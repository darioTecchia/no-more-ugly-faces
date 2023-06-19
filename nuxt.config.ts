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
      script: [
        {
          type: 'text/javascript',
          src: 'mesh/face_mesh/face_mesh.js',
        },
      ]
    },
    baseURL: '/no-more-ugly-faces/'
  },
  build: {
    transpile: ["primevue"]
  },
  modules: [
  ],
  css: [
    'primevue/resources/primevue.min.css',
    'primevue/resources/themes/lara-light-blue/theme.css',
    'primeflex/primeflex.scss',
    'primeflex/themes/primeone-light.scss',
    'primeicons/primeicons.css',
    '@/assets/style/main.scss',
  ]
})