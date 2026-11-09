// 网易云音乐插件的 Host 端：代理接口请求、保存登录 Cookie、生成扫码登录二维码。
// Client 只跟本机 DSH Web 服务器同源通信，网易云请求和 Cookie 都不出 Host 进程。
import { createCipheriv, publicEncrypt, constants } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { encodeQr, toSvg } from './qr.js';
import { createLoginAssistant } from './login-assistant.js';

export const name = 'netease-music';
export const inject = ['webServer'];

const ROUTE_PREFIX = '/api/netease-music';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const REFERER = 'https://music.163.com/';
const PRESET_KEY = '0CoJUm6Qyw8W8jud';
const AES_IV = '0102030405060708';
const IV_BUFFER = Buffer.from(AES_IV);
const PUBLIC_KEY =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB\n' +
  '-----END PUBLIC KEY-----';
const BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_PROFILE_DIR = join(homedir(), '.dsh', 'profiles', 'desktop');

function cookieFile() {
  const dir = process.env.DSH_PROFILE_DIR || DEFAULT_PROFILE_DIR;
  return join(dir, 'netease-music-cookies.json');
}

// ---------- Cookie 存储 ----------

function createCookieJar() {
  const jar = new Map();
  const file = cookieFile();
  try {
    const saved = JSON.parse(readFileSync(file, 'utf8'));
    if (saved && typeof saved === 'object') {
      for (const [key, value] of Object.entries(saved)) if (typeof value === 'string') jar.set(key, value);
    }
  } catch {
    /* 首次运行或文件损坏：从空 jar 开始 */
  }

  function persist() {
    try {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, JSON.stringify(Object.fromEntries(jar), null, 2), 'utf8');
    } catch {
      /* 持久化失败不应影响在线请求；下次启动最多重新扫码 */
    }
  }

  return {
    header() {
      if (jar.size === 0) return '';
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    },
    get(key) {
      return jar.get(key);
    },
    /** 解析 Set-Cookie 头并写入 jar；返回是否有变化 */
    absorb(setCookies) {
      if (!Array.isArray(setCookies) || setCookies.length === 0) return false;
      let changed = false;
      for (const raw of setCookies) {
        const pair = String(raw).split(';')[0];
        const index = pair.indexOf('=');
        if (index <= 0) continue;
        const key = pair.slice(0, index).trim();
        const value = pair.slice(index + 1).trim();
        if (!key) continue;
        if (value === '' || value === 'deleted') {
          if (jar.delete(key)) changed = true;
        } else if (jar.get(key) !== value) {
          jar.set(key, value);
          changed = true;
        }
      }
      if (changed) persist();
      return changed;
    },
    /** 一次性写入多个 Cookie（用于浏览器 Cookie 导入登录） */
    setMany(pairs) {
      let changed = false;
      for (const [key, value] of Object.entries(pairs || {})) {
        if (typeof key !== 'string' || typeof value !== 'string') continue;
        if (jar.get(key) !== value) {
          jar.set(key, value);
          changed = true;
        }
      }
      if (changed) persist();
      return changed;
    },
    clear() {
      jar.clear();
      persist();
    },
    csrf() {
      return jar.get('__csrf') || '';
    },
    hasLogin() {
      return jar.has('MUSIC_U');
    },
  };
}

// ---------- weapi 加密 ----------

function aesEncrypt(text, key) {
  const cipher = createCipheriv('aes-128-cbc', Buffer.from(key), IV_BUFFER);
  return Buffer.concat([cipher.update(Buffer.from(text, 'utf8')), cipher.final()]).toString('base64');
}

function rsaEncrypt(text) {
  // 网易云的做法：把 16 位随机密钥倒序后左补 0 到 128 字节，再按 RSA_NO_PADDING 加密
  const reversed = Buffer.from([...text].reverse().join(''), 'utf8');
  const block = Buffer.concat([Buffer.alloc(128 - reversed.length), reversed]);
  return publicEncrypt({ key: PUBLIC_KEY, padding: constants.RSA_NO_PADDING }, block).toString('hex');
}

function randomKey() {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  let out = '';
  for (const byte of bytes) out += BASE62[byte % BASE62.length];
  return out;
}

