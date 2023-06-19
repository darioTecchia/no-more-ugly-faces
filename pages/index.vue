<template>
  <div id="main">
    <h1 class="mt-3 mb-3">Project No More Ugly Faces</h1>

    <div class="form">
      <div class="row mb-3">
        <div class="col">
          <label for="uploadInput" class="form-label">Upload immagini.</label>
          <input multiple type="file" class="form-control" id="uploadInput" accept="image/*" @change="loadImage"
            aria-describedby="fileHelp">
        </div>
        <div class="col">
          <label for="padInput" class="form-label">Seleziona quanto <code>PAD</code> inserire.</label>
          <input min="0" step=".1" max="2" v-model="PAD" type="number" id="padInput" class="form-control"
            placeholder="PAD" aria-label="PAD">
        </div>
      </div>
      <div class="row form-check mb-3">
        <div class="col">
          <input v-model="removeBg" class="form-check-input" type="checkbox" value="" id="removeBgCheck">
          <label class="form-check-label" for="removeBgCheck">
            Rimuovi sfondo
          </label>
        </div>
      </div>
    </div>

    <div class="mb-3">{{ message }}</div>

    <div class="progress mb-3" role="progressbar" aria-label="Example with label" :aria-valuenow="progress"
      aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar" :style="{ width: progress + '%' }">{{ progress }}%</div>
    </div>

    <div class="results-wrapper">
      <div v-for="(source, index) of sources" class="card mb-3" :class="{ 'border-danger': source.toRemove }">
        <div class="card-header d-flex justify-content-between align-items-center">
          Immagine #{{ index + 1 }}

          <div class="align-items-center d-flex">
            <a class="icon-link" :download="`image_${index + 1}_1.png`" :href="source.faces[0]">
              <button type="button" class="btn btn-sm me-4 p-0">
                <i class="bi bi-cloud-download"></i>
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
              <a v-for="(face, subIndex) of source.faces" :download="`image_${index + 1}_${subIndex + 1}.png`"
                :href="face">
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

import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

const WIDTH = 413;
const HEIGHT = 531;
// const PAD = 70;

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

interface Source {
  image: HTMLImageElement;
  faces: string[];
  toRemove: boolean;
  toRemoveMotivation: string;
}

export default defineNuxtComponent({
  name: "index",
  data() {
    return {
      message: "Sto inizializzando l'app, aspettare qualche secondo." as string,
      images: [] as HTMLImageElement[],
      sources: [] as Source[],
      elaborating: false as boolean,
      removeBg: false as boolean,
      progress: 0 as number,
      PAD: 0.5 as number,
    };
  },
  async mounted() {
    detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    segmenter = await bodySegmentation.createSegmenter(segmenterModel, segmenterConfig);
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
      await this.runFaceRecognition(image);
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
      let textContent = `Report del ${moment().format("DD-MM-YYYY")}\n\n`;
      textContent = this.sources.reduce((accumulator, source, index) => {
        if (source.toRemove) {
          return accumulator + `Foto #${index + 1}. Esclusa con seguente motivazione: ${source.toRemoveMotivation}\n`;
        }
        else {
          return accumulator + "";
        }
      }, textContent);
      // Create a Blob object with the text content
      const blob = new Blob([textContent], { type: "text/plain" });
      this.saveAs(blob, "report.txt");
    },
    saveAs(blobContent: Blob, fileName: string) {
      console.log(blobContent, fileName);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blobContent);
      link.download = fileName;
      // Add the link to the document
      document.body.appendChild(link);
      // Trigger the download
      link.click();
      // Clean up the object URL
      link.remove();
      URL.revokeObjectURL(link.href);
    },
    async downloadAll() {
      // Create a new JSZip instance
      const zip = new JSZip();
      let sourcesToDownload = this.sources.filter(source => !source.toRemove);
      for (let index = 0; index < sourcesToDownload.length; index++) {
        const source = sourcesToDownload[index];
        let blob = await (await fetch(source.faces[0])).blob();
        let file = new Blob([blob], { type: "image/png" });
        zip.file(index + ".png", file);
      }
      let zipBlob = await zip.generateAsync({ type: "blob" });
      this.saveAs(zipBlob, "images.zip");
    },
    async runFaceRecognition(image: HTMLImageElement) {
      console.log("runFaceRecognition");
      const faces = await this.detectFaces(image);
      if (faces) {
        const obj = {
          image,
          faces: faces.map((face: faceLandmarksDetection.Face) => this.getUrlFromFaceSource(image, face)),
          // faces,
          toRemove: faces.length !== 1,
          toRemoveMotivation: faces.length !== 1 ? `La foto è esclusa poiché ci sono ${faces.length} volti!` : ""
        };
        this.sources.push(obj);
      }
    },
    getUrlFromFaceSource(sourceImage: HTMLImageElement, face: faceLandmarksDetection.Face): string {
      console.log("getUrlFromFaceSource");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const box = face.box;
      const paddingX = box.width * this.PAD;
      const paddingY = box.height * this.PAD;
      const paddedX = box.xMin - paddingX;
      const paddedY = box.yMin - paddingY;
      const paddedWidth = box.width + 2 * paddingX;
      const paddedHeight = box.height + 2 * paddingY;
      // Calculate the scale ratio to fit the padded rectangle within the canvas
      const ratio = Math.min(WIDTH / paddedWidth, HEIGHT / paddedHeight);
      // Calculate the actual dimensions within the canvas
      const actualWidth = paddedWidth * ratio;
      const actualHeight = paddedHeight * ratio;
      // Calculate the offset to center the face within the canvas
      const offsetX = (WIDTH - actualWidth) / 2;
      const offsetY = (HEIGHT - actualHeight) / 2;
      // Set the canvas dimensions
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      ctx?.drawImage(sourceImage, paddedX, paddedY, paddedWidth, paddedHeight, offsetX, offsetY, actualWidth, actualHeight);
      return canvas.toDataURL();
    },
    async detectFaces(image: HTMLImageElement): Promise<faceLandmarksDetection.Face[]> {
      console.log("detectFaces");
      const faces = await detector.estimateFaces(image);
      detector.reset();
      return faces;
    },
    async removeBackground(sourceImage: HTMLImageElement) {
      console.log("removeBackground", sourceImage);
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