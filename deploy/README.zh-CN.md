# 九牛核上线说明

项目已经可以静态发布。网站全部交互在浏览器运行，无数据库、无服务端进程、无第三方依赖，也不需要配置密钥。

## 推荐：GitHub + Cloudflare Pages

1. 在 GitHub 创建仓库，例如 `jiuniuhe`。仓库可设为私有，不影响 Cloudflare Pages 发布公开网站。
2. 将源码上传到仓库根目录。根目录应能直接看到 `package.json`、`build.mjs`、`src/`、`public/`、`wrangler.jsonc`。不要把整个项目再套进一层文件夹；保留 `.github/`、`.node-version` 等以点开头的配置文件。
3. 打开 https://dash.cloudflare.com/ ，进入 Workers & Pages，创建 Pages 项目并连接该 GitHub 仓库。平台授权时只选择这个仓库即可。
4. 填写构建设置：

| 设置 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 框架预设 | None |
| 根目录 | 留空（仓库根目录） |
| 构建命令 | `npm run build` |
| 构建输出目录 | `dist` |
| Node.js | `22`；若界面没有版本选项，可设构建环境变量 `NODE_VERSION=22` |

5. 部署成功后，平台会提供公开的 `pages.dev` 地址。复制平台实际生成的链接即可分享，不需要购买域名。
6. 后续修改并推送到 `main` 分支，Cloudflare Pages 会自动重新构建并发布。

仓库中的 `wrangler.jsonc` 已声明静态发布目录；`public/_headers` 提供缓存重验证和基础响应头。不要运行 `server.mjs`，它只用于本地预览。

如果仓库默认分支并非 `main`，将托管平台的生产分支和 `.github/workflows/ci.yml` 中的分支名称一并改为实际名称。

## 备选：GitHub + Vercel

1. 打开 https://vercel.com/new ，导入同一个 GitHub 仓库。
2. 仓库内 `vercel.json` 已配置构建命令和输出目录；框架使用 Other，Node.js 使用 22。
3. 执行部署，分享平台实际生成的 `vercel.app` 地址。
4. 后续推送生产分支自动更新。无需同时连接两个托管平台，选择一个即可。

## 先拿公开链接：直接上传构建包

如果暂时不接 GitHub，可以在 Cloudflare Pages 创建 Direct Upload 项目，上传 `jiuniuhe-site.zip` 或解压后的 `dist/` 文件。解压后 `index.html` 必须位于发布目录第一层。

这种方式需要手动更新。如果计划长期自动部署，优先从 GitHub 连接方式创建 Pages 项目；Cloudflare 的 Direct Upload 与 Git 集成项目应按平台提供的方式分别建立，不要假定可以直接切换。

## 部署后核对

- 电脑和手机都能打开首页，整车插画和样式显示正常。
- 搜索、品牌与预算筛选、收藏正常。
- 加入三款车型后可打开对比表，并能切换「只看不同项」。
- 三步问答能给出符合预算区间的推荐。
- 刷新后当前浏览器的收藏仍在；更换域名或设备后不会同步记录。

当前站点是概念演示。价格、参数和原创车型插画的说明已放在页面中，上线不会将它们转换为已核实的官方资料。

## 当前交付状态

本地构建及脚本检查已通过。尚未创建远程仓库、连接托管账号或获得公开链接。GitHub 网页访问因自动审批服务返回 503 未获执行，实际发布需要在可访问平台的浏览器中完成账号接入。
