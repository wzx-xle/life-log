import { ref } from 'vue'
import type { PlaceFormData } from '@/components/place/PlaceForm.vue'

export const mapPickResult = ref<{ lat: number; lng: number; address: string } | null>(null)

// 去地图选点前暂存的店铺表单草稿：应用无 keep-alive，返回时表单页重挂会丢失已填内容，
// 用此共享草稿在重挂时恢复（选中的新地址由 mapPickResult 覆盖）。
export const placeFormDraft = ref<PlaceFormData | null>(null)
