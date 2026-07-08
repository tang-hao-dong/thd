# 薰陶法 — 部署与使用指南

> 个人文章管理与每日签到工具

---

## 🔄 更新数据到 GitHub Pages

添加或修改文章后，想把内容同步到线上看：

### 第一步：同步文章数据

1. 打开 `index.html`
2. 点顶栏 **🔄 按钮** → 下载 `data.json`
3. 把 `data.json` 放入 `data/` 目录，覆盖旧文件

### 第二步：上传图片到 R2

在 `D:\桌面\薰陶法` 文件夹空白处 **右键 → 打开终端**，运行：

```bash
npm run upload
```

> 首次使用前需运行 `npm install` 安装依赖，并配置 `.env`（参见下方 Cloudflare R2 设置）。
>
> 已上传过的图片会自动跳过，仅上传新增或修改的图片。如需全部重传，使用 `npm run upload -- --force`。

### 第三步：推送到 GitHub

```bash
git push
```

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
| 🔄 同步 | 导出 IndexedDB 文章数据到 `data.json` |

### 图片存储

- 图片存在本地 `data/images/` 目录下
- 首次粘贴图片时会引导你选择这个文件夹
- 图片通过 `upload-r2.js` 上传到 Cloudflare R2，不提交到 Git

---

## ☁️ Cloudflare R2 图片存储

### 初次设置（只需一次）

1. 复制 `.env.example` → `.env`，填入 R2 配置
2. 在 [Cloudflare R2](https://dash.cloudflare.com/) 创建 Bucket
3. Bucket Settings → R2.dev Domain → **Allow Access**
4. Manage R2 API Tokens → 创建 Token，权限选 **Admin Read+Write**
5. 将以下信息填入 `.env`：

```
R2_ACCOUNT_ID=你的AccountID
R2_ACCESS_KEY_ID=你的AccessKey
R2_SECRET_ACCESS_KEY=你的SecretKey
R2_BUCKET=你的Bucket名
R2_PUBLIC_URL=https://你的Bucket.xxxx.r2.dev
```

6. 安装依赖：

```bash
npm install
```

### 日常使用

写完文章后三步走：

```bash
# 1. 先在 app 中点 🔄 按钮，把 data.json 放入 data/
# 2. 上传图片到 R2
npm run upload
# 3. 推送
git push
```

> `npm run upload` 会自动跳过已上传的图片，只传新增或修改过的。

---

## 📁 项目结构

```
薰陶法/
├── index.html          # 主程序（所有功能）
├── manifest.json       # PWA 配置
├── sw.js               # 离线缓存
├── upload-r2.js        # R2 图片上传脚本
├── .env.example        # R2 配置模板
├── .env                # R2 配置（不提交）
├── package.json        # npm 依赖
├── icons/              # 应用图标
├── data/
│   ├── data.json       # 文章数据（含 R2 图片 URL）
│   ├── images/         # 图片文件（不提交）
│   └── .gitkeep
└── .gitignore
```
