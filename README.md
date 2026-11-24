# 3D Room Design for DeepSeek Harness

[简体中文](./README.zh-CN.md)

Give your agent image and video generation, with architectural design tools for interiors, exteriors, and floor plans. Ask it to visualize a renovation, try a different facade finish, or turn a room image into a design video. The available tools depend on your 3D Room Design connection.

## Install

You can give this instruction to an agent that can run commands on your computer.

> Install the 3D Room Design plugin for my current DeepSeek Harness profile using the instructions at https://github.com/3droomdesign/dsh-plugin-3dr. Connect my 3dr account, let me approve access in the browser, restart the profile and verify that you can quote one interior image. Stop after the quote.

1. On the computer that runs DSH, install [Node.js](https://nodejs.org/) 22 or later (with npm) and [Git](https://git-scm.com/downloads). In a terminal, install the official CLI and authorize your account in the browser. An existing 3dr connection on the same site and profile can be reused.

   ```sh
   npm install --global git+https://github.com/3droomdesign/3droomdesign-mcp.git
   3dr login
   ```

2. Install the bundle in the DSH profile you use. Replace `desktop` if you use a different profile. If the DSH command is unavailable, open the desktop plugin manager and install from the same GitHub source.

   ```sh
   dsh plugin --profile desktop add github:3droomdesign/dsh-plugin-3dr#v0.1.0
   ```

3. Save the launcher for that DSH profile. This records the absolute Node.js and CLI paths so desktop apps and Windows can start the installed CLI. The file contains launch settings. Credentials stay in your system credential store.

   **macOS / Linux**
   ```sh
   3dr config > "${DSH_HOME:-$HOME/.dsh}/profiles/desktop/3dr-mcp.json"
   ```

   **Windows PowerShell**
   ```powershell
   $dshRoot = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
   3dr config | Set-Content -Encoding utf8 (Join-Path $dshRoot 'profiles/desktop/3dr-mcp.json')
   ```

   On a Unix host that already resolves `3dr` in its PATH, the default profile also works without a launcher file. Regenerate this file if your Node.js or 3dr installation moves.

4. Restart the DSH profile. Ask your agent to list the 3DR tools and **quote one photorealistic interior image**. DSH exposes tools as `mcp__3dr__<name>`. The quote returns the maximum credit cost and expiry. Generating an image or video consumes account credits according to your website authorization.

The optional [DSH Discover index](https://raw.githubusercontent.com/3droomdesign/dsh-plugin-3dr/main/market/index.json) can also be added as a custom catalog on DSH versions that support it.

## Use your own connection

3dr connects to the official production service by default. For a separate account or device grant, run `3dr --profile design login` and use `3dr --profile design config` in step 3. To use another deployment, set `THREEDR_SITE_ORIGIN` in your local terminal **before both commands**. The generated config preserves that origin even when a desktop app starts outside your shell. Manage permissions, credit limits and revocation on the website under **Account → MCP connections**.

Use `3dr upload <file>` with the same 3dr profile to obtain an asset reference for a source image. The agent can look up presets, request a quote, submit a generation with a unique `request_id`, and retrieve a run's results. Keep the same ID when retrying that generation. For an original file, use the official CLI's [download instructions](https://github.com/3droomdesign/3droomdesign-mcp#readme). The plugin starts `3dr serve` locally and adds no telemetry.

To remove the bundle, run `dsh plugin --profile desktop remove dsh-plugin-3dr` and restart the profile. You can then delete its `3dr-mcp.json` and revoke the connection on the website.
