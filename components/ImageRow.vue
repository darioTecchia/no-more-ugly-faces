<template>
  <div class="card mb-3" :class="{ 'border-danger': source.toRemove }">
    <div class="card-header d-flex justify-content-between align-items-center">
      {{ source.fileName }}

      <div class="align-items-center d-flex">
        <a class="icon-link" :download="`${source.fileName}.png`" :href="source.faces[0]">
          <button type="button" class="btn btn-sm me-4 p-0">
            <i v-if="source.faces.length == 1" class="fa-solid fa-download"></i>
          </button>
        </a>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input" aria-label="Rimuovi" v-model="source.toRemove" type="checkbox" role="switch"
            id="keepCheck">
        </div>
      </div>

    </div>

    <div class="card-body d-flex align-items-center justify-content-between">
      <div class="align-items-center d-flex w-75">
        <img :class="{ 'opacity-50': source.toRemove }" class="source-image me-5 w-25" :src="source.image.src" />

        <div :class="{ 'opacity-50': source.toRemove }" class="w-25" v-if="source.faces.length == 1">
          <a v-for="face of source.faces" :download="`${source.fileName}.png`" :href="face">
            <img class="source-image preview w-100" :src="face" />
          </a>
        </div>
        <div class="w-25" v-else-if="source.faces.length == 0">
          Non sono stati identificati volti! Si consiglia di riprovare.
        </div>
        <div class="w-25" v-else>
          Troppi volti.
        </div>
      </div>

      <div class="w-25">
        <div class="row">
          <div class="col" v-if="source.toRemove">
            <label for="remoteMotivation" class="form-label">Motivare l'esclusione della foto.</label>
            <input v-model="source.toRemoveMotivation" type="text" id="remoteMotivation" class="form-control"
              placeholder="Motivazione esclusione" aria-label="Motivazione esclusione">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Source } from '~/assets/classes/Source'
defineProps({
  source: {
    type: [Source, Object],
    default: {}
  },
  index: {
    type: Number,
    default: 0
  }
})
</script>

<script lang="ts">

export default defineNuxtComponent({
  name: "image-row",
  data() {
    return {
    };
  },
})
</script>