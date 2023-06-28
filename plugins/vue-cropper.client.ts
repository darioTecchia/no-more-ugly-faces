import { Cropper, Preview } from 'vue-advanced-cropper'

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.component('Cropper', Cropper)
  vueApp.component('Preview', Preview)
})