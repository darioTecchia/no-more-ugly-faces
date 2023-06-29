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
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" value="" id="removeBgCheck">
        <label class="form-check-label" for="removeBgCheck">
          Rimuovi sfondo <sup class="text-danger">Beta</sup>
        </label>
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
      <ImageRow v-for="(source, index) of sources" :PAD="PAD" :source="source" :index="index"
        :key="index">
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
      <button type="button" @click="generateReport()" :disabled="elaborating" class="btn btn-info me-3">
        Genera Report
        <i class="bi bi-file-earmark-arrow-down"></i>
      </button>
      <button type="button" @click="downloadAll()" :disabled="elaborating" class="btn btn-primary">
        Scarica risultati
        <i class="bi bi-cloud-arrow-down-fill"></i>
      </button>
    </div>

  </div>
</template>

<script lang="ts">
import JSZip from 'jszip';
import moment from 'moment';

import Source from '~/assets/classes/Source';

import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import { saveAs } from '~/assets/classes/helpers';

const WIDTH = 413;
const HEIGHT = 531;

// Face detector configuration and init
const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
  runtime: 'tfjs', // or 'tfjs'
  maxFaces: 99,
  refineLandmarks: true
};
let detector: faceLandmarksDetection.FaceLandmarksDetector;

// Body segmenter configuration and init
const segmenterModel = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
const segmenterConfig: bodySegmentation.MediaPipeSelfieSegmentationTfjsModelConfig = {
  runtime: 'tfjs', // or 'tfjs'
  modelType: 'general', // or 'landscape'
};
let segmenter: bodySegmentation.BodySegmenter

declare interface IndexComponentData {
  message: string;
  appReady: boolean;
  images: HTMLImageElement[];
  sources: Source[];
  elaborating: boolean;
  removeBg: boolean;
  progress: number;
  PAD: number;
}

export default defineNuxtComponent({
  name: "index",
  data(): IndexComponentData {
    return {
      message: "Sto inizializzando l'app, si prega di attendere qualche secondo",
      appReady: false,
      images: [],
      sources: [],
      elaborating: false,
      removeBg: false,
      progress: 0,
      PAD: 0.5,
    };
  },
  async mounted() {
    detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    segmenter = await bodySegmentation.createSegmenter(segmenterModel, segmenterConfig);
    this.appReady = true;
    this.message = "App pronta!";
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
          await this.processImage(files[i], i, files.length);
        }
      }
      this.elaborating = false;
      const endTime = new Date().getTime();
      this.message = `Ho elaborato ${files.length} immagini in ${(endTime - startTime) / 1000}s.`;
    },
    async processImage(file: File, index: number, total: number) {
      console.log("processImage");
      let image = await this.loadImageFromFile(file);
      if (this.removeBg) {
        image = await this.removeBackground(image);
      }
      this.images.push(image);
      await this.runFaceRecognition(image, file.name);
      this.progress = Math.floor(((index + 1) / total) * 100);
    },
    async loadImageFromFile(file: File): Promise<HTMLImageElement> {
      console.log("loadImageFromFile");
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(error);
        img.src = URL.createObjectURL(file);
      });
    },
    generateReport() {
      let textContent = `riferimento;motivazione_scarto\n`;
      textContent = this.sources.reduce((accumulator, source, index) => {
        if (source.toRemove) {
          return accumulator + `${source.fileName};${source.toRemoveMotivation}\n`;
        }
        else {
          return accumulator + "";
        }
      }, textContent);
      // Create a Blob object with the text content
      const blob = new Blob([textContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "report.csv");
    },
    async downloadAll() {
      // // Create a new JSZip instance
      const zip = new JSZip();
      let sourcesToDownload = this.sources.filter(source => !source.toRemove);
      for (let index = 0; index < sourcesToDownload.length; index++) {
        const source = sourcesToDownload[index];
        let blob = await (await fetch(source.finalSrc)).blob();
        let file = new Blob([blob], { type: "image/jpeg" });
        zip.file(source.fileName + '.jpeg', file);
      }
      let zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "images.zip");
    },
    async runFaceRecognition(image: HTMLImageElement, fileName: string) {
      console.log("runFaceRecognition");
      const faces = await this.detectFaces(image);
      if (faces) {
        const obj: Source = {
          image,
          fileName,
          faces: faces.length,
          facesBox: faces[0]?.box,
          toRemove: faces.length !== 1,
          toRemoveMotivation: faces.length !== 1 ? 'Nessun volto rilevato.' : "",
          finalSrc: ''
        };
        this.sources.push(obj);
      }
    },
    async detectFaces(image: HTMLImageElement): Promise<faceLandmarksDetection.Face[]> {
      console.log("detectFaces");
      const faces = await detector.estimateFaces(image);
      detector.reset();
      return faces;
    },
    async removeBackground(sourceImage: HTMLImageElement) {
      console.log("removeBackground");
      const canvas = document.createElement("canvas");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      const segmentation = await segmenter.segmentPeople(sourceImage);
      const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
      const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
      const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(segmentation, foregroundColor, backgroundColor);
      const opacity = 1;
      const maskBlurAmount = 3;
      const flipHorizontal = false;
      await bodySegmentation.drawMask(canvas, sourceImage, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);
      const destinationImage = new Image();
      destinationImage.src = canvas.toDataURL();
      segmenter.reset();
      return destinationImage;
    }
  },
})
</script>