// 登录助手：拉起一个独立的浏览器窗口打开网易云，用户在里面正常登录后，
// Host 通过浏览器的调试协议（CDP）读到登录 Cookie，自动完成登录。
// 这样用户只需要「点一下 → 在窗口里登录 → 窗口自动关闭」，不用自己找 Cookie。
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LOGIN_URL = 'https://music.163.com/';
const START_TIMEOUT_MS = 25_000;
const SESSION_TIMEOUT_MS = 6 * 60 * 1000;
const POLL_INTERVAL_MS = 1200;
// 只关心这些登录相关的 Cookie，别把浏览器里其它站点的数据带进来。
const WANTED_COOKIES = new Set(['MUSIC_U', 'MUSIC_A', 'MUSIC_R_U', '__csrf', 'NMTID', '__remember_me']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function browserProfileDir() {
  const dir = process.env.DSH_PROFILE_DIR || join(homedir(), '.dsh', 'profiles', 'desktop');
  return join(dir, 'netease-music-browser');
}

export function findBrowser() {
  const local = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
  const candidates = [
    join('C:', 'Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join('C:', 'Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join('C:', 'Program Files', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join('C:', 'Program Files (x86)', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  for (const path of candidates) {
    try {
      if (existsSync(path)) return path;
    } catch {
      /* 忽略不可探测的路径 */
    }
  }
  return null;
}

class CdpSession {
  constructor(socket) {
    this.socket = socket;
    this.pending = new Map();
    this.sequence = 0;
    this.closed = false;
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (!message || typeof message.id !== 'number') return;
      const entry = this.pending.get(message.id);
      if (!entry) return;
      this.pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error.message || 'CDP 调用失败'));
      else entry.resolve(message.result);
    };
    socket.onclose = () => {
      this.closed = true;
      for (const entry of this.pending.values()) entry.reject(new Error('浏览器调试连接已关闭'));
      this.pending.clear();
    };
    socket.onerror = () => {
      this.closed = true;
    };
  }

  static open(url, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(url);
      const timer = setTimeout(() => {
        try {
          socket.close();
        } catch {
          /* 忽略 */
        }
        reject(new Error('连接浏览器调试接口超时'));
      }, timeoutMs);
      socket.onopen = () => {
        clearTimeout(timer);
        resolve(new CdpSession(socket));
      };
      socket.onerror = () => {
        clearTimeout(timer);
        reject(new Error('连接浏览器调试接口失败'));
      };
    });
  }

  send(method, params) {
    if (this.closed) return Promise.reject(new Error('浏览器调试连接已关闭'));
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      try {
        this.socket.send(JSON.stringify({ id, method, params: params ?? {} }));
      } catch (error) {
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  close() {
    this.closed = true;
    try {
      this.socket.close();
    } catch {
      /* 忽略 */
    }
  }
}

async function waitForDevtoolsPort(profileDir, deadline) {
  const portFile = join(profileDir, 'DevToolsActivePort');
  while (Date.now() < deadline) {
    try {
      const text = readFileSync(portFile, 'utf8');
      const port = Number.parseInt(String(text).split('\n')[0], 10);
      if (Number.isFinite(port) && port > 0) return port;
    } catch {
      /* 文件还没写出来，继续等 */
    }
    await sleep(250);
  }
  return 0;
}

async function findPageTarget(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(4000) });
  const targets = await response.json();
  if (!Array.isArray(targets)) return null;
  const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
  return page ? page.webSocketDebuggerUrl : null;
}

// 上一次没能正常收尾时可能还留着一个登录窗口，能连上就直接复用，避免重复开窗。
async function probeExisting(profileDir) {
  try {
    const text = readFileSync(join(profileDir, 'DevToolsActivePort'), 'utf8');
    const port = Number.parseInt(String(text).split('\n')[0], 10);
    if (!Number.isFinite(port) || port <= 0) return 0;
    const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1500) });
    if (!response.ok) return 0;
    const info = await response.json();
    return typeof info?.Browser === 'string' ? port : 0;
  } catch {
    return 0;
  }
}

