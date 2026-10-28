# 九牛核 · EV Riders Club

九号、极核、小牛电动摩托车横向对比概念网站。深墨绿与荧光绿配色，原创整车 SVG，支持桌面和手机。

## 直接打开

双击 `preview.html` 即可浏览完整页面，无需安装、无需网络。它包含全部脚本、样式及插画。

## 本地开发

推荐 Node.js 22，最低需要 Node.js 20，无第三方依赖，不需要 npm install。

```sh
npm run dev
```

访问 http://localhost:5173 。其他端口可用 `npm run dev -- --port 3000`。

```sh
npm run build
npm run preview
```

构建生成 `dist/` 静态网站，同时更新根目录的独立离线版 `preview.html`。`dist/` 可直接用于静态托管。

## 功能

- 六款车型，按品牌、骑行场景、预算、关键词筛选；按价格、续航和性能排序。
- 车型收藏与最多三台车型对比，保存在当前浏览器。
- 完整参数表、只看差异、车型详情。
- 三步选车问答，按预算区间与偏好推荐。
- 三篇完整的选车与骑行指南，数据及素材说明。
- 弹层键盘操作、焦点恢复、窄屏适配、减少动态效果支持。

## 内容口径

这是一个交互与视觉演示，并非官方购车信息网站。价格、参数为演示参考数据，未进行实时官网核验；插画为原创设计风格示意，并非官方车型照片。实际购买前请以品牌官方及当地在售版本为准。

## 文件

- `src/main.js`：首页、筛选与收藏对比状态。
- `src/data.js`：车型、品牌与演示参考数据。
- `src/modals.js`：对比、推荐、详情和文章弹层。
- `src/style.css` / `src/modals.css`：响应式样式。
- `public/images/`：四张原创整车 SVG。
- `server.mjs`：零依赖本地静态服务器。
- `build.mjs`：静态及离线单文件构建。

## 在线部署

已准备 Cloudflare Pages 和 Vercel 配置。推荐 GitHub 连接托管平台，后续推送 `main` 分支自动更新网站。完整操作见 [上线说明](deploy/README.zh-CN.md)。

- 构建命令：`npm run build`
- 发布目录：`dist`
- 框架：None / Other
- Node.js：22
- 环境变量和后端：不需要

`.github/workflows/ci.yml` 会在推送或 PR 时检查脚本并构建静态网站；实际发布由连接的 Cloudflare Pages 或 Vercel 完成。

`jiuniuhe-site.zip` 是已构建的网站，可直接上传到支持静态文件的托管服务。`jiuniuhe-source.zip` 是包含自动部署配置的源码包。
