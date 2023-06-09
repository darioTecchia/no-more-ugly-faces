<template>
  <div class="image-row card mb-3" :class="{ 'border-danger': source.toRemove }">
    <div class="loading card" v-if="elaborating">
      <i class="fa-solid fa-spinner fa-spin fs-3"></i>
    </div>
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
          <i v-if="!source.toRemove" class="fa-solid fa-download"></i>
        </button>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input" aria-label="Rimuovi" v-model="source.toRemove" type="checkbox" role="switch"
            id="keepCheck">
        </div>
      </div>

    </div>

    <div class="card-body d-flex align-items-center">
      <div class="align-items-center d-flex">
        <div>
          <Cropper :class="{ 'opacity-50': source.toRemove }" :ref="'cropper_' + index" imageRestriction="none"
            :default-position="defaultPosition" @change="onChange" class="source-image" :src="source.image.src" 
            background-class="cropper-background"
            :canvas="{
              height: 531,
              width: 413
            }" 
            :background-wrapper-component="
              CustomBackgroundWrapper
            "
            :stencil-props="{
              aspectRatio: 413 / 531
            }" 
          />
          <div class="mt-2">
            <button @click="removeBg()" type="button" class="btn btn-sm btn-light me-2">
              Rimuovi sfondo
              <i class="fa-solid fa-user-xmark ms-1"></i>
              <sup class="ms-1 text-danger">Beta</sup>
            </button>

            <button @click="resetImage()" type="button" class="btn btn-sm btn-light">
              Ripristina
              <i class="fa-solid fa-rotate-left ms-1"></i>
            </button>
          </div>
        </div>
        <Preview :class="{ 'opacity-50': source.toRemove }" :id="'row_' + index" class="ms-3 border border-1 border-black"
          :image="result.image" :width="413" :height="531" :coordinates="result.coordinates" />
      </div>

      <div class="p-3" v-if="source.toRemove">
        Motivazioni dell'esclusione:
        <div class="row">
          <div class="col">
            <span v-for="motivation of source.toRemoveMotivations" class="badge text-bg-danger me-1">{{ motivation }}</span>
          </div>
        </div>
        <div class="row mt-2">
          <div class="col">
            <input v-model="source.toRemoveAdditionalMotivation" type="text" id="removeMotivation" class="form-control"
              placeholder="Informazioni aggiuntive" aria-label="Informazioni aggiuntive">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImageProcessor } from 'assets/core/core';
import Source from '~/assets/classes/Source'
import CustomBackgroundWrapper from './CustomBackgroundWrapper.vue';
import html2canvas from 'html2canvas/dist/html2canvas';

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
let imageProcessor: ImageProcessor;

declare interface ImageRowComponentData {
  result: {
    coordinates: any;
    image: any;
  };
  elaborating: boolean;
  originalImage: any;
  cropper: any;
}

export default defineNuxtComponent({
  name: "image-row",
  data(): ImageRowComponentData {
    return {
      result: {
        coordinates: null,
        image: null,
      },
      elaborating: false,
      originalImage: null,
      cropper: null
    };
  },
  computed: {
    isValid() {
      return this.source.faces == 1;
    }
  },
  async beforeMount() {
    imageProcessor = await ImageProcessor.getInstance();
  },
  mounted() {
    this.source.fileName = this.source.fileName.substr(0, this.source.fileName.lastIndexOf('.')) || this.source.fileName;
    this.originalImage = this.source.image;
    this.cropper = this.$refs['cropper_' + this.index];
  },
  methods: {
    async onChange({ coordinates, image }: any) {
      this.result = {
        coordinates,
        image
      };
      this.source.finalSrc = await this.getFinalImage();
    },
    async download() {
      saveAs(await this.getFinalImage(), this.source.fileName);
    },
    async getFinalImage(): Promise<string> {
      const canvas = await html2canvas(document.querySelector(`#row_${this.index} .vue-preview__wrapper`));
      return canvas?.toDataURL('image/jpeg');
    },
    resetImage() {
      this.cropper.reset();
      this.source.image = this.originalImage;
    },
    async removeBg() {
      this.elaborating = true;
      this.source.image = await imageProcessor.removeBackground(this.source.image)
      this.elaborating = false;
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
.cropper-background {
  background-color: #fff;
}
</style>

<style scoped lang="scss">
.loading {
  background-color: rgba(241, 241, 241, .8);
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  transition: opacity .5s;
}

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