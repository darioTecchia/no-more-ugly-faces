import { ref, Ref } from 'vue'

export default function useLoadingModal() {
  const isLoading: Ref<boolean> = ref(false)

  function showLoading() {
    isLoading.value = true
  }

  function hideLoading() {
    isLoading.value = false
  }

  return {
    isLoading,
    showLoading,
    hideLoading
  }
}