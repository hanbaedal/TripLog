import { copyFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const android = join(root, 'android')
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
const jbr = 'C:\\Program Files\\Android\\Android Studio1\\jbr'
const javaHome = existsSync(join(jbr, 'bin', 'java.exe')) ? jbr : process.env.JAVA_HOME

if (!existsSync(join(sdk, 'platform-tools'))) {
  console.error('Android SDK not found. Install Android Studio first.')
  process.exit(1)
}
if (!javaHome) {
  console.error('JAVA_HOME / Android Studio JBR not found.')
  process.exit(1)
}

writeFileSync(join(android, 'local.properties'), `sdk.dir=${sdk.replace(/\\/g, '\\\\')}\n`)

const env = {
  ...process.env,
  ANDROID_HOME: sdk,
  ANDROID_SDK_ROOT: sdk,
  JAVA_HOME: javaHome,
}

const gradlew = join(android, 'gradlew.bat')
const result = spawnSync(gradlew, ['assembleDebug', '--no-daemon'], {
  cwd: android,
  env,
  stdio: 'inherit',
  shell: true,
})

if (result.status !== 0) {
  process.exit(result.status || 1)
}

const built = join(android, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
const outDir = join(root, 'release')
mkdirSync(outDir, { recursive: true })
const dest = join(outDir, 'triplog.apk')
copyFileSync(built, dest)
console.log(`APK: ${dest}`)