function weapiBody(payload, csrf) {
  const data = { ...payload };
  if (csrf) data.csrf_token = csrf;
  const text = JSON.stringify(data);
  const secretKey = randomKey();
  const params = aesEncrypt(aesEncrypt(text, PRESET_KEY), secretKey);
  const encSecKey = rsaEncrypt(secretKey);
  return new URLSearchParams({ params, encSecKey }).toString();
}

// ---------- 网易云请求 ----------

async function neteaseFetch({ method = 'GET', path, query, payload }, jar) {
  let url = 'https://music.163.com' + path;
  if (query) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      search.append(key, String(value));
    }
    const text = search.toString();
    if (text) url += (url.includes('?') ? '&' : '?') + text;
  }
  const headers = {
    'user-agent': UA,
    referer: REFERER,
    origin: 'https://music.163.com',
    accept: '*/*',
  };
  const cookie = jar.header();
  if (cookie) headers.cookie = cookie;
  const init = { method, headers };
  if (method === 'POST') {
    const body = weapiBody(payload ?? {}, jar.csrf());
    headers['content-type'] = 'application/x-www-form-urlencoded';
    init.body = body;
  }
  const response = await fetch(url, init);
  const setCookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  jar.absorb(setCookies);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { code: response.status, _raw: text.slice(0, 500) };
  }
  return { status: response.status, json };
}

// ---------- 允许客户端调用的接口白名单 ----------

