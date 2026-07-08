<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useLock } from '@/composables/useLock'

const router = useRouter()

const { createPassword, changePassword, resetPassword, isPasswordSet } = useLock()

const pwdEnabled = ref(localStorage.getItem('pwd_enabled') === 'true')
const autoLockMinutes = ref(Number(localStorage.getItem('auto_lock_minutes') || '5'))

const showAutoLockPicker = ref(false)
const showCreatePwdDialog = ref(false)
const showChangePwdDialog = ref(false)

const newPwd = ref('')
const confirmPwd = ref('')
const currentPwd = ref('')
const changeNewPwd = ref('')
const changeConfirmPwd = ref('')

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
    newPwd.value = ''
    confirmPwd.value = ''
    showCreatePwdDialog.value = true
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

async function handleCreatePwd() {
  if (!newPwd.value || newPwd.value.length < 4) {
    showToast('密码至少4位')
    return
  }
  if (newPwd.value !== confirmPwd.value) {
    showToast('两次密码不一致')
    return
  }
  await createPassword(newPwd.value)
  pwdEnabled.value = true
  showCreatePwdDialog.value = false
  showToast('密码设置成功')
}

function openChangePwd() {
  currentPwd.value = ''
  changeNewPwd.value = ''
  changeConfirmPwd.value = ''
  showChangePwdDialog.value = true
}

async function handleChangePwd() {
  if (!currentPwd.value) {
    showToast('请输入当前密码')
    return
  }
  if (!changeNewPwd.value || changeNewPwd.value.length < 4) {
    showToast('新密码至少4位')
    return
  }
  if (changeNewPwd.value !== changeConfirmPwd.value) {
    showToast('两次密码不一致')
    return
  }
  const ok = await changePassword(currentPwd.value, changeNewPwd.value)
  if (ok) {
    showChangePwdDialog.value = false
    showToast('密码修改成功')
  } else {
    showToast('当前密码错误')
  }
}

async function handleResetPwd() {
  await resetPassword()
  pwdEnabled.value = false
}

function onAutoLockConfirm({ selectedOptions }: any) {
  const val = selectedOptions[0]?.value
  autoLockMinutes.value = val
  localStorage.setItem('auto_lock_minutes', String(val))
  showAutoLockPicker.value = false
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
            @click="showAutoLockPicker = true"
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
          <van-cell title="导出数据" is-link @click="$emit('export')" />
          <van-cell title="导入数据" is-link @click="$emit('import')" />
        </van-cell-group>

        <div class="section-label">关于</div>
        <van-cell-group inset>
          <van-cell title="应用名称" value="LifeLog" />
          <van-cell title="版本号" value="1.0.2" />
          <van-cell title="隐私说明" label="所有数据仅存储在本地浏览器，不会上传至任何服务器" />
        </van-cell-group>

        <van-popup v-model:show="showAutoLockPicker" position="bottom" round>
          <van-picker
            :columns="autoLockOptions"
            title="选择自动锁定时间"
            @confirm="onAutoLockConfirm"
            @cancel="showAutoLockPicker = false"
          />
        </van-popup>

        <van-dialog
          v-model:show="showCreatePwdDialog"
          title="设置密码"
          show-cancel-button
          @confirm="handleCreatePwd"
        >
          <div class="dialog-body">
            <van-field
              v-model="newPwd"
              type="password"
              placeholder="请输入密码（至少4位）"
              maxlength="20"
            />
            <van-field
              v-model="confirmPwd"
              type="password"
              placeholder="请确认密码"
              maxlength="20"
            />
          </div>
        </van-dialog>

        <van-dialog
          v-model:show="showChangePwdDialog"
          title="修改密码"
          show-cancel-button
          @confirm="handleChangePwd"
        >
          <div class="dialog-body">
            <van-field
              v-model="currentPwd"
              type="password"
              placeholder="请输入当前密码"
              maxlength="20"
            />
            <van-field
              v-model="changeNewPwd"
              type="password"
              placeholder="请输入新密码（至少4位）"
              maxlength="20"
            />
            <van-field
              v-model="changeConfirmPwd"
              type="password"
              placeholder="请确认新密码"
              maxlength="20"
            />
          </div>
        </van-dialog>
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

.dialog-body {
  padding: 12px 16px;
}

.danger-text {
  color: var(--color-danger);
}
</style>
