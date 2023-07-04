<template>
  <div>
    <Splash v-if="showSplash" />
    <Header />
    <NuxtPage />
  </div>
</template>

<script lang="ts">
export default defineNuxtComponent({
  data() {
    return {
      showSplash: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.showSplash = false;
    }, 1000);
  }
})
</script>