<p align="center">
  <img src="icon.svg" width="96" height="96" alt="网易云音乐" />
</p>

<h1 align="center">网易云音乐 for DSH</h1>

<p align="center">
  在 DeepSeek Harness 左侧栏放一个完整的网易云音乐面板：搜歌、看榜、听歌、登录自己的账号。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license" /></a>
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img src="https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white" alt="powered by dsh" /></a>
</p>

---

## 功能

- **左侧栏入口**：点一下就在主面板打开完整音乐界面，不是网页 iframe
- **发现**：热门榜单 + 推荐歌单
- **排行榜**：全部 65 个官方榜单，点进去看曲目
- **搜索**：单曲、歌手、专辑、歌单四类结果，可直接进歌手页或专辑页
- **歌手页**：头像、简介、单曲/专辑数、热门歌曲 50 首
- **专辑页**：封面、发行日期、完整曲目列表
- **我的音乐**：登录后显示个人资料、每日推荐、我的歌单
- **播放器**：播放/暂停、上一首/下一首、进度、音量、循环模式；切到别的面板也继续播放
- **正在播放**：点播放条左侧封面或「歌词」按钮进入详情页，左侧大封面、右侧滚动歌词（点歌词跳转）或播放队列
- **系统媒体控制**：支持 Windows 媒体键与任务栏媒体浮层，空格键快速播放/暂停
- **三种登录方式**：自动登录（推荐）、扫码登录、粘贴 Cookie

## 安装

### 方式一：插件管理界面（推荐）

1. 克隆本仓库到本地任意目录：

   ```bash
   git clone https://github.com/LessXi/dsh-netease-music.git
   ```

2. 打开 DSH 的插件管理，选择安装本地 bundle，目录指向刚克隆的 `dsh-netease-music`
3. 重启客户端，左侧栏出现云朵图标

### 方式二：手动加入 profile

在 profile 的 `package.json` 里：

```jsonc
{
  "dependencies": {
    "@local/dsh-netease-music": "link:/绝对路径/dsh-netease-music"
  },
  "dsh": {
    "profile": {
      "bundles": [
        // ……原有 bundle，保持顺序
        "@local/dsh-netease-music"
      ]
    }
  }
}
```

然后重新安装依赖并重启客户端。包名带 `@local/` 前缀是刻意的本地作用域，安装时保持原样。

## 使用

打开左侧栏的网易云音乐图标后：

- 左侧导航「发现 / 排行榜 / 我的音乐」
- 顶部搜索框输入歌名回车，结果上可切换「单曲 / 歌手 / 专辑 / 歌单」，点歌手或专辑进详情页
- 双击曲目行或点播放按钮开始播放
- 底部是播放条，切到其他面板后仍可继续播放
- 点播放条左侧封面或右侧「歌词」按钮打开正在播放页，可看滚动歌词（点歌词跳转）或播放队列

## 登录

弹窗默认是**自动登录**，点「打开登录窗口」后会启动一个独立的浏览器窗口（不碰你平时用的浏览器），在里面扫码或账号密码登录，插件会自动读取登录状态、关闭窗口。

另外两个标签是兜底：

- **扫码登录**：直接显示二维码。网易云风控较严时手机确认后可能返回 `8821`，此时请改用自动登录或粘贴 Cookie
- **粘贴 Cookie**：从浏览器 `music.163.com` 的请求头里复制 `Cookie`，粘贴进输入框

登录后可以播放需要权限的歌曲（能否播放取决于账号本身的会员状态）。

## 实现说明

- **Host 端**（`index.js`）：注册 `/api/netease-music/*` 路由，代理网易云接口（weapi 加密链路 + 免加密老接口），校验请求 Origin 只允许同源
- **Client 端**（`client.js`）：`sidebar.panellist` + `main` 两个 slot，纯 React 组件渲染，样式只用 DSH 主题变量
- **二维码**（`qr.js`）：自带纯 JS 二维码编码器，无第三方依赖
- **自动登录**（`login-assistant.js`）：用本机 Chrome/Edge 的独立 profile 目录启动浏览器，通过 CDP 读取登录 Cookie 后关闭窗口
- **播放器**：单例放在 `shell.overlay` 的隐藏 `<audio>` 上，切面板不中断；同时上报 `navigator.mediaSession`，支持系统媒体键

所有代码是纯 JavaScript，没有构建步骤。

## 隐私与安全

- 不上传、不收集任何数据
- 登录 Cookie 只保存在本地 `<profile>/netease-music-cookies.json`，只保留登录必需字段
- 只向 `music.163.com` 及其 CDN 发请求，不经过任何第三方服务
- 所有 API 路由校验 `Origin`，拒绝跨站调用

## 已知限制

- VIP/会员歌曲需要登录，且能否播放取决于账号会员状态
- 自动登录需要本机装有 Chrome 或 Edge
- 网易云接口没有公开文档，升级后可能需要适配

## 免责声明

本项目仅供学习与个人使用。音乐版权归网易云音乐及版权方所有，请勿用于商业用途。

## License

[MIT](LICENSE)
