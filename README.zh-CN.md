# DeepSeek Harness 的 3D Room Design 插件

[English](./README.md)

为您的 Agent 增加生图和视频生成能力，擅长室内外建筑效果图与户型可视化。您可以让它为客厅尝试不同的装修风格、替换建筑外立面材质，或把一张房间效果图变成设计视频。可用工具取决于您在 3D Room Design 网站授予的权限。

## 安装

将这句话发给能在您电脑执行命令的 Agent 即可开始。

> 请按照 https://github.com/3droomdesign/dsh-plugin-3dr 的说明，给我当前使用的 DeepSeek Harness 安装 3D Room Design 插件，连接我的 3dr 账号。需要授权时打开官网让我确认，重启对应的 DSH 配置，然后用一张室内效果图的报价检查连接。拿到报价就结束。

1. 在运行 DSH 的电脑准备好 [Node.js](https://nodejs.org/) 22 或更高版本、npm 和 [Git](https://git-scm.com/downloads)。在终端安装官方 3dr，按提示在浏览器授权。已有同站点、同一 3dr profile 授权的用户可以直接复用。

   ```sh
   npm install --global git+https://github.com/3droomdesign/3droomdesign-mcp.git
   3dr login
   ```

2. 安装到您实际使用的 DSH 配置。以下以桌面版的 `desktop` 为例，其他配置请替换该名称。若终端找不到 `dsh`，也可在桌面插件管理器中使用同一 GitHub 来源安装。

   ```sh
   dsh plugin --profile desktop add github:3droomdesign/dsh-plugin-3dr#v0.1.0
   ```

3. 将启动配置保存到上一步的 DSH 配置目录。文件记录 Node.js 与 3dr 的绝对路径，桌面应用和 Windows 也能准确启动它。授权凭证由 3dr 保存在系统凭证库。

   **macOS / Linux**
   ```sh
   3dr config > "${DSH_HOME:-$HOME/.dsh}/profiles/desktop/3dr-mcp.json"
   ```

   **Windows PowerShell**
   ```powershell
   $dshRoot = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
   3dr config | Set-Content -Encoding utf8 (Join-Path $dshRoot 'profiles/desktop/3dr-mcp.json')
   ```

   在本身能找到 `3dr` 命令的 Unix 宿主中，默认连接也支持省略这一步。更换 Node.js 或 3dr 的安装路径后，请重新生成文件。

4. 重启对应 DSH 配置，让 Agent 列出可用工具，然后**只给一张写实室内效果图报价**。DSH 注册的工具名形如 `mcp__3dr__工具名`。报价给出最高消耗积分和有效期，实际提交生图或视频任务才会按网站授权消耗积分。

支持自定义插件目录的 DSH 版本也可以添加此仓库的 [Discover 索引](https://raw.githubusercontent.com/3droomdesign/dsh-plugin-3dr/main/market/index.json)。

## 连接自己的账号

3dr 默认连接正式站。如果希望为这个宿主单独授权，请运行 `3dr --profile design login`，然后在第 3 步改用 `3dr --profile design config`。如需指向其他部署，请在本机终端执行这两条命令前设置 `THREEDR_SITE_ORIGIN`。生成的文件会记录该站点，桌面应用可以沿用。权限、积分额度和撤销入口都在网站的「账户 → MCP 连接」。

先在同一个 3dr profile 中运行 `3dr upload <文件>`，即可获得参考图的素材引用。Agent 可以查询预设、获取报价、提交生成并取回结果。每次新生成使用独立的 `request_id`，重试同一次任务时复用该值。下载原图可使用[官方 CLI 下载说明](https://github.com/3droomdesign/3droomdesign-mcp#readme)。插件在本机启动 `3dr serve`，使用统计由网站后端处理。

卸载时运行 `dsh plugin --profile desktop remove dsh-plugin-3dr`，重启对应配置，然后可删除本地的 `3dr-mcp.json`，并在网站撤销授权。
