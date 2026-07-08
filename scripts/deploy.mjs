import { Client } from 'basic-ftp'
import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

const envPath = join(rootDir, '.env.ftp')
if (!existsSync(envPath)) {
  console.error('❌ 缺少 .env.ftp 配置文件，请先创建并填写 FTP 信息')
  process.exit(1)
}

const env = parse(readFileSync(envPath, 'utf-8'))

const config = {
  host: env.FTP_HOST || '',
  port: parseInt(env.FTP_PORT || '21', 10),
  user: env.FTP_USER || '',
  password: env.FTP_PASSWORD || '',
  root: env.FTP_ROOT || '/',
}

if (!config.host || !config.user || !config.password) {
  console.error('❌ 请在 .env.ftp 中填写 FTP_HOST、FTP_USER、FTP_PASSWORD')
  process.exit(1)
}

console.log(`📦 构建中...`)
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' })

console.log(`\n🚀 上传到 ${config.host}${config.root} ...`)

const client = new Client()
client.ftp.verbose = false

try {
  await client.access({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    secure: false,
  })

  await client.ensureDir(config.root)
  await client.clearWorkingDir()
  await client.uploadFromDir(join(rootDir, 'dist'))

  console.log(`✅ 部署完成 → ${config.host}${config.root}`)
} catch (err) {
  console.error(`❌ 部署失败: ${err.message}`)
  process.exit(1)
} finally {
  client.close()
}
