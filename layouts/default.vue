<template>
  <div>
    ciao
    <Splash v-if="true" />
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