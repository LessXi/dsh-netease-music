// 网易云音乐 DSH 界面的 Client 端。
// 结构：侧边栏图标（sidebar.panellist）+ 主面板（main）+ 常驻音频宿主（shell.overlay）。
window.__ModuleLoader__.load({
  id: '@local/dsh-netease-music',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } = React;

    const PANEL_ID = 'netease-music';
    const NS = 'netease-music';
    const API = '/api/netease-music';
    const QR_POLL_MS = 1600;
    const ASSISTANT_POLL_MS = 1200;

    // ---------- 文案 ----------

    const zh = {
      panel: '网易云音乐',
      brand: '网易云音乐',
      tabDiscover: '发现',
      tabToplist: '排行榜',
      tabMine: '我的音乐',
      searchPlaceholder: '搜索歌曲、歌手、歌单',
      search: '搜索',
      login: '登录',
      logout: '退出登录',
      loggedOut: '未登录',
      loginHint: '扫码登录后可同步我的歌单、每日推荐，并播放会员歌曲',
      loginScanTitle: '扫码登录网易云音乐',
      loginScanHint: '用网易云音乐 App 扫描二维码',
      loginTitle: '登录网易云音乐',
      loginTabQr: '扫码登录',
      loginTabCookie: '粘贴 Cookie',
      loginCookieHint:
        '在浏览器打开 music.163.com 并登录，按 F12 打开 Network（网络），刷新页面，点任意一条 music.163.com 请求，在 Request Headers 里复制整串 Cookie（必须包含 MUSIC_U=）。',
      loginCookiePlaceholder: 'MUSIC_U=...; __csrf=...; NMTID=...',
      loginCookieSubmit: '用 Cookie 登录',
      loginCookieRequired: '请先粘贴 Cookie',
      loginRiskHint: '扫码登录被网易云风控拦截时，可以改用「粘贴 Cookie」登录。',
      loginSwitchCookie: '改用 Cookie 登录',
      loginTabAssistant: '自动登录',
      loginAssistantHint:
        '点下面的按钮会打开一个独立的登录窗口，在里面扫码或账号登录后，插件会自动读取登录状态并关闭窗口。整个过程不用复制任何东西。',
      loginAssistantStart: '打开登录窗口',
      loginAssistantStarting: '正在打开登录窗口…',
      loginAssistantOpened: '登录窗口已打开，请在窗口里完成登录',
      loginAssistantWaiting: '等待窗口中完成登录…',
      loginAssistantRetry: '重新打开登录窗口',
      loginAssistantCancel: '取消登录',
      loginAssistantNoBrowser: '没有找到 Chrome 或 Edge 浏览器，请改用「粘贴 Cookie」登录。',
      loginWaiting: '等待扫码…',
      loginScanned: '已扫码，请在手机上确认',
      loginSuccess: '登录成功',
      loginExpired: '二维码已过期',
      loginFailed: '登录失败',
      loginRefresh: '刷新二维码',
      close: '关闭',
      hotPlaylists: '推荐歌单',
      hotCharts: '热门榜单',
      allCharts: '全部榜单',
      playAll: '播放全部',
      play: '播放',
      playCount: '播放',
      songCount: '首',
      loading: '加载中…',
      empty: '暂时没有内容',
      loadFailed: '加载失败',
      retry: '重试',
      unknownArtist: '未知歌手',
      unknownAlbum: '未知专辑',
      back: '返回',
      nowPlaying: '正在播放',
      queue: '播放队列',
      playModeList: '列表循环',
      playModeSingle: '单曲循环',
      playModeShuffle: '随机播放',
      needLogin: '需要登录',
      vipNeeded: '这首歌需要登录或会员才能播放',
      playError: '播放失败',
      myPlaylists: '我的歌单',
      myFavorite: '我喜欢的音乐',
      dailyRecommend: '每日推荐',
      recommended: '推荐歌单',
      noResult: '没有找到相关歌曲',
      loginToSee: '登录后查看',
      account: '账号',
    };

    const en = {
      panel: 'NetEase Music',
      brand: 'NetEase Cloud Music',
      tabDiscover: 'Discover',
      tabToplist: 'Charts',
      tabMine: 'My Music',
      searchPlaceholder: 'Search songs, artists, playlists',
      search: 'Search',
      login: 'Log in',
      logout: 'Log out',
      loggedOut: 'Not logged in',
      loginHint: 'Scan the QR code to sync your playlists, daily picks and play VIP songs',
      loginScanTitle: 'Log in to NetEase Cloud Music',
      loginScanHint: 'Scan the QR code with the NetEase Cloud Music app',
      loginTitle: 'Log in',
      loginTabQr: 'Scan QR code',
      loginTabCookie: 'Paste Cookie',
      loginCookieHint:
        'Open music.163.com in a browser and log in, press F12, open Network, reload the page, click any music.163.com request and copy the whole Cookie request header (it must include MUSIC_U=).',
      loginCookiePlaceholder: 'MUSIC_U=...; __csrf=...; NMTID=...',
      loginCookieSubmit: 'Log in with Cookie',
      loginCookieRequired: 'Please paste a Cookie first',
      loginRiskHint: 'If QR login is blocked by NetEase risk control, switch to "Paste Cookie".',
      loginSwitchCookie: 'Use Cookie login',
      loginTabAssistant: 'Auto login',
      loginAssistantHint:
        'Clicking the button opens a separate login window. Log in there (QR or password) and the plugin reads the session and closes the window automatically — nothing to copy.',
      loginAssistantStart: 'Open login window',
      loginAssistantStarting: 'Opening the login window…',
      loginAssistantOpened: 'Login window opened, finish logging in there',
      loginAssistantWaiting: 'Waiting for you to finish logging in…',
      loginAssistantRetry: 'Open login window again',
      loginAssistantCancel: 'Cancel login',
      loginAssistantNoBrowser: 'Chrome or Edge was not found. Use "Paste Cookie" instead.',
      loginWaiting: 'Waiting for scan…',
      loginScanned: 'Scanned, confirm on your phone',
      loginSuccess: 'Logged in',
      loginExpired: 'QR code expired',
      loginFailed: 'Login failed',
      loginRefresh: 'Refresh QR code',
      close: 'Close',
      hotPlaylists: 'Featured playlists',
      hotCharts: 'Top charts',
      allCharts: 'All charts',
      playAll: 'Play all',
      play: 'Play',
      playCount: 'plays',
      songCount: 'songs',
      loading: 'Loading…',
      empty: 'Nothing here yet',
      loadFailed: 'Failed to load',
      retry: 'Retry',
      unknownArtist: 'Unknown artist',
      unknownAlbum: 'Unknown album',
      back: 'Back',
      nowPlaying: 'Now playing',
      queue: 'Queue',
      playModeList: 'Repeat all',
      playModeSingle: 'Repeat one',
      playModeShuffle: 'Shuffle',
      needLogin: 'Login required',
      vipNeeded: 'This song needs an account or VIP membership',
      playError: 'Playback failed',
      myPlaylists: 'My playlists',
      myFavorite: 'Liked songs',
      dailyRecommend: 'Daily picks',
      recommended: 'Recommended',
      noResult: 'No matching songs',
      loginToSee: 'Log in to view',
      account: 'Account',
    };

    // ---------- 样式 ----------

    const CSS = `
.dnm-root{display:flex;flex-direction:column;height:100%;min-height:0;width:100%;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.5;overflow:hidden}
.dnm-topbar{display:flex;align-items:center;gap:14px;padding:10px 20px;border-bottom:.5px solid var(--dsw-alias-border-l2);flex:0 0 auto;min-height:56px}
.dnm-brand{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;white-space:nowrap;flex:0 0 auto}
.dnm-brand-mark{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#c20c0c;color:#fff;flex:0 0 auto}
.dnm-search{display:flex;align-items:center;gap:8px;flex:1 1 auto;max-width:420px;height:34px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:17px;background:var(--dsw-alias-bg-layer-1);transition:border-color .15s}
.dnm-search:focus-within{border-color:var(--dsw-alias-brand-primary)}
.dnm-search input{flex:1 1 auto;min-width:0;height:100%;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dnm-search input::placeholder{color:var(--dsw-alias-label-caption)}
.dnm-topbar-spacer{flex:1 1 auto}
.dnm-userbtn{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;border-radius:16px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;flex:0 0 auto}
.dnm-userbtn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-userbtn.primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}
.dnm-userbtn.primary:hover{opacity:.9;background:var(--dsw-alias-brand-primary)}
.dnm-avatar{width:24px;height:24px;border-radius:50%;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2)}
.dnm-body{display:flex;flex:1 1 auto;min-height:0;overflow:hidden}
.dnm-nav{width:190px;flex:0 0 auto;padding:14px 10px;border-right:.5px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;gap:2px;overflow:auto}
.dnm-nav-item{display:flex;align-items:center;gap:10px;height:36px;padding:0 12px;border-radius:10px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer;text-align:left;width:100%;white-space:nowrap}
.dnm-nav-item:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dnm-nav-item.active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:500}
.dnm-nav-sep{margin:10px 12px;border-top:.5px solid var(--dsw-alias-border-l2)}
.dnm-main{flex:1 1 auto;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.dnm-scroll{flex:1 1 auto;min-height:0;overflow:auto;scrollbar-gutter:stable}
.dnm-content{max-width:1080px;margin:0 auto;padding:20px clamp(18px,3vw,32px) 32px}
.dnm-h1{font-size:20px;font-weight:600;margin:0 0 4px}
.dnm-h2{font-size:16px;font-weight:600;margin:0 0 14px;display:flex;align-items:center;gap:10px}
.dnm-sub{color:var(--dsw-alias-label-secondary);font-size:13px;margin:0 0 18px}
.dnm-section{margin-bottom:28px}
.dnm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px}
.dnm-card{display:flex;flex-direction:column;gap:8px;border:0;background:transparent;padding:0;cursor:pointer;text-align:left;color:inherit;font:inherit;border-radius:12px;overflow:hidden}
.dnm-card:hover .dnm-cover{transform:scale(1.03)}
.dnm-cover{position:relative;width:100%;aspect-ratio:1/1;border-radius:12px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);flex:0 0 auto;transition:transform .18s}
.dnm-cover img{width:100%;height:100%;object-fit:cover;display:block}
.dnm-cover-count{position:absolute;right:6px;top:6px;padding:1px 6px;border-radius:10px;background:rgba(0,0,0,.55);color:#fff;font-size:11px;display:inline-flex;align-items:center;gap:3px}
.dnm-card-title{font-size:13px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--dsw-alias-label-primary)}
.dnm-card-meta{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-chart-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.dnm-chart{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);cursor:pointer;text-align:left;font:inherit;color:inherit}
.dnm-chart:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-chart-cover{width:56px;height:56px;border-radius:8px;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2)}
.dnm-chart-info{min-width:0;flex:1 1 auto}
.dnm-chart-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-chart-desc{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-row{display:flex;align-items:center;gap:12px;padding:7px 10px;border-radius:10px;cursor:default;border:0;background:transparent;width:100%;text-align:left;font:inherit;color:inherit}
.dnm-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-row.playing{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent)}
.dnm-row-index{width:26px;flex:0 0 auto;text-align:right;color:var(--dsw-alias-label-tertiary);font-size:12px;font-variant-numeric:tabular-nums}
.dnm-row-title{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.dnm-row-name{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:6px}
.dnm-row-artist{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-row-album{flex:0 1 200px;min-width:0;font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-row-duration{flex:0 0 auto;font-size:12px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dnm-row-action{flex:0 0 auto;width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0}
.dnm-row:hover .dnm-row-action{opacity:1}
.dnm-row-action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dnm-vip{font-size:10px;padding:0 4px;border-radius:3px;border:.5px solid #d9a441;color:#c08a25;line-height:14px;flex:0 0 auto}
.dnm-playlist-head{display:flex;gap:20px;margin-bottom:22px;align-items:flex-start}
.dnm-playlist-cover{width:160px;height:160px;border-radius:14px;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2)}
.dnm-playlist-info{flex:1 1 auto;min-width:0;padding-top:4px}
.dnm-playlist-name{font-size:20px;font-weight:600;margin:0 0 8px;word-break:break-word}
.dnm-playlist-meta{font-size:12px;color:var(--dsw-alias-label-secondary);margin:0 0 14px}
.dnm-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dnm-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 14px;border-radius:16px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dnm-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-btn.primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:#fff}
.dnm-btn.primary:hover{opacity:.9;background:var(--dsw-alias-brand-primary)}
.dnm-btn:disabled{opacity:.5;cursor:default}
.dnm-empty{padding:48px 16px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px;display:flex;flex-direction:column;align-items:center;gap:12px}
.dnm-spinner{width:18px;height:18px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:dnm-spin .8s linear infinite}
@keyframes dnm-spin{to{transform:rotate(360deg)}}
.dnm-player{flex:0 0 auto;border-top:.5px solid var(--dsw-alias-border-l2);padding:10px 18px;display:flex;align-items:center;gap:16px;background:var(--dsw-alias-bg-layer-1);min-height:72px}
.dnm-player-left{display:flex;align-items:center;gap:10px;width:230px;flex:0 0 auto;min-width:0}
.dnm-player-cover{width:44px;height:44px;border-radius:8px;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2)}
.dnm-player-meta{min-width:0;flex:1 1 auto}
.dnm-player-title{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-player-artist{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-player-center{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px}
.dnm-controls{display:flex;align-items:center;gap:12px}
.dnm-icon-btn{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;flex:0 0 auto}
.dnm-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-icon-btn:disabled{opacity:.4;cursor:default;background:transparent}
.dnm-icon-btn.play{width:38px;height:38px;background:var(--dsw-alias-brand-primary);color:#fff}
.dnm-icon-btn.play:hover{background:var(--dsw-alias-brand-primary);opacity:.9}
.dnm-progress{display:flex;align-items:center;gap:10px;width:100%;max-width:520px}
.dnm-time{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;width:38px;flex:0 0 auto}
.dnm-time.right{text-align:right}
.dnm-range{-webkit-appearance:none;appearance:none;flex:1 1 auto;min-width:0;height:4px;border-radius:2px;background:var(--dsw-alias-border-l2);outline:0;cursor:pointer;accent-color:var(--dsw-alias-brand-primary)}
.dnm-range::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:50%;background:var(--dsw-alias-brand-primary);border:0}
.dnm-player-right{display:flex;align-items:center;gap:10px;width:230px;flex:0 0 auto;justify-content:flex-end}
.dnm-volume{width:80px;flex:0 0 auto}
.dnm-status{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:340px;text-align:center}
.dnm-status.error{color:var(--dsw-alias-state-error-primary)}
.dnm-modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
.dnm-modal{width:340px;max-width:100%;background:var(--dsw-alias-bg-overlay);border-radius:16px;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.28);display:flex;flex-direction:column;align-items:center;gap:12px;color:var(--dsw-alias-label-primary)}
.dnm-modal-title{font-size:16px;font-weight:600;margin:0}
.dnm-modal-hint{font-size:12px;color:var(--dsw-alias-label-secondary);margin:0;text-align:center}
.dnm-qr{width:220px;height:220px;border-radius:10px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.dnm-qr svg{width:100%;height:100%;display:block}
.dnm-qr-loading{display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dnm-login-state{font-size:13px;color:var(--dsw-alias-label-secondary);min-height:20px;text-align:center}
.dnm-login-busy{display:flex;align-items:center;justify-content:center;gap:8px}
.dnm-modal-actions{display:flex;gap:10px;width:100%;justify-content:center;flex-wrap:wrap}
.dnm-login-tabs{display:flex;gap:4px;background:var(--dsw-alias-bg-layer-1);padding:3px;border-radius:9px}
.dnm-login-tab{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1;padding:6px 13px;border-radius:7px;cursor:pointer;font-family:inherit}
.dnm-login-tab.active{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-weight:600}
.dnm-cookie-help{font-size:11.5px;line-height:1.65;color:var(--dsw-alias-label-secondary);margin:0;text-align:left}
.dnm-cookie-input{width:100%;box-sizing:border-box;min-height:92px;resize:vertical;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.55;padding:9px}
.dnm-cookie-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dnm-cookie-input::placeholder{color:var(--dsw-alias-label-caption)}
.dnm-login-error{font-size:12px;line-height:1.6;color:var(--dsw-alias-state-error-primary);text-align:left;width:100%;word-break:break-word}
.dnm-login-risk{font-size:12px;line-height:1.6;color:var(--dsw-alias-state-warn-primary);text-align:center;max-width:100%}
.dnm-mine-head{display:flex;align-items:center;gap:16px;padding:16px;border-radius:14px;background:var(--dsw-alias-bg-layer-1);margin-bottom:22px;border:.5px solid var(--dsw-alias-border-l1)}
.dnm-mine-avatar{width:64px;height:64px;border-radius:50%;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2)}
.dnm-mine-name{font-size:17px;font-weight:600;margin:0 0 4px}
.dnm-mine-sig{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:0}
.dnm-hidden{display:none}
.dnm-scroll::-webkit-scrollbar{width:9px;height:9px}
.dnm-scroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:5px;border:2px solid transparent;background-clip:padding-box}
.dnm-scroll::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-border-l1);background-clip:padding-box}
    `;

    function ensureCss() {
      if (typeof document === 'undefined') return;
      if (document.querySelector('style[data-plugin-netease-music]')) return;
      const tag = document.createElement('style');
      tag.setAttribute('data-plugin-netease-music', '1');
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    function removeCss() {
      if (typeof document === 'undefined') return;
      const tag = document.querySelector('style[data-plugin-netease-music]');
      if (tag) tag.remove();
    }

    // ---------- 请求与数据工具 ----------

    async function request(path, init) {
      const response = await fetch(API + path, init);
      const json = await response.json().catch(() => null);
      if (!json || typeof json !== 'object') throw new Error('响应无法解析（HTTP ' + response.status + '）');
      return json;
    }

    async function rpc(api, params) {
      const json = await request('/rpc', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ api, params: params ?? {} }),
      });
      if (!json.ok) throw new Error(json.error || '请求失败');
      return json.data;
    }

    const formatDuration = (ms) => {
      const total = Math.max(0, Math.round((Number(ms) || 0) / 1000));
      const minutes = Math.floor(total / 60);
      const seconds = total % 60;
      return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    };

    const formatSeconds = (seconds) => {
      const total = Math.max(0, Math.floor(Number(seconds) || 0));
      return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
    };

    const formatCount = (value) => {
      const count = Number(value) || 0;
      if (count >= 100000000) return (count / 100000000).toFixed(1) + '亿';
      if (count >= 10000) return (count / 10000).toFixed(1) + '万';
      return String(count);
    };

    function normalizeTrack(raw) {
      if (!raw || typeof raw !== 'object') return null;
      const artists = Array.isArray(raw.ar)
        ? raw.ar.map((artist) => artist && artist.name).filter(Boolean)
        : Array.isArray(raw.artists)
          ? raw.artists.map((artist) => artist && artist.name).filter(Boolean)
          : [];
      const album = raw.al ?? raw.album ?? {};
      return {
        id: raw.id,
        name: raw.name || '未知歌曲',
        artists,
        album: album.name || '',
        coverUrl: album.picUrl || raw.picUrl || '',
        duration: raw.dt ?? raw.duration ?? 0,
        fee: raw.fee ?? 0,
        alias: Array.isArray(raw.alia) && raw.alia.length > 0 ? raw.alia[0] : '',
      };
    }

    function normalizeTracks(list) {
      if (!Array.isArray(list)) return [];
      return list.map(normalizeTrack).filter(Boolean);
    }

    function artistText(track) {
      if (!track || track.artists.length === 0) return '未知歌手';
      return track.artists.join(' / ');
    }

    // ---------- 播放器（模块级单例，跨面板存活） ----------

    function createPlayer() {
      let state = {
        audio: null,
        track: null,
        queue: [],
        index: -1,
        playing: false,
        loading: false,
        error: '',
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        mode: 'list',
        url: '',
        panelVisible: false,
      };
      const listeners = new Set();
      const emit = () => {
        for (const listener of [...listeners]) {
          try {
            listener();
          } catch {
            /* 单个订阅者出错不影响其他订阅者 */
          }
        }
      };
      const patch = (next) => {
        state = { ...state, ...next };
        emit();
      };
      let playToken = 0;

      function bindAudio(audio) {
        if (state.audio === audio) return;
        if (state.audio) {
          const old = state.audio;
          old.onplay = null;
          old.onpause = null;
          old.onended = null;
          old.ontimeupdate = null;
          old.ondurationchange = null;
          old.onerror = null;
          old.onwaiting = null;
          old.oncanplay = null;
          try {
            old.pause();
          } catch {
            /* 已经卸载的 audio 无法读状态 */
          }
        }
        if (!audio) {
          patch({ audio: null, playing: false });
          return;
        }
        audio.volume = state.volume;
        audio.onplay = () => patch({ playing: true });
        audio.onpause = () => patch({ playing: false });
        audio.ontimeupdate = () => patch({ currentTime: audio.currentTime || 0 });
        audio.ondurationchange = () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) patch({ duration: audio.duration });
        };
        audio.onended = () => {
          if (state.mode === 'single') {
            audio.currentTime = 0;
            void audio.play().catch(() => undefined);
            return;
          }
          next();
        };
        audio.onwaiting = () => patch({ loading: true });
        audio.oncanplay = () => patch({ loading: false });
        audio.onerror = () => {
          patch({ loading: false, playing: false, error: '音频加载失败，换一首试试' });
        };
        patch({ audio });
      }

      async function playTrack(track, context) {
        const normalized = normalizeTrack(track);
        if (!normalized) return;
        const token = ++playToken;
        let queue = state.queue;
        let index = state.index;
        if (context && Array.isArray(context.queue)) {
          queue = context.queue;
          index = context.index ?? queue.findIndex((item) => item.id === normalized.id);
          if (index < 0) index = 0;
        } else if (!queue.some((item) => item.id === normalized.id)) {
          queue = [normalized];
          index = 0;
        } else {
          index = queue.findIndex((item) => item.id === normalized.id);
        }
        patch({ track: normalized, queue, index, loading: true, error: '', currentTime: 0, duration: normalized.duration / 1000 || 0 });
        try {
          const data = await rpc('songUrl', { ids: [normalized.id] });
          if (token !== playToken) return;
          const entry = Array.isArray(data?.data) ? data.data.find((item) => item && item.id === normalized.id) ?? data.data[0] : null;
          const url = entry && entry.url ? String(entry.url) : '';
          if (!url) {
            patch({ loading: false, playing: false, error: '这首歌暂时无法播放（可能需要登录或会员）' });
            return;
          }
          const audio = state.audio;
          if (!audio) {
            patch({ loading: false, error: '播放器尚未就绪' });
            return;
          }
          audio.src = url;
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((error) => {
              if (token !== playToken) return;
              patch({
                loading: false,
                playing: false,
                error: error && error.name === 'NotAllowedError' ? '浏览器拦截了自动播放，请再点一次播放' : '播放失败',
              });
            });
          }
        } catch (error) {
          if (token !== playToken) return;
          patch({ loading: false, playing: false, error: String((error && error.message) || error) });
        }
      }

      function toggle() {
        const audio = state.audio;
        if (!audio || !state.track) return;
        if (audio.paused) {
          void audio.play().catch(() => patch({ error: '播放失败' }));
        } else {
          audio.pause();
        }
      }

      function orderOf(index, length, mode) {
        if (length === 0) return -1;
        if (mode === 'shuffle') {
          if (length === 1) return 0;
          let next = index;
          for (let attempt = 0; attempt < 20 && next === index; attempt += 1) next = Math.floor(Math.random() * length);
          return next;
        }
        return (index + 1 + length) % length;
      }

      function next() {
        if (state.queue.length === 0) return;
        const target = orderOf(state.index, state.queue.length, state.mode);
        const track = state.queue[target];
        if (track) void playTrack(track, { queue: state.queue, index: target });
      }

      function previous() {
        if (state.queue.length === 0) return;
        const audio = state.audio;
        if (audio && audio.currentTime > 3) {
          audio.currentTime = 0;
          return;
        }
        const target = state.mode === 'shuffle' ? orderOf(state.index, state.queue.length, 'shuffle') : (state.index - 1 + state.queue.length) % state.queue.length;
        const track = state.queue[target];
        if (track) void playTrack(track, { queue: state.queue, index: target });
      }

      function seek(seconds) {
        const audio = state.audio;
        if (!audio) return;
        const target = Math.max(0, Math.min(Number(seconds) || 0, Number.isFinite(audio.duration) ? audio.duration : 0));
        audio.currentTime = target;
        patch({ currentTime: target });
      }

      function setVolume(value) {
        const volume = Math.max(0, Math.min(1, Number(value) || 0));
        if (state.audio) state.audio.volume = volume;
        patch({ volume });
      }

      function setMode(mode) {
        patch({ mode });
      }

      function cycleMode() {
        const modes = ['list', 'single', 'shuffle'];
        setMode(modes[(modes.indexOf(state.mode) + 1) % modes.length]);
      }

      function playQueue(tracks, startIndex) {
        const queue = normalizeTracks(tracks);
        if (queue.length === 0) return;
        const index = Math.max(0, Math.min(startIndex ?? 0, queue.length - 1));
        void playTrack(queue[index], { queue, index });
      }

      function setPanelVisible(visible) {
        if (state.panelVisible === visible) return;
        patch({ panelVisible: visible });
      }

      function clearError() {
        patch({ error: '' });
      }

      return {
        getSnapshot: () => state,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        bindAudio,
        playTrack,
        playQueue,
        toggle,
        next,
        previous,
        seek,
        setVolume,
        setMode,
        cycleMode,
        setPanelVisible,
        clearError,
      };
    }

    const player = createPlayer();
    // 旧模块实例（热更新）可能还持有 audio，用 window 上的单例避免双份播放
    const sharedPlayer = (() => {
      if (typeof window === 'undefined') return player;
      if (window.__dshNeteasePlayer) return window.__dshNeteasePlayer;
      window.__dshNeteasePlayer = player;
      return player;
    })();

    function usePlayerState() {
      return useSyncExternalStore(sharedPlayer.subscribe, sharedPlayer.getSnapshot, sharedPlayer.getSnapshot);
    }

    // ---------- 登录会话（模块级） ----------

    function createSession() {
      let state = { status: 'idle', loggedIn: false, profile: null, error: '' };
      const listeners = new Set();
      const emit = () => {
        for (const listener of listeners) listener();
      };
      const patch = (next) => {
        state = { ...state, ...next };
        emit();
      };
      let loading = null;
      async function refresh() {
        if (loading) return loading;
        loading = (async () => {
          try {
            const json = await request('/status');
            if (json.ok) {
              patch({ status: 'ready', loggedIn: Boolean(json.loggedIn), profile: json.profile ?? null, error: '' });
            } else {
              patch({ status: 'ready', error: json.error || '状态获取失败' });
            }
          } catch (error) {
            patch({ status: 'ready', error: String((error && error.message) || error) });
          } finally {
            loading = null;
          }
        })();
        return loading;
      }
      async function logout() {
        try {
          await request('/logout', { method: 'POST' });
        } catch {
          /* 本地照样清状态 */
        }
        patch({ loggedIn: false, profile: null });
      }
      return {
        getSnapshot: () => state,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        refresh,
        logout,
      };
    }

    const session = createSession();
    const sharedSession = (() => {
      if (typeof window === 'undefined') return session;
      if (window.__dshNeteaseSession) return window.__dshNeteaseSession;
      window.__dshNeteaseSession = session;
      return session;
    })();

    function useSession() {
      return useSyncExternalStore(sharedSession.subscribe, sharedSession.getSnapshot, sharedSession.getSnapshot);
    }

    // ---------- 图标 ----------

    function svgIcon(size, path, options) {
      const viewBox = (options && options.viewBox) || '0 0 24 24';
      const content =
        options && Array.isArray(options.children)
          ? options.children
          : typeof path === 'string'
            ? h('path', { d: path })
            : path;
      return h(
        'svg',
        {
          width: options && options.width ? options.width : size,
          height: size,
          viewBox,
          fill: options && options.fill !== undefined ? options.fill : 'currentColor',
          'aria-hidden': 'true',
          style: { display: 'block', flex: '0 0 auto' },
        },
        content,
      );
    }

    const IconPlay = ({ size = 18 }) => svgIcon(size, 'M8 5v14l11-7z');
    const IconPause = ({ size = 18 }) => svgIcon(size, 'M6 5h4v14H6zM14 5h4v14h-4z');
    const IconPrev = ({ size = 16 }) =>
      svgIcon(size, 'M6 5h2v14H6zm12 0v14l-9-7z');
    const IconNext = ({ size = 16 }) => svgIcon(size, 'M16 5h2v14h-2zM6 5l9 7-9 7z');
    const IconSearch = ({ size = 15 }) =>
      svgIcon(size, null, {
        fill: 'none',
        children: [
          h('circle', { key: 'c', cx: 11, cy: 11, r: 7, stroke: 'currentColor', strokeWidth: 2 }),
          h('path', { key: 'l', d: 'M16.5 16.5L21 21', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }),
        ],
      });
    const IconBack = ({ size = 16 }) => svgIcon(size, 'M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z');
    const IconUser = ({ size = 15 }) =>
      svgIcon(size, null, {
        fill: 'none',
        children: [
          h('circle', { key: 'c', cx: 12, cy: 8.5, r: 3.6, stroke: 'currentColor', strokeWidth: 1.8 }),
          h('path', { key: 'p', d: 'M4.8 20c.6-3.6 3.6-5.6 7.2-5.6s6.6 2 7.2 5.6', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none' }),
        ],
      });
    const IconVolume = ({ size = 15 }) =>
      svgIcon(size, null, {
        fill: 'none',
        children: [
          h('path', { key: 's', d: 'M4 9.5h3l4-3.5v12l-4-3.5H4z', fill: 'currentColor' }),
          h('path', { key: 'w', d: 'M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }),
        ],
      });
    const IconHeart = ({ size = 14 }) => svgIcon(size, 'M12 21s-7.5-4.7-9.3-9A5.2 5.2 0 0112 6.4 5.2 5.2 0 0121.3 12c-1.8 4.3-9.3 9-9.3 9z');
    const IconRefresh = ({ size = 14 }) => svgIcon(size, 'M12 5V2L7 6l5 4V7a5 5 0 11-5 5H5a7 7 0 107-7z');
    const IconMusic = ({ size = 14 }) => svgIcon(size, 'M9 18V6l10-2v12M9 18a3 3 0 11-3-3 3 3 0 013 3zM19 16a3 3 0 11-3-3 3 3 0 013 3z');

    // 侧边栏图标：云朵 + 音符。颜色跟随侧边栏文字色，选中态由侧边栏自己渲染。
    function NeteaseIcon({ size = 20, active = false }) {
      const color = 'currentColor';
      void active;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          'aria-hidden': 'true',
          style: { display: 'block' },
        },
        h('path', {
          d: 'M7.4 19.5a4.4 4.4 0 01-.5-8.77 5.6 5.6 0 0110.8-1.4 3.55 3.55 0 012.9 3.47 3.6 3.6 0 01-2.1 3.26',
          fill: 'none',
          stroke: color,
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M13.4 11.2v6.1',
          stroke: color,
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('circle', { cx: 11.4, cy: 17.6, r: 1.9, fill: color }),
        h('path', {
          d: 'M13.4 11.2c1.4.3 2.4 1 3 2.1',
          stroke: color,
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          fill: 'none',
        }),
      );
    }

    // 封面：加载失败时退回占位渐变
    function Cover({ url, className, alt, rounded }) {
      const [broken, setBroken] = useState(false);
      useEffect(() => {
        setBroken(false);
      }, [url]);
      const style = rounded ? { borderRadius: rounded } : undefined;
      if (!url || broken) {
        return h(
          'div',
          {
            className,
            style: {
              ...style,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent), var(--dsw-alias-bg-layer-2))',
              color: 'var(--dsw-alias-label-tertiary)',
              flex: '0 0 auto',
            },
            'aria-hidden': 'true',
          },
          h(IconMusic, { size: 18 }),
        );
      }
      return h('img', {
        className,
        style,
        src: url,
        alt: alt || '',
        loading: 'lazy',
        referrerPolicy: 'no-referrer',
        onError: () => setBroken(true),
      });
    }

    // ---------- 数据加载 hook ----------

    function useAsync(loader, deps) {
      const [state, setState] = useState({ status: 'loading', data: null, error: '' });
      const [nonce, setNonce] = useState(0);
      useEffect(() => {
        let cancelled = false;
        setState({ status: 'loading', data: null, error: '' });
        Promise.resolve()
          .then(loader)
          .then((data) => {
            if (!cancelled) setState({ status: 'ready', data, error: '' });
          })
          .catch((error) => {
            if (!cancelled) setState({ status: 'error', data: null, error: String((error && error.message) || error) });
          });
        return () => {
          cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [...deps, nonce]);
      return { ...state, reload: () => setNonce((value) => value + 1) };
    }

    // ---------- 通用组件 ----------

    function Loading({ label }) {
      return h('div', { className: 'dnm-empty' }, h('div', { className: 'dnm-spinner' }), h('span', null, label || '加载中…'));
    }

    function Empty({ label, action }) {
      return h('div', { className: 'dnm-empty' }, h('span', null, label), action || null);
    }

    function ErrorBox({ message, onRetry, retryLabel }) {
      return h(
        'div',
        { className: 'dnm-empty' },
        h('span', null, message),
        onRetry ? h('button', { type: 'button', className: 'dnm-btn', onClick: onRetry }, retryLabel || '重试') : null,
      );
    }

    function TrackRow({ track, index, playing, onPlay, t }) {
      const isVip = track.fee === 1 || track.fee === 4;
      return h(
        'div',
        {
          className: 'dnm-row' + (playing ? ' playing' : ''),
          onDoubleClick: () => onPlay(),
          role: 'button',
          tabIndex: 0,
          onKeyDown: (event) => {
            if (event.key === 'Enter') onPlay();
          },
          title: track.name,
        },
        h('div', { className: 'dnm-row-index' }, playing ? h(IconMusic, { size: 12 }) : String(index + 1).padStart(2, '0')),
        h(
          'div',
          { className: 'dnm-row-title' },
          h(
            'div',
            { className: 'dnm-row-name' },
            h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, track.name),
            isVip ? h('span', { className: 'dnm-vip' }, 'VIP') : null,
          ),
          h('div', { className: 'dnm-row-artist' }, artistText(track)),
        ),
        h('div', { className: 'dnm-row-album' }, track.album || ''),
        h('div', { className: 'dnm-row-duration' }, formatDuration(track.duration)),
        h(
          'button',
          {
            type: 'button',
            className: 'dnm-row-action',
            title: t('play'),
            onClick: (event) => {
              event.stopPropagation();
              onPlay();
            },
          },
          h(IconPlay, { size: 13 }),
        ),
      );
    }

    // ---------- 视图：发现 ----------

    function DiscoverView({ t, onOpenPlaylist, onOpenToplist }) {
      const charts = useAsync(async () => {
        const data = await rpc('toplist');
        return Array.isArray(data?.list) ? data.list : [];
      }, []);
      const playlists = useAsync(async () => {
        const data = await rpc('personalized', { limit: 12 });
        return Array.isArray(data?.result) ? data.result : [];
      }, []);
      const featured = (charts.data || []).filter((chart) =>
        ['飙升榜', '新歌榜', '热歌榜', '原创榜', '说唱榜', '电音榜'].includes(chart.name),
      );
      const shownCharts = featured.length > 0 ? featured : (charts.data || []).slice(0, 6);
      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('brand')),
        h('p', { className: 'dnm-sub' }, t('panel')),
        h(
          'div',
          { className: 'dnm-section' },
          h('h2', { className: 'dnm-h2' }, t('hotCharts')),
          charts.status === 'loading'
            ? h(Loading, { label: t('loading') })
            : charts.status === 'error'
              ? h(ErrorBox, { message: charts.error, onRetry: charts.reload, retryLabel: t('retry') })
              : h(
                  'div',
                  { className: 'dnm-chart-list' },
                  shownCharts.map((chart) =>
                    h(
                      'button',
                      {
                        type: 'button',
                        key: chart.id,
                        className: 'dnm-chart',
                        onClick: () => onOpenPlaylist(chart.id),
                      },
                      h(Cover, { url: chart.coverImgUrl, className: 'dnm-chart-cover' }),
                      h(
                        'div',
                        { className: 'dnm-chart-info' },
                        h('div', { className: 'dnm-chart-name' }, chart.name),
                        h('div', { className: 'dnm-chart-desc' }, chart.description || chart.updateFrequency || ''),
                      ),
                    ),
                  ),
                ),
        ),
        h(
          'div',
          { className: 'dnm-section' },
          h('h2', { className: 'dnm-h2' }, t('hotPlaylists')),
          playlists.status === 'loading'
            ? h(Loading, { label: t('loading') })
            : playlists.status === 'error'
              ? h(ErrorBox, { message: playlists.error, onRetry: playlists.reload, retryLabel: t('retry') })
              : h(
                  'div',
                  { className: 'dnm-grid' },
                  (playlists.data || []).map((playlist) =>
                    h(
                      'button',
                      {
                        type: 'button',
                        key: playlist.id,
                        className: 'dnm-card',
                        onClick: () => onOpenPlaylist(playlist.id),
                      },
                      h(
                        'div',
                        { className: 'dnm-cover' },
                        h(Cover, { url: playlist.picUrl, className: 'dnm-cover-img', alt: playlist.name }),
                        h('span', { className: 'dnm-cover-count' }, h(IconPlay, { size: 10 }), formatCount(playlist.playCount)),
                      ),
                      h('div', { className: 'dnm-card-title' }, playlist.name),
                    ),
                  ),
                ),
          h(
            'div',
            { style: { marginTop: 12 } },
            h('button', { type: 'button', className: 'dnm-btn', onClick: onOpenToplist }, t('allCharts')),
          ),
        ),
      );
    }

    // ---------- 视图：全部榜单 ----------

    function ToplistView({ t, onOpenPlaylist }) {
      const charts = useAsync(async () => {
        const data = await rpc('toplist');
        return Array.isArray(data?.list) ? data.list : [];
      }, []);
      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('tabToplist')),
        charts.status === 'loading'
          ? h(Loading, { label: t('loading') })
          : charts.status === 'error'
            ? h(ErrorBox, { message: charts.error, onRetry: charts.reload, retryLabel: t('retry') })
            : h(
                'div',
                { className: 'dnm-chart-list' },
                (charts.data || []).map((chart) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      key: chart.id,
                      className: 'dnm-chart',
                      onClick: () => onOpenPlaylist(chart.id),
                    },
                    h(Cover, { url: chart.coverImgUrl, className: 'dnm-chart-cover' }),
                    h(
                      'div',
                      { className: 'dnm-chart-info' },
                      h('div', { className: 'dnm-chart-name' }, chart.name),
                      h('div', { className: 'dnm-chart-desc' }, (chart.updateFrequency || '') + (chart.trackCount ? ' · ' + chart.trackCount + recordSuffix(t) : '')),
                    ),
                  ),
                ),
              ),
      );
    }

    function recordSuffix(t) {
      return t('songCount');
    }

    // ---------- 视图：歌单详情 ----------

    function PlaylistView({ t, playlistId, onBack }) {
      const detail = useAsync(async () => {
        const data = await rpc('playlistDetail', { id: playlistId, n: 1000 });
        const playlist = data?.playlist;
        if (!playlist) throw new Error('歌单不存在或已下架');
        return {
          id: playlist.id,
          name: playlist.name,
          coverUrl: playlist.coverImgUrl,
          creator: playlist.creator?.nickname || '',
          trackCount: playlist.trackCount || (playlist.tracks ? playlist.tracks.length : 0),
          description: playlist.description || '',
          tags: Array.isArray(playlist.tags) ? playlist.tags : [],
          tracks: normalizeTracks(playlist.tracks),
        };
      }, [playlistId]);
      const playerState = usePlayerState();
      const playlist = detail.data;
      const currentId = playerState.track ? playerState.track.id : null;
      return h(
        'div',
        { className: 'dnm-content' },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 } },
          h(
            'button',
            { type: 'button', className: 'dnm-btn', onClick: onBack },
            h(IconBack, { size: 13 }),
            t('back'),
          ),
        ),
        detail.status === 'loading'
          ? h(Loading, { label: t('loading') })
          : detail.status === 'error'
            ? h(ErrorBox, { message: detail.error, onRetry: detail.reload, retryLabel: t('retry') })
            : h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'dnm-playlist-head' },
                  h(Cover, { url: playlist.coverUrl, className: 'dnm-playlist-cover', alt: playlist.name }),
                  h(
                    'div',
                    { className: 'dnm-playlist-info' },
                    h('h1', { className: 'dnm-playlist-name' }, playlist.name),
                    h(
                      'p',
                      { className: 'dnm-playlist-meta' },
                      (playlist.creator ? playlist.creator + ' · ' : '') + playlist.trackCount + recordSuffix(t),
                    ),
                    playlist.description
                      ? h(
                          'p',
                          {
                            className: 'dnm-playlist-meta',
                            style: { maxHeight: 42, overflow: 'hidden', marginBottom: 14 },
                          },
                          playlist.description,
                        )
                      : null,
                    h(
                      'div',
                      { className: 'dnm-actions' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dnm-btn primary',
                          disabled: playlist.tracks.length === 0,
                          onClick: () => sharedPlayer.playQueue(playlist.tracks, 0),
                        },
                        h(IconPlay, { size: 14 }),
                        t('playAll'),
                      ),
                    ),
                  ),
                ),
                playlist.tracks.length === 0
                  ? h(Empty, { label: t('empty') })
                  : h(
                      'div',
                      null,
                      playlist.tracks.map((track, index) =>
                        h(TrackRow, {
                          key: track.id + '-' + index,
                          track,
                          index,
                          playing: currentId === track.id,
                          t,
                          onPlay: () => sharedPlayer.playQueue(playlist.tracks, index),
                        }),
                      ),
                    ),
              ),
      );
    }

    // ---------- 视图：搜索 ----------

    function SearchView({ t, keyword, onSearch }) {
      const [input, setInput] = useState(keyword || '');
      const result = useAsync(async () => {
        if (!keyword) return { songs: [], playlists: [] };
        const [songData, playlistData] = await Promise.all([
          rpc('search', { q: keyword, type: 1, limit: 50 }),
          rpc('search', { q: keyword, type: 1000, limit: 6 }).catch(() => null),
        ]);
        return {
          songs: normalizeTracks(songData?.result?.songs),
          playlists: Array.isArray(playlistData?.result?.playlists) ? playlistData.result.playlists : [],
        };
      }, [keyword]);
      useEffect(() => {
        setInput(keyword || '');
      }, [keyword]);
      const playerState = usePlayerState();
      const currentId = playerState.track ? playerState.track.id : null;
      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('search')),
        h(
          'div',
          {
            className: 'dnm-search',
            style: { maxWidth: 480, marginBottom: 20 },
          },
          h(IconSearch, { size: 15 }),
          h('input', {
            value: input,
            placeholder: t('searchPlaceholder'),
            onChange: (event) => setInput(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') onSearch(input.trim());
            },
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-btn',
              style: { height: 24, padding: '0 10px', fontSize: 12 },
              onClick: () => onSearch(input.trim()),
            },
            t('search'),
          ),
        ),
        !keyword
          ? h(Empty, { label: t('searchPlaceholder') })
          : result.status === 'loading'
            ? h(Loading, { label: t('loading') })
            : result.status === 'error'
              ? h(ErrorBox, { message: result.error, onRetry: result.reload, retryLabel: t('retry') })
              : result.data.songs.length === 0
                ? h(Empty, { label: t('noResult') })
                : h(
                    'div',
                    null,
                    h('h2', { className: 'dnm-h2' }, t('search')),
                    result.data.songs.map((track, index) =>
                      h(TrackRow, {
                        key: track.id + '-' + index,
                        track,
                        index,
                        playing: currentId === track.id,
                        t,
                        onPlay: () => sharedPlayer.playQueue(result.data.songs, index),
                      }),
                    ),
                  ),
      );
    }

    // ---------- 视图：我的音乐 ----------

    function MineView({ t, onOpenPlaylist, onLogin }) {
      const state = useSession();
      const uid = state.profile ? state.profile.userId : 0;
      const playlists = useAsync(async () => {
        if (!uid) return [];
        const data = await rpc('userPlaylist', { uid, limit: 100 });
        return Array.isArray(data?.playlist) ? data.playlist : [];
      }, [uid]);
      const daily = useAsync(async () => {
        if (!state.loggedIn) return [];
        const data = await rpc('recommendSongs').catch(() => null);
        return normalizeTracks(data?.recommend ?? data?.data?.dailySongs ?? []);
      }, [state.loggedIn]);
      if (!state.loggedIn) {
        return h(
          'div',
          { className: 'dnm-content' },
          h('h1', { className: 'dnm-h1' }, t('tabMine')),
          h(
            'div',
            { className: 'dnm-mine-head', style: { flexDirection: 'column', alignItems: 'flex-start' } },
            h('div', { className: 'dnm-mine-name' }, t('loggedOut')),
            h('p', { className: 'dnm-mine-sig' }, t('loginHint')),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-btn primary',
                style: { marginTop: 12 },
                onClick: onLogin,
              },
              h(IconUser, { size: 14 }),
              t('login'),
            ),
          ),
        );
      }
      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('tabMine')),
        h(
          'div',
          { className: 'dnm-mine-head' },
          h(Cover, { url: state.profile.avatarUrl, className: 'dnm-mine-avatar' }),
          h(
            'div',
            null,
            h('h2', { className: 'dnm-mine-name' }, state.profile.nickname || t('account')),
            h('p', { className: 'dnm-mine-sig' }, state.profile.signature || ''),
          ),
        ),
        daily.data && daily.data.length > 0
          ? h(
              'div',
              { className: 'dnm-section' },
              h('h2', { className: 'dnm-h2' }, t('dailyRecommend')),
              daily.data.slice(0, 12).map((track, index) =>
                h(TrackRow, {
                  key: track.id + '-' + index,
                  track,
                  index,
                  t,
                  playing: false,
                  onPlay: () => sharedPlayer.playQueue(daily.data, index),
                }),
              ),
            )
          : null,
        h(
          'div',
          { className: 'dnm-section' },
          h('h2', { className: 'dnm-h2' }, t('myPlaylists')),
          playlists.status === 'loading'
            ? h(Loading, { label: t('loading') })
            : playlists.status === 'error'
              ? h(ErrorBox, { message: playlists.error, onRetry: playlists.reload, retryLabel: t('retry') })
              : h(
                  'div',
                  { className: 'dnm-grid' },
                  (playlists.data || []).map((playlist) =>
                    h(
                      'button',
                      {
                        type: 'button',
                        key: playlist.id,
                        className: 'dnm-card',
                        onClick: () => onOpenPlaylist(playlist.id),
                      },
                      h(
                        'div',
                        { className: 'dnm-cover' },
                        h(Cover, { url: playlist.coverImgUrl, className: 'dnm-cover-img', alt: playlist.name }),
                        h(
                          'span',
                          { className: 'dnm-cover-count' },
                          h(IconPlay, { size: 10 }),
                          formatCount(playlist.playCount),
                        ),
                      ),
                      h('div', { className: 'dnm-card-title' }, playlist.name),
                    ),
                  ),
                ),
        ),
      );
    }

    // ---------- 播放条 ----------

    function PlayerBar({ t }) {
      const state = usePlayerState();
      const track = state.track;
      const duration = state.duration || (track ? track.duration / 1000 : 0);
      const progress = duration > 0 ? Math.min(state.currentTime, duration) : 0;
      const modeLabel =
        state.mode === 'single' ? t('playModeSingle') : state.mode === 'shuffle' ? t('playModeShuffle') : t('playModeList');
      return h(
        'div',
        { className: 'dnm-player' },
        h(
          'div',
          { className: 'dnm-player-left' },
          h(Cover, { url: track ? track.coverUrl : '', className: 'dnm-player-cover' }),
          h(
            'div',
            { className: 'dnm-player-meta' },
            h('div', { className: 'dnm-player-title' }, track ? track.name : t('nowPlaying')),
            h('div', { className: 'dnm-player-artist' }, track ? artistText(track) : ''),
          ),
        ),
        h(
          'div',
          { className: 'dnm-player-center' },
          h(
            'div',
            { className: 'dnm-controls' },
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-icon-btn',
                title: modeLabel,
                onClick: () => sharedPlayer.cycleMode(),
              },
              state.mode === 'shuffle'
                ? svgIcon(14, 'M17 3l4 4-4 4V8h-3.2l-2.6 3-1.4-1.6L12.6 6H17V3zM3 6h5.4l2.4 2.8-1.4 1.6L7.8 8H3V6zm14 8v-3l4 4-4 4v-3h-4.4l-2.3-2.7 1.4-1.6L13.8 14H17zM3 18v-2h4.8l2.1-2.4 1.4 1.6L8.4 18H3z')
                : state.mode === 'single'
                  ? svgIcon(14, 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z')
                  : svgIcon(14, 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-icon-btn',
                title: '上一首',
                disabled: !track,
                onClick: () => sharedPlayer.previous(),
              },
              h(IconPrev, { size: 15 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-icon-btn play',
                title: state.playing ? '暂停' : '播放',
                disabled: !track && state.queue.length === 0,
                onClick: () => {
                  if (state.track) sharedPlayer.toggle();
                  else if (state.queue.length > 0) sharedPlayer.playQueue(state.queue, 0);
                },
              },
              state.loading ? h('div', { className: 'dnm-spinner', style: { width: 15, height: 15 } }) : state.playing ? h(IconPause, { size: 17 }) : h(IconPlay, { size: 17 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-icon-btn',
                title: '下一首',
                disabled: !track,
                onClick: () => sharedPlayer.next(),
              },
              h(IconNext, { size: 15 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-icon-btn',
                title: t('queue'),
                onClick: () => sharedPlayer.next(),
                style: { visibility: 'hidden' },
              },
              null,
            ),
          ),
          h(
            'div',
            { className: 'dnm-progress' },
            h('span', { className: 'dnm-time' }, formatSeconds(progress)),
            h('input', {
              className: 'dnm-range',
              type: 'range',
              min: 0,
              max: Math.max(1, Math.round(duration)),
              step: 1,
              value: Math.round(progress),
              disabled: !track,
              onChange: (event) => sharedPlayer.seek(Number(event.target.value)),
            }),
            h('span', { className: 'dnm-time right' }, formatSeconds(duration)),
          ),
          state.error
            ? h(
                'div',
                {
                  className: 'dnm-status error',
                  title: state.error,
                  onClick: () => sharedPlayer.clearError(),
                  style: { cursor: 'pointer' },
                },
                state.error,
              )
            : null,
        ),
        h(
          'div',
          { className: 'dnm-player-right' },
          h(IconVolume, { size: 15 }),
          h('input', {
            className: 'dnm-range dnm-volume',
            type: 'range',
            min: 0,
            max: 1,
            step: 0.01,
            value: state.volume,
            onChange: (event) => sharedPlayer.setVolume(Number(event.target.value)),
          }),
        ),
      );
    }

    // ---------- 登录弹窗 ----------

    function LoginDialog({ t, onClose, onSuccess }) {
      const [mode, setMode] = useState('assistant');
      const [qr, setQr] = useState(null);
      const [state, setState] = useState('loading');
      const [message, setMessage] = useState('');
      const [error, setError] = useState('');
      const [risk, setRisk] = useState(false);
      const [cookieText, setCookieText] = useState('');
      const [cookieBusy, setCookieBusy] = useState(false);
      const [assistantState, setAssistantState] = useState('idle');
      const [assistantMessage, setAssistantMessage] = useState('');
      const pollRef = useRef(null);
      const assistantPollRef = useRef(null);
      const assistantStateRef = useRef('idle');
      const closedRef = useRef(false);

      useEffect(() => {
        assistantStateRef.current = assistantState;
      }, [assistantState]);

      const loadQr = useCallback(async () => {
        setState('loading');
        setError('');
        setMessage('');
        setRisk(false);
        try {
          const json = await request('/login/qr', { method: 'POST' });
          if (closedRef.current) return;
          if (!json.ok) {
            setState('error');
            setError(json.error || t('loginFailed'));
            return;
          }
          setQr(json);
          setState('waiting');
          setMessage(t('loginWaiting'));
        } catch (loadError) {
          if (closedRef.current) return;
          setState('error');
          setError(String((loadError && loadError.message) || loadError));
        }
      }, [t]);

      useEffect(() => {
        closedRef.current = false;
        // 打开弹窗时先看看 Host 那边是不是已经有登录窗口在跑（比如上次没关）。
        void (async () => {
          try {
            const json = await request('/login/assistant/status');
            if (closedRef.current) return;
            if (json && json.running) {
              setAssistantState('running');
              setAssistantMessage(json.message || t('loginAssistantWaiting'));
            } else if (json && json.done) {
              setAssistantState('done');
            }
          } catch {
            /* 忽略：拿不到状态就当作没在跑 */
          }
        })();
        return () => {
          closedRef.current = true;
          const current = assistantStateRef.current;
          if (current === 'running' || current === 'starting') {
            void request('/login/assistant/cancel', { method: 'POST' }).catch(() => {});
          }
        };
      }, [t]);

      useEffect(() => {
        if (mode !== 'qr' || !qr || !qr.key || state === 'expired' || state === 'error' || state === 'success') {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          return undefined;
        }
        pollRef.current = setInterval(async () => {
          try {
            const json = await request('/login/qr/check?key=' + encodeURIComponent(qr.key));
            if (closedRef.current) return;
            if (!json.ok) return;
            if (json.code === 800) {
              setState('expired');
              setMessage(t('loginExpired'));
            } else if (json.code === 802) {
              setMessage(t('loginScanned'));
            } else if (json.code === 803) {
              setState('success');
              setMessage(t('loginSuccess'));
              clearInterval(pollRef.current);
              pollRef.current = null;
              onSuccess();
            } else if (json.code !== 801) {
              // 8821 之类的风控/异常码：停下轮询，把网易云的原话显示出来，并引导改用 Cookie。
              setRisk(true);
              setMessage(json.message || t('loginFailed'));
            }
          } catch {
            /* 轮询失败静默重试 */
          }
        }, QR_POLL_MS);
        return () => {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        };
      }, [mode, qr, state, t, onSuccess]);

      // 只有切到扫码标签时才去要二维码，避免一打开弹窗就多发一次请求。
      useEffect(() => {
        if (mode === 'qr' && !qr) void loadQr();
      }, [mode, qr, loadQr]);

      const startAssistant = useCallback(async () => {
        setError('');
        setAssistantState('starting');
        setAssistantMessage(t('loginAssistantStarting'));
        try {
          const json = await request('/login/assistant/start', { method: 'POST' });
          if (closedRef.current) return;
          if (!json.ok) {
            setAssistantState('error');
            setAssistantMessage(json.error || t('loginAssistantNoBrowser'));
            return;
          }
          if (json.done) {
            setAssistantState('done');
            setMessage(t('loginSuccess'));
            onSuccess();
            return;
          }
          setAssistantState('running');
          setAssistantMessage(json.message || t('loginAssistantOpened'));
        } catch (startError) {
          if (closedRef.current) return;
          setAssistantState('error');
          setAssistantMessage(String((startError && startError.message) || startError));
        }
      }, [t, onSuccess]);

      const cancelAssistant = useCallback(async () => {
        setAssistantState('idle');
        setAssistantMessage('');
        try {
          await request('/login/assistant/cancel', { method: 'POST' });
        } catch {
          /* 忽略：窗口可能已经关了 */
        }
      }, []);

      useEffect(() => {
        if (assistantState !== 'running') {
          if (assistantPollRef.current) {
            clearInterval(assistantPollRef.current);
            assistantPollRef.current = null;
          }
          return undefined;
        }
        assistantPollRef.current = setInterval(async () => {
          try {
            const json = await request('/login/assistant/status');
            if (closedRef.current || !json) return;
            if (json.message) setAssistantMessage(json.message);
            if (json.done) {
              setAssistantState('done');
              setMessage(t('loginSuccess'));
              clearInterval(assistantPollRef.current);
              assistantPollRef.current = null;
              onSuccess();
            } else if (json.error) {
              setAssistantState('error');
              setAssistantMessage(json.error);
            }
          } catch {
            /* 静默重试 */
          }
        }, ASSISTANT_POLL_MS);
        return () => {
          if (assistantPollRef.current) {
            clearInterval(assistantPollRef.current);
            assistantPollRef.current = null;
          }
        };
      }, [assistantState, t, onSuccess]);

      const submitCookie = useCallback(async () => {
        if (!cookieText.trim()) {
          setError(t('loginCookieRequired'));
          return;
        }
        setCookieBusy(true);
        setError('');
        try {
          const json = await request('/login/cookie', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ cookie: cookieText }),
          });
          if (!json.ok) {
            setError(json.error || t('loginFailed'));
            return;
          }
          setState('success');
          setMessage(t('loginSuccess'));
          onSuccess();
        } catch (submitError) {
          setError(String((submitError && submitError.message) || submitError));
        } finally {
          setCookieBusy(false);
        }
      }, [cookieText, t, onSuccess]);

      useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => document.removeEventListener('keydown', onKeyDown, true);
      }, [onClose]);

      const qrPanel = h(
        'div',
        { className: 'dnm-qr' },
        state === 'loading'
          ? h(
              'div',
              { className: 'dnm-qr-loading' },
              h('div', { className: 'dnm-spinner' }),
              h('span', null, t('loading')),
            )
          : qr && qr.svg
            ? h('div', {
                style: { width: '100%', height: '100%' },
                dangerouslySetInnerHTML: { __html: qr.svg },
              })
            : h(
                'div',
                { className: 'dnm-qr-loading' },
                h('span', null, error || t('loginFailed')),
                h(
                  'button',
                  { type: 'button', className: 'dnm-btn', onClick: loadQr },
                  h(IconRefresh, { size: 13 }),
                  t('loginRefresh'),
                ),
              ),
      );

      const cookiePanel = h(
        React.Fragment,
        null,
        h('p', { className: 'dnm-cookie-help' }, t('loginCookieHint')),
        h('textarea', {
          className: 'dnm-cookie-input',
          value: cookieText,
          placeholder: t('loginCookiePlaceholder'),
          spellCheck: false,
          onChange: (event) => setCookieText(event.target.value),
        }),
        error ? h('div', { className: 'dnm-login-error' }, error) : null,
      );

      const assistantRunning = assistantState === 'running' || assistantState === 'starting';
      const assistantPanel = h(
        React.Fragment,
        null,
        h('p', { className: 'dnm-cookie-help' }, t('loginAssistantHint')),
        assistantRunning
          ? h(
              'div',
              { className: 'dnm-login-state dnm-login-busy' },
              h('div', { className: 'dnm-spinner' }),
              h('span', null, assistantMessage || t('loginAssistantWaiting')),
            )
          : assistantState === 'done'
            ? h(
                'div',
                {
                  className: 'dnm-login-state',
                  style: { color: 'var(--dsw-alias-state-success-primary)' },
                },
                t('loginSuccess'),
              )
            : assistantState === 'error'
              ? h('div', { className: 'dnm-login-error' }, assistantMessage || t('loginAssistantNoBrowser'))
              : null,
      );

      return h(
        'div',
        {
          className: 'dnm-modal-mask',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose();
          },
        },
        h(
          'div',
          { className: 'dnm-modal', role: 'dialog', 'aria-modal': 'true' },
          h('h2', { className: 'dnm-modal-title' }, t('loginTitle')),
          h(
            'div',
            { className: 'dnm-login-tabs' },
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-login-tab' + (mode === 'assistant' ? ' active' : ''),
                onClick: () => {
                  setMode('assistant');
                  setError('');
                },
              },
              t('loginTabAssistant'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-login-tab' + (mode === 'qr' ? ' active' : ''),
                onClick: () => {
                  setMode('qr');
                  setError('');
                },
              },
              t('loginTabQr'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-login-tab' + (mode === 'cookie' ? ' active' : ''),
                onClick: () => {
                  setMode('cookie');
                  setError('');
                },
              },
              t('loginTabCookie'),
            ),
          ),
          mode === 'assistant'
            ? assistantPanel
            : mode === 'qr'
              ? h(
                  React.Fragment,
                  null,
                  h('p', { className: 'dnm-modal-hint' }, t('loginScanHint')),
                  qrPanel,
                  h(
                    'div',
                    {
                      className: 'dnm-login-state',
                      style: state === 'success' ? { color: 'var(--dsw-alias-state-success-primary)' } : undefined,
                    },
                    message,
                  ),
                  risk ? h('div', { className: 'dnm-login-risk' }, t('loginRiskHint')) : null,
                )
              : cookiePanel,
          h(
            'div',
            { className: 'dnm-modal-actions' },
            mode === 'assistant'
              ? assistantRunning
                ? h(
                    'button',
                    { type: 'button', className: 'dnm-btn', onClick: () => void cancelAssistant() },
                    t('loginAssistantCancel'),
                  )
                : assistantState === 'error'
                  ? h(
                      'button',
                      { type: 'button', className: 'dnm-btn primary', onClick: () => void startAssistant() },
                      h(IconRefresh, { size: 13 }),
                      t('loginAssistantRetry'),
                    )
                  : assistantState === 'done'
                    ? null
                    : h(
                        'button',
                        { type: 'button', className: 'dnm-btn primary', onClick: () => void startAssistant() },
                        t('loginAssistantStart'),
                      )
              : mode === 'qr'
                ? state === 'expired' || state === 'error'
                  ? h(
                      'button',
                      { type: 'button', className: 'dnm-btn primary', onClick: loadQr },
                      h(IconRefresh, { size: 13 }),
                      t('loginRefresh'),
                    )
                  : risk
                    ? h(
                        'button',
                        { type: 'button', className: 'dnm-btn primary', onClick: () => setMode('cookie') },
                        t('loginSwitchCookie'),
                      )
                    : null
                : h(
                    'button',
                    {
                      type: 'button',
                      className: 'dnm-btn primary',
                      disabled: cookieBusy,
                      onClick: () => void submitCookie(),
                    },
                    cookieBusy ? t('loading') : t('loginCookieSubmit'),
                  ),
            h('button', { type: 'button', className: 'dnm-btn', onClick: onClose }, t('close')),
          ),
        ),
      );
    }

    // ---------- 常驻音频宿主 ----------

    function AudioHost() {
      const audioRef = useRef(null);
      useEffect(() => {
        const audio = audioRef.current;
        if (audio) sharedPlayer.bindAudio(audio);
        return () => {
          sharedPlayer.bindAudio(null);
        };
      }, []);
      return h('audio', {
        ref: audioRef,
        preload: 'auto',
        style: { display: 'none' },
        'aria-hidden': 'true',
      });
    }

    // ---------- 主面板 ----------

    function NeteaseMusicPage(props) {
      const t = props.t;
      const [view, setView] = useState('discover');
      const [playlistId, setPlaylistId] = useState(null);
      const [keyword, setKeyword] = useState('');
      const [searchInput, setSearchInput] = useState('');
      const [loginOpen, setLoginOpen] = useState(false);
      const state = useSession();
      const playerState = usePlayerState();

      useEffect(() => {
        sharedPlayer.setPanelVisible(true);
        if (state.status === 'idle') void sharedSession.refresh();
        return () => sharedPlayer.setPanelVisible(false);
      }, [state.status]);

      const openPlaylist = useCallback((id) => {
        setPlaylistId(id);
        setView('playlist');
      }, []);

      const openSearch = useCallback((value) => {
        setKeyword(value);
        setView('search');
      }, []);

      const navItems = [
        { key: 'discover', label: t('tabDiscover'), icon: h(IconMusic, { size: 15 }) },
        { key: 'toplist', label: t('tabToplist'), icon: h(IconRefresh, { size: 15 }) },
        { key: 'mine', label: t('tabMine'), icon: h(IconUser, { size: 15 }) },
      ];

      let content;
      if (view === 'playlist' && playlistId) {
        content = h(PlaylistView, { t, playlistId, onBack: () => setView('discover') });
      } else if (view === 'toplist') {
        content = h(ToplistView, { t, onOpenPlaylist: openPlaylist });
      } else if (view === 'search') {
        content = h(SearchView, { t, keyword, onSearch: openSearch });
      } else if (view === 'mine') {
        content = h(MineView, {
          t,
          onOpenPlaylist: openPlaylist,
          onLogin: () => setLoginOpen(true),
        });
      } else {
        content = h(DiscoverView, { t, onOpenPlaylist: openPlaylist, onOpenToplist: () => setView('toplist') });
      }

      return h(
        'section',
        { className: 'dnm-root', 'aria-label': t('brand') },
        h(
          'header',
          { className: 'dnm-topbar' },
          h(
            'div',
            { className: 'dnm-brand' },
            h('span', { className: 'dnm-brand-mark', 'aria-hidden': 'true' }, h(IconMusic, { size: 13 })),
            h('span', null, t('brand')),
          ),
          h(
            'div',
            { className: 'dnm-search' },
            h(IconSearch, { size: 15 }),
            h('input', {
              value: searchInput,
              placeholder: t('searchPlaceholder'),
              onChange: (event) => setSearchInput(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter' && searchInput.trim()) openSearch(searchInput.trim());
              },
            }),
          ),
          h('div', { className: 'dnm-topbar-spacer' }),
          state.loggedIn && state.profile
            ? h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dnm-userbtn',
                    onClick: () => setView('mine'),
                    title: state.profile.nickname || t('account'),
                  },
                  h(Cover, { url: state.profile.avatarUrl, className: 'dnm-avatar' }),
                  h('span', { style: { maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis' } }, state.profile.nickname || t('account')),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dnm-userbtn',
                    onClick: async () => {
                      await sharedSession.logout();
                    },
                  },
                  t('logout'),
                ),
              )
            : h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-userbtn primary',
                  onClick: () => setLoginOpen(true),
                },
                h(IconUser, { size: 14 }),
                t('login'),
              ),
        ),
        h(
          'div',
          { className: 'dnm-body' },
          h(
            'nav',
            { className: 'dnm-nav' },
            navItems.map((item) =>
              h(
                'button',
                {
                  type: 'button',
                  key: item.key,
                  className:
                    'dnm-nav-item' + (view === item.key || (view === 'playlist' && item.key === 'discover') ? ' active' : ''),
                  onClick: () => {
                    if (item.key === 'discover') setPlaylistId(null);
                    setView(item.key);
                  },
                },
                item.icon,
                item.label,
              ),
            ),
            h('div', { className: 'dnm-nav-sep', 'aria-hidden': 'true' }),
            playerState.track
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'dnm-nav-item',
                    onClick: () => sharedPlayer.toggle(),
                    title: t('nowPlaying'),
                  },
                  h('span', { style: { width: 15, display: 'flex', justifyContent: 'center' } }, playerState.playing ? h(IconPause, { size: 13 }) : h(IconPlay, { size: 13 })),
                  h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, playerState.track.name),
                )
              : null,
          ),
          h('div', { className: 'dnm-main' }, h('div', { className: 'dnm-scroll dnm-scroll' }, content)),
        ),
        h(PlayerBar, { t }),
        loginOpen
          ? h(LoginDialog, {
              t,
              onClose: () => setLoginOpen(false),
              onSuccess: () => {
                void sharedSession.refresh();
                setLoginOpen(false);
                setView('mine');
              },
            })
          : null,
      );
    }

    // ---------- 模块导出 ----------

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ensureCss();
        ctx.effect(() => () => removeCss(), 'netease-music: styles');
        ctx.effect(
          () =>
            ctx.locale.register(NS, {
              zh,
              en,
            }),
          'netease-music: dictionaries',
        );
        const t = ctx.locale.bind(NS);

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: PANEL_ID,
              locale: NS,
              inject: () => ({ t }),
            },
            NeteaseMusicPage,
          ),
        );
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: PANEL_ID,
              order: 20,
              locale: NS,
              label: () => t('panel'),
            },
            NeteaseIcon,
          ),
        );
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'netease-music-audio',
            },
            AudioHost,
          ),
        );
      },
    };
  },
});
