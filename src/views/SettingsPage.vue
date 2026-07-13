<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useLock } from '@/composables/useLock'
import { useExport } from '@/utils/exportData'
import { useImport } from '@/utils/importData'
import { useWebdavSync } from '@/composables/useWebdavSync'
import PinInputPopup from '@/components/lock/PinInputPopup.vue'

const router = useRouter()

const { createPassword, changePassword, resetPassword, isPasswordSet } = useLock()
const { downloadExport } = useExport()
const { validateFormat, importMerge, importOverwrite } = useImport()
const { getLastSync } = useWebdavSync()

// WebDAV 入口右侧摘要：上次同步日期或未同步（返回本页时刷新）
const syncSummary = ref('未同步')
const refreshSyncSummary = () => {
  const s = getLastSync()
  if (!s) {
    syncSummary.value = '未同步'
    return
  }
  const d = new Date(s.time)
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  syncSummary.value = `${s.action === 'upload' ? '上传' : '恢复'} ${md}`
}
onMounted(refreshSyncSummary)
onActivated(refreshSyncSummary)

const pwdEnabled = ref(localStorage.getItem('pwd_enabled') === 'true')
const autoLockMinutes = ref(Number(localStorage.getItem('auto_lock_minutes') || '5'))

const showAutoLockPicker = ref(false)

// 密码 4 位 PIN 录入状态机（创建/修改共用一个弹窗，体验与解锁界面一致）
const showPinPopup = ref(false)
const pinMode = ref<'create' | 'change'>('create')
const pinStep = ref<'current' | 'new' | 'confirm'>('new')
const pinTitle = ref('')
const pinSubtitle = ref('')
const pinError = ref('')
let firstPin = ''
let currentPinInput = ''

const stepTexts = {
  create: {
    new: { title: '设置密码', subtitle: '输入 4 位数字密码' },
    confirm: { title: '确认密码', subtitle: '再次输入以确认' },
  },
  change: {
    current: { title: '当前密码', subtitle: '输入当前 4 位密码' },
    new: { title: '新密码', subtitle: '输入 4 位数字新密码' },
    confirm: { title: '确认新密码', subtitle: '再次输入新密码' },
  },
} as const

function setPinStep(step: 'current' | 'new' | 'confirm') {
  pinStep.value = step
  const texts = (stepTexts[pinMode.value] as Record<string, { title: string; subtitle: string }>)[step]
  pinTitle.value = texts.title
  pinSubtitle.value = texts.subtitle
}

const autoLockOptions = [
  { text: '立即', value: 0 },
  { text: '1分钟', value: 1 },
  { text: '5分钟', value: 5 },
  { text: '15分钟', value: 15 },
]

const autoLockText = computed(() => {
  const opt = autoLockOptions.find((o) => o.value === autoLockMinutes.value)
  return opt?.text || '5分钟'
})

async function onPwdToggle(val: boolean) {
  if (val) {
    pinMode.value = 'create'
    firstPin = ''
    pinError.value = ''
    setPinStep('new')
    showPinPopup.value = true
  } else {
    try {
      await showConfirmDialog({
        title: '关闭密码锁',
        message: '关闭后将不再需要密码验证，确定要关闭吗？',
      })
      localStorage.setItem('pwd_enabled', 'false')
      localStorage.removeItem('pwd_hash')
      sessionStorage.removeItem('unlock_time')
      pwdEnabled.value = false
      showToast('密码锁已关闭')
    } catch {
      return
    }
  }
}

function openChangePwd() {
  pinMode.value = 'change'
  firstPin = ''
  currentPinInput = ''
  pinError.value = ''
  setPinStep('current')
  showPinPopup.value = true
}

async function onPinComplete(pin: string) {
  pinError.value = ''
  if (pinMode.value === 'create') {
    if (pinStep.value === 'new') {
      firstPin = pin
      setPinStep('confirm')
      return
    }
    // confirm
    if (pin !== firstPin) {
      pinError.value = '两次密码不一致，请重新输入'
      firstPin = ''
      setPinStep('new')
      return
    }
    await createPassword(pin)
    pwdEnabled.value = true
    showPinPopup.value = false
    showToast('密码设置成功')
    return
  }

  // change
  if (pinStep.value === 'current') {
    currentPinInput = pin
    setPinStep('new')
    return
  }
  if (pinStep.value === 'new') {
    firstPin = pin
    setPinStep('confirm')
    return
  }
  // confirm
  if (pin !== firstPin) {
    pinError.value = '两次密码不一致，请重新输入'
    firstPin = ''
    setPinStep('new')
    return
  }
  const ok = await changePassword(currentPinInput, firstPin)
  if (ok) {
    showPinPopup.value = false
    showToast('密码修改成功')
  } else {
    pinError.value = '当前密码错误'
    currentPinInput = ''
    firstPin = ''
    setPinStep('current')
  }
}