export function createLoginAssistant({ jar, verify }) {
  const state = { running: false, done: false, error: '', message: '' };
  let child = null;
  let cdp = null;
  let deadline = 0;
  let loopTask = null;
  let stopping = false;

  function status() {
    return { running: state.running, done: state.done, error: state.error, message: state.message };
  }

  function setError(message) {
    state.error = message;
    state.message = message;
    state.running = false;
  }

  async function closeBrowser() {
    if (cdp) {
      try {
        await cdp.send('Browser.close');
      } catch {
        /* 窗口可能已经关了 */
      }
      cdp.close();
      cdp = null;
    }
    if (child) {
      const running = child;
      child = null;
      try {
        running.kill();
      } catch {
        /* 忽略 */
      }
      // Windows 上 Chrome 会派生子进程，再补一次整棵树清理
      if (process.platform === 'win32' && running.pid) {
        try {
          spawn('taskkill', ['/pid', String(running.pid), '/T', '/F'], { stdio: 'ignore' });
        } catch {
          /* 忽略 */
        }
      }
    }
  }

  async function stop() {
    stopping = true;
    state.running = false;
    await closeBrowser();
    try {
      rmSync(join(browserProfileDir(), 'DevToolsActivePort'), { force: true });
    } catch {
      /* 忽略 */
    }
    return status();
  }

  function cookiePairsFrom(result) {
    const pairs = {};
    for (const cookie of (result && result.cookies) || []) {
      if (!String(cookie.domain || '').includes('music.163.com')) continue;
      if (!WANTED_COOKIES.has(cookie.name) || !cookie.value) continue;
      pairs[cookie.name] = cookie.value;
    }
    return pairs;
  }

  async function readAllCookies() {
    if (cdp && !cdp.closed) {
      try {
        return await cdp.send('Network.getAllCookies');
      } catch {
        /* 连接可能失效，下面重连 */
      }
    }
    const profileDir = browserProfileDir();
    let port = await waitForDevtoolsPort(profileDir, Date.now() + 3000);
    if (!port) return null;
    const url = await findPageTarget(port);
    if (!url) return null;
    cdp = await CdpSession.open(url, 5000);
    return cdp.send('Network.getAllCookies');
  }

  async function pollLoop() {
    let verifyFailures = 0;
    while (state.running && !state.done && !stopping) {
      if (Date.now() > deadline) {
        setError('登录超时，请重新点击「自动登录」');
        await closeBrowser();
        return;
      }
      try {
        const result = await readAllCookies();
        const pairs = cookiePairsFrom(result);
        if (pairs.MUSIC_U) {
          state.message = '已获取登录凭证，正在验证…';
          const profile = await verify(pairs);
          if (profile) {
            state.done = true;
            state.running = false;
            state.message = '登录成功';
            await closeBrowser();
            return;
          }
          verifyFailures += 1;
          if (verifyFailures >= 3) {
            setError('浏览器里的登录状态无效，请重新打开登录窗口再试');
            await closeBrowser();
            return;
          }
          state.message = '登录状态还没生效，继续等待…';
        }
      } catch (error) {
        state.message = '正在等待浏览器响应…';
      }
      await sleep(POLL_INTERVAL_MS);
    }
  }

  async function start() {
    if (state.running) return { ok: true, alreadyRunning: true, ...status() };
    if (state.done) return { ok: true, done: true, ...status() };
    const browser = findBrowser();
    if (!browser) {
      setError('没有找到 Chrome 或 Edge 浏览器，请改用「粘贴 Cookie」登录');
      return { ok: false, error: state.error, ...status() };
    }
    const profileDir = browserProfileDir();
    try {
      mkdirSync(profileDir, { recursive: true });
    } catch {
      /* 忽略目录创建失败 */
    }
    stopping = false;
    state.running = true;
    state.done = false;
    state.error = '';
    state.message = '正在打开登录窗口…';
    deadline = Date.now() + SESSION_TIMEOUT_MS;

    // 如果上次的窗口还开着（Host 异常退出时可能留下），直接复用，不再开第二个。
    const existing = await probeExisting(profileDir);
    if (existing) {
      state.message = '登录窗口已经打开，请在其中完成登录';
      loopTask = pollLoop();
      void loopTask;
      return { ok: true, reused: true, ...status() };
    }
    try {
      rmSync(join(profileDir, 'DevToolsActivePort'), { force: true });
    } catch {
      /* 忽略清理失败 */
    }
    const args = [
      '--remote-debugging-port=0',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-search-engine-choice-screen',
      '--disable-features=Translate,MediaRouter',
      '--remote-allow-origins=*',
      '--window-size=1120,840',
      LOGIN_URL,
    ];
    try {
      child = spawn(browser, args, { stdio: 'ignore' });
    } catch (error) {
      setError('启动浏览器失败：' + String((error && error.message) || error));
      return { ok: false, error: state.error, ...status() };
    }
    child.on('error', () => {
      if (state.running) setError('浏览器启动失败');
    });
    child.on('exit', () => {
      if (!state.done && !stopping && state.running) {
        setError('登录窗口已关闭，没有检测到登录');
      }
    });

    const port = await waitForDevtoolsPort(profileDir, Date.now() + START_TIMEOUT_MS);
    if (!port) {
      setError('浏览器启动超时，请重试');
      await closeBrowser();
      return { ok: false, error: state.error, ...status() };
    }
    state.message = '请在打开的窗口中登录网易云';
    loopTask = pollLoop();
    void loopTask;
    return { ok: true, ...status() };
  }

  async function dispose() {
    stopping = true;
    state.running = false;
    if (loopTask) void loopTask.finally(() => {});
    await closeBrowser();
  }

  return { start, stop, status, dispose };
}
