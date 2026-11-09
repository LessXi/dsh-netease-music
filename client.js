// 网易云音乐 DSH 界面的 Client 端。
// 结构：侧边栏图标（sidebar.panellist）+ 主面板（main）+ 常驻音频宿主（shell.overlay）。
window.__ModuleLoader__.load({
  id: '@local/dsh-netease-music',
  factory(require) {
    const React = require('react');
    const { createPortal } = require('react-dom');
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
      fullscreenLyric: '全屏歌词',
      exitFullscreen: '退出全屏',
      upNext: '接下来播放',
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
      nowPlayingPage: '正在播放',
      lyrics: '歌词',
      lyricTranslation: '翻译',
      lyricFont: '歌词字号',
      lyricSizeSmall: '小',
      lyricSizeNormal: '中',
      lyricSizeLarge: '大',
      dislike: '不喜欢',
      noLyric: '纯音乐，请欣赏',
      lyricLoading: '歌词加载中…',
      queueEmpty: '播放队列是空的',
      queueSearchPlaceholder: '搜索队列里的歌',
      sessionExpired: '登录已过期，部分功能需要重新登录',
      relogin: '重新登录',
      queueNoMatch: '没有匹配的歌曲',
      viewArtist: '查看歌手',
      viewAlbum: '查看专辑',
      coverAlt: '封面',
      searchSongs: '单曲',
      searchArtists: '歌手',
      searchAlbums: '专辑',
      searchPlaylists: '歌单',
      searchAll: '查看全部结果',
      hotSongs: '热门歌曲',
      released: '发行',
      artistAlbums: '张专辑',
      artistSongs: '首单曲',
      follow: '关注',
      following: '已关注',
      followLoginHint: '登录后可关注歌手',
      saveAlbum: '收藏专辑',
      albumSaved: '已收藏',
      saveLoginHint: '登录后可收藏专辑',
      navDaily: '每日推荐',
      refresh: '刷新',
      navRadio: '私人FM',
      dailyHint: '每天根据你的口味更新',
      radioHint: '根据你的口味随机推荐，不喜欢就换一批',
      radioRefresh: '换一批',
      radioEmpty: '暂时没有推荐，稍后再试',
      loginRequired: '登录后可以查看每日推荐和私人FM',
      likes: '我喜欢的音乐',
      like: '喜欢',
      unlike: '取消喜欢',
      likeHint: '登录后可以收藏歌曲',
      likesHint: '在播放条或歌单里点红心，歌曲会收进这里',
      likesEmpty: '还没有喜欢的歌曲',
      recent: '最近播放',
      recentEmpty: '还没有播放记录',
      clearHistory: '清空记录',
      queuedCount: '已加入播放队列 · {n} 首',
      trackSearchPlaceholder: '搜索歌单里的歌',
      sortDefault: '默认顺序',
      sortName: '歌名',
      sortArtist: '歌手',
      sortDuration: '时长',
      groupByArtist: '按歌手分组',
      searchHistory: '搜索历史',
      hotSearch: '热门搜索',
      clear: '清空',
      quality: '音质',
      volume: '音量',
      qualityStandard: '标准',
      qualityHigher: '较高',
      qualityExhigh: '极高',
      qualityLossless: '无损',
      playNow: '立即播放',
      playNext: '下一首播放',
      addToQueue: '加入播放队列',
      addToPlaylist: '收藏到歌单',
      viewArtist: '查看歌手',
      viewAlbum: '查看专辑',
      copyLink: '复制歌曲链接',
      linkCopied: '已复制歌曲链接',
      copyFailed: '复制失败，请手动复制',
      selectPlaylist: '选择歌单',
      noPlaylists: '还没有创建歌单',
      addedToPlaylist: '已收藏到「{name}」',
      addToPlaylistFailed: '收藏失败，请稍后重试',
      playlistSongCount: '{n} 首',
      comments: '评论',
      hotComments: '热门评论',
      noComments: '还没有评论',
      loadMore: '加载更多',
      commentFloor: '楼',
      justNow: '刚刚',
      minutesAgo: '{n} 分钟前',
      hoursAgo: '{n} 小时前',
      daysAgo: '{n} 天前',
      playCountLabel: '播放',
      subscribeCountLabel: '收藏',
      commentCountLabel: '评论',
      subscribe: '收藏',
      subscribed: '已收藏',
      tracksTab: '曲目',
      commentsTab: '评论',
      albumsTab: '专辑',
      allSongs: '全部歌曲',
      removeFromQueue: '从队列移除',
      clearQueue: '清空队列',
      expand: '展开',
      collapse: '收起',
      updatedAt: '更新于 {n}',
      pause: '暂停',
      previousTrack: '上一首',
      nextTrack: '下一首',
      miniPlayer: '迷你播放器',
      openPlayer: '打开网易云音乐',
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
      fullscreenLyric: 'Full screen lyrics',
      exitFullscreen: 'Exit full screen',
      upNext: 'Up next',
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
      nowPlayingPage: 'Now playing',
      lyrics: 'Lyrics',
      lyricTranslation: 'Translation',
      lyricFont: 'Lyric size',
      lyricSizeSmall: 'Small',
      lyricSizeNormal: 'Medium',
      lyricSizeLarge: 'Large',
      dislike: 'Not interested',
      noLyric: 'Instrumental — enjoy',
      lyricLoading: 'Loading lyrics…',
      queueEmpty: 'The queue is empty',
      queueSearchPlaceholder: 'Search the queue',
      sessionExpired: 'Login expired, some features need signing in again',
      relogin: 'Sign in again',
      queueNoMatch: 'No matching songs',
      viewArtist: 'View artist',
      viewAlbum: 'View album',
      coverAlt: 'Cover',
      searchSongs: 'Songs',
      searchArtists: 'Artists',
      searchAlbums: 'Albums',
      searchPlaylists: 'Playlists',
      searchAll: 'See all results',
      hotSongs: 'Popular songs',
      released: 'Released',
      artistAlbums: 'albums',
      artistSongs: 'songs',
      follow: 'Follow',
      following: 'Following',
      followLoginHint: 'Log in to follow',
      saveAlbum: 'Save album',
      albumSaved: 'Saved',
      saveLoginHint: 'Log in to save',
      navDaily: 'Daily mix',
      refresh: 'Refresh',
      navRadio: 'Private FM',
      dailyHint: 'Updated daily for your taste',
      radioHint: 'Random picks from your taste — refresh if you dislike them',
      radioRefresh: 'Refresh',
      radioEmpty: 'No recommendations yet, try again later',
      loginRequired: 'Sign in to see daily picks and private FM',
      likes: 'Liked songs',
      like: 'Like',
      unlike: 'Unlike',
      likeHint: 'Sign in to like songs',
      likesHint: 'Songs you like will show up here',
      likesEmpty: 'No liked songs yet',
      recent: 'Recently played',
      recentEmpty: 'Nothing played yet',
      clearHistory: 'Clear history',
      queuedCount: 'Queued {n} tracks',
      trackSearchPlaceholder: 'Search in this playlist',
      sortDefault: 'Default',
      sortName: 'Title',
      sortArtist: 'Artist',
      sortDuration: 'Duration',
      groupByArtist: 'Group by artist',
      searchHistory: 'Search history',
      hotSearch: 'Trending',
      clear: 'Clear',
      quality: 'Quality',
      volume: 'Volume',
      qualityStandard: 'Standard',
      qualityHigher: 'Higher',
      qualityExhigh: 'High',
      qualityLossless: 'Lossless',
      playNow: 'Play now',
      playNext: 'Play next',
      addToQueue: 'Add to queue',
      addToPlaylist: 'Add to playlist',
      viewArtist: 'View artist',
      viewAlbum: 'View album',
      copyLink: 'Copy song link',
      linkCopied: 'Song link copied',
      copyFailed: 'Copy failed, please copy manually',
      selectPlaylist: 'Choose a playlist',
      noPlaylists: 'You have no playlists yet',
      addedToPlaylist: 'Added to "{name}"',
      addToPlaylistFailed: 'Could not add, try again later',
      playlistSongCount: '{n} songs',
      comments: 'Comments',
      hotComments: 'Hot comments',
      noComments: 'No comments yet',
      loadMore: 'Load more',
      commentFloor: 'floor',
      justNow: 'just now',
      minutesAgo: '{n} min ago',
      hoursAgo: '{n} h ago',
      daysAgo: '{n} d ago',
      playCountLabel: 'plays',
      subscribeCountLabel: 'subscribers',
      commentCountLabel: 'comments',
      subscribe: 'Subscribe',
      subscribed: 'Subscribed',
      tracksTab: 'Tracks',
      commentsTab: 'Comments',
      albumsTab: 'Albums',
      allSongs: 'All songs',
      removeFromQueue: 'Remove from queue',
      clearQueue: 'Clear queue',
      expand: 'Expand',
      collapse: 'Collapse',
      updatedAt: 'updated {n}',
      pause: 'Pause',
      previousTrack: 'Previous',
      nextTrack: 'Next',
      miniPlayer: 'Mini player',
      openPlayer: 'Open NetEase Music',
    };

    // ---------- 样式 ----------

    const CSS = `
.dnm-root{display:flex;flex-direction:column;height:100%;min-height:0;width:100%;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.5;overflow:hidden;--dnm-red:#ec4141}
.dnm-topbar{display:flex;align-items:center;gap:14px;padding:10px 20px;border-bottom:.5px solid var(--dsw-alias-border-l2);flex:0 0 auto;min-height:56px}
.dnm-brand{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;white-space:nowrap;flex:0 0 auto}
.dnm-brand-mark{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#c20c0c;color:#fff;flex:0 0 auto}
.dnm-search{display:flex;align-items:center;gap:8px;flex:1 1 auto;max-width:420px;height:34px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:17px;background:var(--dsw-alias-bg-layer-1);transition:border-color .15s}
.dnm-search-wrap{position:relative;flex:1 1 auto;max-width:420px;min-width:0}
.dnm-search-wrap .dnm-search{max-width:none;width:100%}
.dnm-suggest{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:45;max-height:min(430px,62vh);overflow:auto;padding:6px;border-radius:12px;background:var(--dsw-alias-bg-overlay);border:.5px solid var(--dsw-alias-border-l2);box-shadow:0 18px 44px -18px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:1px}
.dnm-suggest-section{padding:7px 8px 3px;font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dnm-suggest-item{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border:0;border-radius:8px;background:none;color:inherit;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.dnm-suggest-item:hover,.dnm-suggest-item.active{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-suggest-cover{width:28px;height:28px;border-radius:6px;flex:0 0 auto}
.dnm-suggest-round{border-radius:50%}
.dnm-suggest-name{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-suggest-sub{font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:0 0 auto;max-width:45%;overflow:hidden;text-overflow:ellipsis}
.dnm-suggest-all{border:0;background:none;color:var(--dnm-red);font:inherit;font-size:12px;padding:8px;cursor:pointer;text-align:left;border-radius:8px}
.dnm-suggest-all:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-search:focus-within{border-color:var(--dnm-red);box-shadow:0 0 0 3px color-mix(in srgb,var(--dnm-red) 16%,transparent)}
.dnm-search input{flex:1 1 auto;min-width:0;height:100%;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dnm-search input::placeholder{color:var(--dsw-alias-label-caption)}
.dnm-topbar-spacer{flex:1 1 auto}
.dnm-userbtn{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 12px;border-radius:16px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;flex:0 0 auto}
.dnm-userbtn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-userbtn.primary{background:var(--dnm-red);border-color:transparent;color:#fff}
.dnm-userbtn.primary:hover{opacity:.9;background:var(--dnm-red)}
.dnm-avatar{width:24px;height:24px;border-radius:50%;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2)}
.dnm-body{display:flex;flex:1 1 auto;min-height:0;overflow:hidden}
.dnm-nav{width:190px;flex:0 0 auto;padding:14px 10px;border-right:.5px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;gap:2px;overflow:auto}
.dnm-nav-item{display:flex;align-items:center;gap:10px;height:36px;padding:0 12px;border-radius:10px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer;text-align:left;width:100%;white-space:nowrap}
.dnm-nav-item:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dnm-nav-item{position:relative}
.dnm-nav-item.active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:500}
.dnm-nav-item.active::before{content:'';position:absolute;left:0;top:9px;bottom:9px;width:3px;border-radius:2px;background:var(--dnm-red)}
.dnm-nav-sep{margin:10px 12px;border-top:.5px solid var(--dsw-alias-border-l2)}
.dnm-main{flex:1 1 auto;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.dnm-scroll{flex:1 1 auto;min-height:0;overflow:auto;scrollbar-gutter:stable}
.dnm-content{max-width:1080px;margin:0 auto;padding:20px clamp(18px,3vw,32px) 32px}
.dnm-h1{font-size:20px;font-weight:600;margin:0 0 4px}
.dnm-h2{font-size:16px;font-weight:600;margin:0 0 14px;display:flex;align-items:center;gap:10px}
.dnm-sub{color:var(--dsw-alias-label-secondary);font-size:13px;margin:0 0 18px}
.dnm-section{margin-bottom:28px}
.dnm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px}
.dnm-card{position:relative;display:flex;flex-direction:column;gap:8px;border:0;background:transparent;padding:0;cursor:pointer;text-align:left;color:inherit;font:inherit;border-radius:12px;outline:none}
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
.dnm-row.playing{background:color-mix(in srgb, var(--dnm-red) 12%, transparent)}
.dnm-row-index{width:26px;flex:0 0 auto;display:flex;align-items:center;justify-content:flex-end;color:var(--dsw-alias-label-tertiary);font-size:12px;font-variant-numeric:tabular-nums}
.dnm-row-playsign{display:none;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:50%;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dnm-row:hover .dnm-row-num{display:none}
.dnm-row:hover .dnm-row-playsign{display:inline-flex}
.dnm-row-playsign:hover{color:var(--dnm-red)}
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
.dnm-playlist-tags{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}
.dnm-playlist-tag{font-size:11px;line-height:20px;padding:0 8px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.dnm-playlist-creator{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dnm-playlist-avatar{width:24px;height:24px;border-radius:50%;object-fit:cover;background:var(--dsw-alias-bg-layer-2);flex:0 0 auto}
.dnm-playlist-stats{display:flex;flex-wrap:wrap;gap:14px;font-size:12px;color:var(--dsw-alias-label-secondary);margin:0 0 12px}
.dnm-playlist-desc{font-size:13px;line-height:1.7;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;word-break:break-word;margin:0 0 8px;max-height:66px;overflow:hidden}
.dnm-playlist-desc.expanded{max-height:none}
.dnm-playlist-desc-toggle{align-self:flex-start;border:0;background:transparent;color:var(--dnm-red);font:inherit;font-size:12px;cursor:pointer;padding:0;margin:0 0 14px}
.dnm-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dnm-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 14px;border-radius:16px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dnm-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-btn.primary{background:var(--dnm-red);border-color:transparent;color:#fff}
.dnm-btn.primary:hover{background:var(--dnm-red);filter:brightness(1.08)}
.dnm-btn.on{border-color:color-mix(in srgb,var(--dnm-red) 55%,transparent);color:var(--dnm-red)}
.dnm-btn.on:hover{background:color-mix(in srgb,var(--dnm-red) 8%,transparent)}
.dnm-btn:disabled{opacity:.5;cursor:default}
.dnm-empty{padding:48px 16px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px;display:flex;flex-direction:column;align-items:center;gap:12px}
.dnm-empty-icon{display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:20px;background:linear-gradient(145deg,var(--dsw-alias-bg-layer-1),var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-tertiary);box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}
.dnm-spinner{width:18px;height:18px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dnm-red);animation:dnm-spin .8s linear infinite}
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
.dnm-quality-btn{border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1;padding:5px 8px;border-radius:999px;cursor:pointer;flex:0 0 auto;transition:color .15s,border-color .15s}
.dnm-quality-btn:hover:not(:disabled){color:var(--dnm-red);border-color:var(--dnm-red)}
.dnm-quality-btn:disabled{opacity:.35;cursor:default}
.dnm-menu-mask{position:fixed;inset:0;z-index:60}
.dnm-menu{position:fixed;min-width:180px;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:6px;display:flex;flex-direction:column;gap:2px}
.dnm-menu-title{font-size:11px;color:var(--dsw-alias-label-tertiary);padding:4px 8px 6px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-menu-item{border:0;background:none;text-align:left;color:var(--dsw-alias-label-primary);font-size:13px;padding:7px 10px;border-radius:6px;cursor:pointer;transition:background .15s}
.dnm-playlist-pick-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex:0 0 auto}
.dnm-playlist-pick{display:flex;flex-direction:column;gap:2px;max-height:46vh;overflow:auto;scrollbar-gutter:stable;margin-top:2px}
.dnm-playlist-pick-item{display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;text-align:left;color:var(--dsw-alias-label-primary);font-size:13px;padding:6px;border-radius:8px;cursor:pointer;transition:background .15s}
.dnm-playlist-pick-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-playlist-pick-item:disabled{cursor:default;opacity:.6}
.dnm-playlist-pick-item.done{outline:1px solid var(--dnm-red);outline-offset:-1px}
.dnm-playlist-pick-cover{width:38px;height:38px;border-radius:6px;flex:0 0 auto;object-fit:cover}
.dnm-playlist-pick-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}
.dnm-playlist-pick-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-playlist-pick-count{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dnm-playlist-pick-busy{color:var(--dsw-alias-label-secondary);font-size:12px}
.dnm-playlist-done{font-size:12px;color:var(--dsw-alias-state-success-primary);text-align:left}
.dnm-menu-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-icon-btn:disabled{opacity:.4;cursor:default;background:transparent}
.dnm-icon-btn.play{width:38px;height:38px;background:var(--dnm-red);color:#fff;box-shadow:0 4px 14px -4px color-mix(in srgb,var(--dnm-red) 60%,transparent);transition:transform .18s,opacity .18s}
.dnm-icon-btn.play:hover{background:var(--dnm-red);opacity:.92;transform:scale(1.05)}
.dnm-progress{display:flex;align-items:center;gap:10px;width:100%;max-width:520px}
.dnm-progress-track{position:relative;display:flex;align-items:center;flex:1 1 auto;min-width:0;height:16px}
.dnm-progress-track .dnm-range{width:100%}
.dnm-progress-tip{position:absolute;bottom:calc(100% + 2px);transform:translateX(-50%);padding:2px 7px;border-radius:6px;background:var(--dsw-alias-bg-overlay);border:.5px solid var(--dsw-alias-border-l1);font-size:11px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,.32);z-index:5}
.dnm-time{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;width:38px;flex:0 0 auto}
.dnm-time.right{text-align:right}
.dnm-range{-webkit-appearance:none;appearance:none;flex:1 1 auto;min-width:0;height:4px;border-radius:2px;background:var(--dsw-alias-border-l2);outline:0;cursor:pointer;accent-color:var(--dnm-red)}
.dnm-range::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:50%;background:var(--dnm-red);border:0;box-shadow:0 1px 4px rgba(0,0,0,.4)}
.dnm-player-right{display:flex;align-items:center;gap:10px;width:230px;flex:0 0 auto;justify-content:flex-end}
.dnm-volume{width:80px;flex:0 0 auto}
.dnm-volume-wrap{display:flex;align-items:center;gap:6px;flex:0 0 auto;cursor:ns-resize}
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
.dnm-cookie-input:focus{outline:none;border-color:var(--dnm-red)}
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
.dnm-np{display:flex;flex-direction:column;height:100%;min-height:0;width:100%;background:var(--dsw-alias-bg-base);overflow:hidden}
.dnm-np-head{display:flex;align-items:center;gap:10px;padding:12px 18px 4px;flex:0 0 auto}
.dnm-np-titlebar{font-size:13px;color:var(--dsw-alias-label-secondary);margin-right:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-np-tabs{display:flex;gap:4px;background:var(--dsw-alias-bg-layer-1);padding:3px;border-radius:9px;flex:0 0 auto}
.dnm-np-tools{display:flex;align-items:center;gap:4px;flex:0 0 auto}
.dnm-np-tool{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:24px;padding:0 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;transition:color .15s,background .15s}
.dnm-np-tool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
.dnm-np-tool.on{color:var(--dnm-red);border-color:var(--dnm-red)}
.dnm-np[data-lyric-size="small"] .dnm-lyric-line{font-size:13px}
.dnm-np[data-lyric-size="large"] .dnm-lyric-line{font-size:18px}
.dnm-np-tab{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1;padding:6px 13px;border-radius:7px;cursor:pointer;font-family:inherit;white-space:nowrap}
.dnm-np-tab.active{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-weight:600}
.dnm-np-body{flex:1 1 auto;min-height:0;display:flex;gap:clamp(20px,4vw,44px);padding:12px clamp(18px,4vw,44px) 20px;overflow:hidden}
.dnm-np-left{width:min(300px,34%);flex:0 0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding-top:12px;min-height:0;overflow-y:auto;scrollbar-gutter:stable;padding-bottom:8px}
.dnm-np-cover{width:100%;aspect-ratio:1/1;border-radius:18px;object-fit:cover;background:var(--dsw-alias-bg-layer-2);box-shadow:0 16px 44px rgba(0,0,0,.26)}
.dnm-np-name{font-size:19px;font-weight:600;margin:2px 0 0;line-height:1.35;word-break:break-word;max-width:100%}
.dnm-np-artist{font-size:13px;color:var(--dsw-alias-label-secondary);margin:0;max-width:100%;word-break:break-word}
.dnm-np-album{font-size:12px;color:var(--dsw-alias-label-tertiary);margin:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-np-right{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;min-height:0}
.dnm-lyrics{flex:1 1 auto;min-height:0;overflow:auto;padding:8px 10px 72px;display:flex;flex-direction:column}.dnm-lyrics::-webkit-scrollbar{width:0;height:0}
.dnm-lyric-line{padding:8px 6px;font-size:14px;line-height:1.55;color:var(--dsw-alias-label-tertiary);text-align:center;transition:color .18s,transform .18s;transform-origin:center;white-space:pre-wrap;word-break:break-word;cursor:pointer}
.dnm-lyric-line:hover{color:var(--dsw-alias-label-secondary)}
.dnm-lyric-line.active{color:var(--dsw-alias-label-primary);font-weight:600;transform:scale(1.04)}
.dnm-lyric-trans{display:block;font-size:12px;font-weight:400;color:var(--dsw-alias-label-tertiary);margin-top:2px}
.dnm-lyrics-empty{flex:1 1 auto;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px;padding:40px 0}
.dnm-np-queue{flex:1 1 auto;min-height:0;overflow:auto;padding:4px 0 48px;scrollbar-gutter:stable}
.dnm-np-queue-wrap{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
.dnm-np-queue-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 2px 8px;font-size:12px;color:var(--dsw-alias-label-secondary);flex:0 0 auto}
.dnm-queue-search{display:flex;align-items:center;gap:6px;flex:0 0 auto;margin:0 2px 8px;padding:0 9px;height:30px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary)}
.dnm-lyric-full{position:fixed;inset:0;z-index:70;--dnm-red:#ec4141;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);isolation:isolate;animation:dnm-fade-in .22s cubic-bezier(.2,.8,.2,1) both}
.dnm-lyric-full-bg{position:absolute;inset:0;z-index:-2;overflow:hidden}
.dnm-lyric-full-bg-img{position:absolute;inset:-16%;background-size:cover;background-position:center;filter:blur(90px) saturate(1.5);opacity:.34;transform:scale(1.1)}
.dnm-lyric-full::after{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-bg-base) 52%,transparent) 0,var(--dsw-alias-bg-base) 82%)}
.dnm-lyric-full-head{display:flex;align-items:center;gap:14px;padding:14px clamp(20px,5vw,44px);flex:0 0 auto}
.dnm-lyric-full-meta{flex:1 1 auto;min-width:0}
.dnm-lyric-full-name{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-lyric-full-artist{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:2px}
.dnm-lyric-full-lines{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:2px;padding:14vh clamp(24px,12vw,220px) 16vh}
.dnm-lyric-full-lines::-webkit-scrollbar{width:0;height:0}
.dnm-lyric-full .dnm-lyric-line{font-size:22px;line-height:1.55;max-width:min(880px,86vw);text-align:center}
.dnm-lyric-full[data-lyric-size="small"] .dnm-lyric-line{font-size:18px}
.dnm-lyric-full[data-lyric-size="large"] .dnm-lyric-line{font-size:27px}
.dnm-lyric-full .dnm-lyric-line.active{font-size:1.16em}
.dnm-lyric-full .dnm-lyric-trans{font-size:.62em;margin-top:.25em}
.dnm-lyric-full-foot{display:flex;align-items:center;gap:12px;padding:10px clamp(20px,5vw,44px) 22px;flex:0 0 auto;color:var(--dsw-alias-label-secondary);font-size:12px;font-variant-numeric:tabular-nums}
.dnm-lyric-full-foot .dnm-range{flex:1 1 auto;min-width:0}
.dnm-lyric-full-foot .dnm-icon-btn{width:34px;height:34px}
.dnm-lyric-full-foot .dnm-icon-btn.play{background:var(--dnm-red);color:#fff;width:42px;height:42px}
.dnm-lyric-full-foot .dnm-icon-btn.play:hover{transform:scale(1.05)}
body:not([data-ds-dark-theme]) .dnm-lyric-full-bg-img{opacity:.26}
body:not([data-ds-dark-theme]) .dnm-lyric-full .dnm-lyric-line{color:var(--dsw-alias-label-secondary)}
body:not([data-ds-dark-theme]) .dnm-lyric-full .dnm-lyric-line.active{color:var(--dsw-alias-label-primary)}
.dnm-banner{display:flex;align-items:center;gap:10px;flex:0 0 auto;padding:8px 20px;font-size:12px;color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 14%,var(--dsw-alias-bg-base));border-bottom:.5px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 34%,transparent)}
.dnm-banner-text{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-banner-action{flex:0 0 auto;height:26px;padding:0 12px;border-radius:13px;border:.5px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);background:transparent;color:inherit;font:inherit;font-size:12px;cursor:pointer}
.dnm-banner-action:hover{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 18%,transparent)}
.dnm-queue-search:focus-within{border-color:var(--dnm-red)}
.dnm-queue-search input{flex:1 1 auto;min-width:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dnm-queue-search input::placeholder{color:var(--dsw-alias-label-tertiary)}
.dnm-queue-search-clear{display:flex;align-items:center;justify-content:center;width:18px;height:18px;border:0;border-radius:50%;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0}
.dnm-np-link{display:inline;border:0;background:none;padding:0;margin:0;font:inherit;color:inherit;cursor:pointer;text-align:left}
.dnm-np-link:hover{color:var(--dsw-alias-label-primary);text-decoration:underline;text-underline-offset:2px}
.dnm-track-toolbar{position:sticky;top:-1px;z-index:6;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:2px -8px 12px;padding:8px;background:var(--dsw-alias-bg-base);border-radius:0 0 10px 10px}
.dnm-track-search{display:flex;align-items:center;gap:6px;flex:1 1 220px;min-width:180px;max-width:340px;padding:0 9px;height:30px;border:.5px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary)}
.dnm-track-search:focus-within{border-color:var(--dnm-red)}
.dnm-track-search input{flex:1 1 auto;min-width:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
.dnm-track-search input::placeholder{color:var(--dsw-alias-label-tertiary)}
.dnm-sort-group{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);flex:0 0 auto}
.dnm-sort-btn{border:0;background:none;padding:4px 9px;border-radius:6px;font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .16s,color .16s}
.dnm-sort-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dnm-sort-btn.active{background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.16)}
.dnm-track-count{margin-left:auto;font-size:12px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:0 0 auto}
.dnm-group{margin-bottom:6px}
.dnm-group-head{display:flex;align-items:baseline;gap:8px;padding:10px 2px 6px;border-bottom:.5px solid var(--dsw-alias-border-l1);margin-bottom:2px}
.dnm-group-name{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dnm-group-count{font-size:12px;color:var(--dsw-alias-label-tertiary)}
.dnm-tabs{display:inline-flex;gap:4px;background:var(--dsw-alias-bg-layer-1);padding:3px;border-radius:9px;margin-bottom:18px}
.dnm-tab{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;padding:5px 14px;border-radius:7px;cursor:pointer;white-space:nowrap}
.dnm-tab:hover{color:var(--dsw-alias-label-primary)}
.dnm-tab.active{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 1px 3px rgba(0,0,0,.12)}
.dnm-card-sub{font-size:12px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-card-round .dnm-cover{border-radius:50%}
.dnm-artist-head{display:flex;gap:22px;margin-bottom:24px;align-items:flex-start}
.dnm-artist-avatar{width:132px;height:132px;border-radius:50%;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2);box-shadow:0 8px 26px rgba(0,0,0,.2)}
.dnm-artist-title{font-size:26px;font-weight:600;margin:0 0 8px}
.dnm-artist-meta{font-size:13px;color:var(--dsw-alias-label-secondary);margin:0 0 8px}
.dnm-artist-desc{font-size:13px;color:var(--dsw-alias-label-tertiary);margin:0 0 14px;max-width:640px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.dnm-album-head{display:flex;gap:22px;margin-bottom:24px;align-items:flex-start}
.dnm-album-cover{width:180px;height:180px;border-radius:12px;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2);box-shadow:0 10px 30px rgba(0,0,0,.22)}
.dnm-album-title{font-size:24px;font-weight:600;margin:0 0 8px}
.dnm-album-meta{font-size:13px;color:var(--dsw-alias-label-secondary);margin:0 0 6px}
.dnm-likes-cover{width:180px;height:180px;border-radius:16px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,var(--dsw-alias-bg-layer-2),var(--dsw-alias-bg-layer-1));border:.5px solid var(--dsw-alias-border-l1);color:var(--dnm-red)}
.dnm-entry{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border:0;border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:14px;cursor:pointer;text-align:left;transition:background .15s}
.dnm-entry:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dnm-entry-icon{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dnm-red);flex:0 0 auto}
.dnm-entry-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-entry-arrow{color:var(--dsw-alias-label-tertiary);font-size:18px;line-height:1}
.dnm-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.dnm-search-home{max-width:620px}
.dnm-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}
.dnm-chip{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;padding:5px 12px;border-radius:999px;cursor:pointer;transition:color .15s,border-color .15s}
.dnm-chip:hover{color:var(--dnm-red);border-color:var(--dnm-red)}
.dnm-link{border:0;background:none;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;padding:0}
.dnm-link:hover{color:var(--dnm-red)}
.dnm-hot{display:flex;flex-direction:column;gap:1px}
.dnm-hot-hint{font-size:13px;color:var(--dsw-alias-label-tertiary);padding:6px 0}
.dnm-hot-item{display:flex;align-items:center;gap:12px;border:0;background:none;color:var(--dsw-alias-label-primary);padding:7px 8px;border-radius:8px;cursor:pointer;text-align:left;font-size:13px;transition:background .15s}
.dnm-hot-item:hover{background:var(--dsw-alias-bg-layer-1)}
.dnm-hot-rank{width:20px;flex:0 0 auto;text-align:center;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.dnm-hot-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-section-head .dnm-h2{margin:0}
.dnm-row-action:disabled,.dnm-icon-btn:disabled{opacity:.35;cursor:default}
.dnm-row-like.liked{color:var(--dnm-red)}
.dnm-player-like.liked{color:var(--dnm-red)}
.dnm-comments{flex:1 1 auto;min-height:0;overflow:auto;padding:4px 10px 32px;max-width:760px;scrollbar-gutter:stable}
.dnm-comment{display:flex;gap:12px;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l1)}
.dnm-comment:last-child{border-bottom:0}
.dnm-comment-avatar{width:34px;height:34px;border-radius:50%;object-fit:cover;flex:0 0 auto;background:var(--dsw-alias-bg-layer-2)}
.dnm-comment-body{flex:1;min-width:0}
.dnm-comment-head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.dnm-comment-user{font-size:13px;color:var(--dsw-alias-label-secondary)}
.dnm-comment-time{font-size:12px;color:var(--dsw-alias-label-tertiary)}
.dnm-comment-text{font-size:14px;line-height:1.7;margin:4px 0 0;white-space:pre-wrap;word-break:break-word;color:var(--dsw-alias-label-primary)}
.dnm-comment-foot{display:flex;align-items:center;gap:14px;margin-top:6px;font-size:12px;color:var(--dsw-alias-label-tertiary)}
.dnm-comment-like{display:inline-flex;align-items:center;gap:4px}
.dnm-comment-more{display:flex;justify-content:center;padding:18px 0}
.dnm-comment-hot-tag{font-size:11px;color:var(--dnm-red);border:.5px solid var(--dnm-red);border-radius:999px;padding:0 6px;flex:0 0 auto}
.dnm-comment-section{margin:6px 0 2px;font-size:13px;color:var(--dsw-alias-label-secondary);font-weight:600}
@media (max-width:760px){.dnm-np-left{display:none}.dnm-artist-head,.dnm-album-head{flex-direction:column}.dnm-artist-avatar{width:96px;height:96px}.dnm-album-cover{width:130px;height:130px}.dnm-likes-cover{width:130px;height:130px}}
/* ---------- 迷你播放器（面板不在前台时显示） ---------- */
.dnm-mini{position:fixed;right:22px;bottom:22px;z-index:60;display:flex;align-items:center;gap:10px;width:min(330px,calc(100vw - 44px));padding:8px 10px 12px;border-radius:14px;--dnm-red:#ec4141;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 94%,transparent);backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4);border:.5px solid var(--dsw-alias-border-l2);box-shadow:0 18px 44px -18px rgba(0,0,0,.55);animation:dnm-mini-in .28s cubic-bezier(.2,.8,.2,1) both}
@keyframes dnm-mini-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.dnm-mini-main{display:flex;align-items:center;gap:9px;flex:1 1 auto;min-width:0;background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer}
.dnm-mini-cover{width:38px;height:38px;border-radius:8px;flex:0 0 auto}
.dnm-mini-meta{display:flex;flex-direction:column;gap:1px;min-width:0}
.dnm-mini-name{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-mini-artist{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-mini-controls{display:flex;align-items:center;gap:2px;flex:0 0 auto}
.dnm-mini-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:50%;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0;transition:background .16s,color .16s}
.dnm-mini-btn:hover{background:rgba(255,255,255,.1);color:var(--dsw-alias-label-primary)}
.dnm-mini-btn.play{background:var(--dnm-red);color:#fff;width:30px;height:30px;flex:0 0 auto}
.dnm-mini-btn.play:hover{filter:brightness(1.06);color:#fff}
.dnm-mini-progress{position:absolute;left:10px;right:10px;bottom:5px;height:2px;border-radius:2px;background:rgba(127,127,127,.22);overflow:hidden}
.dnm-mini-progress span{display:block;height:100%;background:var(--dnm-red);border-radius:2px;transition:width .2s linear}
/* ---------- 视觉增强：沉浸背景、毛玻璃、悬浮卡片与过渡 ---------- */
.dnm-root{position:relative}
.dnm-ambient{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.dnm-ambient-img{position:absolute;inset:-14%;background-size:cover;background-position:center;filter:blur(80px) saturate(1.55);opacity:.26;transform:scale(1.08)}
.dnm-ambient::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 0,color-mix(in srgb,var(--dsw-alias-bg-base) 90%,transparent) 58%,var(--dsw-alias-bg-base) 100%)}
.dnm-topbar,.dnm-body{position:relative;z-index:1}
.dnm-topbar{background:color-mix(in srgb,var(--dsw-alias-bg-base) 82%,transparent);backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35)}
.dnm-player{position:relative;z-index:1;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 68%,transparent);backdrop-filter:blur(22px) saturate(1.5);-webkit-backdrop-filter:blur(22px) saturate(1.5);box-shadow:0 -1px 0 var(--dsw-alias-border-l2)}
.dnm-card{transition:transform .24s cubic-bezier(.2,.8,.2,1)}
.dnm-card:hover{transform:translateY(-4px)}
.dnm-cover{transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s;box-shadow:inset 0 0 0 .5px rgba(255,255,255,.07),0 1px 2px rgba(0,0,0,.16)}
.dnm-card:hover .dnm-cover{transform:scale(1.02);box-shadow:0 20px 38px -16px rgba(0,0,0,.58)}
.dnm-card-play{position:absolute;right:9px;bottom:9px;z-index:3;display:flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:var(--dnm-red);color:#fff;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.42);opacity:0;transform:translateY(8px) scale(.92);transition:opacity .22s,transform .22s}
.dnm-card:hover .dnm-card-play,.dnm-card:focus-within .dnm-card-play{opacity:1;transform:none}
.dnm-card-play:hover{transform:scale(1.06)}
.dnm-card-play.busy{opacity:1;transform:none}
.dnm-card:focus-visible{box-shadow:0 0 0 2px var(--dnm-red)}
.dnm-row{position:relative;transition:background .16s}
.dnm-row::before{content:'';position:absolute;left:2px;top:8px;bottom:8px;width:2.5px;border-radius:2px;background:var(--dnm-red);opacity:0;transform:scaleY(.35);transition:opacity .16s,transform .16s}
.dnm-row:hover::before{opacity:.85;transform:none}
.dnm-np{position:relative;isolation:isolate;background:var(--dsw-alias-bg-base)}
.dnm-np-bg{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none}
.dnm-np-bg-img{position:absolute;inset:-16%;background-size:cover;background-position:center;filter:blur(72px) saturate(1.65);opacity:.4;transform:scale(1.08)}
.dnm-np-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-bg-base) 62%,transparent) 0,transparent 30%,transparent 54%,var(--dsw-alias-bg-base) 100%)}
.dnm-np-cover{box-shadow:0 28px 60px -28px rgba(0,0,0,.7),0 2px 6px rgba(0,0,0,.2)}
.dnm-np-cover{animation:dnm-breathe 7s ease-in-out infinite;will-change:transform}
@keyframes dnm-breathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.008)}}
@media (prefers-reduced-motion:reduce){.dnm-np-cover{animation:none}}
.dnm-np-actions{display:flex;align-items:center;gap:6px;margin-top:4px}
.dnm-np-next{display:flex;flex-direction:column;gap:1px;margin-top:16px;padding:8px 6px;border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 60%,transparent);border:.5px solid var(--dsw-alias-border-l1);max-width:min(280px,100%)}
.dnm-np-next-label{font-size:11px;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary);padding:2px 8px 4px}
.dnm-np-next-item{display:flex;flex-direction:row;align-items:baseline;gap:8px;width:100%;padding:5px 8px;border:0;border-radius:7px;background:none;font:inherit;text-align:left;cursor:pointer;transition:background .14s}
.dnm-np-next-item:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 70%,transparent)}
.dnm-np-next-name{flex:1 1 auto;font-size:13px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dnm-np-next-artist{flex:0 1 auto;font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%}
.dnm-np-controls{display:flex;align-items:center;justify-content:center;gap:22px;margin-top:20px}
.dnm-np-controls .dnm-icon-btn{width:40px;height:40px;transition:background .16s,transform .16s}
.dnm-np-controls .dnm-icon-btn:not(:disabled):hover{background:rgba(255,255,255,.1)}
body:not([data-ds-dark-theme]) .dnm-np-controls .dnm-icon-btn:not(:disabled):hover{background:rgba(15,17,21,.06)}
.dnm-np-controls .dnm-icon-btn.play{width:56px;height:56px;box-shadow:0 14px 30px -14px color-mix(in srgb,var(--dnm-red) 80%,transparent)}
.dnm-np-controls .dnm-icon-btn.play:not(:disabled):hover{background:var(--dnm-red);opacity:.94}
.dnm-np-progress{display:flex;align-items:center;gap:10px;margin-top:18px;font-size:12px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.dnm-np-progress .dnm-range{flex:1 1 auto;min-width:0}
.dnm-toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:80;padding:9px 16px;border-radius:10px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.4;box-shadow:0 12px 32px -12px rgba(0,0,0,.45),0 0 0 .5px var(--dsw-alias-border-l2);animation:dnm-fade-in .2s ease both;pointer-events:none;max-width:70vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dnm-content{position:relative;isolation:isolate}
.dnm-hero-bg{position:absolute;left:calc(-1 * clamp(18px,3vw,32px));right:calc(-1 * clamp(18px,3vw,32px));top:-20px;height:360px;z-index:-1;overflow:hidden;pointer-events:none}
.dnm-hero-bg-img{position:absolute;inset:-20%;background-size:cover;background-position:center;filter:blur(58px) saturate(1.5);opacity:.32;transform:scale(1.15)}
.dnm-hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 0,color-mix(in srgb,var(--dsw-alias-bg-base) 55%,transparent) 45%,var(--dsw-alias-bg-base) 100%)}
.dnm-skeleton{display:flex;flex-direction:column;gap:10px;padding:14px 0}
.dnm-skeleton-row{height:42px;border-radius:8px;background:linear-gradient(90deg,var(--dsw-alias-bg-layer-1) 25%,var(--dsw-alias-bg-layer-2) 37%,var(--dsw-alias-bg-layer-1) 63%);background-size:400% 100%;animation:dnm-shimmer 1.6s ease infinite}
.dnm-skeleton-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:clamp(14px,2vw,22px);padding:10px 0}
.dnm-skeleton-card{aspect-ratio:1/1;border-radius:12px;background:linear-gradient(90deg,var(--dsw-alias-bg-layer-1) 25%,var(--dsw-alias-bg-layer-2) 37%,var(--dsw-alias-bg-layer-1) 63%);background-size:400% 100%;animation:dnm-shimmer 1.6s ease infinite}
@keyframes dnm-shimmer{0%{background-position:100% 0}100%{background-position:0 0}}
.dnm-np-like.liked{color:var(--dnm-red)}
@keyframes dnm-fade-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
.dnm-scroll>*{animation:dnm-fade-in .26s cubic-bezier(.2,.8,.2,1) both}
.dnm-np{animation:dnm-fade-in .26s cubic-bezier(.2,.8,.2,1) both}
/* ---------- 浅色主题微调：加层次、边界与对比度 ---------- */
body:not([data-ds-dark-theme]) .dnm-root{background:linear-gradient(180deg,#fbfbfd 0,#fff 240px)}
body:not([data-ds-dark-theme]) .dnm-topbar{background:color-mix(in srgb,#fff 84%,transparent);box-shadow:0 1px 0 rgba(15,17,21,.07)}
body:not([data-ds-dark-theme]) .dnm-player{background:color-mix(in srgb,#fff 90%,transparent);box-shadow:0 -1px 0 rgba(15,17,21,.08),0 -14px 32px rgba(15,17,21,.05)}
body:not([data-ds-dark-theme]) .dnm-lyric-line{color:var(--dsw-alias-label-secondary)}
body:not([data-ds-dark-theme]) .dnm-lyric-line.active{color:var(--dsw-alias-label-primary)}
body:not([data-ds-dark-theme]) .dnm-np-bg-img{opacity:.3}
body:not([data-ds-dark-theme]) .dnm-hero-bg-img{opacity:.26}
body:not([data-ds-dark-theme]) .dnm-ambient-img{opacity:.22}
body:not([data-ds-dark-theme]) .dnm-cover{box-shadow:inset 0 0 0 .5px rgba(15,17,21,.08),0 1px 2px rgba(15,17,21,.06)}
body:not([data-ds-dark-theme]) .dnm-card:hover .dnm-cover{box-shadow:0 20px 36px -18px rgba(15,17,21,.3),0 1px 2px rgba(15,17,21,.06)}
body:not([data-ds-dark-theme]) .dnm-row:hover{background:rgba(15,17,21,.035)}
body:not([data-ds-dark-theme]) .dnm-chart:hover{background:rgba(15,17,21,.035)}
body:not([data-ds-dark-theme]) .dnm-menu{box-shadow:0 10px 30px -10px rgba(15,17,21,.25),0 0 0 .5px rgba(15,17,21,.06)}
body:not([data-ds-dark-theme]) .dnm-modal{box-shadow:0 26px 62px -24px rgba(15,17,21,.3),0 0 0 .5px rgba(15,17,21,.06)}
body:not([data-ds-dark-theme]) .dnm-tabs{background:rgba(15,17,21,.05)}
body:not([data-ds-dark-theme]) .dnm-tab.active{background:#fff;box-shadow:0 1px 2px rgba(15,17,21,.1)}
body:not([data-ds-dark-theme]) .dnm-search{background:#fff;border-color:rgba(15,17,21,.1)}
body:not([data-ds-dark-theme]) .dnm-track-search{background:#fff;border-color:rgba(15,17,21,.1)}
body:not([data-ds-dark-theme]) .dnm-np-next{background:rgba(15,17,21,.04);border-color:rgba(15,17,21,.08)}
body:not([data-ds-dark-theme]) .dnm-sort-group{background:rgba(15,17,21,.05)}
body:not([data-ds-dark-theme]) .dnm-sort-btn.active{background:#fff;box-shadow:0 1px 2px rgba(15,17,21,.12)}
body:not([data-ds-dark-theme]) .dnm-mini{background:color-mix(in srgb,#fff 94%,transparent);box-shadow:0 18px 44px -20px rgba(15,17,21,.35)}
body:not([data-ds-dark-theme]) .dnm-mini-btn:hover{background:rgba(15,17,21,.06)}
body:not([data-ds-dark-theme]) .dnm-suggest{background:#fff;box-shadow:0 18px 44px -20px rgba(15,17,21,.32),0 0 0 .5px rgba(15,17,21,.06)}
body:not([data-ds-dark-theme]) .dnm-suggest-item:hover,body:not([data-ds-dark-theme]) .dnm-suggest-item.active{background:rgba(15,17,21,.055)}
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

    // 幂等：既能吃网易云原始曲目（ar/al/dt/alia），也能吃已经归一化过的对象。
    function normalizeTrack(raw) {
      if (!raw || typeof raw !== 'object') return null;
      const artistList = Array.isArray(raw.ar) ? raw.ar : Array.isArray(raw.artists) ? raw.artists : [];
      const artists = artistList
        .map((artist) => (typeof artist === 'string' ? artist : artist && artist.name))
        .filter(Boolean);
      const albumObject = raw.al && typeof raw.al === 'object' ? raw.al : raw.album && typeof raw.album === 'object' ? raw.album : null;
      const albumName = typeof raw.album === 'string' ? raw.album : (albumObject && albumObject.name) || '';
      const coverUrl = (albumObject && albumObject.picUrl) || raw.coverUrl || raw.picUrl || '';
      const alias = Array.isArray(raw.alia) && raw.alia.length > 0 ? raw.alia[0] : typeof raw.alias === 'string' ? raw.alias : '';
      const objectArtistIds = artistList
        .map((artist) => (artist && typeof artist === 'object' && artist.id ? artist.id : null))
        .filter(Boolean);
      // 幂等保护：已经归一化过的对象不会再有对象数组，沿用上一次提取的 id
      const artistIds = objectArtistIds.length > 0 ? objectArtistIds : Array.isArray(raw.artistIds) ? raw.artistIds : [];
      const albumId = (albumObject && albumObject.id) || raw.albumId || null;
      return {
        id: raw.id,
        name: raw.name || '未知歌曲',
        artists,
        artistIds,
        album: albumName,
        albumId,
        coverUrl,
        duration: raw.dt ?? raw.duration ?? 0,
        fee: raw.fee ?? 0,
        alias,
      };
    }

    function normalizeTracks(list) {
      if (!Array.isArray(list)) return [];
      return list.map(normalizeTrack).filter(Boolean);
    }

    function artistText(track, t) {
      if (!track || !Array.isArray(track.artists) || track.artists.length === 0) return t ? t('unknownArtist') : '未知歌手';
      return track.artists.join(' / ');
    }

    // ---------- 播放器（模块级单例，跨面板存活） ----------

    const QUALITY_LEVELS = ['standard', 'higher', 'exhigh', 'lossless'];
    const QUALITY_KEY = 'dsh-netease-music:quality';
    const QUALITY_LABELS = { standard: 'qualityStandard', higher: 'qualityHigher', exhigh: 'qualityExhigh', lossless: 'qualityLossless' };

    function readQuality() {
      try {
        const value = window.localStorage.getItem(QUALITY_KEY);
        return QUALITY_LEVELS.includes(value) ? value : 'exhigh';
      } catch {
        return 'exhigh';
      }
    }

    // 播放器会话持久化：刷新页面后恢复队列、当前曲目、音量与播放模式
    const PLAYER_STATE_KEY = 'dsh-netease-music:player-state';

    function readPlayerState() {
      try {
        const raw = window.localStorage.getItem(PLAYER_STATE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return null;
        const queue = Array.isArray(data.queue) ? data.queue.map(normalizeTrack).filter(Boolean).slice(0, 100) : [];
        const track = normalizeTrack(data.track);
        const index = Number.isInteger(data.index) ? data.index : -1;
        const volume = typeof data.volume === 'number' ? Math.max(0, Math.min(1, data.volume)) : 0.8;
        const mode = ['list', 'single', 'shuffle'].includes(data.mode) ? data.mode : 'list';
        const resume = typeof data.currentTime === 'number' && Number.isFinite(data.currentTime) ? data.currentTime : 0;
        return { track, queue, index, volume, mode, resume };
      } catch {
        return null;
      }
    }

    function writePlayerState(snapshot) {
      try {
        window.localStorage.setItem(
          PLAYER_STATE_KEY,
          JSON.stringify({
            track: snapshot.track,
            queue: snapshot.queue.slice(0, 100),
            index: snapshot.index,
            volume: snapshot.volume,
            mode: snapshot.mode,
            currentTime: Math.round(snapshot.currentTime || 0),
            at: Date.now(),
          }),
        );
      } catch {
        /* 隐私模式或配额不足时忽略 */
      }
    }

    function createPlayer() {
      const restored = readPlayerState();
      let state = {
        audio: null,
        track: restored && restored.track ? restored.track : null,
        queue: restored ? restored.queue : [],
        index: restored ? restored.index : -1,
        playing: false,
        loading: false,
        error: '',
        currentTime: restored && restored.track ? restored.resume : 0,
        duration: restored && restored.track ? (restored.track.duration || 0) / 1000 : 0,
        volume: restored ? restored.volume : 0.8,
        mode: restored ? restored.mode : 'list',
        quality: readQuality(),
        url: '',
        panelVisible: false,
      };
      // 刷新后首次点播放时，从上次的进度继续（只在同一首歌时生效）
      let resumeTime = restored && restored.track ? restored.resume : 0;
      let resumeTrackId = restored && restored.track ? restored.track.id : null;
      let saveTimer = null;
      let saveSignature = '';
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
      const scheduleSave = () => {
        const signature = [state.track ? state.track.id : '', state.index, state.volume, state.mode, state.queue.length].join('|');
        if (signature === saveSignature) return;
        saveSignature = signature;
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          saveTimer = null;
          writePlayerState(state);
        }, 600);
      };
      const patch = (next) => {
        state = { ...state, ...next };
        emit();
        scheduleSave();
      };
      let playToken = 0;
      try {
        window.addEventListener('pagehide', () => writePlayerState(state));
      } catch {
        /* 环境不支持时忽略 */
      }

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
        historyStore.record(normalized);
        try {
          const data = await rpc('songUrl', { ids: [normalized.id], level: state.quality });
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
          if (resumeTrackId !== null && normalized.id === resumeTrackId && resumeTime > 1) {
            const target = resumeTime;
            resumeTime = 0;
            resumeTrackId = null;
            try {
              audio.currentTime = target;
            } catch {
              /* 元数据就绪前设置失败则忽略 */
            }
          }
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
        if (!audio.src) {
          // 刷新后恢复的会话还没有直链，重新取一次
          void playTrack(state.track, { queue: state.queue, index: state.index });
          return;
        }
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

      function setQuality(level) {
        if (!QUALITY_LEVELS.includes(level) || level === state.quality) return;
        try {
          window.localStorage.setItem(QUALITY_KEY, level);
        } catch {
          /* 存储不可用时只在本次会话生效 */
        }
        patch({ quality: level });
        const audio = state.audio;
        const track = state.track;
        if (!audio || !track) return;
        // 换音质时保持当前进度与播放状态
        const at = audio.currentTime;
        const wasPlaying = !audio.paused;
        const token = ++playToken;
        patch({ loading: true, error: '' });
        void (async () => {
          try {
            const data = await rpc('songUrl', { ids: [track.id], level });
            if (token !== playToken) return;
            const entry = Array.isArray(data?.data)
              ? data.data.find((item) => item && item.id === track.id) ?? data.data[0]
              : null;
            const url = entry && entry.url ? String(entry.url) : '';
            if (!url) {
              patch({ loading: false, error: '这个音质暂时不可用，换一个试试' });
              return;
            }
            audio.src = url;
            audio.addEventListener(
              'loadedmetadata',
              () => {
                try {
                  audio.currentTime = at;
                } catch {
                  /* 时长未知时忽略 */
                }
                if (wasPlaying) void audio.play().catch(() => undefined);
              },
              { once: true },
            );
            patch({ url, loading: false });
          } catch (error) {
            if (token !== playToken) return;
            patch({ loading: false, error: String((error && error.message) || error) });
          }
        })();
      }

      function cycleQuality() {
        const order = QUALITY_LEVELS;
        setQuality(order[(order.indexOf(state.quality) + 1) % order.length]);
      }

      function playQueue(tracks, startIndex) {
        const queue = normalizeTracks(tracks);
        if (queue.length === 0) return;
        const index = Math.max(0, Math.min(startIndex ?? 0, queue.length - 1));
        void playTrack(queue[index], { queue, index });
      }

      function playNext(track) {
        const normalized = normalizeTrack(track);
        if (!normalized) return;
        const queue = [...state.queue];
        if (queue.length === 0) {
          void playTrack(normalized, { queue: [normalized], index: 0 });
          return;
        }
        const at = Math.max(0, Math.min(state.index + 1, queue.length));
        queue.splice(at, 0, normalized);
        patch({ queue, index: state.index });
      }

      function addToQueue(track) {
        const normalized = normalizeTrack(track);
        if (!normalized) return;
        const queue = [...state.queue, normalized];
        if (state.queue.length === 0) {
          patch({ queue, index: -1 });
          return;
        }
        patch({ queue });
      }

      function removeFromQueue(targetIndex) {
        const index = Number(targetIndex);
        const queue = state.queue;
        if (!Number.isInteger(index) || index < 0 || index >= queue.length) return;
        const nextQueue = queue.filter((_, position) => position !== index);
        if (nextQueue.length === 0) {
          clearQueue();
          return;
        }
        if (index === state.index) {
          // 删掉正在播的那首：接着播它后面的歌（末尾则回到第一首）
          const target = Math.min(index, nextQueue.length - 1);
          void playTrack(nextQueue[target], { queue: nextQueue, index: target });
          return;
        }
        patch({ queue: nextQueue, index: index < state.index ? state.index - 1 : state.index });
      }

      function clearQueue() {
        const audio = state.audio;
        playToken += 1;
        if (audio) {
          try {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
          } catch {
            /* 卸载失败不影响状态清理 */
          }
        }
        patch({
          queue: [],
          index: -1,
          track: null,
          playing: false,
          loading: false,
          currentTime: 0,
          duration: 0,
          url: '',
          error: '',
        });
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
        playNext,
        addToQueue,
        removeFromQueue,
        clearQueue,
        toggle,
        next,
        previous,
        seek,
        setVolume,
        setMode,
        cycleMode,
        setQuality,
        cycleQuality,
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

    // ---------- 最近播放（本地记录） ----------

    const HISTORY_KEY = 'dsh-netease-music:history';
    const HISTORY_LIMIT = 100;

    const historyStore = (() => {
      function read() {
        try {
          const raw = window.localStorage.getItem(HISTORY_KEY);
          if (!raw) return [];
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) return [];
          return parsed.map((item) => normalizeTrack(item)).filter(Boolean).slice(0, HISTORY_LIMIT);
        } catch {
          return [];
        }
      }
      let items = read();
      const listeners = new Set();
      function persist() {
        try {
          window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
        } catch {
          /* 存储被禁用或写满时忽略，不影响播放 */
        }
      }
      function emit() {
        for (const listener of listeners) listener();
      }
      function record(track) {
        const normalized = normalizeTrack(track);
        if (!normalized) return;
        items = [normalized, ...items.filter((item) => item.id !== normalized.id)].slice(0, HISTORY_LIMIT);
        persist();
        emit();
      }
      function clear() {
        items = [];
        persist();
        emit();
      }
      return {
        getSnapshot: () => items,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        record,
        clear,
      };
    })();

    function useHistory() {
      return useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot, historyStore.getSnapshot);
    }

    // ---------- 喜欢的歌曲（登录后从服务端同步） ----------

    const likedStore = (() => {
      let ids = new Set();
      let loadingFor = 0;
      let request = null;
      const listeners = new Set();
      function emit() {
        for (const listener of listeners) listener();
      }
      function ensure(uid) {
        if (!uid) return Promise.resolve();
        if (loadingFor === uid) return request || Promise.resolve();
        loadingFor = uid;
        request = (async () => {
          try {
            const data = await rpc('likeSongs', { uid });
            ids = new Set(Array.isArray(data?.ids) ? data.ids.map(Number) : []);
            emit();
          } catch {
            /* 拿不到喜欢列表时红心保持为空，不影响其它功能 */
          }
        })();
        return request;
      }
      async function toggle(id) {
        const trackId = Number(id);
        if (!trackId) return null;
        const like = !ids.has(trackId);
        await rpc('songLike', { id: trackId, like });
        const next = new Set(ids);
        if (like) next.add(trackId);
        else next.delete(trackId);
        ids = next;
        emit();
        return like;
      }
      return {
        getSnapshot: () => ids,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        ensure,
        toggle,
      };
    })();

    function useLikedIds() {
      return useSyncExternalStore(likedStore.subscribe, likedStore.getSnapshot, likedStore.getSnapshot);
    }

    // ---------- 曲目右键菜单（模块级，任意列表行都能唤起） ----------

    const contextMenuStore = (() => {
      let current = null;
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
      return {
        open(event, track) {
          if (!track) return;
          current = {
            track,
            x: Number(event && event.clientX) || 0,
            y: Number(event && event.clientY) || 0,
          };
          emit();
        },
        close() {
          if (!current) return;
          current = null;
          emit();
        },
        getSnapshot() {
          return current;
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    })();

    function useContextMenu() {
      return useSyncExternalStore(contextMenuStore.subscribe, contextMenuStore.getSnapshot, contextMenuStore.getSnapshot);
    }

    // 轻量提示条：复制链接、操作结果之类的一次性反馈
    const toastStore = (() => {
      let message = '';
      let timer = null;
      const listeners = new Set();
      const emit = () => {
        for (const listener of listeners) {
          try {
            listener();
          } catch {
            /* 忽略订阅者异常 */
          }
        }
      };
      return {
        show(text) {
          message = String(text || '');
          emit();
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            message = '';
            emit();
          }, 1800);
        },
        getSnapshot() {
          return message;
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    })();

    function useToast() {
      return useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);
    }

    function Toast() {
      const message = useToast();
      if (!message) return null;
      return h('div', { className: 'dnm-toast', role: 'status' }, message);
    }

    function usePlayerState() {
      return useSyncExternalStore(sharedPlayer.subscribe, sharedPlayer.getSnapshot, sharedPlayer.getSnapshot);
    }

    // ---------- 登录会话（模块级） ----------

    function createSession() {
      let state = { status: 'idle', loggedIn: false, profile: null, expired: false, error: '' };
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
              patch({
                status: 'ready',
                loggedIn: Boolean(json.loggedIn),
                profile: json.profile ?? null,
                expired: Boolean(json.expired),
                error: '',
              });
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
        patch({ loggedIn: false, profile: null, expired: false });
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
    const IconRadio = ({ size = 14 }) => svgIcon(size, 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 3a6 6 0 110 12 6 6 0 010-12zm0 3a3 3 0 100 6 3 3 0 000-6z');
    const IconDaily = ({ size = 14 }) => svgIcon(size, 'M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z');
    const IconLyric = ({ size = 15 }) =>
      svgIcon(size, null, {
        fill: 'none',
        children: [
          h('path', { key: 'a', d: 'M4 7h16M4 12h11M4 17h7', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' }),
          h('path', { key: 'b', d: 'M18 13v5M18 13l2.2-.5v4.6', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
        ],
      });
    const IconClose = ({ size = 12 }) =>
      svgIcon(size, null, {
        fill: 'none',
        children: [h('path', { key: 'a', d: 'M6 6l12 12M18 6L6 18', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' })],
      });

    // 全屏歌词：四角向外扩，和「缩小」共用一套路径
    const IconExpand = ({ size = 14 }) =>
      svgIcon(size, null, {
        fill: 'none',
        children: [
          h('path', { key: 'a', d: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        ],
      });
    const IconCollapse = ({ size = 14 }) =>
      svgIcon(size, null, {
        fill: 'none',
        children: [
          h('path', { key: 'a', d: 'M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        ],
      });

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
                'linear-gradient(135deg, color-mix(in srgb, var(--dnm-red) 22%, transparent), var(--dsw-alias-bg-layer-2))',
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

    // 卡片右下角的播放按钮：不进入详情页，直接播放
    function CardPlayButton({ label, busy, onClick }) {
      return h(
        'button',
        {
          type: 'button',
          className: 'dnm-card-play' + (busy ? ' busy' : ''),
          title: label,
          'aria-label': label,
          onClick: (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!busy) onClick();
          },
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              if (!busy) onClick();
            }
          },
        },
        busy ? h('div', { className: 'dnm-spinner', style: { width: 14, height: 14 } }) : h(IconPlay, { size: 13 }),
      );
    }

    // 直接播放某个歌单（优先用列表缓存里的曲目，避免重复请求）
    async function playPlaylistById(playlistId) {
      const cached = cacheGet('playlist:' + playlistId);
      let tracks = cached && Array.isArray(cached.tracks) && cached.tracks.length > 0 ? cached.tracks : null;
      if (!tracks) {
        const data = await rpc('playlistDetail', { id: playlistId, n: 1000 });
        const playlist = data && data.playlist ? data.playlist : null;
        if (!playlist) throw new Error('歌单不存在');
        tracks = normalizeTracks(playlist.tracks || []);
      }
      if (!tracks || tracks.length === 0) throw new Error('歌单是空的');
      sharedPlayer.playQueue(tracks, 0);
      return tracks.length;
    }

    // 直接播放某个专辑
    async function playAlbumById(albumId) {
      const cached = cacheGet('album:' + albumId);
      let songs = cached && Array.isArray(cached.songs) && cached.songs.length > 0 ? cached.songs : null;
      if (!songs) {
        const data = await rpc('albumDetail', { id: albumId });
        songs = normalizeTracks((data && data.songs) || []);
      }
      if (!songs || songs.length === 0) throw new Error('专辑是空的');
      sharedPlayer.playQueue(songs, 0);
      return songs.length;
    }

    // 直接播放某个歌手的热门歌曲
    async function playArtistById(artistId) {
      const cached = cacheGet('artist:' + artistId);
      let songs = cached && Array.isArray(cached.hotSongs) && cached.hotSongs.length > 0 ? cached.hotSongs : null;
      if (!songs) {
        const data = await rpc('artistDetail', { id: artistId });
        songs = normalizeTracks((data && data.hotSongs) || []);
      }
      if (!songs || songs.length === 0) throw new Error('歌手还没有歌曲');
      sharedPlayer.playQueue(songs, 0);
      return songs.length;
    }

    // 卡片上的播放动作：维护 loading 状态并给出提示
    function useCardPlay(t) {
      const [busyKey, setBusyKey] = useState(null);
      const play = useCallback(
        async (key, loader) => {
          setBusyKey(key);
          try {
            const count = await loader();
            toastStore.show(t('queuedCount').replace('{n}', String(count)));
          } catch (error) {
            toastStore.show(String((error && error.message) || t('loadFailed')));
          } finally {
            setBusyKey(null);
          }
        },
        [t],
      );
      return { busyKey, play };
    }

    // ---------- 数据加载 hook ----------

    // 列表数据缓存：返回上一页时直接复用，避免每次重新请求导致闪骨架
    const DATA_CACHE_LIMIT = 40;
    const dataCache = new Map();

    function cacheGet(key) {
      return dataCache.get(key);
    }

    function cachePut(key, value) {
      if (!key) return;
      if (dataCache.has(key)) dataCache.delete(key);
      dataCache.set(key, value);
      while (dataCache.size > DATA_CACHE_LIMIT) {
        const oldest = dataCache.keys().next();
        if (oldest.done) break;
        dataCache.delete(oldest.value);
      }
    }

    function useAsync(loader, deps, options) {
      const cacheKey = options && options.cacheKey;
      const cached = cacheKey ? cacheGet(cacheKey) : undefined;
      const [state, setState] = useState(() =>
        cached !== undefined
          ? { status: 'ready', data: cached, error: '' }
          : { status: 'loading', data: null, error: '' },
      );
      const [nonce, setNonce] = useState(0);
      const forceRef = useRef(false);
      useEffect(() => {
        let cancelled = false;
        if (cacheKey && nonce === 0 && !forceRef.current) {
          const hit = cacheGet(cacheKey);
          if (hit !== undefined) {
            setState({ status: 'ready', data: hit, error: '' });
            return () => {
              cancelled = true;
            };
          }
        }
        forceRef.current = false;
        setState({ status: 'loading', data: null, error: '' });
        Promise.resolve()
          .then(loader)
          .then((data) => {
            if (cancelled) return;
            if (cacheKey) cachePut(cacheKey, data);
            setState({ status: 'ready', data, error: '' });
          })
          .catch((error) => {
            if (!cancelled) setState({ status: 'error', data: null, error: String((error && error.message) || error) });
          });
        return () => {
          cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [...deps, nonce]);
      return {
        ...state,
        reload: () => {
          forceRef.current = true;
          setNonce((value) => value + 1);
        },
      };
    }

    // ---------- 歌词解析 ----------

    const LRC_STAMP = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

    function parseLrc(text) {
      const lines = [];
      if (!text) return lines;
      for (const raw of String(text).split(/\r?\n/)) {
        LRC_STAMP.lastIndex = 0;
        const stamps = [];
        let match;
        while ((match = LRC_STAMP.exec(raw)) !== null) {
          const minutes = Number(match[1]);
          const seconds = Number(match[2]);
          const fraction = match[3] ? Number((match[3] + '000').slice(0, 3)) / 1000 : 0;
          stamps.push(minutes * 60 + seconds + fraction);
        }
        if (stamps.length === 0) continue;
        const content = raw.replace(LRC_STAMP, '').trim();
        if (!content) continue;
        for (const time of stamps) lines.push({ time, text: content });
      }
      lines.sort((a, b) => a.time - b.time);
      return lines;
    }

    // 把翻译歌词按时间挂到原文行上：行数一致时按顺序配对，否则就近匹配。
    function attachTranslation(lines, translatedLines) {
      if (!translatedLines || translatedLines.length === 0) return lines;
      const sameLength = translatedLines.length === lines.length;
      return lines.map((line, index) => {
        let translation = '';
        if (sameLength && translatedLines[index]) {
          translation = translatedLines[index].text;
        } else {
          for (const candidate of translatedLines) {
            if (candidate.time > line.time + 0.6) break;
            if (candidate.time >= line.time - 0.6) {
              translation = candidate.text;
              break;
            }
          }
        }
        return translation && translation !== line.text ? { ...line, translation } : line;
      });
    }

    const lyricCache = new Map();

    function useLyric(trackId) {
      return useAsync(async () => {
        if (!trackId) return { lines: [] };
        if (lyricCache.has(trackId)) return lyricCache.get(trackId);
        const data = await rpc('lyric', { id: trackId });
        const result = { lines: attachTranslation(parseLrc(data?.lrc?.lyric), parseLrc(data?.tlyric?.lyric)) };
        lyricCache.set(trackId, result);
        if (lyricCache.size > 40) lyricCache.delete(lyricCache.keys().next().value);
        return result;
      }, [trackId]);
    }

    // ---------- 通用组件 ----------

    // 详情页头部背景：用封面图做模糊晕染，随滚动固定在内容顶部
    function HeroBackdrop({ url }) {
      if (!url) return null;
      return h(
        'div',
        { className: 'dnm-hero-bg', 'aria-hidden': 'true' },
        h('div', { className: 'dnm-hero-bg-img', style: { backgroundImage: 'url("' + url + '")' } }),
      );
    }

    const LYRIC_SETTINGS_KEY = 'dsh-netease-music:lyric-settings';
    const LYRIC_SIZES = ['small', 'normal', 'large'];

    function readLyricSettings() {
      const fallback = { translation: true, size: 'normal' };
      try {
        const raw = window.localStorage.getItem(LYRIC_SETTINGS_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return {
          translation: parsed && typeof parsed.translation === 'boolean' ? parsed.translation : true,
          size: parsed && LYRIC_SIZES.includes(parsed.size) ? parsed.size : 'normal',
        };
      } catch {
        return fallback;
      }
    }

    function saveLyricSettings(settings) {
      try {
        window.localStorage.setItem(LYRIC_SETTINGS_KEY, JSON.stringify(settings));
      } catch {
        /* 存储不可用时只在本次会话生效 */
      }
    }

    function Loading({ label }) {
      return h('div', { className: 'dnm-empty' }, h('div', { className: 'dnm-spinner' }), h('span', null, label || '加载中…'));
    }

    // 骨架屏：加载中占位，比转圈更有桌面端质感
    function Skeleton({ rows = 0, cards = 0 }) {
      if (cards > 0) {
        return h(
          'div',
          { className: 'dnm-skeleton-grid', 'aria-hidden': 'true' },
          Array.from({ length: cards }, (_, index) => h('div', { key: index, className: 'dnm-skeleton-card' })),
        );
      }
      return h(
        'div',
        { className: 'dnm-skeleton', 'aria-hidden': 'true' },
        Array.from({ length: rows }, (_, index) => h('div', { key: index, className: 'dnm-skeleton-row' })),
      );
    }

    function Empty({ label, action, icon }) {
      return h(
        'div',
        { className: 'dnm-empty' },
        h('div', { className: 'dnm-empty-icon', 'aria-hidden': 'true' }, icon || h(IconMusic, { size: 24 })),
        h('span', null, label),
        action || null,
      );
    }

    function ErrorBox({ message, onRetry, retryLabel }) {
      return h(
        'div',
        { className: 'dnm-empty' },
        h('span', null, message),
        onRetry ? h('button', { type: 'button', className: 'dnm-btn', onClick: onRetry }, retryLabel || '重试') : null,
      );
    }

    function TrackRow({ track, index, playing, onPlay, t, onRemove, onDislike }) {
      const isVip = track.fee === 1 || track.fee === 4;
      const session = useSession();
      const likedIds = useLikedIds();
      const liked = likedIds.has(track.id);
      return h(
        'div',
        {
          className: 'dnm-row' + (playing ? ' playing' : ''),
          onDoubleClick: () => onPlay(),
          onContextMenu: (event) => {
            event.preventDefault();
            event.stopPropagation();
            contextMenuStore.open(event, track);
          },
          role: 'button',
          tabIndex: 0,
          onKeyDown: (event) => {
            if (event.key === 'Enter') onPlay();
          },
          title: track.name,
        },
        h(
          'div',
          { className: 'dnm-row-index' },
          playing
            ? h(IconMusic, { size: 12 })
            : [
                h('span', { key: 'num', className: 'dnm-row-num' }, String(index + 1).padStart(2, '0')),
                h(
                  'button',
                  {
                    key: 'play',
                    type: 'button',
                    className: 'dnm-row-playsign',
                    title: t('play'),
                    onClick: (event) => {
                      event.stopPropagation();
                      onPlay();
                    },
                  },
                  h(IconPlay, { size: 11 }),
                ),
              ],
        ),
        h(
          'div',
          { className: 'dnm-row-title' },
          h(
            'div',
            { className: 'dnm-row-name' },
            h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, track.name),
            isVip ? h('span', { className: 'dnm-vip' }, 'VIP') : null,
          ),
          h('div', { className: 'dnm-row-artist' }, artistText(track, t)),
        ),
        h('div', { className: 'dnm-row-album' }, track.album || ''),
        h('div', { className: 'dnm-row-duration' }, formatDuration(track.duration)),
        h(
          'button',
          {
            type: 'button',
            className: 'dnm-row-action dnm-row-like' + (liked ? ' liked' : ''),
            title: session.loggedIn ? (liked ? t('unlike') : t('like')) : t('likeHint'),
            disabled: !session.loggedIn,
            onClick: (event) => {
              event.stopPropagation();
              if (!session.loggedIn) return;
              likedStore.toggle(track.id).catch(() => undefined);
            },
          },
          h(IconHeart, { size: 13 }),
        ),
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
        onDislike
          ? h(
              'button',
              {
                type: 'button',
                className: 'dnm-row-action',
                title: t('dislike'),
                onClick: (event) => {
                  event.stopPropagation();
                  onDislike();
                },
              },
              svgIcon(13, 'M5 11h14v2H5z'),
            )
          : null,
        onRemove
          ? h(
              'button',
              {
                type: 'button',
                className: 'dnm-row-action',
                title: t('removeFromQueue'),
                onClick: (event) => {
                  event.stopPropagation();
                  onRemove();
                },
              },
              h(IconClose, { size: 12 }),
            )
          : null,
      );
    }

    // 曲目右键菜单：任意列表行右键唤起，可立即播放 / 下一首播放 / 加入队列 / 收藏到歌单
    function ContextMenu({ t, onOpenArtist, onOpenAlbum }) {
      const menu = useContextMenu();
      const session = useSession();
      const [addingTrack, setAddingTrack] = useState(null);
      useEffect(() => {
        if (!menu) return undefined;
        const onKey = (event) => {
          if (event.key === 'Escape') contextMenuStore.close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [menu]);
      const track = menu ? menu.track : null;
      const left = menu ? Math.max(8, Math.min(menu.x, window.innerWidth - 212)) : 0;
      const top = menu ? Math.max(8, Math.min(menu.y, window.innerHeight - 330)) : 0;
      const copyLink = async () => {
        if (!track) return;
        const link = 'https://music.163.com/#/song?id=' + track.id;
        let ok = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(link);
            ok = true;
          }
        } catch {
          /* 权限被拒时走降级方案 */
        }
        if (!ok) {
          try {
            const area = document.createElement('textarea');
            area.value = link;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            ok = document.execCommand('copy');
            document.body.removeChild(area);
          } catch {
            ok = false;
          }
        }
        toastStore.show(ok ? t('linkCopied') : t('copyFailed'));
      };
      const item = (label, onClick) =>
        h(
          'button',
          {
            type: 'button',
            className: 'dnm-menu-item',
            onClick: (event) => {
              event.stopPropagation();
              contextMenuStore.close();
              onClick();
            },
          },
          label,
        );
      return h(
        React.Fragment,
        null,
        menu
          ? h(
              'div',
              {
                className: 'dnm-menu-mask',
                onClick: () => contextMenuStore.close(),
                onContextMenu: (event) => {
                  event.preventDefault();
                  contextMenuStore.close();
                },
              },
              h(
                'div',
                { className: 'dnm-menu', style: { left, top }, onClick: (event) => event.stopPropagation() },
                h('div', { className: 'dnm-menu-title' }, track.name),
                item(t('playNow'), () => sharedPlayer.playQueue([track], 0)),
                item(t('playNext'), () => sharedPlayer.playNext(track)),
                item(t('addToQueue'), () => sharedPlayer.addToQueue(track)),
                track.artistIds && track.artistIds.length > 0 && onOpenArtist
                  ? item(t('viewArtist'), () => onOpenArtist(track.artistIds[0]))
                  : null,
                track.albumId && onOpenAlbum ? item(t('viewAlbum'), () => onOpenAlbum(track.albumId)) : null,
                session.loggedIn ? item(t('addToPlaylist'), () => setAddingTrack(track)) : null,
                item(t('copyLink'), () => void copyLink()),
              ),
            )
          : null,
        addingTrack ? h(AddToPlaylistDialog, { t, track: addingTrack, onClose: () => setAddingTrack(null) }) : null,
      );
    }

    // 收藏到歌单：列出我的歌单，选一个把曲目加进去
    function AddToPlaylistDialog({ t, track, onClose }) {
      const session = useSession();
      const uid = session.profile ? session.profile.userId : 0;
      const playlists = useAsync(async () => {
        if (!uid) return [];
        const data = await rpc('userPlaylist', { uid, limit: 100 });
        return Array.isArray(data && data.playlist) ? data.playlist : [];
      }, [uid], { cacheKey: uid ? 'userPlaylists:' + uid : undefined });
      const [busyId, setBusyId] = useState(0);
      const [doneName, setDoneName] = useState('');
      const [error, setError] = useState('');

      const add = async (playlist) => {
        if (busyId) return;
        setBusyId(playlist.id);
        setError('');
        try {
          const result = await rpc('playlistAddTrack', { pid: playlist.id, id: track.id });
          if (result && typeof result.code === 'number' && result.code !== 200) {
            throw new Error(result.message || t('addToPlaylistFailed'));
          }
          setDoneName(playlist.name);
        } catch (caught) {
          setError(caught && caught.message ? caught.message : t('addToPlaylistFailed'));
        } finally {
          setBusyId(0);
        }
      };

      let body;
      if (playlists.status === 'loading') {
        body = h(Skeleton, { rows: 8 });
      } else if (playlists.status === 'error') {
        body = h(ErrorBox, { message: playlists.error, onRetry: playlists.reload, retryLabel: t('retry') });
      } else if ((playlists.data || []).length === 0) {
        body = h(Empty, { label: t('noPlaylists'), icon: h(IconUser, { size: 24 }) });
      } else {
        body = h(
          'div',
          { className: 'dnm-playlist-pick' },
          (playlists.data || []).map((playlist) =>
            h(
              'button',
              {
                type: 'button',
                key: playlist.id,
                className: 'dnm-playlist-pick-item' + (doneName === playlist.name ? ' done' : ''),
                disabled: Boolean(busyId),
                onClick: () => void add(playlist),
              },
              h(Cover, { url: playlist.coverImgUrl, className: 'dnm-playlist-pick-cover' }),
              h(
                'div',
                { className: 'dnm-playlist-pick-body' },
                h('div', { className: 'dnm-playlist-pick-name' }, playlist.name),
                h(
                  'div',
                  { className: 'dnm-playlist-pick-count' },
                  t('playlistSongCount').replace('{n}', String(playlist.trackCount || 0)),
                ),
              ),
              busyId === playlist.id ? h('span', { className: 'dnm-playlist-pick-busy' }, '…') : null,
            ),
          ),
        );
      }

      return h(
        'div',
        { className: 'dnm-modal-mask', onClick: onClose },
        h(
          'div',
          {
            className: 'dnm-modal',
            role: 'dialog',
            'aria-modal': 'true',
            style: { width: 420, alignItems: 'stretch' },
            onClick: (event) => event.stopPropagation(),
          },
          h(
            'div',
            { className: 'dnm-playlist-pick-head' },
            h('h2', { className: 'dnm-modal-title' }, t('addToPlaylist')),
            h(
              'button',
              { type: 'button', className: 'dnm-icon-btn', title: t('close'), onClick: onClose },
              h(IconClose, { size: 14 }),
            ),
          ),
          h('p', { className: 'dnm-modal-hint', style: { textAlign: 'left' } }, track.name),
          doneName ? h('div', { className: 'dnm-playlist-done' }, t('addedToPlaylist').replace('{name}', doneName)) : null,
          error ? h('div', { className: 'dnm-status error' }, error) : null,
          body,
        ),
      );
    }

    // ---------- 视图：发现 ----------
    function DiscoverView({ t, onOpenPlaylist, onOpenToplist }) {
      const cardPlay = useCardPlay(t);
      const charts = useAsync(async () => {
        const data = await rpc('toplist');
        return Array.isArray(data?.list) ? data.list : [];
      }, [], { cacheKey: 'toplist' });
      const playlists = useAsync(async () => {
        const data = await rpc('personalized', { limit: 12 });
        return Array.isArray(data?.result) ? data.result : [];
      }, [], { cacheKey: 'discoverPlaylists' });
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
            ? h(Skeleton, { cards: 8 })
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
            ? h(Skeleton, { rows: 8 })
            : playlists.status === 'error'
              ? h(ErrorBox, { message: playlists.error, onRetry: playlists.reload, retryLabel: t('retry') })
              : h(
                  'div',
                  { className: 'dnm-grid' },
                  (playlists.data || []).map((playlist) =>
                    h(
                      'div',
                      {
                        key: playlist.id,
                        className: 'dnm-card',
                        role: 'button',
                        tabIndex: 0,
                        onClick: () => onOpenPlaylist(playlist.id),
                        onKeyDown: (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onOpenPlaylist(playlist.id);
                          }
                        },
                      },
                      h(
                        'div',
                        { className: 'dnm-cover' },
                        h(Cover, { url: playlist.picUrl, className: 'dnm-cover-img', alt: playlist.name }),
                        h('span', { className: 'dnm-cover-count' }, h(IconPlay, { size: 10 }), formatCount(playlist.playCount)),
                      ),
                      h(CardPlayButton, {
                        label: t('playAll'),
                        busy: cardPlay.busyKey === 'pl:' + playlist.id,
                        onClick: () => cardPlay.play('pl:' + playlist.id, () => playPlaylistById(playlist.id)),
                      }),
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
      }, [], { cacheKey: 'toplist' });
      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('tabToplist')),
        charts.status === 'loading'
          ? h(Skeleton, { rows: 8 })
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

    const TRACK_SORTS = [
      { key: 'default', label: 'sortDefault' },
      { key: 'name', label: 'sortName' },
      { key: 'artist', label: 'sortArtist' },
      { key: 'duration', label: 'sortDuration' },
    ];
    const PLAYLIST_SORTS = [...TRACK_SORTS, { key: 'group', label: 'groupByArtist' }];

    function groupTracksByArtist(entries, t) {
      const groups = new Map();
      for (const entry of entries) {
        const name = artistText(entry.track, t);
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name).push(entry);
      }
      return [...groups.entries()]
        .map(([artist, items]) => ({ artist, entries: items }))
        .sort((a, b) => b.entries.length - a.entries.length || a.artist.localeCompare(b.artist, 'zh-CN'));
    }

    function sortTracks(entries, sortBy, t) {
      if (sortBy === 'name') {
        return [...entries].sort((a, b) => String(a.track.name || '').localeCompare(String(b.track.name || ''), 'zh-CN'));
      }
      if (sortBy === 'artist') {
        return [...entries].sort((a, b) => artistText(a.track, t).localeCompare(artistText(b.track, t), 'zh-CN'));
      }
      if (sortBy === 'duration') {
        return [...entries].sort((a, b) => (Number(a.track.duration) || 0) - (Number(b.track.duration) || 0));
      }
      return entries;
    }

    function filterTracks(entries, query, t) {
      const needle = query.trim().toLowerCase();
      if (!needle) return entries;
      return entries.filter(({ track }) =>
        [track.name, artistText(track, t), track.album].some((value) =>
          String(value || '').toLowerCase().includes(needle),
        ),
      );
    }

    function TrackToolbar({ t, query, onQuery, sortBy, onSort, count, total, sorts }) {
      const options = sorts || TRACK_SORTS;
      return h(
        'div',
        { className: 'dnm-track-toolbar' },
        h(
          'label',
          { className: 'dnm-track-search' },
          h(IconSearch, { size: 13 }),
          h('input', {
            type: 'search',
            value: query,
            placeholder: t('trackSearchPlaceholder'),
            'aria-label': t('trackSearchPlaceholder'),
            onChange: (event) => onQuery(event.target.value),
          }),
          query
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-queue-search-clear',
                  'aria-label': t('clear'),
                  onClick: () => onQuery(''),
                },
                h(IconClose, { size: 11 }),
              )
            : null,
        ),
        h(
          'div',
          { className: 'dnm-sort-group' },
          options.map((option) =>
            h(
              'button',
              {
                key: option.key,
                type: 'button',
                className: 'dnm-sort-btn' + (sortBy === option.key ? ' active' : ''),
                onClick: () => onSort(option.key),
              },
              t(option.label),
            ),
          ),
        ),
        h(
          'span',
          { className: 'dnm-track-count' },
          query.trim() ? count + ' / ' + total : total + recordSuffix(t),
        ),
      );
    }

    function PlaylistView({ t, playlistId, onBack }) {
      const detail = useAsync(async () => {
        const data = await rpc('playlistDetail', { id: playlistId, n: 1000 });
        const playlist = data?.playlist;
        if (!playlist) throw new Error('歌单不存在或已下架');
        const creator = playlist.creator || {};
        const tagList = [
          ...(Array.isArray(playlist.tags) ? playlist.tags : []),
          ...(Array.isArray(playlist.displayTags) ? playlist.displayTags : []),
        ];
        return {
          id: playlist.id,
          name: playlist.name,
          coverUrl: playlist.coverImgUrl,
          creator: creator.nickname || '',
          creatorAvatar: creator.avatarUrl || '',
          trackCount: playlist.trackCount || (playlist.tracks ? playlist.tracks.length : 0),
          description: (playlist.description || '').trim(),
          tags: [...new Set(tagList)].filter(Boolean),
          playCount: Number(playlist.playCount) || 0,
          subscribedCount: Number(playlist.subscribedCount) || 0,
          commentCount: Number(playlist.commentCount) || 0,
          subscribed: Boolean(playlist.subscribed),
          updateTime: Number(playlist.updateTime) || 0,
          tracks: normalizeTracks(playlist.tracks),
        };
      }, [playlistId], { cacheKey: 'playlist:' + playlistId });
      const playerState = usePlayerState();
      const session = useSession();
      const [tab, setTab] = useState('tracks');
      const [expanded, setExpanded] = useState(false);
      const [trackQuery, setTrackQuery] = useState('');
      const [sortBy, setSortBy] = useState('default');
      const [subscribedOverride, setSubscribedOverride] = useState(null);
      const [subscribeBusy, setSubscribeBusy] = useState(false);
      const [subscribeError, setSubscribeError] = useState('');
      const playlist = detail.data;
      const currentId = playerState.track ? playerState.track.id : null;
      const trackEntries = playlist ? playlist.tracks.map((track, index) => ({ track, index })) : [];
      const visibleTracks = sortTracks(filterTracks(trackEntries, trackQuery, t), sortBy, t);
      const groupedTracks = sortBy === 'group' ? groupTracksByArtist(visibleTracks, t) : null;
      const subscribed = playlist ? (subscribedOverride === null ? playlist.subscribed : subscribedOverride) : false;
      const toggleSubscribe = () => {
        if (!playlist || subscribeBusy) return;
        const next = !subscribed;
        setSubscribeBusy(true);
        setSubscribeError('');
        rpc('playlistSubscribe', { id: playlist.id, subscribe: next })
          .then(() => setSubscribedOverride(next))
          .catch((error) => setSubscribeError(String((error && error.message) || error)))
          .then(() => setSubscribeBusy(false));
      };
      return h(
        'div',
        { className: 'dnm-content' },
        playlist ? h(HeroBackdrop, { url: playlist.coverUrl }) : null,
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
          ? h(Skeleton, { rows: 8 })
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
                    playlist.tags.length > 0
                      ? h(
                          'div',
                          { className: 'dnm-playlist-tags' },
                          playlist.tags.map((tag, index) => h('span', { key: tag + '-' + index, className: 'dnm-playlist-tag' }, tag)),
                        )
                      : null,
                    playlist.creator
                      ? h(
                          'div',
                          { className: 'dnm-playlist-creator' },
                          playlist.creatorAvatar
                            ? h('img', { className: 'dnm-playlist-avatar', src: playlist.creatorAvatar, alt: '', loading: 'lazy' })
                            : null,
                          h('span', null, playlist.creator),
                        )
                      : null,
                    h(
                      'div',
                      { className: 'dnm-playlist-stats' },
                      h('span', null, formatCount(playlist.playCount) + ' ' + t('playCountLabel')),
                      h('span', null, formatCount(playlist.subscribedCount) + ' ' + t('subscribeCountLabel')),
                      h('span', null, formatCount(playlist.commentCount) + ' ' + t('commentCountLabel')),
                      h('span', null, playlist.trackCount + recordSuffix(t)),
                      playlist.updateTime
                        ? h('span', null, t('updatedAt').replace('{n}', new Date(playlist.updateTime).toLocaleDateString()))
                        : null,
                    ),
                    playlist.description
                      ? h(React.Fragment, null,
                          h('p', { className: 'dnm-playlist-desc' + (expanded ? ' expanded' : '') }, playlist.description),
                          playlist.description.length > 60
                            ? h(
                                'button',
                                { type: 'button', className: 'dnm-playlist-desc-toggle', onClick: () => setExpanded((value) => !value) },
                                expanded ? t('collapse') : t('expand'),
                              )
                            : null,
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
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dnm-btn' + (subscribed ? ' primary' : ''),
                          disabled: !session.loggedIn || subscribeBusy,
                          title: session.loggedIn ? '' : t('loginRequired'),
                          onClick: toggleSubscribe,
                        },
                        h(IconHeart, { size: 14 }),
                        subscribed ? t('subscribed') : t('subscribe'),
                      ),
                    ),
                    subscribeError
                      ? h('p', { className: 'dnm-playlist-meta', style: { color: 'var(--dsw-alias-state-error-primary)' } }, subscribeError)
                      : null,
                  ),
                ),
                h(
                  'div',
                  { className: 'dnm-tabs' },
                  h(
                    'button',
                    { type: 'button', className: 'dnm-tab' + (tab === 'tracks' ? ' active' : ''), onClick: () => setTab('tracks') },
                    t('tracksTab') + ' (' + playlist.tracks.length + ')',
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'dnm-tab' + (tab === 'comments' ? ' active' : ''), onClick: () => setTab('comments') },
                    t('commentsTab') + ' (' + formatCount(playlist.commentCount) + ')',
                  ),
                ),
                tab === 'comments'
                  ? h(CommentsPanel, { t, kind: 'playlist', id: playlist.id })
                  : playlist.tracks.length === 0
                    ? h(Empty, { label: t('empty') })
                    : h(
                        React.Fragment,
                        null,
                        h(TrackToolbar, {
                          t,
                          query: trackQuery,
                          onQuery: setTrackQuery,
                          sortBy,
                          onSort: setSortBy,
                          count: visibleTracks.length,
                          total: playlist.tracks.length,
                          sorts: PLAYLIST_SORTS,
                        }),
                        visibleTracks.length === 0
                          ? h(Empty, { label: t('queueNoMatch'), icon: h(IconSearch, { size: 24 }) })
                          : groupedTracks
                            ? groupedTracks.map((group) =>
                                h(
                                  'div',
                                  { key: group.artist, className: 'dnm-group' },
                                  h(
                                    'div',
                                    { className: 'dnm-group-head' },
                                    h('span', { className: 'dnm-group-name' }, group.artist),
                                    h('span', { className: 'dnm-group-count' }, group.entries.length + recordSuffix(t)),
                                  ),
                                  group.entries.map(({ track, index }) =>
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
                              )
                            : visibleTracks.map(({ track, index }) =>
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

    const SEARCH_HISTORY_KEY = 'dsh-netease-music:search-history';
    const SEARCH_HISTORY_LIMIT = 10;

    const searchHistory = (() => {
      function read() {
        try {
          const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(parsed)) return [];
          return parsed
            .filter((item) => typeof item === 'string' && item.trim())
            .slice(0, SEARCH_HISTORY_LIMIT);
        } catch {
          return [];
        }
      }
      function persist(items) {
        try {
          window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
        } catch {
          /* 存储不可用时忽略，不影响搜索 */
        }
      }
      return {
        read,
        record(keyword) {
          const text = String(keyword || '').trim();
          if (!text) return;
          persist([text, ...read().filter((item) => item !== text)].slice(0, SEARCH_HISTORY_LIMIT));
        },
        clear() {
          persist([]);
        },
      };
    })();

    const SEARCH_TYPES = [
      { key: 'songs', label: 'searchSongs', type: 1 },
      { key: 'artists', label: 'searchArtists', type: 100 },
      { key: 'albums', label: 'searchAlbums', type: 10 },
      { key: 'playlists', label: 'searchPlaylists', type: 1000 },
    ];

    function SearchView({ t, keyword, onSearch, onOpenPlaylist, onOpenArtist, onOpenAlbum }) {
      const cardPlay = useCardPlay(t);
      const [input, setInput] = useState(keyword || '');
      const [type, setType] = useState('songs');
      useEffect(() => {
        setInput(keyword || '');
      }, [keyword]);
      const result = useAsync(async () => {
        if (!keyword) return null;
        const kind = SEARCH_TYPES.find((item) => item.key === type) || SEARCH_TYPES[0];
        const data = await rpc('search', { q: keyword, type: kind.type, limit: kind.key === 'playlists' ? 30 : 50 });
        const payload = data?.result ?? {};
        return {
          songs: normalizeTracks(payload.songs),
          artists: Array.isArray(payload.artists) ? payload.artists : [],
          albums: Array.isArray(payload.albums) ? payload.albums : [],
          playlists: Array.isArray(payload.playlists) ? payload.playlists : [],
        };
      }, [keyword, type], { cacheKey: keyword ? 'search:' + type + ':' + keyword : undefined });
      const playerState = usePlayerState();
      const currentId = playerState.track ? playerState.track.id : null;
      const data = result.data;
      const items = data ? data[type] || [] : [];
      const [history, setHistory] = useState(() => searchHistory.read());
      useEffect(() => {
        setHistory(searchHistory.read());
      }, [keyword]);
      const hot = useAsync(async () => {
        if (keyword) return [];
        const payload = await rpc('searchHot');
        const list = payload?.result?.hots ?? [];
        return list.map((item) => item?.first).filter((item) => typeof item === 'string' && item);
      }, [keyword], { cacheKey: keyword ? undefined : 'searchHot' });
      const pickKeyword = (value) => {
        setInput(value);
        onSearch(value);
      };

      let body;
      if (!keyword) {
        const hotWords = hot.data || [];
        body = h(
          'div',
          { className: 'dnm-search-home' },
          history.length > 0
            ? h(
                'div',
                null,
                h(
                  'div',
                  { className: 'dnm-section-head' },
                  h('span', null, t('searchHistory')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dnm-link',
                      onClick: () => {
                        searchHistory.clear();
                        setHistory([]);
                      },
                    },
                    t('clear'),
                  ),
                ),
                h(
                  'div',
                  { className: 'dnm-chips' },
                  history.map((word) =>
                    h(
                      'button',
                      { type: 'button', key: word, className: 'dnm-chip', onClick: () => pickKeyword(word) },
                      word,
                    ),
                  ),
                ),
              )
            : null,
          h('div', { className: 'dnm-section-head' }, h('span', null, t('hotSearch'))),
          hot.status === 'loading'
            ? h('div', { className: 'dnm-hot-hint' }, t('loading'))
            : h(
                'div',
                { className: 'dnm-hot' },
                hotWords.map((word, index) =>
                  h(
                    'button',
                    { type: 'button', key: word, className: 'dnm-hot-item', onClick: () => pickKeyword(word) },
                    h('span', { className: 'dnm-hot-rank' }, String(index + 1)),
                    h('span', { className: 'dnm-hot-name' }, word),
                  ),
                ),
              ),
        );
      } else if (result.status === 'loading') {
        body = h(Skeleton, { rows: 8 });
      } else if (result.status === 'error') {
        body = h(ErrorBox, { message: result.error, onRetry: result.reload, retryLabel: t('retry') });
      } else if (items.length === 0) {
        body = h(Empty, { label: t('noResult'), icon: h(IconSearch, { size: 24 }) });
      } else if (type === 'songs') {
        body = h(
          React.Fragment,
          null,
          h(
            'div',
            { className: 'dnm-actions', style: { marginBottom: 10 } },
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-btn primary',
                onClick: () => sharedPlayer.playQueue(data.songs, 0),
              },
              h(IconPlay, { size: 14 }),
              t('playAll'),
            ),
            h('span', { className: 'dnm-track-count' }, data.songs.length + recordSuffix(t)),
          ),
          data.songs.map((track, index) =>
            h(TrackRow, {
              key: track.id + '-' + index,
              track,
              index,
              playing: currentId === track.id,
              t,
              onPlay: () => sharedPlayer.playQueue(data.songs, index),
            }),
          ),
        );
      } else if (type === 'artists') {
        body = h(
          'div',
          { className: 'dnm-grid' },
          data.artists.map((artist) =>
            h(
              'div',
              {
                key: artist.id,
                className: 'dnm-card dnm-card-round',
                role: 'button',
                tabIndex: 0,
                onClick: () => onOpenArtist(artist.id),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenArtist(artist.id);
                  }
                },
              },
              h('div', { className: 'dnm-cover' }, h(Cover, { url: artist.picUrl || artist.img1v1Url, className: 'dnm-cover-img', alt: artist.name })),
              h(CardPlayButton, {
                label: t('playAll'),
                busy: cardPlay.busyKey === 'ar:' + artist.id,
                onClick: () => cardPlay.play('ar:' + artist.id, () => playArtistById(artist.id)),
              }),
              h('div', { className: 'dnm-card-title' }, artist.name),
              h('div', { className: 'dnm-card-sub' }, artist.musicSize != null ? artist.musicSize + ' ' + t('artistSongs') : ''),
            ),
          ),
        );
      } else if (type === 'albums') {
        body = h(
          'div',
          { className: 'dnm-grid' },
          data.albums.map((album) =>
            h(
              'div',
              {
                key: album.id,
                className: 'dnm-card',
                role: 'button',
                tabIndex: 0,
                onClick: () => onOpenAlbum(album.id),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenAlbum(album.id);
                  }
                },
              },
              h('div', { className: 'dnm-cover' }, h(Cover, { url: album.picUrl, className: 'dnm-cover-img', alt: album.name })),
              h(CardPlayButton, {
                label: t('playAll'),
                busy: cardPlay.busyKey === 'al:' + album.id,
                onClick: () => cardPlay.play('al:' + album.id, () => playAlbumById(album.id)),
              }),
              h('div', { className: 'dnm-card-title' }, album.name),
              h(
                'div',
                { className: 'dnm-card-sub' },
                [(album.artist && album.artist.name) || '', album.size ? album.size + ' ' + t('songCount') : ''].filter(Boolean).join(' · '),
              ),
            ),
          ),
        );
      } else {
        body = h(
          'div',
          { className: 'dnm-grid' },
          data.playlists.map((playlist) =>
            h(
              'div',
              {
                key: playlist.id,
                className: 'dnm-card',
                role: 'button',
                tabIndex: 0,
                onClick: () => onOpenPlaylist(playlist.id),
                onKeyDown: (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenPlaylist(playlist.id);
                  }
                },
              },
              h(
                'div',
                { className: 'dnm-cover' },
                h(Cover, { url: playlist.picUrl || playlist.coverImgUrl, className: 'dnm-cover-img', alt: playlist.name }),
                h('span', { className: 'dnm-cover-count' }, h(IconPlay, { size: 10 }), formatCount(playlist.playCount)),
              ),
              h(CardPlayButton, {
                label: t('playAll'),
                busy: cardPlay.busyKey === 'pl:' + playlist.id,
                onClick: () => cardPlay.play('pl:' + playlist.id, () => playPlaylistById(playlist.id)),
              }),
              h('div', { className: 'dnm-card-title' }, playlist.name),
            ),
          ),
        );
      }

      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('search')),
        h(
          'div',
          {
            className: 'dnm-search',
            style: { maxWidth: 480, marginBottom: 16 },
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
        h(
          'div',
          { className: 'dnm-tabs' },
          SEARCH_TYPES.map((item) =>
            h(
              'button',
              {
                type: 'button',
                key: item.key,
                className: 'dnm-tab' + (type === item.key ? ' active' : ''),
                onClick: () => setType(item.key),
              },
              t(item.label),
            ),
          ),
        ),
        body,
      );
    }

    // ---------- 视图：歌手 ----------

    function ArtistAlbums({ t, artistId, onOpenAlbum }) {
      const cardPlay = useCardPlay(t);
      const albums = useAsync(async () => {
        const data = await rpc('artistAlbums', { id: artistId, limit: 100, offset: 0 });
        const list = Array.isArray(data?.hotAlbums) ? data.hotAlbums : [];
        return list.map((album) => ({
          id: album.id,
          name: album.name,
          picUrl: album.picUrl || '',
          publishTime: Number(album.publishTime) || 0,
          size: Number(album.size) || 0,
          type: album.type || '',
        }));
      }, [artistId], { cacheKey: 'artistAlbums:' + artistId });
      if (albums.status === 'loading') return h(Skeleton, { rows: 8 });
      if (albums.status === 'error') return h(ErrorBox, { message: albums.error, onRetry: albums.reload, retryLabel: t('retry') });
      const list = albums.data || [];
      if (list.length === 0) return h(Empty, { label: t('empty') });
      return h(
        'div',
        { className: 'dnm-grid' },
        list.map((album) =>
          h(
            'div',
            {
              key: album.id,
              className: 'dnm-card',
              role: 'button',
              tabIndex: 0,
              onClick: () => onOpenAlbum(album.id),
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onOpenAlbum(album.id);
                }
              },
            },
            h(Cover, { url: album.picUrl, className: 'dnm-cover', alt: album.name }),
            h(CardPlayButton, {
              label: t('playAll'),
              busy: cardPlay.busyKey === 'al:' + album.id,
              onClick: () => cardPlay.play('al:' + album.id, () => playAlbumById(album.id)),
            }),
            h('div', { className: 'dnm-card-name' }, album.name),
            h(
              'div',
              { className: 'dnm-card-sub' },
              [album.publishTime ? new Date(album.publishTime).toLocaleDateString() : '', album.size ? album.size + recordSuffix(t) : '']
                .filter(Boolean)
                .join(' · '),
            ),
          ),
        ),
      );
    }

    // 歌手「全部歌曲」：分页拉取，支持搜索与排序
    function ArtistAllSongs({ t, artistId }) {
      const playerState = usePlayerState();
      const currentId = playerState.track ? playerState.track.id : null;
      const [songs, setSongs] = useState(null);
      const [more, setMore] = useState(false);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');
      const [trackQuery, setTrackQuery] = useState('');
      const [sortBy, setSortBy] = useState('default');
      const load = useCallback(
        async (offset) => {
          setLoading(true);
          setError('');
          try {
            const data = await rpc('artistSongs', { id: artistId, offset: offset || 0, limit: 50 });
            const list = normalizeTracks(data?.songs || []);
            setSongs((previous) => (offset > 0 && previous ? previous.concat(list) : list));
            setMore(Boolean(data?.more));
          } catch (err) {
            setError((err && err.message) || t('loadFailed'));
          } finally {
            setLoading(false);
          }
        },
        [artistId, t],
      );
      useEffect(() => {
        void load(0);
      }, [load]);
      const entries = (songs || []).map((track, index) => ({ track, index }));
      const visible = sortTracks(filterTracks(entries, trackQuery, t), sortBy, t);
      if (songs === null) return h(Skeleton, { rows: 10 });
      return h(
        React.Fragment,
        null,
        h(TrackToolbar, {
          t,
          query: trackQuery,
          onQuery: setTrackQuery,
          sortBy,
          onSort: setSortBy,
          count: visible.length,
          total: songs.length,
        }),
        error ? h(ErrorBox, { message: error, onRetry: () => void load(0), retryLabel: t('retry') }) : null,
        visible.length === 0
          ? h(Empty, { label: t('queueNoMatch'), icon: h(IconSearch, { size: 24 }) })
          : visible.map(({ track, index }) =>
              h(TrackRow, {
                key: track.id + '-' + index,
                track,
                index,
                playing: currentId === track.id,
                t,
                onPlay: () => sharedPlayer.playQueue(songs, index),
              }),
            ),
        more
          ? h(
              'div',
              { style: { display: 'flex', justifyContent: 'center', marginTop: 14 } },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-btn',
                  disabled: loading,
                  onClick: () => void load(songs.length),
                },
                loading ? t('loading') : t('loadMore'),
              ),
            )
          : null,
      );
    }

    function ArtistView({ t, artistId, onBack, onOpenAlbum, onLogin }) {
      const detail = useAsync(async () => {
        const data = await rpc('artistDetail', { id: artistId });
        const artist = data?.artist;
        if (!artist) throw new Error('歌手不存在或已下架');
        return {
          id: artist.id,
          name: artist.name,
          picUrl: artist.picUrl || artist.img1v1Url || '',
          briefDesc: artist.briefDesc || '',
          albumSize: artist.albumSize || 0,
          musicSize: artist.musicSize || 0,
          followed: Boolean(artist.followed),
          hotSongs: normalizeTracks(data.hotSongs),
        };
      }, [artistId], { cacheKey: 'artist:' + artistId });
      const playerState = usePlayerState();
      const session = useSession();
      const [tab, setTab] = useState('songs');
      const [followedOverride, setFollowedOverride] = useState(null);
      const [followBusy, setFollowBusy] = useState(false);
      const [followError, setFollowError] = useState('');
      const [trackQuery, setTrackQuery] = useState('');
      const [sortBy, setSortBy] = useState('default');
      const currentId = playerState.track ? playerState.track.id : null;
      const artist = detail.data;
      const songEntries = artist ? artist.hotSongs.map((track, index) => ({ track, index })) : [];
      const visibleSongs = sortTracks(filterTracks(songEntries, trackQuery, t), sortBy, t);
      const following = followedOverride !== null ? followedOverride : Boolean(artist && artist.followed);
      const toggleFollow = () => {
        if (!artist) return;
        if (!session.loggedIn) {
          onLogin();
          return;
        }
        if (followBusy) return;
        const next = !following;
        setFollowBusy(true);
        setFollowError('');
        rpc(next ? 'artistSub' : 'artistUnsub', { id: artist.id })
          .then(() => setFollowedOverride(next))
          .catch((error) => setFollowError(error?.message || t('loadFailed')))
          .finally(() => setFollowBusy(false));
      };
      return h(
        'div',
        { className: 'dnm-content' },
        artist ? h(HeroBackdrop, { url: artist.picUrl }) : null,
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 } },
          h('button', { type: 'button', className: 'dnm-btn', onClick: onBack }, h(IconBack, { size: 13 }), t('back')),
        ),
        detail.status === 'loading'
          ? h(Skeleton, { rows: 8 })
          : detail.status === 'error'
            ? h(ErrorBox, { message: detail.error, onRetry: detail.reload, retryLabel: t('retry') })
            : h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'dnm-artist-head' },
                  h(Cover, { url: artist.picUrl, className: 'dnm-artist-avatar', alt: artist.name }),
                  h(
                    'div',
                    null,
                    h('h1', { className: 'dnm-artist-title' }, artist.name),
                    h(
                      'p',
                      { className: 'dnm-artist-meta' },
                      [artist.musicSize ? artist.musicSize + ' ' + t('artistSongs') : '', artist.albumSize ? artist.albumSize + ' ' + t('artistAlbums') : '']
                        .filter(Boolean)
                        .join(' · '),
                    ),
                    artist.briefDesc ? h('p', { className: 'dnm-artist-desc' }, artist.briefDesc) : null,
                    h(
                      'div',
                      { className: 'dnm-actions' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dnm-btn primary',
                          disabled: artist.hotSongs.length === 0,
                          onClick: () => sharedPlayer.playQueue(artist.hotSongs, 0),
                        },
                        h(IconPlay, { size: 14 }),
                        t('playAll'),
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dnm-btn' + (following ? ' on' : ''),
                          disabled: followBusy,
                          title: session.loggedIn ? undefined : t('followLoginHint'),
                          onClick: toggleFollow,
                        },
                        h(IconUser, { size: 14 }),
                        following ? t('following') : t('follow'),
                      ),
                    ),
                    followError ? h('p', { className: 'dnm-status error' }, followError) : null,
                  ),
                ),
                h(
                  'div',
                  { className: 'dnm-tabs' },
                  h(
                    'button',
                    { type: 'button', className: 'dnm-tab' + (tab === 'songs' ? ' active' : ''), onClick: () => setTab('songs') },
                    t('hotSongs'),
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'dnm-tab' + (tab === 'all' ? ' active' : ''), onClick: () => setTab('all') },
                    t('allSongs') + (artist.musicSize ? ' (' + artist.musicSize + ')' : ''),
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'dnm-tab' + (tab === 'albums' ? ' active' : ''), onClick: () => setTab('albums') },
                    t('albumsTab') + (artist.albumSize ? ' (' + artist.albumSize + ')' : ''),
                  ),
                ),
                tab === 'albums'
                  ? h(ArtistAlbums, { t, artistId, onOpenAlbum })
                  : tab === 'all'
                    ? h(ArtistAllSongs, { t, artistId })
                    : artist.hotSongs.length === 0
                    ? h(Empty, { label: t('empty') })
                    : h(
                        React.Fragment,
                        null,
                        h(TrackToolbar, {
                          t,
                          query: trackQuery,
                          onQuery: setTrackQuery,
                          sortBy,
                          onSort: setSortBy,
                          count: visibleSongs.length,
                          total: artist.hotSongs.length,
                        }),
                        visibleSongs.length === 0
                          ? h(Empty, { label: t('queueNoMatch'), icon: h(IconSearch, { size: 24 }) })
                          : visibleSongs.map(({ track, index }) =>
                              h(TrackRow, {
                                key: track.id + '-' + index,
                                track,
                                index,
                                playing: currentId === track.id,
                                t,
                                onPlay: () => sharedPlayer.playQueue(artist.hotSongs, index),
                              }),
                            ),
                      ),
              ),
      );
    }

    // ---------- 视图：专辑 ----------

    function AlbumView({ t, albumId, onBack, onLogin }) {
      const detail = useAsync(async () => {
        const data = await rpc('albumDetail', { id: albumId });
        const album = data?.album;
        if (!album) throw new Error('专辑不存在或已下架');
        return {
          id: album.id,
          name: album.name,
          coverUrl: album.picUrl || '',
          artistName: (album.artist && album.artist.name) || '',
          publishTime: album.publishTime || 0,
          description: album.description || '',
          subscribed: Boolean(album.subscribed),
          songs: normalizeTracks(data.songs),
        };
      }, [albumId], { cacheKey: 'album:' + albumId });
      const playerState = usePlayerState();
      const session = useSession();
      const [savedOverride, setSavedOverride] = useState(null);
      const [saveBusy, setSaveBusy] = useState(false);
      const [saveError, setSaveError] = useState('');
      const [trackQuery, setTrackQuery] = useState('');
      const [sortBy, setSortBy] = useState('default');
      const currentId = playerState.track ? playerState.track.id : null;
      const album = detail.data;
      const saved = savedOverride !== null ? savedOverride : Boolean(album && album.subscribed);
      const songEntries = album ? album.songs.map((track, index) => ({ track, index })) : [];
      const visibleSongs = sortTracks(filterTracks(songEntries, trackQuery, t), sortBy, t);
      const toggleSave = () => {
        if (!album) return;
        if (!session.loggedIn) {
          onLogin();
          return;
        }
        if (saveBusy) return;
        const next = !saved;
        setSaveBusy(true);
        setSaveError('');
        rpc(next ? 'albumSub' : 'albumUnsub', { id: album.id })
          .then(() => setSavedOverride(next))
          .catch((error) => setSaveError(error?.message || t('loadFailed')))
          .finally(() => setSaveBusy(false));
      };
      const released = album && album.publishTime ? new Date(album.publishTime).toLocaleDateString() : '';
      return h(
        'div',
        { className: 'dnm-content' },
        album ? h(HeroBackdrop, { url: album.coverUrl }) : null,
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 } },
          h('button', { type: 'button', className: 'dnm-btn', onClick: onBack }, h(IconBack, { size: 13 }), t('back')),
        ),
        detail.status === 'loading'
          ? h(Skeleton, { rows: 8 })
          : detail.status === 'error'
            ? h(ErrorBox, { message: detail.error, onRetry: detail.reload, retryLabel: t('retry') })
            : h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'dnm-album-head' },
                  h(Cover, { url: album.coverUrl, className: 'dnm-album-cover', alt: album.name }),
                  h(
                    'div',
                    null,
                    h('h1', { className: 'dnm-album-title' }, album.name),
                    h(
                      'p',
                      { className: 'dnm-album-meta' },
                      [album.artistName, released ? t('released') + ' ' + released : ''].filter(Boolean).join(' · '),
                    ),
                    album.songs.length ? h('p', { className: 'dnm-artist-meta' }, album.songs.length + ' ' + t('songCount')) : null,
                    h(
                      'div',
                      { className: 'dnm-actions' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dnm-btn primary',
                          disabled: album.songs.length === 0,
                          onClick: () => sharedPlayer.playQueue(album.songs, 0),
                        },
                        h(IconPlay, { size: 14 }),
                        t('playAll'),
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          className: 'dnm-btn' + (saved ? ' on' : ''),
                          disabled: saveBusy,
                          title: session.loggedIn ? undefined : t('saveLoginHint'),
                          onClick: toggleSave,
                        },
                        h(IconHeart, { size: 14 }),
                        saved ? t('albumSaved') : t('saveAlbum'),
                      ),
                    ),
                    saveError ? h('p', { className: 'dnm-status error' }, saveError) : null,
                  ),
                ),
                album.songs.length === 0
                  ? h(Empty, { label: t('empty') })
                  : h(
                      React.Fragment,
                      null,
                      h(TrackToolbar, {
                        t,
                        query: trackQuery,
                        onQuery: setTrackQuery,
                        sortBy,
                        onSort: setSortBy,
                        count: visibleSongs.length,
                        total: album.songs.length,
                      }),
                      visibleSongs.length === 0
                        ? h(Empty, { label: t('queueNoMatch'), icon: h(IconSearch, { size: 24 }) })
                        : visibleSongs.map(({ track, index }) =>
                            h(TrackRow, {
                              key: track.id + '-' + index,
                              track,
                              index,
                              playing: currentId === track.id,
                              t,
                              onPlay: () => sharedPlayer.playQueue(album.songs, index),
                            }),
                          ),
                    ),
              ),
      );
    }

    // ---------- 视图：我的音乐 ----------

    // ---------- 视图：每日推荐 / 私人FM ----------

    function LoginRequired({ t, onLogin }) {
      return h(
        'div',
        { className: 'dnm-empty' },
        h('p', null, t('loginRequired')),
        h('button', { type: 'button', className: 'dnm-btn primary', onClick: onLogin }, h(IconUser, { size: 14 }), t('login')),
      );
    }

    function DailyView({ t, onLogin }) {
      const state = useSession();
      const daily = useAsync(async () => {
        if (!state.loggedIn) return [];
        const data = await rpc('dailyRecommend');
        return normalizeTracks(data?.data?.dailySongs ?? data?.recommend ?? []);
      }, [state.loggedIn], { cacheKey: state.loggedIn ? 'daily' : undefined });
      const playerState = usePlayerState();
      const currentId = playerState.track ? playerState.track.id : null;
      const tracks = daily.data || [];
      if (!state.loggedIn) {
        return h('div', { className: 'dnm-content' }, h('h1', { className: 'dnm-h1' }, t('navDaily')), h(LoginRequired, { t, onLogin }));
      }
      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('navDaily')),
        h('p', { style: { margin: '0 0 12px', color: 'var(--dsw-alias-label-secondary)', fontSize: 13 } }, t('dailyHint')),
        h(
          'div',
          { className: 'dnm-actions', style: { marginBottom: 14 } },
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-btn primary',
              disabled: tracks.length === 0,
              onClick: () => sharedPlayer.playQueue(tracks, 0),
            },
            h(IconPlay, { size: 14 }),
            t('playAll'),
          ),
          h(
            'button',
            { type: 'button', className: 'dnm-btn', disabled: daily.status === 'loading', onClick: daily.reload },
            h(IconRefresh, { size: 13 }),
            t('refresh'),
          ),
        ),
        daily.status === 'loading'
          ? h(Skeleton, { rows: 8 })
          : daily.status === 'error'
            ? h(ErrorBox, { message: daily.error, onRetry: daily.reload, retryLabel: t('retry') })
            : tracks.length === 0
              ? h(Empty, { label: t('dailyHint') })
              : tracks.map((track, index) =>
                  h(TrackRow, {
                    key: track.id + '-' + index,
                    track,
                    index,
                    playing: currentId === track.id,
                    t,
                    onPlay: () => sharedPlayer.playQueue(tracks, index),
                  }),
                ),
      );
    }

    function RadioView({ t, onLogin }) {
      const state = useSession();
      const fm = useAsync(async () => {
        if (!state.loggedIn) return [];
        // 私人FM 每次只返回 1~3 首，累积几轮凑成一批
        const collected = [];
        const seen = new Set();
        for (let round = 0; round < 3; round += 1) {
          const data = await rpc('personalFm').catch(() => null);
          const batch = normalizeTracks(Array.isArray(data?.data) ? data.data : []);
          if (batch.length === 0) break;
          for (const track of batch) {
            if (track.id && !seen.has(track.id)) {
              seen.add(track.id);
              collected.push(track);
            }
          }
          if (collected.length >= 6) break;
        }
        return collected;
      }, [state.loggedIn]);
      const playerState = usePlayerState();
      const currentId = playerState.track ? playerState.track.id : null;
      const tracks = fm.data || [];
      const [hiddenIds, setHiddenIds] = useState([]);
      const visibleTracks = tracks.filter((track) => !hiddenIds.includes(track.id));
      const dislike = (track) => {
        setHiddenIds((prev) => (prev.includes(track.id) ? prev : prev.concat([track.id])));
        void rpc('fmDislike', { id: track.id }).catch(() => undefined);
        if (playerState.track && playerState.track.id === track.id) sharedPlayer.next();
      };
      if (!state.loggedIn) {
        return h('div', { className: 'dnm-content' }, h('h1', { className: 'dnm-h1' }, t('navRadio')), h(LoginRequired, { t, onLogin }));
      }
      return h(
        'div',
        { className: 'dnm-content' },
        h('h1', { className: 'dnm-h1' }, t('navRadio')),
        h('p', { style: { margin: '0 0 12px', color: 'var(--dsw-alias-label-secondary)', fontSize: 13 } }, t('radioHint')),
        h(
          'div',
          { className: 'dnm-actions', style: { marginBottom: 14 } },
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-btn primary',
              disabled: visibleTracks.length === 0,
              onClick: () => sharedPlayer.playQueue(visibleTracks, 0),
            },
            h(IconPlay, { size: 14 }),
            t('playAll'),
          ),
          h(
            'button',
            { type: 'button', className: 'dnm-btn', disabled: fm.status === 'loading', onClick: fm.reload },
            h(IconRefresh, { size: 13 }),
            t('radioRefresh'),
          ),
        ),
        fm.status === 'loading'
          ? h(Skeleton, { rows: 8 })
          : fm.status === 'error'
            ? h(ErrorBox, { message: fm.error, onRetry: fm.reload, retryLabel: t('retry') })
            : visibleTracks.length === 0
              ? h(Empty, { label: t('radioEmpty'), icon: h(IconRadio, { size: 24 }) })
              : visibleTracks.map((track, index) =>
                  h(TrackRow, {
                    key: track.id + '-' + index,
                    track,
                    index,
                    playing: currentId === track.id,
                    t,
                    onPlay: () => sharedPlayer.playQueue(visibleTracks, index),
                    onDislike: () => dislike(track),
                  }),
                ),
      );
    }

    // ---------- 视图：我喜欢的音乐 ----------

    function LikesView({ t, onBack, onLogin }) {
      const state = useSession();
      const uid = state.profile ? state.profile.userId : 0;
      const likes = useAsync(async () => {
        if (!uid) return { ids: [], tracks: [] };
        const data = await rpc('likeSongs', { uid });
        const ids = Array.isArray(data?.ids) ? data.ids : [];
        if (ids.length === 0) return { ids, tracks: [] };
        const chunks = [];
        for (let index = 0; index < ids.length; index += 100) chunks.push(ids.slice(index, index + 100));
        const results = await Promise.all(chunks.map((chunk) => rpc('songDetail', { ids: chunk }).catch(() => null)));
        const songs = [];
        for (const result of results) {
          if (result && Array.isArray(result.songs)) songs.push(...result.songs);
        }
        return { ids, tracks: normalizeTracks(songs) };
      }, [uid], { cacheKey: uid ? 'likes:' + uid : undefined });
      const playerState = usePlayerState();
      const currentId = playerState.track ? playerState.track.id : null;
      const tracks = (likes.data && likes.data.tracks) || [];
      const head = h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 } },
        h('button', { type: 'button', className: 'dnm-btn', onClick: onBack }, h(IconBack, { size: 13 }), t('back')),
      );
      if (!state.loggedIn) {
        return h('div', { className: 'dnm-content' }, head, h(LoginRequired, { t, onLogin }));
      }
      return h(
        'div',
        { className: 'dnm-content' },
        head,
        h(
          'div',
          { className: 'dnm-album-head' },
          h(
            'div',
            { className: 'dnm-likes-cover', 'aria-hidden': 'true' },
            h(IconHeart, { size: 54 }),
          ),
          h(
            'div',
            null,
            h('h1', { className: 'dnm-album-title' }, t('likes')),
            h('p', { className: 'dnm-album-meta' }, t('likesHint')),
            likes.status === 'ready' && tracks.length ? h('p', { className: 'dnm-artist-meta' }, tracks.length + ' ' + t('songCount')) : null,
            h(
              'div',
              { className: 'dnm-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-btn primary',
                  disabled: tracks.length === 0,
                  onClick: () => sharedPlayer.playQueue(tracks, 0),
                },
                h(IconPlay, { size: 14 }),
                t('playAll'),
              ),
            ),
          ),
        ),
        likes.status === 'loading'
          ? h(Skeleton, { rows: 8 })
          : likes.status === 'error'
            ? h(ErrorBox, { message: likes.error, onRetry: likes.reload, retryLabel: t('retry') })
            : tracks.length === 0
              ? h(Empty, { label: t('likesEmpty') })
              : tracks.map((track, index) =>
                  h(TrackRow, {
                    key: track.id + '-' + index,
                    track,
                    index,
                    playing: currentId === track.id,
                    t,
                    onPlay: () => sharedPlayer.playQueue(tracks, index),
                  }),
                ),
      );
    }

    function MineView({ t, onOpenPlaylist, onOpenLikes, onLogin }) {
      const cardPlay = useCardPlay(t);
      const state = useSession();
      const uid = state.profile ? state.profile.userId : 0;
      const playlists = useAsync(async () => {
        if (!uid) return [];
        const data = await rpc('userPlaylist', { uid, limit: 100 });
        return Array.isArray(data?.playlist) ? data.playlist : [];
      }, [uid], { cacheKey: uid ? 'userPlaylists:' + uid : undefined });
      const daily = useAsync(async () => {
        if (!state.loggedIn) return [];
        const data = await rpc('recommendSongs').catch(() => null);
        return normalizeTracks(data?.recommend ?? data?.data?.dailySongs ?? []);
      }, [state.loggedIn], { cacheKey: state.loggedIn ? 'recommend' : undefined });
      const recent = useHistory();
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
        h(
          'div',
          { className: 'dnm-section' },
          h('h2', { className: 'dnm-h2' }, t('likes')),
          h(
            'button',
            { type: 'button', className: 'dnm-entry', onClick: onOpenLikes },
            h('span', { className: 'dnm-entry-icon' }, h(IconHeart, { size: 18 })),
            h('span', { className: 'dnm-entry-label' }, t('likes')),
            h('span', { className: 'dnm-entry-arrow', 'aria-hidden': 'true' }, '›'),
          ),
        ),
        recent.length > 0
          ? h(
              'div',
              { className: 'dnm-section' },
              h(
                'div',
                { className: 'dnm-section-head' },
                h('h2', { className: 'dnm-h2' }, t('recent')),
                h('button', { type: 'button', className: 'dnm-btn', onClick: () => historyStore.clear() }, t('clearHistory')),
              ),
              recent.slice(0, 12).map((track, index) =>
                h(TrackRow, {
                  key: track.id + '-' + index,
                  track,
                  index,
                  t,
                  playing: false,
                  onPlay: () => sharedPlayer.playQueue(recent, index),
                }),
              ),
            )
          : null,
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
            ? h(Skeleton, { rows: 8 })
            : playlists.status === 'error'
              ? h(ErrorBox, { message: playlists.error, onRetry: playlists.reload, retryLabel: t('retry') })
              : h(
                  'div',
                  { className: 'dnm-grid' },
                  (playlists.data || []).map((playlist) =>
                    h(
                      'div',
                      {
                        key: playlist.id,
                        className: 'dnm-card',
                        role: 'button',
                        tabIndex: 0,
                        onClick: () => onOpenPlaylist(playlist.id),
                        onKeyDown: (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onOpenPlaylist(playlist.id);
                          }
                        },
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
                      h(CardPlayButton, {
                        label: t('playAll'),
                        busy: cardPlay.busyKey === 'pl:' + playlist.id,
                        onClick: () => cardPlay.play('pl:' + playlist.id, () => playPlaylistById(playlist.id)),
                      }),
                      h('div', { className: 'dnm-card-title' }, playlist.name),
                    ),
                  ),
                ),
        ),
      );
    }

    // ---------- 评论 ----------

    function commentTime(timestamp, t) {
      const value = Number(timestamp) || 0;
      if (!value) return '';
      const diff = Math.max(0, Date.now() - value);
      if (diff < 60000) return t('justNow');
      if (diff < 3600000) return t('minutesAgo').replace('{n}', String(Math.floor(diff / 60000)));
      if (diff < 86400000) return t('hoursAgo').replace('{n}', String(Math.floor(diff / 3600000)));
      if (diff < 30 * 86400000) return t('daysAgo').replace('{n}', String(Math.floor(diff / 86400000)));
      return new Date(value).toLocaleDateString();
    }

    function useCommentList(kind, id) {
      const api = kind === 'playlist' ? 'playlistComment' : 'songComment';
      const [state, setState] = useState({ status: 'loading', hot: [], items: [], total: 0, more: false, error: '', loadingMore: false });
      useEffect(() => {
        if (!id) return undefined;
        let cancelled = false;
        setState({ status: 'loading', hot: [], items: [], total: 0, more: false, error: '', loadingMore: false });
        rpc(api, { id, limit: 20, offset: 0 })
          .then((data) => {
            if (cancelled) return;
            setState({
              status: 'ready',
              hot: Array.isArray(data?.hotComments) ? data.hotComments : [],
              items: Array.isArray(data?.comments) ? data.comments : [],
              total: Number(data?.total) || 0,
              more: Boolean(data?.more),
              error: '',
              loadingMore: false,
            });
          })
          .catch((error) => {
            if (cancelled) return;
            setState({
              status: 'error',
              hot: [],
              items: [],
              total: 0,
              more: false,
              error: String((error && error.message) || error),
              loadingMore: false,
            });
          });
        return () => {
          cancelled = true;
        };
      }, [api, id]);
      const loadMore = useCallback(() => {
        setState((prev) => (prev.loadingMore || !prev.more ? prev : { ...prev, loadingMore: true }));
        const offset = state.items.length;
        rpc(api, { id, limit: 20, offset })
          .then((data) => {
            setState((prev) => ({
              ...prev,
              items: prev.items.concat(Array.isArray(data?.comments) ? data.comments : []),
              more: Boolean(data?.more),
              total: Number(data?.total) || prev.total,
              loadingMore: false,
            }));
          })
          .catch(() => setState((prev) => ({ ...prev, loadingMore: false })));
      }, [api, id, state.items.length]);
      return { ...state, loadMore };
    }

    function CommentItem({ comment, t, hot }) {
      const user = comment.user || {};
      const replied = Array.isArray(comment.beReplied) && comment.beReplied.length > 0 ? comment.beReplied[0] : null;
      return h(
        'div',
        { className: 'dnm-comment' },
        h('img', {
          className: 'dnm-comment-avatar',
          src: user.avatarUrl || '',
          alt: '',
          loading: 'lazy',
          onError: (event) => {
            event.currentTarget.style.visibility = 'hidden';
          },
        }),
        h(
          'div',
          { className: 'dnm-comment-body' },
          h(
            'div',
            { className: 'dnm-comment-head' },
            h('span', { className: 'dnm-comment-user' }, user.nickname || t('account')),
            hot ? h('span', { className: 'dnm-comment-hot-tag' }, t('hotComments')) : null,
            h('span', { className: 'dnm-comment-time' }, commentTime(comment.time, t)),
          ),
          h('p', { className: 'dnm-comment-text' }, comment.content || ''),
          replied
            ? h(
                'p',
                { className: 'dnm-comment-text', style: { color: 'var(--dsw-alias-label-secondary)', fontSize: 13 } },
                '@' + ((replied.user && replied.user.nickname) || '') + '：' + (replied.content || ''),
              )
            : null,
          h(
            'div',
            { className: 'dnm-comment-foot' },
            h('span', { className: 'dnm-comment-like' }, h(IconHeart, { size: 12 }), formatCount(comment.likedCount || 0)),
            comment.floor ? h('span', null, '#' + comment.floor) : null,
          ),
        ),
      );
    }

    function CommentsPanel({ t, kind, id }) {
      const list = useCommentList(kind, id);
      if (!id) return h('div', { className: 'dnm-lyrics-empty' }, t('noComments'));
      if (list.status === 'loading') return h(Skeleton, { rows: 8 });
      if (list.status === 'error') return h('div', { className: 'dnm-lyrics-empty' }, list.error);
      if (list.hot.length === 0 && list.items.length === 0) return h('div', { className: 'dnm-lyrics-empty' }, t('noComments'));
      return h(
        'div',
        { className: 'dnm-comments' },
        list.hot.length > 0
          ? h(
              React.Fragment,
              null,
              h('div', { className: 'dnm-comment-section' }, t('hotComments')),
              list.hot.map((comment, index) => h(CommentItem, { key: 'hot-' + index, comment, t, hot: true })),
            )
          : null,
        list.items.map((comment, index) => h(CommentItem, { key: 'comment-' + index, comment, t })),
        list.more
          ? h(
              'div',
              { className: 'dnm-comment-more' },
              h(
                'button',
                { type: 'button', className: 'dnm-btn', disabled: list.loadingMore, onClick: list.loadMore },
                list.loadingMore ? t('loading') : t('loadMore'),
              ),
            )
          : null,
      );
    }

    // ---------- 正在播放（歌词 / 播放队列） ----------

    function NowPlayingView({ t, onBack, onOpenArtist, onOpenAlbum }) {
      const state = usePlayerState();
      const session = useSession();
      const likedIds = useLikedIds();
      const [tab, setTab] = useState('lyric');
      const [queueQuery, setQueueQuery] = useState('');
      const track = state.track;
      const liked = track ? likedIds.has(track.id) : false;
      const queueList = state.queue || [];
      const upcomingList =
        track && state.index >= 0
          ? queueList
              .slice(state.index + 1, state.index + 4)
              .map((item, offset) => ({ item, index: state.index + 1 + offset }))
          : [];
      const lyric = useLyric(track ? track.id : null);
      const lines = (lyric.data && lyric.data.lines) || [];
      const [activeIndex, setActiveIndex] = useState(-1);
      const lyricBoxRef = useRef(null);
      const fullLyricRef = useRef(null);
      const [fullscreen, setFullscreen] = useState(false);
      const [lyricOptions, setLyricOptions] = useState(readLyricSettings);

      const updateLyricOptions = (next) => {
        setLyricOptions(next);
        saveLyricSettings(next);
      };
      const toggleTranslation = () => updateLyricOptions({ ...lyricOptions, translation: !lyricOptions.translation });
      const cycleLyricSize = () => {
        const index = LYRIC_SIZES.indexOf(lyricOptions.size);
        updateLyricOptions({ ...lyricOptions, size: LYRIC_SIZES[(index + 1) % LYRIC_SIZES.length] });
      };
      const hasTranslation = lines.some((line) => Boolean(line.translation));
      const sizeLabel = { small: t('lyricSizeSmall'), normal: t('lyricSizeNormal'), large: t('lyricSizeLarge') }[lyricOptions.size] || t('lyricSizeNormal');

      useEffect(() => {
        if (lines.length === 0) {
          if (activeIndex !== -1) setActiveIndex(-1);
          return;
        }
        let index = -1;
        for (let i = 0; i < lines.length; i += 1) {
          if (lines[i].time <= state.currentTime + 0.15) index = i;
          else break;
        }
        if (index !== activeIndex) setActiveIndex(index);
      }, [lines, state.currentTime, activeIndex]);

      useEffect(() => {
        if (activeIndex < 0) return;
        for (const ref of [lyricBoxRef, fullLyricRef]) {
          const box = ref.current;
          if (!box || box.clientHeight <= 0) continue;
          const line = box.querySelector('[data-active="1"]');
          if (!line) continue;
          const target = Math.max(0, line.offsetTop - box.clientHeight / 2 + line.offsetHeight / 2);
          if (typeof box.scrollTo === 'function') box.scrollTo({ top: target, behavior: 'smooth' });
          else box.scrollTop = target;
        }
      }, [activeIndex, tab, fullscreen]);

      useEffect(() => {
        if (!fullscreen) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setFullscreen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, [fullscreen]);

      const left = h(
        'div',
        { className: 'dnm-np-left' },
        h(Cover, { url: track ? track.coverUrl : '', className: 'dnm-np-cover', alt: t('coverAlt') }),
        h('h2', { className: 'dnm-np-name' }, track ? track.name : t('nowPlaying')),
        h(
          'p',
          { className: 'dnm-np-artist' },
          track && track.artistIds && track.artistIds.length > 0
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-np-link',
                  title: t('viewArtist'),
                  onClick: () => onOpenArtist(track.artistIds[0]),
                },
                artistText(track, t),
              )
            : track
              ? artistText(track, t)
              : '',
        ),
        track && track.album
          ? h(
              track.albumId
                ? 'button'
                : 'p',
              {
                type: track.albumId ? 'button' : undefined,
                className: track.albumId ? 'dnm-np-album dnm-np-link' : 'dnm-np-album',
                title: track.albumId ? t('viewAlbum') : track.album,
                onClick: track.albumId ? () => onOpenAlbum(track.albumId) : undefined,
              },
              track.album,
            )
          : null,
        track
          ? h(
              'div',
              { className: 'dnm-np-controls' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-icon-btn',
                  title: '上一首',
                  disabled: !track,
                  onClick: () => sharedPlayer.previous(),
                },
                h(IconPrev, { size: 19 }),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-icon-btn play',
                  title: state.playing ? '暂停' : '播放',
                  disabled: !track,
                  onClick: () => sharedPlayer.toggle(),
                },
                state.loading
                  ? h('div', { className: 'dnm-spinner', style: { width: 18, height: 18 } })
                  : state.playing
                    ? h(IconPause, { size: 21 })
                    : h(IconPlay, { size: 21 }),
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
                h(IconNext, { size: 19 }),
              ),
            )
          : null,
        track
          ? h(
              'div',
              { className: 'dnm-np-progress' },
              h('span', null, formatSeconds(state.currentTime)),
              h('input', {
                type: 'range',
                className: 'dnm-range',
                min: 0,
                max: Math.max(1, state.duration),
                step: 0.1,
                value: state.currentTime,
                'aria-label': '播放进度',
                onChange: (event) => sharedPlayer.seek(Number(event.target.value)),
                onInput: (event) => sharedPlayer.seek(Number(event.target.value)),
              }),
              h('span', null, formatSeconds(state.duration)),
            )
          : null,
        track
          ? h(
              'div',
              { className: 'dnm-np-actions' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dnm-icon-btn dnm-np-like' + (liked ? ' liked' : ''),
                  title: liked ? t('unlike') : t('like'),
                  disabled: !session.loggedIn,
                  onClick: () => void likedStore.toggle(track.id),
                },
                h(IconHeart, { size: 17 }),
              ),
            )
          : null,
        upcomingList.length > 0
          ? h(
              'div',
              { className: 'dnm-np-next' },
              h('div', { className: 'dnm-np-next-label' }, t('upNext')),
              upcomingList.map(({ item, index }) =>
                h(
                  'button',
                  {
                    type: 'button',
                    key: item.id + '-' + index,
                    className: 'dnm-np-next-item',
                    title: item.name + ' · ' + artistText(item, t),
                    onClick: () => void sharedPlayer.playTrack(item, { queue: queueList, index }),
                  },
                  h('span', { className: 'dnm-np-next-name' }, item.name),
                  h('span', { className: 'dnm-np-next-artist' }, artistText(item, t)),
                ),
              ),
            )
          : null,
      );

      let right;
      if (tab === 'comments') {
        right = h(CommentsPanel, { t, kind: 'song', id: track ? track.id : null });
      } else if (tab === 'queue') {
        const queue = state.queue || [];
        const needle = queueQuery.trim().toLowerCase();
        const indexed = queue.map((item, index) => ({ item, index }));
        const visible = needle
          ? indexed.filter(({ item }) => {
              const name = (item.name || '').toLowerCase();
              const artist = (item.artists || []).join(' ').toLowerCase();
              const album = (item.album || '').toLowerCase();
              return name.includes(needle) || artist.includes(needle) || album.includes(needle);
            })
          : indexed;
        right =
          queue.length === 0
            ? h(Empty, { label: t('queueEmpty'), icon: h(IconLyric, { size: 24 }) })
            : h(
                'div',
                { className: 'dnm-np-queue-wrap' },
                h(
                  'div',
                  { className: 'dnm-np-queue-head' },
                  h('span', null, visible.length === queue.length ? queue.length + recordSuffix(t) : visible.length + ' / ' + queue.length),
                  h(
                    'button',
                    { type: 'button', className: 'dnm-btn', onClick: () => sharedPlayer.clearQueue() },
                    h(IconClose, { size: 12 }),
                    t('clearQueue'),
                  ),
                ),
                h(
                  'div',
                  { className: 'dnm-queue-search' },
                  h(IconSearch, { size: 13 }),
                  h('input', {
                    value: queueQuery,
                    placeholder: t('queueSearchPlaceholder'),
                    'aria-label': t('queueSearchPlaceholder'),
                    onChange: (event) => setQueueQuery(event.target.value),
                  }),
                  queueQuery
                    ? h('button', { type: 'button', className: 'dnm-queue-search-clear', title: t('clear'), onClick: () => setQueueQuery('') }, h(IconClose, { size: 12 }))
                    : null,
                ),
                visible.length === 0
                  ? h(Empty, { label: t('queueNoMatch'), icon: h(IconSearch, { size: 24 }) })
                  : h(
                      'div',
                      { className: 'dnm-np-queue' },
                      visible.map(({ item, index }) =>
                        h(TrackRow, {
                          key: String(item.id) + '-' + index,
                          t,
                          track: item,
                          index,
                          playing: Boolean(track && track.id === item.id),
                          onPlay: () => sharedPlayer.playTrack(item, { queue, index }),
                          onRemove: () => sharedPlayer.removeFromQueue(index),
                        }),
                      ),
                    ),
              );
      } else if (lyric.status === 'loading') {
        right = h('div', { className: 'dnm-lyrics-empty' }, t('lyricLoading'));
      } else if (lyric.status === 'error') {
        right = h('div', { className: 'dnm-lyrics-empty' }, t('loadFailed'));
      } else if (lines.length === 0) {
        right = h('div', { className: 'dnm-lyrics-empty' }, t('noLyric'));
      } else {
        right = h(
          'div',
          { className: 'dnm-lyrics', ref: lyricBoxRef },
          lines.map((line, index) =>
            h(
              'div',
              {
                key: index,
                className: 'dnm-lyric-line' + (index === activeIndex ? ' active' : ''),
                'data-active': index === activeIndex ? '1' : '0',
                role: 'button',
                tabIndex: 0,
                title: t('play'),
                onClick: () => sharedPlayer.seek(line.time),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') sharedPlayer.seek(line.time);
                },
              },
              line.text,
              line.translation && lyricOptions.translation ? h('span', { className: 'dnm-lyric-trans' }, line.translation) : null,
            ),
          ),
        );
      }

      return h(
        'section',
        { className: 'dnm-np', 'aria-label': t('nowPlayingPage'), 'data-lyric-size': lyricOptions.size },
        track && track.coverUrl
          ? h(
              'div',
              { className: 'dnm-np-bg', 'aria-hidden': 'true' },
              h('div', { className: 'dnm-np-bg-img', style: { backgroundImage: 'url("' + track.coverUrl + '")' } }),
            )
          : null,
        h(
          'header',
          { className: 'dnm-np-head' },
          h('button', { type: 'button', className: 'dnm-icon-btn', title: t('back'), onClick: onBack }, h(IconBack, { size: 16 })),
          h('span', { className: 'dnm-np-titlebar' }, track ? track.name : t('nowPlayingPage')),
          state.error ? h('span', { className: 'dnm-status error', title: state.error }, state.error) : null,
          h(
            'div',
            { className: 'dnm-np-tools' },
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-np-tool' + (lyricOptions.translation ? ' on' : ''),
                title: t('lyricTranslation'),
                disabled: !hasTranslation,
                onClick: toggleTranslation,
              },
              t('lyricTranslation'),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dnm-np-tool',
                title: t('lyricFont') + '：' + sizeLabel,
                onClick: cycleLyricSize,
              },
              'A ' + sizeLabel,
            ),
            tab === 'lyric' && lines.length > 0
              ? h(
                  'button',
                  {
                    type: 'button',
                    className: 'dnm-np-tool',
                    title: t('fullscreenLyric'),
                    onClick: () => setFullscreen(true),
                  },
                  h(IconExpand, { size: 13 }),
                )
              : null,
          ),
          h(
            'div',
            { className: 'dnm-np-tabs' },
            h(
              'button',
              { type: 'button', className: 'dnm-np-tab' + (tab === 'lyric' ? ' active' : ''), onClick: () => setTab('lyric') },
              t('lyrics'),
            ),
            h(
              'button',
              { type: 'button', className: 'dnm-np-tab' + (tab === 'queue' ? ' active' : ''), onClick: () => setTab('queue') },
              t('queue') + ' (' + (state.queue.length || 0) + ')',
            ),
            h(
              'button',
              { type: 'button', className: 'dnm-np-tab' + (tab === 'comments' ? ' active' : ''), onClick: () => setTab('comments') },
              t('comments'),
            ),
          ),
        ),
        h('div', { className: 'dnm-np-body' }, left, h('div', { className: 'dnm-np-right' }, right)),
        fullscreen && lines.length > 0
          ? createPortal(
              h(
                'div',
                { className: 'dnm-lyric-full', 'data-lyric-size': lyricOptions.size, role: 'dialog', 'aria-label': t('fullscreenLyric') },
              track && track.coverUrl
                ? h(
                    'div',
                    { className: 'dnm-lyric-full-bg', 'aria-hidden': 'true' },
                    h('div', { className: 'dnm-lyric-full-bg-img', style: { backgroundImage: 'url("' + track.coverUrl + '")' } }),
                  )
                : null,
              h(
                'div',
                { className: 'dnm-lyric-full-head' },
                h(
                  'button',
                  { type: 'button', className: 'dnm-icon-btn', title: t('exitFullscreen'), onClick: () => setFullscreen(false) },
                  h(IconCollapse, { size: 16 }),
                ),
                h(
                  'div',
                  { className: 'dnm-lyric-full-meta' },
                  h('div', { className: 'dnm-lyric-full-name' }, track ? track.name : t('nowPlaying')),
                  h('div', { className: 'dnm-lyric-full-artist' }, track ? artistText(track, t) : ''),
                ),
                h(
                  'div',
                  { className: 'dnm-np-tools' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dnm-np-tool' + (lyricOptions.translation ? ' on' : ''),
                      title: t('lyricTranslation'),
                      disabled: !hasTranslation,
                      onClick: toggleTranslation,
                    },
                    t('lyricTranslation'),
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'dnm-np-tool', title: t('lyricFont') + '：' + sizeLabel, onClick: cycleLyricSize },
                    'A ' + sizeLabel,
                  ),
                ),
              ),
              h(
                'div',
                { className: 'dnm-lyric-full-lines', ref: fullLyricRef },
                lines.map((line, index) =>
                  h(
                    'div',
                    {
                      key: index,
                      className: 'dnm-lyric-line' + (index === activeIndex ? ' active' : ''),
                      'data-active': index === activeIndex ? '1' : '0',
                      role: 'button',
                      tabIndex: 0,
                      onClick: () => sharedPlayer.seek(line.time),
                      onKeyDown: (event) => {
                        if (event.key === 'Enter') sharedPlayer.seek(line.time);
                      },
                    },
                    line.text,
                    line.translation && lyricOptions.translation ? h('span', { className: 'dnm-lyric-trans' }, line.translation) : null,
                  ),
                ),
              ),
              h(
                'div',
                { className: 'dnm-lyric-full-foot' },
                h('span', null, formatSeconds(state.currentTime)),
                h('input', {
                  className: 'dnm-range',
                  type: 'range',
                  min: 0,
                  max: Math.max(1, state.duration),
                  step: 0.1,
                  value: Math.min(state.currentTime, Math.max(1, state.duration)),
                  'aria-label': t('playProgress'),
                  onChange: (event) => sharedPlayer.seek(Number(event.target.value)),
                  onInput: (event) => sharedPlayer.seek(Number(event.target.value)),
                }),
                h('span', null, formatSeconds(state.duration)),
                h(
                  'button',
                  { type: 'button', className: 'dnm-icon-btn', title: t('previousTrack'), onClick: () => sharedPlayer.previous() },
                  h(IconPrev, { size: 16 }),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dnm-icon-btn play',
                    title: state.playing ? t('pause') : t('play'),
                    onClick: () => sharedPlayer.toggle(),
                  },
                  state.playing ? h(IconPause, { size: 18 }) : h(IconPlay, { size: 18 }),
                ),
                h(
                  'button',
                  { type: 'button', className: 'dnm-icon-btn', title: t('nextTrack'), onClick: () => sharedPlayer.next() },
                  h(IconNext, { size: 16 }),
                ),
                ),
              ),
              document.body,
            )
          : null,
      );
    }

    // ---------- 播放条 ----------

    function PlayerBar({ t, onOpenNowPlaying }) {
      const state = usePlayerState();
      const session = useSession();
      const likedIds = useLikedIds();
      const track = state.track;
      const liked = track ? likedIds.has(track.id) : false;
      const duration = state.duration || (track ? track.duration / 1000 : 0);
      const progress = duration > 0 ? Math.min(state.currentTime, duration) : 0;
      const [hoverRatio, setHoverRatio] = React.useState(null);
      const updateHover = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (rect.width <= 0) return;
        const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        setHoverRatio(ratio);
      };
      const modeLabel =
        state.mode === 'single' ? t('playModeSingle') : state.mode === 'shuffle' ? t('playModeShuffle') : t('playModeList');
      return h(
        'div',
        { className: 'dnm-player' },
        h(
          'div',
          {
            className: 'dnm-player-left',
            role: 'button',
            tabIndex: track ? 0 : -1,
            title: t('nowPlayingPage'),
            style: { cursor: track ? 'pointer' : 'default' },
            onClick: () => {
              if (track && onOpenNowPlaying) onOpenNowPlaying();
            },
            onKeyDown: (event) => {
              if (track && onOpenNowPlaying && event.key === 'Enter') onOpenNowPlaying();
            },
          },
          h(Cover, { url: track ? track.coverUrl : '', className: 'dnm-player-cover' }),
          h(
            'div',
            { className: 'dnm-player-meta' },
            h('div', { className: 'dnm-player-title' }, track ? track.name : t('nowPlaying')),
            h('div', { className: 'dnm-player-artist' }, track ? artistText(track, t) : ''),
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
                  ? svgIcon(14, null, {
                      children: [
                        h('path', { d: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z' }),
                        h(
                          'text',
                          {
                            x: '12',
                            y: '15.5',
                            textAnchor: 'middle',
                            fontSize: '9',
                            fontWeight: '600',
                            fill: 'currentColor',
                            stroke: 'none',
                            style: { fontFamily: 'inherit' },
                          },
                          '1',
                        ),
                      ],
                    })
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
                title: t('lyrics'),
                disabled: !track,
                onClick: () => {
                  if (onOpenNowPlaying) onOpenNowPlaying();
                },
              },
              h(IconLyric, { size: 15 }),
            ),
          ),
          h(
            'div',
            { className: 'dnm-progress' },
            h('span', { className: 'dnm-time' }, formatSeconds(progress)),
            h(
              'div',
              {
                className: 'dnm-progress-track',
                onMouseMove: updateHover,
                onMouseLeave: () => setHoverRatio(null),
              },
              h('input', {
                className: 'dnm-range',
                type: 'range',
                min: 0,
                max: Math.max(1, Math.round(duration)),
                step: 1,
                value: Math.round(progress),
                disabled: !track,
                onChange: (event) => sharedPlayer.seek(Number(event.target.value)),
                onInput: (event) => sharedPlayer.seek(Number(event.target.value)),
              }),
              hoverRatio !== null && duration > 0
                ? h(
                    'div',
                    { className: 'dnm-progress-tip', style: { left: hoverRatio * 100 + '%' } },
                    formatSeconds(hoverRatio * duration),
                  )
                : null,
            ),
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
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-icon-btn dnm-player-like' + (liked ? ' liked' : ''),
              title: !track ? t('nowPlaying') : session.loggedIn ? (liked ? t('unlike') : t('like')) : t('likeHint'),
              disabled: !track || !session.loggedIn,
              onClick: () => {
                if (track && session.loggedIn) likedStore.toggle(track.id).catch(() => undefined);
              },
            },
            h(IconHeart, { size: 15 }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-quality-btn',
              title: t('quality') + '：' + t(QUALITY_LABELS[state.quality]),
              disabled: !track,
              onClick: () => sharedPlayer.cycleQuality(),
            },
            t(QUALITY_LABELS[state.quality]),
          ),
          h(
            'div',
            {
              className: 'dnm-volume-wrap',
              title: t('volume') + '：' + Math.round(state.volume * 100) + '%',
              onWheel: (event) => {
                event.preventDefault();
                const step = event.deltaY > 0 ? -0.05 : 0.05;
                sharedPlayer.setVolume(Math.round((state.volume + step) * 100) / 100);
              },
            },
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
      const lastVolumeRef = useRef(0.8);
      const state = usePlayerState();
      useEffect(() => {
        const audio = audioRef.current;
        if (audio) sharedPlayer.bindAudio(audio);
        return () => {
          sharedPlayer.bindAudio(null);
        };
      }, []);

      // 系统媒体控制：Windows 媒体键 / 任务栏媒体浮层会显示当前歌曲
      useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.mediaSession) return undefined;
        const media = navigator.mediaSession;
        const track = state.track;
        try {
          if (!track) {
            media.metadata = null;
          } else if (typeof window !== 'undefined' && typeof window.MediaMetadata === 'function') {
            media.metadata = new window.MediaMetadata({
              title: track.name,
              artist: artistText(track),
              album: track.album || '',
              artwork: track.coverUrl ? [{ src: track.coverUrl, sizes: '300x300', type: 'image/jpeg' }] : [],
            });
          }
          media.playbackState = state.playing ? 'playing' : 'paused';
        } catch {
          /* 媒体会话只是增强，失败不影响播放 */
        }
        return undefined;
      }, [state.track, state.playing]);

      useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.mediaSession) return undefined;
        const media = navigator.mediaSession;
        const handlers = {
          play: () => sharedPlayer.toggle(),
          pause: () => sharedPlayer.toggle(),
          previoustrack: () => sharedPlayer.previous(),
          nexttrack: () => sharedPlayer.next(),
          seekto: (details) => {
            if (details && typeof details.seekTime === 'number') sharedPlayer.seek(details.seekTime);
          },
        };
        for (const name of Object.keys(handlers)) {
          try {
            media.setActionHandler(name, handlers[name]);
          } catch {
            /* 个别动作在部分系统不受支持 */
          }
        }
        return () => {
          for (const name of Object.keys(handlers)) {
            try {
              media.setActionHandler(name, null);
            } catch {
              /* 忽略 */
            }
          }
        };
      }, []);

      // 面板内键盘快捷键：空格播放/暂停、←/→ 快退快进、Ctrl+←/→ 切歌、M 静音
      useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
        const onKeyDown = (event) => {
          const target = event.target;
          const tag = target && target.tagName ? String(target.tagName).toLowerCase() : '';
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable)) return;
          if (!document.querySelector('.dnm-root')) return;
          const snapshot = sharedPlayer.getSnapshot();
          if (!snapshot.track) return;
          if (event.key === ' ' || event.code === 'Space') {
            event.preventDefault();
            sharedPlayer.toggle();
            return;
          }
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const direction = event.key === 'ArrowRight' ? 1 : -1;
            if (event.ctrlKey || event.metaKey) {
              if (direction > 0) sharedPlayer.next();
              else sharedPlayer.previous();
              return;
            }
            sharedPlayer.seek((snapshot.currentTime || 0) + direction * 5);
            return;
          }
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            const delta = event.key === 'ArrowUp' ? 0.05 : -0.05;
            sharedPlayer.setVolume(Math.round(((snapshot.volume || 0) + delta) * 100) / 100);
            return;
          }
          if (event.key === 'm' || event.key === 'M') {
            event.preventDefault();
            const current = snapshot.volume || 0;
            if (current > 0) {
              lastVolumeRef.current = current;
              sharedPlayer.setVolume(0);
            } else {
              sharedPlayer.setVolume(lastVolumeRef.current || 0.8);
            }
          }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, []);

      return h('audio', {
        ref: audioRef,
        preload: 'auto',
        style: { display: 'none' },
        'aria-hidden': 'true',
      });
    }

    // 面板不在前台时，右下角显示一个迷你播放器，方便边干活边控制音乐
    function MiniPlayer({ t, onOpen }) {
      const state = usePlayerState();
      const track = state.track;
      if (state.panelVisible || !track) return null;
      const ratio = state.duration > 0 ? Math.min(1, Math.max(0, state.currentTime / state.duration)) : 0;
      return h(
        'div',
        { className: 'dnm-mini', role: 'complementary', 'aria-label': t('miniPlayer') },
        h(
          'button',
          { type: 'button', className: 'dnm-mini-main', onClick: onOpen, title: t('openPlayer') },
          h(Cover, { url: track.coverUrl, className: 'dnm-mini-cover', alt: t('coverAlt') }),
          h(
            'span',
            { className: 'dnm-mini-meta' },
            h('span', { className: 'dnm-mini-name' }, track.name),
            h('span', { className: 'dnm-mini-artist' }, artistText(track, t)),
          ),
        ),
        h(
          'span',
          { className: 'dnm-mini-controls' },
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-mini-btn',
              onClick: () => sharedPlayer.previous(),
              title: t('previousTrack'),
              'aria-label': t('previousTrack'),
            },
            h(IconPrev, { size: 14 }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-mini-btn play',
              onClick: () => sharedPlayer.toggle(),
              title: state.playing ? t('pause') : t('play'),
              'aria-label': state.playing ? t('pause') : t('play'),
            },
            state.loading
              ? h('span', { className: 'dnm-spinner', style: { width: 12, height: 12 } })
              : state.playing
                ? h(IconPause, { size: 14 })
                : h(IconPlay, { size: 14 }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dnm-mini-btn',
              onClick: () => sharedPlayer.next(),
              title: t('nextTrack'),
              'aria-label': t('nextTrack'),
            },
            h(IconNext, { size: 14 }),
          ),
        ),
        h('span', { className: 'dnm-mini-progress', 'aria-hidden': 'true' }, h('span', { style: { width: (ratio * 100).toFixed(2) + '%' } })),
      );
    }

    // 顶栏搜索框：边打字边给建议，回车看全部结果
    function TopSearch({ t, onSearch, onPickSong, onPickArtist, onPickAlbum, onPickPlaylist }) {
      const [value, setValue] = useState('');
      const [open, setOpen] = useState(false);
      const [data, setData] = useState(null);
      const [active, setActive] = useState(-1);
      const wrapRef = useRef(null);
      const keyword = value.trim();

      useEffect(() => {
        if (!keyword) {
          setData(null);
          return undefined;
        }
        let alive = true;
        const timer = setTimeout(() => {
          rpc('searchSuggest', { s: keyword })
            .then((payload) => {
              if (!alive) return;
              const result = (payload && payload.result) || {};
              setData({
                songs: normalizeTracks(Array.isArray(result.songs) ? result.songs : []).slice(0, 3),
                artists: (Array.isArray(result.artists) ? result.artists : []).slice(0, 2),
                albums: (Array.isArray(result.albums) ? result.albums : []).slice(0, 2),
                playlists: (Array.isArray(result.playlists) ? result.playlists : []).slice(0, 2),
              });
              setActive(-1);
            })
            .catch(() => {
              if (alive) setData(null);
            });
        }, 240);
        return () => {
          alive = false;
          clearTimeout(timer);
        };
      }, [keyword]);

      useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const onPointerDown = (event) => {
          if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        return () => document.removeEventListener('mousedown', onPointerDown);
      }, []);

      const entries = [];
      if (data) {
        for (const track of data.songs) entries.push({ kind: 'song', track });
        for (const artist of data.artists) entries.push({ kind: 'artist', artist });
        for (const album of data.albums) entries.push({ kind: 'album', album });
        for (const playlist of data.playlists) entries.push({ kind: 'playlist', playlist });
      }

      const close = () => {
        setOpen(false);
        setActive(-1);
      };

      const submit = () => {
        if (!keyword) return;
        close();
        onSearch(keyword);
      };

      const pick = (entry) => {
        close();
        if (entry.kind === 'song') onPickSong(entry.track);
        else if (entry.kind === 'artist') onPickArtist(entry.artist.id);
        else if (entry.kind === 'album') onPickAlbum(entry.album.id);
        else onPickPlaylist(entry.playlist.id);
      };

      const onKeyDown = (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (open && active >= 0 && entries[active]) pick(entries[active]);
          else submit();
          return;
        }
        if (event.key === 'Escape') {
          close();
          return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          if (!open || entries.length === 0) return;
          event.preventDefault();
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          setActive((previous) => {
            const next = previous + delta;
            if (next < -1) return entries.length - 1;
            if (next >= entries.length) return -1;
            return next;
          });
        }
      };

      const renderItem = (entry, index) => {
        const className = 'dnm-suggest-item' + (index === active ? ' active' : '');
        const shared = {
          type: 'button',
          className,
          onMouseDown: (event) => event.preventDefault(),
          onClick: () => pick(entry),
        };
        if (entry.kind === 'song') {
          return h(
            'button',
            { key: 'song-' + entry.track.id, ...shared },
            h(Cover, { url: entry.track.coverUrl, className: 'dnm-suggest-cover', alt: '' }),
            h('span', { className: 'dnm-suggest-name' }, entry.track.name),
            h('span', { className: 'dnm-suggest-sub' }, artistText(entry.track, t)),
          );
        }
        if (entry.kind === 'artist') {
          return h(
            'button',
            { key: 'artist-' + entry.artist.id, ...shared },
            h(Cover, { url: entry.artist.picUrl, className: 'dnm-suggest-cover dnm-suggest-round', alt: '' }),
            h('span', { className: 'dnm-suggest-name' }, entry.artist.name),
            h('span', { className: 'dnm-suggest-sub' }, t('searchArtists')),
          );
        }
        if (entry.kind === 'album') {
          return h(
            'button',
            { key: 'album-' + entry.album.id, ...shared },
            h(Cover, { url: entry.album.picUrl, className: 'dnm-suggest-cover', alt: '' }),
            h('span', { className: 'dnm-suggest-name' }, entry.album.name),
            h('span', { className: 'dnm-suggest-sub' }, t('searchAlbums')),
          );
        }
        return h(
          'button',
          { key: 'playlist-' + entry.playlist.id, ...shared },
          h(Cover, { url: entry.playlist.picUrl || entry.playlist.coverImgUrl, className: 'dnm-suggest-cover', alt: '' }),
          h('span', { className: 'dnm-suggest-name' }, entry.playlist.name),
          h('span', { className: 'dnm-suggest-sub' }, t('searchPlaylists')),
        );
      };

      let panel = null;
      if (open && keyword && entries.length > 0) {
        const rows = [];
        let index = 0;
        const pushSection = (title, kind, list) => {
          if (!list || list.length === 0) return;
          rows.push(h('div', { key: 'section-' + title, className: 'dnm-suggest-section' }, title));
          for (const item of list) {
            const entry =
              kind === 'song'
                ? { kind: 'song', track: item }
                : kind === 'artist'
                  ? { kind: 'artist', artist: item }
                  : kind === 'album'
                    ? { kind: 'album', album: item }
                    : { kind: 'playlist', playlist: item };
            rows.push(renderItem(entry, index));
            index += 1;
          }
        };
        pushSection(t('searchSongs'), 'song', data.songs);
        pushSection(t('searchArtists'), 'artist', data.artists);
        pushSection(t('searchAlbums'), 'album', data.albums);
        pushSection(t('searchPlaylists'), 'playlist', data.playlists);
        rows.push(
          h(
            'button',
            {
              key: 'all',
              type: 'button',
              className: 'dnm-suggest-all',
              onMouseDown: (event) => event.preventDefault(),
              onClick: submit,
            },
            t('searchAll'),
          ),
        );
        panel = h('div', { className: 'dnm-suggest', role: 'listbox' }, rows);
      }

      return h(
        'div',
        { className: 'dnm-search-wrap', ref: wrapRef },
        h(
          'div',
          { className: 'dnm-search' },
          h(IconSearch, { size: 15 }),
          h('input', {
            value,
            placeholder: t('searchPlaceholder'),
            onChange: (event) => {
              setValue(event.target.value);
              setOpen(true);
            },
            onFocus: () => {
              if (keyword) setOpen(true);
            },
            onKeyDown,
          }),
        ),
        panel,
      );
    }

    // ---------- 主面板 ----------

    function NeteaseMusicPage(props) {
      const t = props.t;
      const [view, setView] = useState('discover');
      const [prevView, setPrevView] = useState('discover');
      const [playlistId, setPlaylistId] = useState(null);
      const [artistId, setArtistId] = useState(null);
      const [albumId, setAlbumId] = useState(null);
      const [albumFrom, setAlbumFrom] = useState('search');
      const [artistFrom, setArtistFrom] = useState('search');
      const [keyword, setKeyword] = useState('');
      const [loginOpen, setLoginOpen] = useState(false);
      const state = useSession();
      const playerState = usePlayerState();

      useEffect(() => {
        sharedPlayer.setPanelVisible(true);
        if (state.status === 'idle') void sharedSession.refresh();
        return () => sharedPlayer.setPanelVisible(false);
      }, [state.status]);

      useEffect(() => {
        if (state.loggedIn && state.profile) void likedStore.ensure(state.profile.userId);
      }, [state.loggedIn, state.profile]);

      const openPlaylist = useCallback((id) => {
        setPlaylistId(id);
        setView('playlist');
      }, []);

      const openArtist = useCallback((id) => {
        setArtistId(id);
        setArtistFrom((previous) => (view === 'artist' ? previous : view));
        setView('artist');
      }, [view]);

      const openAlbum = useCallback((id) => {
        setAlbumId(id);
        setAlbumFrom((previous) => (view === 'album' ? previous : view));
        setView('album');
      }, [view]);

      const openSearch = useCallback((value) => {
        setKeyword(value);
        setView('search');
        if (value) searchHistory.record(value);
      }, []);

      const openNowPlaying = useCallback(() => {
        if (view !== 'nowplaying') setPrevView(view);
        setView('nowplaying');
      }, [view]);

      const navItems = [
        { key: 'discover', label: t('tabDiscover'), icon: h(IconMusic, { size: 15 }) },
        { key: 'daily', label: t('navDaily'), icon: h(IconDaily, { size: 15 }) },
        { key: 'radio', label: t('navRadio'), icon: h(IconRadio, { size: 15 }) },
        { key: 'toplist', label: t('tabToplist'), icon: h(IconRefresh, { size: 15 }) },
        { key: 'mine', label: t('tabMine'), icon: h(IconUser, { size: 15 }) },
      ];

      let content;
      if (view === 'playlist' && playlistId) {
        content = h(PlaylistView, { t, playlistId, onBack: () => setView('discover') });
      } else if (view === 'daily') {
        content = h(DailyView, { t, onLogin: () => setLoginOpen(true) });
      } else if (view === 'radio') {
        content = h(RadioView, { t, onLogin: () => setLoginOpen(true) });
      } else if (view === 'toplist') {
        content = h(ToplistView, { t, onOpenPlaylist: openPlaylist });
      } else if (view === 'search') {
        content = h(SearchView, {
          t,
          keyword,
          onSearch: openSearch,
          onOpenPlaylist: openPlaylist,
          onOpenArtist: openArtist,
          onOpenAlbum: openAlbum,
        });
      } else if (view === 'artist' && artistId) {
        content = h(ArtistView, { t, artistId, onBack: () => setView(artistFrom), onOpenAlbum: openAlbum, onLogin: () => setLoginOpen(true) });
      } else if (view === 'album' && albumId) {
        content = h(AlbumView, { t, albumId, onBack: () => setView(albumFrom), onLogin: () => setLoginOpen(true) });
      } else if (view === 'likes') {
        content = h(LikesView, { t, onBack: () => setView('mine'), onLogin: () => setLoginOpen(true) });
      } else if (view === 'mine') {
        content = h(MineView, {
          t,
          onOpenPlaylist: openPlaylist,
          onOpenLikes: () => setView('likes'),
          onLogin: () => setLoginOpen(true),
        });
      } else {
        content = h(DiscoverView, { t, onOpenPlaylist: openPlaylist, onOpenToplist: () => setView('toplist') });
      }

      return h(
        'section',
        { className: 'dnm-root', 'aria-label': t('brand') },
        playerState.track && playerState.track.coverUrl
          ? h(
              'div',
              { className: 'dnm-ambient', 'aria-hidden': 'true' },
              h('div', {
                className: 'dnm-ambient-img',
                style: { backgroundImage: 'url("' + playerState.track.coverUrl + '")' },
              }),
            )
          : null,
        h(
          'header',
          { className: 'dnm-topbar' },
          h(
            'div',
            { className: 'dnm-brand' },
            h('span', { className: 'dnm-brand-mark', 'aria-hidden': 'true' }, h(IconMusic, { size: 13 })),
            h('span', null, t('brand')),
          ),
          h(TopSearch, {
            t,
            onSearch: openSearch,
            onPickSong: (track) => {
              void sharedPlayer.playQueue([track], 0);
            },
            onPickArtist: openArtist,
            onPickAlbum: openAlbum,
            onPickPlaylist: openPlaylist,
          }),
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
        state.expired
          ? h(
              'div',
              { className: 'dnm-banner', role: 'status' },
              h(IconUser, { size: 14 }),
              h('span', { className: 'dnm-banner-text' }, t('sessionExpired')),
              h(
                'button',
                { type: 'button', className: 'dnm-banner-action', onClick: () => setLoginOpen(true) },
                t('relogin'),
              ),
            )
          : null,
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
                    'dnm-nav-item' +
                      (view === item.key || (['playlist', 'artist', 'album', 'search'].includes(view) && item.key === 'discover')
                        ? ' active'
                        : ''),
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
          h(
            'div',
            { className: 'dnm-main' },
            view === 'nowplaying'
              ? h(NowPlayingView, { t, onBack: () => setView(prevView), onOpenArtist: openArtist, onOpenAlbum: openAlbum })
              : h('div', { className: 'dnm-scroll' }, content),
          ),
        ),
        h(PlayerBar, { t, onOpenNowPlaying: openNowPlaying }),
        h(ContextMenu, { t, onOpenArtist: openArtist, onOpenAlbum: openAlbum }),
        h(Toast),
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
      inject: ['slots', 'locale', 'layout'],
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
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'netease-music-mini',
              locale: NS,
              inject: () => ({ t, onOpen: () => ctx.layout.selectPanel(PANEL_ID) }),
            },
            MiniPlayer,
          ),
        );
      },
    };
  },
});
