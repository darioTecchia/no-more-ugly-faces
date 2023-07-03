<template>
  <header class="p-3">
    <LogoNTT />
  </header>
</template>

<script lang="ts">
export default defineNuxtComponent({
  name: "header",
})
</script>

<style lang="scss">
header {
  background: rgb(103, 133, 193);
  position: sticky;
  top: 0;
  z-index: 9999999;

  svg {
    width: 140px;

    g {
      fill: #000;
    }
  }
}
</style>