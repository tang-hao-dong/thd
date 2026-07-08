/**
 * 薰陶法 — R2 图片上传脚本
 *
 * 用法:
 *   1. 复制 .env.example → .env，填入 R2 配置
 *   2. npm install
 *   3. npm run upload (或 node upload-r2.js)
 *
 * 功能:
 *   1. 扫描 data/images/ 下的图片，上传新增/修改的
 *   2. 自动删除 R2 上本地已不存在的图片
 *   3. 本地未变化的图片保持不动
 *   4. 生成含 R2 URL 的 data/data.json
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// ===== 读取 .env =====
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ 请先创建 .env 文件（参考 .env.example）');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = process.env;

// 检查必要配置
const missing = [];
for (const [k, v] of Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL })) {
  if (!v) missing.push(k);
}
if (missing.length) {
  console.error(`❌ .env 中缺少: ${missing.join(', ')}`);
  process.exit(1);
}

// 去掉尾部斜杠
const publicBase = R2_PUBLIC_URL.replace(/\/$/, '');

// ===== 初始化 S3 客户端 =====
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ===== 工具函数 =====

/** 获取 Content-Type */
function mimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = { '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.gif':'image/gif' };
  return map[ext] || 'application/octet-stream';
}

/** 递归扫描目录获取所有文件 */
function scanDir(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDir(full, base));
    } else if (entry.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name)) {
      results.push({ path: full, key: path.relative(base, full).replace(/\\/g, '/') });
    }
  }
  return results;
}

// ===== 主流程 =====
async function main() {
  const imagesDir = path.join(__dirname, 'data', 'images');
  const dataJsonPath = path.join(__dirname, 'data', 'data.json');

  // 读取已上传记录
  const manifestPath = path.join(__dirname, 'data', '.r2-uploaded.json');
  const uploadedBefore = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) : {};
  const forceAll = process.argv.includes('--force');

  console.log('📁 扫描图片目录...');
  const allImages = scanDir(imagesDir);
  // 过滤：只上传新文件或修改过的文件
  const images = forceAll
    ? allImages
    : allImages.filter(({ path: filePath, key }) => {
        const mtime = fs.statSync(filePath).mtimeMs;
        return !uploadedBefore[key] || uploadedBefore[key] !== mtime;
      });

  if (allImages.length === 0) {
    console.log('⚠️ 没有图片需要上传，直接生成 data.json');
  } else if (images.length === 0) {
    console.log(`✅ ${allImages.length} 张图片均未变化，跳过上传`);
  } else {
    console.log(`   共 ${allImages.length} 张，其中 ${images.length} 张需要上传${forceAll ? ' (强制)' : ''}`);
  }

  // 并行上传（每批10张，大幅提速）
  let uploaded = 0, failed = 0, finished = 0, newManifest = {};
  const batchSize = 10;

  async function uploadOne({ path: filePath, key }) {
    try {
      const body = fs.readFileSync(filePath);
      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: mimeType(filePath),
      }));
      // 记录成功上传的文件
      newManifest[key] = fs.statSync(filePath).mtimeMs;
      uploaded++;
    } catch (err) {
      if (err.name === 'NoSuchBucket') {
        console.error(`\n❌ Bucket "${R2_BUCKET}" 不存在，请检查 R2 配置`);
        process.exit(1);
      }
      console.error(`\n⚠️ 上传失败: ${key} — ${err.message}`);
      failed++;
    } finally {
      finished++;
      const pct = Math.round((finished / images.length) * 100);
      process.stdout.write(`\r   [${'='.repeat(Math.floor(pct/5))}${' '.repeat(20-Math.floor(pct/5))}] ${pct}%  (${finished}/${images.length})`);
    }
  }

  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    await Promise.all(batch.map(uploadOne));
  }
  process.stdout.write('\r                                          \r');
  console.log(`✅ 上传完成: ${uploaded} 张成功, ${failed} 张失败`);

  // 合并记录
  const final = { ...uploadedBefore, ...newManifest };

  // === 清理：自动删除 R2 上本地不存在的图片 ===
  const localKeys = new Set(allImages.map(({ key }) => key));
  const orphans = Object.keys(uploadedBefore).filter(k => !localKeys.has(k));
  if (orphans.length > 0) {
    console.log(`🧹 清理 R2 中 ${orphans.length} 个已删除的图片...`);
    let cleaned = 0;
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    for (const key of orphans) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
        delete final[key];
        cleaned++;
      } catch (e) {
        console.error(`\n⚠️ 删除失败: ${key} — ${e.message}`);
      }
    }
    console.log(`✅ 清理完成: ${cleaned} 张`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(final), 'utf-8');

  // 生成 R2 URL 映射（包含所有图片，不限于本次上传的）
  const urlMap = {};
  for (const { key } of allImages) {
    urlMap[key] = `${publicBase}/${key}`;
  }

  // 生成 data.json
  console.log('📝 生成 data.json...');
  if (!fs.existsSync(dataJsonPath)) {
    console.log('⚠️ data.json 不存在，创建空数据');
    const empty = { version: 2, exportedAt: new Date().toISOString(), articles: [], checkins: null };
    fs.writeFileSync(dataJsonPath, JSON.stringify(empty, null, 2));
  }

  const data = JSON.parse(fs.readFileSync(dataJsonPath, 'utf-8'));
  if (data.articles) {
    for (const article of data.articles) {
      if (article.images && article.images.length > 0) {
        article.images = article.images.map(img => {
          // 已经是完整 URL 则不管
          if (typeof img === 'string' && img.startsWith('http')) return img;
          // 本地文件名 → R2 URL
          const name = typeof img === 'string' ? img : (img.name || '');
          if (urlMap[name]) return urlMap[name];
          // 不在映射中的保持原样
          return img;
        });
      }
    }
  }

  fs.writeFileSync(dataJsonPath, JSON.stringify(data, null, 2));
  console.log('✅ data.json 已更新');

  console.log(`
🎉 全部完成！
  现在运行 git push 即可将更新推送到 GitHub Pages。
  网页版将从 R2 加载图片（${publicBase}/...）
`);
}

main().catch(err => {
  console.error('❌ 脚本出错:', err.message);
  process.exit(1);
});
