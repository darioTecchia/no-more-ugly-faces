<template>
  <div class="splash">
    <h1 class="m-5">Project No More Ugly Faces</h1>
    <h2 class="m-5 mt-0 ">
      Scarico e inizializzo le risorse necessarie.
      <br>
      Si prega di attendere qualche istante.
    </h2>
    <LogoNTT class="m-5 mt-0 mb-0 w-3" />
  </div>
</template>

<style lang="scss">
.splash {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  background-color: white;

  text-align: center;

  z-index: 9999;
}
</style>