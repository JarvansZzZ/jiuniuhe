# 九牛核上线说明

当前 V2 内容预览使用 **GitHub Pages**：[打开九牛核](https://jarvanszzz.github.io/jiuniuhe/)。仓库为 [JarvansZzZ/jiuniuhe](https://github.com/JarvansZzZ/jiuniuhe)，推送到 `main` 后自动发布，配置与维护步骤见 [GitHub Pages 说明](GITHUB-PAGES.zh-CN.md)。

早期 Cloudflare 路线使用 **Workers**，仓库保留 Workers Static Assets 配置，将 `dist/` 作为静态网站发布，无需后端 Worker 入口脚本。以下 Workers 步骤适用于继续使用该托管方式的情况。

## Workers 静态资源配置

早期出现过 Building 成功、Deploying 失败的问题：此前的 `pages_build_output_dir` 属于 Cloudflare Pages 配置，Workers 发布命令没有获得静态资源目录。

修复后的 `wrangler.jsonc` 包含：

```json
{
  "name": "jiuniuhe",
  "compatibility_date": "2026-10-28",
  "workers_dev": true,
  "assets": {
    "directory": "./dist"
  }
}
```

实际文件还保留了编辑器使用的 `$schema` 字段。

1. 在 GitHub Desktop 确认当前仓库为 `jiuniuhe`，提交配置修改，例如「修复 Cloudflare 静态网站部署」。
2. 点击 **Push origin**，将提交推送到 GitHub。已连接的 Cloudflare 项目会重新构建与部署。
3. 如果需要检查 Cloudflare 构建设置，使用下表：

| 设置 | 值 |
| --- | --- |
| 项目类型 | Workers |
| 生产分支 | `main` |
| 根目录 | 仓库根目录 |
| 构建命令 | `npm run build` |
| 部署命令 | `npx wrangler deploy` |
| Node.js | 推荐 `22` |
| 静态资源目录 | 由 `wrangler.jsonc` 中的 `assets.directory` 指定为 `./dist` |

4. 在 Deployments 中确认最新部署成功，再从项目 Overview 或 Domains 中打开平台实际生成的 `workers.dev` 地址。

无需重新创建 Cloudflare 项目，也无需上传 `preview.html`。网站资源由构建过程完整生成，收藏、筛选、对比和推荐都在浏览器运行。

## 后续更新

修改网站文件后，通过 GitHub Desktop 提交并推送到 `main`，GitHub Pages 工作流会自动发布最新版本。若仍使用 Cloudflare Git 集成，也应在该平台检查仓库绑定和部署结果。

`.github/workflows/ci.yml` 负责脚本检查及构建，`.github/workflows/pages.yml` 负责 GitHub Pages 发布。Workers 配置仍可用于 Cloudflare 发布。`public/_headers` 提供缓存重验证和基础响应头。不应对本项目直接添加禁止内联脚本的 CSP，因为独立构建页包含内联 JS 与 CSS。

## 备选：GitHub + Vercel

如果改用 Vercel，在 https://vercel.com/new 导入仓库。`vercel.json` 已声明构建命令 `npm run build` 和输出目录 `dist`，框架选择 Other，Node.js 使用 22。后续推送生产分支自动更新。

## 本地验证

```sh
npm run check
npm run build
npm run preview
```

本地服务使用 http://localhost:5173 。`preview.html` 也可独立离线打开。

## 部署后核对

- 电脑和手机可打开首页，整车插画和样式正常。
- 搜索、品牌与预算筛选、收藏正常。
- 加入三款车型后可打开对比表，并切换「只看不同项」。
- 三步问答给出符合预算区间的推荐。
- 刷新后当前浏览器的收藏仍在；不同域名或设备之间不会同步记录。

当前站点是 V2 内容预览，保留资料来源及价格、参数和实拍缺口；首页原创插画仍为风格示意。上线不代表已完成全车型、全价格或每车三张实拍的内容目标。

## 当前状态

源码位于本地 `jiuniuhe` 仓库，GitHub 账户已更名为 `JarvansZzZ`。Pages 发布结果以仓库 Actions 中的 Deploy GitHub Pages 为准；Workers 发布结果则以 Cloudflare 的最新部署记录为准。
