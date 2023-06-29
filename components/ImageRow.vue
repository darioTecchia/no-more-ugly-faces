<template>
  <div class="image-row card mb-3" :class="{ 'border-danger': source.toRemove }">
    <div class="card-header d-flex justify-content-between align-items-center">

      <div class="d-flex align-items-baseline w-50">
        <i v-if="isValid" class="fa-solid fa-check text-success"></i>
        <i v-if="!isValid" class="fa-solid fa-xmark text-danger"></i>

        <span class="ms-3 fw-bold">#{{ index + 1 }}</span>

        <div class="input-group ms-3">
          <input type="text" v-model="source.fileName" class="form-control" placeholder="Nome file" aria-label="Nome file"
            aria-describedby="fileName">
          <span class="input-group-text" id="fileName">.jpeg</span>
        </div>
      </div>


      <div class="align-items-center d-flex">
        <button :disabled="source.fileName == ''" type="button" class="btn btn-light btn-sm me-4 p-0" @click="download">
          <i v-if="source.faces == 1" class="fa-solid fa-download"></i>
        </button>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input" aria-label="Rimuovi" v-model="source.toRemove" type="checkbox" role="switch"
            id="keepCheck">
        </div>
      </div>

    </div>

    <div class="card-body d-flex align-items-center justify-content-between">
      <div class="align-items-center d-flex">
        <Cropper :class="{ 'opacity-50': source.toRemove }" :ref="'cropper_' + index" imageRestriction="none"
          :default-position="defaultPosition" @change="onChange" class="source-image" :src="source.image.src" 
          :canvas="{
            height: 531,
            width: 413
          }" 
          :stencil-props="{
            aspectRatio: 413 / 531
          }" 
        />
        <Preview :class="{ 'opacity-50': source.toRemove }" class="ms-3 border border-1 border-black"
          :image="result.image" :width="413" :height="531" :coordinates="result.coordinates" />
      </div>

      <div class="p-3" v-if="source.toRemove">
        <div class="row">
          <div class="col">
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
import Source from '~/assets/classes/Source'
import { saveAs } from '~/assets/classes/helpers';

defineProps({
  source: {
    type: [Source],
    default: {}
  },
  index: {
    type: Number,
    default: 0
  },
  PAD: {
    type: Number,
    default: .5
  }
})
</script>

<script lang="ts">

declare interface ImageRowComponentData {
  result: {
    coordinates: any;
    image: any;
  }
}

export default defineNuxtComponent({
  name: "image-row",
  data(): ImageRowComponentData {
    return {
      result: {
        coordinates: null,
        image: null,
      },
    };
  },
  computed: {
    isValid() {
      return this.source.faces == 1;
    }
  },
  mounted() {
    this.source.fileName = this.source.fileName.substr(0, this.source.fileName.lastIndexOf('.')) || this.source.fileName;
  },
  methods: {
    onChange({ coordinates, image }: any) {
      this.result = {
        coordinates,
        image
      };
      this.source.finalSrc = this.getFinalImage();
    },
    download() {
      saveAs(this.getFinalImage(), this.source.fileName);
    },
    getFinalImage(): string {
      const { canvas } = this.$refs['cropper_' + this.index].getResult();
      return canvas.toDataURL('image/jpeg');
    },
    defaultPosition() {
      if (this.source.facesBox) {
        const box = this.source.facesBox;

        const paddingX = box.width * this.PAD;
        const paddingY = box.height * this.PAD;
        const paddedX = box.xMin - paddingX;
        const paddedY = box.yMin - paddingY;
        const paddedHeight = box.height + 2 * paddingY;

        return {
          left: paddedX + 10,
          top: paddedY,
          height: paddedHeight
        }
      } else {
        return {}
      }

    },
  }
})
</script>

<style lang="scss">
a {
  &.preview-wrapper {
    display: block;
    position: relative;

    &::after {
      position: absolute;
      content: "";
      left: 50%;
      top: 0;
      right: 50%;
      bottom: 0;
      pointer-events: none;
      border: 1px solid red;
    }

    &::before {
      position: absolute;
      content: "";
      left: 0;
      top: 50%;
      right: 0;
      bottom: 50%;
      pointer-events: none;
      border: 1px solid green;
    }
  }
}

.source-image {
  width: 340px;

  &.preview {
    border: 1px solid black;
  }
}

.placeholder.image {
  &.image {
    height: 340px;
    width: 340px;
  }
}

.form-check-input:checked {
  background-color: rgba(var(--bs-danger-rgb), var(--bs-border-opacity));
  border-color: rgba(var(--bs-danger-rgb), var(--bs-border-opacity));
}

.form-check-input:focus {
  box-shadow: none;
}
</style>