const ALLOWED_APIS = {
  search: {
    method: 'POST',
    path: '/weapi/search/get',
    payload: (p) => ({
      s: String(p.q ?? ''),
      type: Number(p.type ?? 1),
      limit: clampInt(p.limit, 1, 100, 30),
      offset: clampInt(p.offset, 0, 10000, 0),
      total: true,
    }),
  },
  searchHot: {
    method: 'POST',
    path: '/weapi/search/hot',
    payload: () => ({ type: 1111 }),
  },
  searchSuggest: {
    method: 'GET',
    path: '/api/search/suggest/web',
    query: (p) => ({ s: String(p.s ?? '').trim().slice(0, 40) }),
  },
  songDetail: {
    method: 'POST',
    path: '/weapi/v3/song/detail',
    payload: (p) => {
      const ids = normalizeIds(p.ids);
      return {
        c: JSON.stringify(ids.map((id) => ({ id: String(id) }))),
        ids: '[' + ids.map((id) => JSON.stringify(String(id))).join(',') + ']',
      };
    },
  },
  songUrl: {
    method: 'POST',
    path: '/weapi/song/enhance/player/url/v1',
    payload: (p) => {
      const ids = normalizeIds(p.ids);
      const level = QUALITY_LEVELS.includes(p.level) ? p.level : 'standard';
      return { ids: '[' + ids.map((id) => JSON.stringify(String(id))).join(',') + ']', level, encodeType: 'flac' };
    },
  },
  lyric: {
    method: 'GET',
    path: '/api/song/lyric',
    query: (p) => ({ id: normalizeId(p.id), lv: 1, kv: 1, tv: -1 }),
  },
  playlistDetail: {
    method: 'GET',
    path: '/api/v6/playlist/detail',
    query: (p) => ({ id: normalizeId(p.id), n: clampInt(p.n, 1, 1000, 1000), s: 0 }),
  },
  toplist: { method: 'GET', path: '/api/toplist', query: () => ({}) },
  personalized: {
    method: 'GET',
    path: '/api/personalized/playlist',
    query: (p) => ({ limit: clampInt(p.limit, 1, 30, 12), total: true, n: 1000 }),
  },
  userPlaylist: {
    method: 'GET',
    path: '/api/user/playlist',
    query: (p) => ({ uid: normalizeId(p.uid), limit: clampInt(p.limit, 1, 200, 100), offset: clampInt(p.offset, 0, 10000, 0) }),
  },
  account: { method: 'GET', path: '/api/nuser/account/get', query: () => ({}) },
  recommendSongs: { method: 'POST', path: '/weapi/v3/discovery/recommend/songs', payload: () => ({}) },
  recommendResource: {
    method: 'GET',
    path: '/api/v1/discovery/recommend/resource',
    query: () => ({ timestamp: Date.now() }),
  },
  likeList: {
    // 「我喜欢的音乐」：账号的歌单列表里找 specialType=5 的那个
    method: 'GET',
    path: '/api/song/like',
    query: (p) => ({ uid: normalizeId(p.uid) }),
  },
  songLike: {
    method: 'POST',
    path: '/weapi/song/like',
    payload: (p) => ({ trackId: normalizeId(p.id), like: p.like ? 'true' : 'false', time: clampInt(p.time, 0, 100000, 25) }),
  },
  songComment: {
    method: 'GET',
    path: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌曲 id 不合法');
      return '/api/v1/resource/comments/R_SO_4_' + id;
    },
    query: (p) => ({ limit: clampInt(p.limit, 1, 50, 20), offset: clampInt(p.offset, 0, 10000, 0) }),
  },
  playlistComment: {
    method: 'GET',
    path: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌单 id 不合法');
      return '/api/v1/resource/comments/A_PL_0_' + id;
    },
    query: (p) => ({ limit: clampInt(p.limit, 1, 50, 20), offset: clampInt(p.offset, 0, 10000, 0) }),
  },
  playlistSubscribe: {
    method: 'POST',
    path: '/weapi/playlist/subscribe',
    payload: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌单 id 不合法');
      return { id, t: p.subscribe ? '1' : '0' };
    },
  },
  playlistAddTrack: {
    // 把一首歌加入自己的歌单（收藏到歌单）
    method: 'POST',
    path: '/weapi/playlist/manipulate/tracks',
    payload: (p) => {
      const pid = normalizeId(p.pid);
      const id = normalizeId(p.id);
      if (!pid) throw new Error('歌单 id 不合法');
      if (!id) throw new Error('歌曲 id 不合法');
      return { op: 'add', pid, trackIds: JSON.stringify([id]), tracks: JSON.stringify([id]) };
    },
  },
  artistDetail: {
    // 老接口一次返回歌手信息 + 热门 50 首（hotSongs）
    method: 'GET',
    path: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌手 id 不合法');
      return '/api/artist/' + id;
    },
    query: () => ({}),
  },
  artistSub: {
    // 关注歌手 / 取消关注
    method: 'POST',
    path: '/weapi/artist/sub',
    payload: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌手 id 不合法');
      return { artistId: id, artistIds: [id] };
    },
  },
  artistUnsub: {
    method: 'POST',
    path: '/weapi/artist/unsub',
    payload: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌手 id 不合法');
      return { artistId: id, artistIds: [id] };
    },
  },
  albumSub: {
    // 收藏专辑 / 取消收藏
    method: 'POST',
    path: '/weapi/album/sub',
    payload: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('专辑 id 不合法');
      return { id };
    },
  },
  albumUnsub: {
    method: 'POST',
    path: '/weapi/album/unsub',
    payload: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('专辑 id 不合法');
      return { id };
    },
  },
  artistAlbums: {
    // 歌手专辑列表，老接口返回 hotAlbums 与 more
    method: 'GET',
    path: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌手 id 不合法');
      return '/api/artist/albums/' + id;
    },
    query: (p) => ({ limit: clampInt(p.limit, 1, 100, 50), offset: clampInt(p.offset, 0, 10000, 0) }),
  },
  albumDetail: {
    method: 'POST',
    path: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('专辑 id 不合法');
      return '/weapi/v1/album/' + id;
    },
    payload: () => ({}),
  },
  personalFm: {
    // 私人FM（每日推荐电台），需要登录
    method: 'POST',
    path: '/weapi/v1/radio/get',
    payload: () => ({}),
  },
  fmDislike: {
    // 私人FM「不感兴趣」，需要登录
    method: 'POST',
    path: (p) => {
      const id = normalizeId(p.id);
      if (!id) throw new Error('歌曲 id 不合法');
      return '/weapi/v1/radio/trash/' + id;
    },
    payload: () => ({}),
  },
  dailyRecommend: {
    // 每日推荐（需要登录）
    method: 'POST',
    path: '/weapi/v1/discovery/recommend/songs',
    payload: () => ({}),
  },
  playRecord: {
    // 听歌排行（需要登录），type=1 本周、0 所有时间
    method: 'POST',
    path: '/weapi/v1/play/record',
    payload: (p) => ({ uid: normalizeId(p.uid), type: p.type === 'all' ? 0 : 1 }),
  },
  likeSongs: {
    // 我喜欢的音乐：先拿账号信息里的 userId，再拉喜欢列表（由 client 组合），这里提供 id 列表
    method: 'POST',
    path: '/weapi/song/like/get',
    payload: (p) => ({ uid: normalizeId(p.uid) }),
  },
};