async function handleResetPwd() {
  const ok = await resetPassword()
  if (ok) pwdEnabled.value = false
}

const autoLockPickerValue = ref<number[]>([autoLockMinutes.value])

function openAutoLockPicker() {
  autoLockPickerValue.value = [autoLockMinutes.value]
  showAutoLockPicker.value = true
}

function onAutoLockConfirm({ selectedOptions }: any) {
  const val = selectedOptions[0]?.value
  autoLockMinutes.value = val
  localStorage.setItem('auto_lock_minutes', String(val))
  showAutoLockPicker.value = false
}

const fileInput = ref<HTMLInputElement>()
const showImportSheet = ref(false)
let pendingImport: Awaited<ReturnType<typeof parseImportFile>> | null = null
const importActions = [
  { name: '合并导入（保留现有数据）' },
  { name: '覆盖导入（清空后导入）' },
]

async function handleExport() {
  try {
    await downloadExport()
  } catch {
    showToast('导出失败')
  }
}

function handleImport() {
  fileInput.value?.click()
}

async function parseImportFile(file: File) {
  const text = await file.text()
  const data = JSON.parse(text)
  return validateFormat(data) ? data : null
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const data = await parseImportFile(file)
    if (!data) {
      showToast('文件格式错误')
      return
    }
    pendingImport = data
    showImportSheet.value = true
  } catch {
    showToast('文件解析失败')
  } finally {
    input.value = ''
  }
}

async function onImportSelect(_action: { name: string }, index: number) {
  showImportSheet.value = false
  if (!pendingImport) return
  const data = pendingImport
  pendingImport = null
  try {
    if (index === 1) {
      await showConfirmDialog({
        title: '覆盖导入',
        message: '将清空现有全部店铺与记录后导入，此操作不可恢复，确定继续吗？',
      })
      const result = await importOverwrite(data)
      showToast(`导入成功：${result.placesCount} 个店铺，${result.reviewsCount} 条记录`)
    } else {
      const result = await importMerge(data)
      showToast(`导入成功：${result.placesCount} 个店铺，${result.reviewsCount} 条记录`)
    }
  } catch {
    // 覆盖确认被取消或导入出错
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <span class="page-title">设置</span>
    </div>

    <div class="settings-content">
        <div class="section-label">安全设置</div>
        <van-cell-group inset>
          <van-cell title="密码锁" center>
            <template #right-icon>
              <van-switch
                :model-value="pwdEnabled"
                size="24px"
                @update:model-value="onPwdToggle"
              />
            </template>
          </van-cell>
          <van-cell
            title="自动锁定时间"
            :value="autoLockText"
            is-link
            @click="openAutoLockPicker"
          />
          <van-cell
            v-if="isPasswordSet() || pwdEnabled"
            title="修改密码"
            is-link
            @click="openChangePwd"
          />
          <van-cell
            v-if="isPasswordSet() || pwdEnabled"
            title="重置密码"
            is-link
            title-class="danger-text"
            @click="handleResetPwd"
          />
        </van-cell-group>

        <div class="section-label">数据管理</div>
        <van-cell-group inset>
          <van-cell title="分类管理" is-link @click="router.push({ name: 'categoryManage' })" />
          <van-cell title="导出数据" is-link @click="handleExport" />
          <van-cell title="导入数据" is-link @click="handleImport" />
          <van-cell title="WebDAV 同步" :value="syncSummary" is-link @click="router.push({ name: 'settingsSync' })" />
        </van-cell-group>

        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          style="display: none"
          @change="onFileChange"
        />
        <van-action-sheet
          v-model:show="showImportSheet"
          :actions="importActions"
          cancel-text="取消"
          close-on-click-action
          @select="onImportSelect"
        />

        <div class="section-label">关于</div>
        <van-cell-group inset>
          <van-cell title="应用名称" value="LifeLog" />
          <van-cell title="版本号" value="1.0.5" />
          <van-cell title="隐私说明" label="默认仅存储在本地浏览器；开启 WebDAV 同步后会上传到你配置的服务" />
        </van-cell-group>

        <van-popup v-model:show="showAutoLockPicker" position="bottom" round>
          <van-picker
            v-model="autoLockPickerValue"
            :columns="autoLockOptions"
            title="选择自动锁定时间"
            @confirm="onAutoLockConfirm"
            @cancel="showAutoLockPicker = false"
          />
        </van-popup>

        <PinInputPopup
          v-model:show="showPinPopup"
          :title="pinTitle"
          :subtitle="pinSubtitle"
          :error="pinError"
          @complete="onPinComplete"
        />
      </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding-bottom: var(--safe-bottom);
}

.page-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.settings-content {
  padding: var(--spacing-lg);
}

.section-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: 8px 16px 6px;
}

.danger-text {
  color: var(--color-danger);
}
</style>
