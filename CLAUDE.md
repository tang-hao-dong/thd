# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

薰陶法 — 纯前端 PWA，文章管理与每日签到工具。无构建步骤，无后端依赖，浏览器直接打开 `index.html` 即可运行。

## 运行与测试

```bash
# 直接在浏览器打开（唯一的启动方式）
start index.html

# 语法校验
node -e "new Function(document.querySelector('script').textContent)"
```

无测试框架。手动测试路径：添加文章 → Ctrl+V 粘贴图片 → 保存 → 随机一篇 → 签到标签打卡。

## 架构：6 模块，单文件

全部代码在 `index.html` 内，`<style>` 块 + `<script>` 块。6 个全局模块按依赖顺序排列：

| 模块 | 行号 | 职责 |
|------|------|------|
| `Utils` | ~392 | generateId, formatDate, truncate, formatFileSize |
| `DB` | ~421 | IndexedDB v2 封装，3 个 object store：`articles`（主键 `id`）、`checkins`（主键 `id`）、`folder_handle`（key `image_folder`） |
| `ImageManager` | ~613 | 图片校验（类型、单张 <2MB）、canvas 压缩（长边 >1920px 缩小至 1920） |
| `FolderManager` | ~665 | File System Access API 封装。文件夹句柄持久化到 IndexedDB。`saveImage(blob)` 写入本地文件夹，返回文件名 |
| `UI` | ~777 | 纯渲染函数 + _editorExistingImages/_editorNewFiles 编辑态数组。关键方法：`renderArticleList`、`openArticleDetail`、`openArticleEditor`、`renderCheckinView`、`_renderInlineContent` |
| `App` | ~1160 | 入口 `init()`，事件委托路由（`data-action` 分发），状态：`currentTab` |

## 数据流

- **文章存储**：文字和 imageNames 在 IndexedDB `articles` store，图片二进制文件在用户选择的本地文件夹（通过 File System Access API 的 `showDirectoryPicker`）
- **签到存储**：IndexedDB `checkins` store，单条记录 key=`checkin_data`
- **图片编辑态**：`UI._editorExistingImages`（字符串文件名数组）和 `UI._editorNewFiles`（Blob 数组）在编辑器打开时初始化，保存时合并处理

## 图片 + 文本内联

正文中 `[图片]` 是图片占位标记，粘贴时按 DOM 树中图片的原始位置插入。查看时 `_renderInlineContent()` 将标记替换为实际图片（从文件夹读取）。保存时根据标记数量自动裁剪多余图片。

CORS 限制：外部网页的图片（URL 引用的）通常无法跨域下载，粘贴时标记为 `[图片缺失]`。截图和 base64 图片正常。

## 关键技术约束

- File System Access API 仅 Chrome/Edge 支持（86+）
- IndexedDB v2 需要 `onupgradeneeded` 中创建 `folder_handle` store
- iOS 上不支持文件夹存储，但应用本身可在 iOS Safari 中运行（只是图片只能用旧式 Blob 存 IndexedDB）
- PWA 离线缓存由 `sw.js` 处理，缓存 index.html 自身，数据由 IndexedDB 持久化
- 配色主题定义在 `:root` CSS 变量中：主色 `#8B5E3C`（暖棕色），背景 `#FDF8F3`（奶油色）
