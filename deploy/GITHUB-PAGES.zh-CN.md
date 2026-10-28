# 免费备选：GitHub Pages

目标是获得一个不需要购买域名的公开网站地址。GitHub Pages 使用境外托管，并非中国大陆节点；国内访问需要实际测试，不承诺所有运营商或地区都可访问。

## 使用前决定仓库可见性

GitHub Free 的 Pages 通常要求使用公开仓库。私有仓库的 Pages 支持取决于付费套餐。如果你不希望公开当前仓库，请先不要推送这个 Pages 工作流，也不要修改仓库可见性。

公开仓库会让任何人都能读取该仓库中的文件和提交历史，不只是最终的网站页面。改变可见性前，应确认这些内容符合自己的分享意愿。

## 配置与发布

1. 在 GitHub 网页打开仓库。如果使用免费账号且仓库目前私有，先自行决定是否在 Settings → General → Danger Zone → Change repository visibility 中设为 Public。
2. 在仓库 Settings → Pages → Build and deployment 中，将 Source 设为 GitHub Actions。
3. 回到 GitHub Desktop，提交 `.github/workflows/pages.yml` 以及说明文档，点击 Push origin。
4. 在仓库 Actions 中打开 Deploy GitHub Pages，等待 build 和 deploy 两个任务完成。
5. 成功后在 Settings → Pages 或工作流部署结果中查看真实生成的网址。项目网站一般为 `https://<GitHub用户名>.github.io/<仓库名>/`。
6. 分别使用不开代理的手机流量和 Wi-Fi 实测访问情况。

以后推送到 `main` 分支会自动更新。该工作流不会创建账号、购买服务或修改仓库可见性。

## 与现有 Cloudflare 部署的关系

现有 Workers 配置保持可用。新增的工作流提供 GitHub Pages 发布路径，推送后 Cloudflare 已有的 Git 集成也可能照常构建。

如果暂时不使用 GitHub Pages，可以不提交这个工作流；如果已经提交，可在 Actions 中禁用 Deploy GitHub Pages 工作流。

若 GitHub Pages 也不能满足国内访问需求，应选择明确支持中国大陆访问的托管服务，并核实其套餐、域名与备案要求。不能仅凭「免费托管」判断国内可达性。
