<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useWebdavSync } from '@/composables/useWebdavSync'
import { WebdavError, type WebdavConfig } from '@/utils/webdavClient'

defineOptions({ name: 'SettingsSyncPage' })

const router = useRouter()
const { getConfig, saveConfig, getLastSync, testConnection, upload, restore } = useWebdavSync()

const form = reactive<WebdavConfig>(
  getConfig() ?? { url: '', username: '', password: '', rootPath: '/lifelog/' },
)

const showPassword = ref(false)
const testing = ref(false)
const busy = ref(false) // 上传/恢复进行中
const progressText = ref('')
const lastSyncText = ref('尚未同步')

const refreshLast = () => {
  const s = getLastSync()
  if (s) {
    lastSyncText.value = `${new Date(s.time).toLocaleString()} · ${s.action === 'upload' ? '上传' : '恢复'}`
  }
}
onMounted(refreshLast)

// 把底层错误翻译成用户可读、且能区分 CORS/认证的提示
const explainError = (e: unknown): string => {
  if (e instanceof WebdavError) {
    if (e.kind === 'network') return '连接失败：网络不可达，或服务端未放行跨域（CORS）'
    if (e.kind === 'auth') return '认证失败：请检查账号或密码'
    return e.message
  }
  return e instanceof Error ? e.message : '操作失败'
}

const hasBasics = (): boolean => !!form.url.trim() && !!form.username.trim()

const onSave = () => {
  if (!hasBasics()) {
    showToast('请填写服务地址与账号')
    return
  }
  saveConfig({ ...form })
  showToast('已保存')
}

const onTest = async () => {
  if (!hasBasics()) {
    showToast('请先填写服务地址与账号')
    return
  }
  testing.value = true
  try {
    await testConnection({ ...form })
    showToast('连接成功')
  } catch (e) {
    showToast(explainError(e))
  } finally {
    testing.value = false
  }
}

const onUpload = async () => {
  if (!hasBasics()) {
    showToast('请先填写并保存连接配置')
    return
  }
  saveConfig({ ...form })
  busy.value = true
  progressText.value = '准备上传…'
  try {
    await upload((c, t, l) => {
      progressText.value = `上传 ${l} (${c}/${t})`
    })
    showToast('上传完成')
    refreshLast()
  } catch (e) {
    showToast(explainError(e))
  } finally {
    busy.value = false
    progressText.value = ''
  }
}

const onRestore = async () => {
  if (!hasBasics()) {
    showToast('请先填写并保存连接配置')
    return
  }
  try {
    await showConfirmDialog({
      title: '确认恢复',
      message: '将用云端数据覆盖本地，本地未上传的改动会丢失。确定继续？',
      confirmButtonText: '确认恢复',
      confirmButtonColor: '#ee0a24',
    })
  } catch {
    return // 用户取消
  }
  saveConfig({ ...form })
  busy.value = true
  progressText.value = '准备恢复…'
  try {
    await restore((c, t, l) => {
      progressText.value = `恢复 ${l} (${c}/${t})`
    })
    showToast('恢复完成')
    refreshLast()
  } catch (e) {
    showToast(explainError(e))
  } finally {
    busy.value = false
    progressText.value = ''
  }
}
</script>

<template>
  <div class="sync-page">
    <van-nav-bar title="WebDAV 同步" left-arrow @click-left="router.back()" />

    <div class="sync-content">
      <div class="section-label">连接配置</div>
      <van-cell-group inset>
        <van-field v-model="form.url" label="服务地址" placeholder="https://nas.example.com/dav" />
        <van-field v-model="form.username" label="账号" placeholder="WebDAV 账号" />
        <van-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="密码"
          placeholder="建议使用应用专用密码"
        >
          <template #right-icon>
            <van-icon
              :name="showPassword ? 'eye-o' : 'closed-eye'"
              @click="showPassword = !showPassword"
            />
          </template>
        </van-field>
        <van-field v-model="form.rootPath" label="根目录" placeholder="/lifelog/" />
      </van-cell-group>

      <div class="btn-row">
        <van-button plain round size="small" :loading="testing" @click="onTest">测试连接</van-button>
        <van-button round size="small" type="primary" @click="onSave">保存</van-button>
      </div>

      <div class="section-label">同步操作</div>
      <van-cell-group inset>
        <van-cell title="上传备份" label="本地 → 云端，仅传变化分片" is-link :class="{ disabled: busy }" @click="!busy && onUpload()" />
        <van-cell title="下载恢复" label="云端 → 覆盖本地（会丢失本地未上传改动）" is-link title-class="danger-text" :class="{ disabled: busy }" @click="!busy && onRestore()" />
      </van-cell-group>

      <div v-if="busy" class="progress">
        <van-loading size="18px">{{ progressText }}</van-loading>
      </div>

      <div class="section-label">状态</div>
      <van-cell-group inset>
        <van-cell title="上次同步" :value="lastSyncText" />
      </van-cell-group>

      <p class="hint">
        提示：浏览器直连 WebDAV 需服务端放行跨域（CORS，含 PROPFIND/PUT/MKCOL 方法与 Authorization 头）。
        凭证保存在本机浏览器，请仅用于自有服务。
      </p>
    </div>
  </div>
</template>

<style scoped>
.sync-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: var(--safe-bottom);
}

.sync-content {
  padding: var(--spacing-md) 0 var(--spacing-xl);
}

.section-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-sm);
}

.btn-row {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg) 0;
}

.progress {
  padding: var(--spacing-md) var(--spacing-lg);
}

.sync-page :deep(.danger-text) {
  color: var(--color-danger);
}

.sync-page :deep(.disabled) {
  opacity: 0.5;
  pointer-events: none;
}

.hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  padding: var(--spacing-lg);
}
</style>
