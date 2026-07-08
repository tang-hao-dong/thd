# 薰陶法 — 部署与使用指南

> 个人文章管理与每日签到工具

---

## 🔄 更新数据到 GitHub Pages

添加或修改文章后，想把内容同步到线上看：

### 第一步：同步数据

1. 打开 `index.html`
2. 点顶栏 **🔄 按钮** → 下载 `data.json`
3. 把 `data.json` 放入 `data/` 目录，覆盖旧文件

### 第二步：推送

在 `D:\桌面\薰陶法` 文件夹空白处 **右键 → 打开终端（或 Git Bash）**，运行这一行：

```bash
git add -A; git commit -m "更新"; git push
```

> 这行命令会自动包含所有改动（新图片、修改的文件、删除的文件），一键推送。

### 第三步：查看

等 1-2 分钟，刷新 `https://tang-hao-dong.github.io/thd/` 即可看到更新。

---

## 💻 本地使用说明

直接在浏览器打开 `index.html` 即可使用（双击文件）。

### 功能

| 功能 | 说明 |
|------|------|
| 📖 添加文章 | 右下角 **+** 按钮 → 输入标题和正文 |
| 🖼️ 粘贴图片 | 在正文框按 **Ctrl+V** 粘贴截图或复制的图片 |
| 🎲 随机一篇 | 点击 **随机一篇** 按钮 |
| 🔍 搜索 | 输入关键词，实时搜索标题和正文 |
| 📋 浏览历史 | 顶栏 **📋** 按钮 → 查看最近阅读记录 |
| 🔍 查重 | 顶栏 **🔍** 按钮 → 检测相似文章 |
| ✅ 签到 | 切换到 **签到** 标签 → 每日打卡 |
| 📤 导出 | 导出全部数据（JSON） |
| 📥 导入 | 从 JSON 恢复数据到新电脑 |
| 🔄 同步 | 生成 `data.json` 用于 GitHub Pages |

### 图片存储

- 图片存在 `data/images/` 目录下
- 首次粘贴图片时会引导你选择这个文件夹

> 💡 图片不再提交到 GitHub，而是上传到 Cloudflare R2（对象存储）。

---

## ☁️ Cloudflare R2 图片存储

为了解决 GitHub 仓库大小限制，图片改为存储在 Cloudflare R2 上。

### 初次设置（只需一次）

1. 复制 `.env.example` → `.env`
2. 打开 [Cloudflare R2](https://dash.cloudflare.com/) → R2 → 创建 Bucket（如 `xuntaofa`）
3. 启用公开访问：Bucket Settings → R2.dev Domain → **Allow Access**
4. 创建 API Token：账户主页 → Manage R2 API Tokens → 创建，权限选 **Admin Read+Write**
5. 把配置填入 `.env`

```
R2_ACCOUNT_ID=你的AccountID
R2_ACCESS_KEY_ID=你的AccessKey
R2_SECRET_ACCESS_KEY=你的SecretKey
R2_BUCKET=xuntaofa
R2_PUBLIC_URL=https://xuntaofa.xxxx.r2.dev
```

6. 安装依赖：`npm install`

### 日常使用

写完文章后，在终端运行：

```bash
npm run upload
```

这会自动上传所有图片到 R2，并生成含 R2 URL 的 `data.json`。然后：

```bash
git push
```

---

## 📁 项目结构

```
薰陶法/
├── index.html          # 主程序（所有功能）
├── manifest.json       # PWA 配置
├── sw.js               # 离线缓存
├── CLAUDE.md           # 项目说明
├── upload-r2.js        # R2 图片上传脚本
├── .env.example        # R2 配置模板
├── .env                # R2 配置（不提交 git）
├── package.json        # npm 依赖（AWS S3 SDK）
├── icons/              # 应用图标
├── data/
│   ├── data.json       # 文章数据（含 R2 图片 URL）
│   ├── images/         # 图片文件（不提交 git）
│   └── .gitkeep
└── .gitignore
```
