<template>
  <div id="main" class="container">
    <h1 class="mt-3 mb-3">Project No More Ugly Faces <sup class="text-danger">Beta</sup></h1>

    <div class="form">
      <div class="row mb-3">
        <div class="col">
          <label for="uploadInput" class="form-label">Upload immagini.</label>
          <input :disabled="!appReady || elaborating" multiple type="file" class="form-control" id="uploadInput"
            accept="image/*" @change="loadImage" aria-describedby="fileHelp">
        </div>
        <div class="col" v-if="false">
          <label for="padInput" class="form-label">Seleziona quanto <code>PAD</code> inserire.</label>
          <input min="0" step=".1" max="2" v-model="PAD" type="number" id="padInput" class="form-control"
            placeholder="PAD" aria-label="PAD">
        </div>
      </div>
      <div class="row mb-2">
        <div class="col">
          <input :disabled="!appReady || elaborating" class="me-2" v-model="removeBg" type="checkbox" id="removeBgCheck">
          <label class="form-check-label" for="removeBgCheck">
            Rimuovi sfondo <sup class="text-danger">Beta</sup>
          </label>
        </div>
      </div>
    </div>

    <div class="mb-3">
      {{ message }}
      <i v-if="!appReady || elaborating" class="fa-solid fa-spinner fa-spin"></i>
    </div>

    <div class="progress mb-3" role="progressbar" aria-label="Example with label" :aria-valuenow="progress"
      aria-valuemin="0" aria-valuemax="100" v-if="elaborating">
      <div class="progress-bar" :style="{ width: progress + '%' }">{{ progress }}%</div>
    </div>

    <div class="results-wrapper">
      <ImageRow v-for="(source, index) of sources" :PAD="PAD" :source="source" :index="index" :key="index">
      </ImageRow>
      <div v-if="elaborating" class="card mb-2 placeholder-glow">
        <div class="card-header"><span class="placeholder w-25"></span></div>
        <div class="card-body">
          <span class="placeholder image me-5"></span>

          <span class="placeholder image"></span>
        </div>
      </div>
    </div>

    <div class="cta-wrapper mb-5" v-if="sources.length > 0">
      <button type="button" @click="generateReport()" :disabled="elaborating" class="btn btn-light me-3">
        <span v-if="!elaboratingReport">Genera Report &nbsp; <i class="fa-solid fa-file-csv"></i></span>
        <span v-else>Sto generando il report &nbsp; <i class="fa-solid fa-spinner fa-spin"></i></span>
      </button>
      <button type="button" @click="download('valid')" :disabled="elaborating" class="btn btn-light me-3">
        <span v-if="!elaboratingZip">Scarica risultati &nbsp; <i class="fa-solid fa-file-zipper"></i></span>
        <span v-else>Sto generando lo zip &nbsp; <i class="fa-solid fa-spinner fa-spin"></i></span>
      </button>
      <button type="button" @click="download('excluded')" :disabled="elaborating" class="btn btn-light">
        <span v-if="!elaboratingZip">Scarica immagini non valide &nbsp; <i class="fa-solid fa-file-zipper"></i></span>
        <span v-else>Sto generando lo zip &nbsp; <i class="fa-solid fa-spinner fa-spin"></i></span>
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import JSZip from 'jszip';

import Source from '~/assets/classes/Source';
import { ImageProcessor } from '~/assets/core/core';

declare interface IndexComponentData {
  message: string;
  appReady: boolean;
  sources: Source[];
  elaborating: boolean;
  removeBg: boolean;
  progress: number;
  PAD: number;
  elaboratingReport: boolean;
  elaboratingZip: boolean;
}

let imageProcessor: ImageProcessor;

export default defineNuxtComponent({
  name: "index",
  data(): IndexComponentData {
    return {
      message: "Sto inizializzando l'app, si prega di attendere qualche secondo",
      appReady: false,
      sources: [],
      elaborating: false,
      removeBg: false,
      progress: 0,
      PAD: 0.5,
      elaboratingReport: false,
      elaboratingZip: false,
    };
  },
  async mounted() {
    this.appReady = true;
    this.message = "App pronta!";
  },
  async beforeMount() {
    imageProcessor = await ImageProcessor.getInstance();
  },
  methods: {
    async loadImage(event: any) {
      console.log("loadImage");
      this.progress = 0;
      const files: File[] = Array.from(event.target.files);
      this.message = `Sto elaborando ${files.length} immagini, attendere.`;
      const startTime = new Date().getTime();
      this.elaborating = true;
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let source = await imageProcessor.processImage(files[i], this.removeBg);
          if (source) {
            this.sources.push(source)
          }
          this.progress = Math.floor(((i + 1) / files.length) * 100);
        }
      }
      this.elaborating = false;
      const endTime = new Date().getTime();
      this.message = `Ho elaborato ${files.length} immagini in ${(endTime - startTime) / 1000}s.`;
    },
    generateReport() {
      this.elaboratingReport = true;
      let textContent = `riferimento;motivazione_scarto\n`;
      textContent = this.sources.filter(source => source.toRemove).reduce((accumulator, source) => {
        return accumulator + `${source.fileName};${source.toRemoveMotivations.join('; ')}\n`;
      }, textContent);
      // Create a Blob object with the text content
      const blob = new Blob([textContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "report.csv");
      this.elaboratingReport = false;
    },
    async download(option: 'all' | 'valid' | 'excluded' = 'valid') {
      this.elaboratingZip = true;
      const zip = new JSZip();
      let sourcesToDownload = this.sources;
      if (option != 'all') {
        sourcesToDownload = (option == 'valid' ? this.sources.filter(source => !source.toRemove) : this.sources.filter(source => source.toRemove))
      }
      for (let index = 0; index < sourcesToDownload.length; index++) {
        const source = sourcesToDownload[index];
        let blob = await (await fetch(source.finalSrc)).blob();
        let file = new Blob([blob], { type: "image/jpeg" });
        zip.file(source.fileName + '.jpeg', file);
      }
      let zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "images.zip");
      this.elaboratingZip = false;
    },
  },
})
</script>