function clampInt(value, min, max, fallback) {
  const number = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeId(value) {
  const number = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeId).filter((id) => id !== undefined).slice(0, 100);
}

// 播放音质档位：标准 / 较高 / 极高 / 无损（无损需要会员）
const QUALITY_LEVELS = ['standard', 'higher', 'exhigh', 'lossless'];

// ---------- HTTP 工具 ----------

function sendJson(res, status, body) {
  if (res.writableEnded) return;
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJsonBody(req, limit = 200_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('request body too large');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/** 同源校验：浏览器跨站请求会带别的 Origin，直接拒绝，避免被第三方页面借道。 */
function sameOrigin(req, origin) {
  const requestOrigin = req.headers.origin;
  if (!requestOrigin) return true; // 同源 GET 通常没有 Origin 头
  try {
    return new URL(requestOrigin).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

// ---------- 扫码登录 ----------

const QR_CONTENT_PREFIX = 'https://music.163.com/login?codekey=';

async function qrcodeLoginStart(jar) {
  const { json } = await neteaseFetch({ method: 'GET', path: '/api/login/qrcode/unikey', query: { type: 1 } }, jar);
  if (!json || json.code !== 200 || !json.unikey) {
    return { ok: false, error: '无法获取登录二维码（网易云接口返回异常）', detail: json?.code ?? json?.message };
  }
  const content = QR_CONTENT_PREFIX + json.unikey;
  const qr = encodeQr(content, { ecLevel: 'M' });
  return {
    ok: true,
    key: json.unikey,
    content,
    svg: toSvg(qr.modules, { margin: 2 }),
    version: qr.version,
  };
}

async function qrcodeLoginCheck(jar, key) {
  const { json } = await neteaseFetch(
    { method: 'GET', path: '/api/login/qrcode/client/login', query: { key, type: 1 } },
    jar,
  );
  const code = Number(json?.code ?? 0);
  const messages = {
    800: '二维码已过期，请刷新',
    801: '等待扫码',
    802: '已扫码，请在手机上确认登录',
    803: '登录成功',
    8821: '网易云风控拦截了这次扫码登录，请稍后重试，或改用「粘贴 Cookie」登录',
  };
  return {
    ok: true,
    code,
    message: messages[code] ?? String(json?.message ?? '未知状态'),
    loggedIn: jar.hasLogin(),
  };
}

async function loadProfile(jar) {
  if (!jar.hasLogin()) return null;
  try {
    const { json } = await neteaseFetch({ method: 'GET', path: '/api/nuser/account/get', query: {} }, jar);
    const profile = json?.profile ?? json?.data?.profile;
    if (!profile) return null;
    return {
      userId: profile.userId,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
      backgroundUrl: profile.backgroundUrl,
      signature: profile.signature,
      vipType: profile.vipType,
    };
  } catch {
    return null;
  }
}

// ---------- 浏览器 Cookie 导入登录 ----------

// 只接受登录相关的 Cookie，别把浏览器的无关 Cookie 全存进来。
const COOKIE_KEYS = new Set([
  'MUSIC_U',
  'MUSIC_A',
  'MUSIC_R_U',
  '__csrf',
  '__remember_me',
  'NMTID',
  '_ntes_nuid',
  '_ntes_nnid',
  'JSESSIONID-WYYY',
  '_iuqxldmzr_',
  'os',
  'appver',
  'channel',
  'mode',
]);

function parseCookieInput(text) {
  const source = String(text ?? '').replace(/^\s*cookie\s*:/i, '').trim();
  const pairs = {};
  if (!source) return pairs;
  for (const part of source.split(';')) {
    const piece = part.trim();
    if (!piece) continue;
    const index = piece.indexOf('=');
    if (index <= 0) continue;
    const key = piece.slice(0, index).trim();
    const value = piece.slice(index + 1).trim();
    if (!value) continue;
    if (!COOKIE_KEYS.has(key)) continue;
    pairs[key] = value;
  }
  return pairs;
}

async function loginWithCookie(jar, text) {
  const pairs = parseCookieInput(text);
  if (!pairs.MUSIC_U) {
    return { ok: false, error: 'Cookie 里没有 MUSIC_U，请确认复制的是已登录状态的完整 Cookie' };
  }
  // 先清掉旧登录态，避免浏览器导出的 __csrf 与旧 MUSIC_U 混在一起。
  jar.clear();
  jar.setMany(pairs);
  const profile = await loadProfile(jar);
  if (!profile) {
    jar.clear();
    return { ok: false, error: 'Cookie 无效或已过期，请重新登录 music.163.com 后复制新的 Cookie' };
  }
  return { ok: true, profile, loggedIn: true };
}

// ---------- 插件入口 ----------

export function apply(ctx) {
  const jar = createCookieJar();

  // 登录助手：拉起独立浏览器窗口，用户登录后通过浏览器调试协议读回 Cookie。
  const assistant = createLoginAssistant({
    jar,
    verify: async (pairs) => {
      jar.clear();
      jar.setMany(pairs);
      const profile = await loadProfile(jar);
      if (!profile) jar.clear();
      return profile;
    },
  });
  ctx.effect(() => () => assistant.dispose(), 'netease-music: login assistant');

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: ROUTE_PREFIX,
        handler: async (req, res) => {
          const url = new URL(req.url ?? '/', ctx.webServer.getOrigin());
          const route = url.pathname.slice(ROUTE_PREFIX.length);
          if (!sameOrigin(req, ctx.webServer.getOrigin())) {
            sendJson(res, 403, { ok: false, error: 'cross-origin request rejected' });
            return;
          }
          try {
            if (route === '/rpc' && req.method === 'POST') {
              const body = await readJsonBody(req);
              const api = String(body?.api ?? '');
              const spec = ALLOWED_APIS[api];
              if (!spec) {
                sendJson(res, 400, { ok: false, error: `未支持的接口：${api}` });
                return;
              }
              const params = body?.params && typeof body.params === 'object' ? body.params : {};
              // path 允许是函数（如 /api/artist/<id> 这种把 id 写进路径的接口）。
              const path = typeof spec.path === 'function' ? spec.path(params) : spec.path;
              const { status, json } = await neteaseFetch(
                { method: spec.method, path, query: spec.query?.(params), payload: spec.payload?.(params) },
                jar,
              );
              sendJson(res, 200, { ok: true, status, data: json });
              return;
            }
            if (route === '/status' && req.method === 'GET') {
              const hadSession = jar.hasLogin();
              const profile = await loadProfile(jar);
              // Cookie 还在但拿不到账号信息，说明登录已经过期（网易云会让 MUSIC_U 失效）
              sendJson(res, 200, {
                ok: true,
                loggedIn: Boolean(profile),
                profile,
                expired: hadSession && !profile,
              });
              return;
            }
            if (route === '/login/cookie' && req.method === 'POST') {
              const body = await readJsonBody(req);
              const text = typeof body?.cookie === 'string' ? body.cookie : '';
              if (!text.trim()) {
                sendJson(res, 400, { ok: false, error: '请先粘贴 Cookie' });
                return;
              }
              sendJson(res, 200, await loginWithCookie(jar, text));
              return;
            }
            if (route === '/login/assistant/start' && req.method === 'POST') {
              sendJson(res, 200, await assistant.start());
              return;
            }
            if (route === '/login/assistant/status' && req.method === 'GET') {
              sendJson(res, 200, { ok: true, ...assistant.status() });
              return;
            }
            if (route === '/login/assistant/cancel' && req.method === 'POST') {
              sendJson(res, 200, { ok: true, ...(await assistant.stop()) });
              return;
            }
            if (route === '/login/qr' && req.method === 'POST') {
              sendJson(res, 200, await qrcodeLoginStart(jar));
              return;
            }
            if (route === '/login/qr/check' && req.method === 'GET') {
              const key = url.searchParams.get('key') ?? '';
              if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
                sendJson(res, 400, { ok: false, error: '登录 key 格式不正确' });
                return;
              }
              sendJson(res, 200, await qrcodeLoginCheck(jar, key));
              return;
            }
            if (route === '/logout' && req.method === 'POST') {
              try {
                await neteaseFetch({ method: 'POST', path: '/weapi/logout', payload: {} }, jar);
              } catch {
                /* 网易云那边失败也要清掉本地 Cookie */
              }
              jar.clear();
              sendJson(res, 200, { ok: true });
              return;
            }
            sendJson(res, 404, { ok: false, error: 'not found' });
          } catch (error) {
            sendJson(res, 502, {
              ok: false,
              error: '网易云请求失败',
              detail: String((error && error.message) || error),
            });
          }
        },
      }),
    'netease-music: api routes',
  );
}
