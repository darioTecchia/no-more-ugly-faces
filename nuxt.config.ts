// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      title: 'Project No More Ugly Faces',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Project No More Ugly Faces' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg', href: '/favicon.svg' }
      ],
    },
    baseURL: '/no-more-ugly-faces/'
  },
  css: [
    '~/node_modules/bootstrap/scss/bootstrap.scss',
    '~/node_modules/@fortawesome/fontawesome-free/scss/fontawesome.scss',
    '~/node_modules/@fortawesome/fontawesome-free/scss/regular.scss',
    '~/node_modules/@fortawesome/fontawesome-free/scss/solid.scss',
    '~/node_modules/@fortawesome/fontawesome-free/scss/brands.scss',
    '~/node_modules/vue-advanced-cropper/dist/style.css',
    '@/assets/style/main.scss',
  ]
})