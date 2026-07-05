# 薰陶法 — 部署与使用指南

> 个人文章管理与每日签到工具

---

## 📖 目录

- [第一次部署到 GitHub Pages](#-第一次部署到-github-pages)
- [日常更新数据](#-日常更新数据)
- [本地使用说明](#-本地使用说明)

---

## 🚀 第一次部署到 GitHub Pages

### 前置条件

- 已注册 [GitHub](https://github.com) 账号
- 已创建仓库（如 `thd`）

### 第一步：生成 GitHub Token（个人访问令牌）

GitHub 从 2021 年起不允许用密码推送代码，需要用 **Token**。

1. 打开 https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 填写以下信息：
   - **Note**：填写 `薰陶法`（随便写，给你自己看的）
   - **Expiration**：选 **No expiration**（永不过期）
   - **Scopes**：勾选 **repo**（全部勾上）
4. 滚动到底部点击 **Generate token**
5. **立即复制** 生成的 token（一串字母和数字，如 `ghp_xxxxxxxxxxxxxxxxxxxx`）
   > ⚠️ 关掉页面后就看不到了，复制后先粘贴到记事本保存

### 第二步：在 app 中同步数据

1. 打开 `index.html`
2. 点击顶栏 **🔄 按钮**
3. 浏览器会下载一个 `data.json` 文件
4. 把 `data.json` **复制/剪切**到 `data/` 目录下，覆盖旧的

### 第三步：打开终端

**方式一**：在文件夹地址栏输入 `cmd` 按回车
![在地址栏输入 cmd](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9pLmxvbGkubmV0LzIwMjAvMDMvMDkvYWhhVHo4NjdYZVdrN0U4LnBuZw)

**方式二**：按 `Win + R` → 输入 `cmd` 回车 → 输入以下命令跳转到项目目录：

```bash
cd /d D:\桌面\薰陶法
```

### 第四步：设置 Git 用户信息（仅第一次）

```bash
git config user.email "你的邮箱@example.com"
git config user.name "tang-hao-dong"
```

> 邮箱用你 GitHub 注册的邮箱，名字用你的 GitHub 用户名

### 第五步：设置远程仓库并推送

**一行一行复制，每粘贴一行按回车：**

```bash
git remote add origin https://github.com/tang-hao-dong/thd.git
```

```bash
git branch -M main
```

```bash
git add data/images/ data/data.json
```

```bash
git commit -m "迁移图片和文章数据"
```

```bash
git push -u origin main
```

**运行 `git push` 时：**
- 弹出窗口要求登录 → 选 **Sign in with your browser**（浏览器登录）
- 或者弹窗用户名密码 → 用户名填 GitHub 用户名，密码填 **刚才复制的 Token**（不是 GitHub 密码）
- 如果没有弹窗，终端会提示输入用户名和密码，同样用 Token 代替密码

### 第六步：启用 GitHub Pages

1. 浏览器打开 `https://github.com/tang-hao-dong/thd`
2. 点击顶部 **Settings**
3. 左侧菜单点击 **Pages**
4. 在 **Branch** 下拉选 `main`
5. 文件夹选 `/ (root)`
6. 点击 **Save**
7. 等 2-3 分钟，访问 `https://tang-hao-dong.github.io/thd/`

> 如果打开是空白，等几分钟再刷新。第一次部署需要时间。

---

## 🔄 日常更新数据

以后加了新文章，想同步到线上看：

### 第一步：生成数据

1. 打开 `index.html`
2. 点顶栏 **🔄 按钮** → 下载 `data.json`
3. 把 `data.json` 放入 `data/` 目录，覆盖旧文件

### 第二步：推送

在 `D:\桌面\薰陶法` 目录打开终端，依次运行：

```bash
git add data/
git commit -m "更新数据"
git push
```

> `"更新数据"` 是本次提交的说明，可以改成你想写的内容，比如 `"添加了3篇文章"`，英文也可以。

### 第三步：查看

等 1-2 分钟，刷新 `https://tang-hao-dong.github.io/thd/` 即可看到更新。

> 第二次以后不用再输入用户名密码。

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
- `data/images/` 会跟随 git 一起推送到 GitHub，线上也能看到图

---

## 📁 项目结构

```
薰陶法/
├── index.html          # 主程序（所有功能）
├── manifest.json       # PWA 配置
├── sw.js               # 离线缓存
├── CLAUDE.md           # 项目说明
├── icons/              # 应用图标
├── data/
│   ├── data.json       # 文章数据（同步生成）
│   ├── images/         # 图片文件
│   └── .gitkeep
└── .gitignore
```
