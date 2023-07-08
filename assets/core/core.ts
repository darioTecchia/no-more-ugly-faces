import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import Source from 'assets/classes/Source';

import * as tf from '@tensorflow/tfjs';

// Face detector configuration and init
const detectorModel = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
  runtime: 'tfjs', // or 'tfjs'
  maxFaces: 99,
  refineLandmarks: true
};

// Body segmenter configuration and init
const segmenterModel = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
const segmenterConfig: bodySegmentation.MediaPipeSelfieSegmentationTfjsModelConfig = {
  runtime: 'tfjs', // or 'tfjs'
  modelType: 'general', // or 'landscape'
};

class ImageProcessor {

  private static instance: ImageProcessor;

  private WIDTH: number = 413;
  private HEIGHT: number = 531;
  private segmenter!: bodySegmentation.BodySegmenter;
  private detector!: faceLandmarksDetection.FaceLandmarksDetector;

  constructor() { }

  public static async getInstance(): Promise<ImageProcessor> {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
      await ImageProcessor.instance.setup();
    }
    return ImageProcessor.instance;
  }

  async setup() {
    this.detector = await faceLandmarksDetection.createDetector(detectorModel, detectorConfig);
    this.segmenter = await bodySegmentation.createSegmenter(segmenterModel, segmenterConfig);
  }

  async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    console.log("loadImageFromFile");
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = URL.createObjectURL(file);
    });
  }

  async processImage(file: File, removeBackground: boolean = false): Promise<Source | undefined> {
    console.log("processImage");
    let image = await this.loadImageFromFile(file);
    if (removeBackground) {
      image = await this.removeBackground(image);
    }
    console.log(await this.getBrightness(image));
    
    return await this.runFaceRecognition(image, file.name);
  }

  async getBrightness(imageElement: HTMLImageElement): Promise<number | any> {
    const image = tf.browser.fromPixels(imageElement);
    const brightness = await tf.mean(image).array();
    image.dispose();
    return brightness;
  }

  async removeBackground(sourceImage: HTMLImageElement): Promise<HTMLImageElement> {
    console.log("removeBackground");
    const canvas = document.createElement("canvas");
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    const segmentation = await this.segmenter.segmentPeople(sourceImage);
    const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
    const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
    const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(segmentation, foregroundColor, backgroundColor);
    const opacity = 1;
    const maskBlurAmount = 3;
    const flipHorizontal = false;
    await bodySegmentation.drawMask(canvas, sourceImage, backgroundDarkeningMask, opacity, maskBlurAmount, flipHorizontal);
    const destinationImage = new Image();
    destinationImage.src = canvas.toDataURL();
    this.segmenter.reset();
    return destinationImage;
  }

  async detectFaces(image: HTMLImageElement): Promise<faceLandmarksDetection.Face[]> {
    console.log("detectFaces");
    const faces = await this.detector.estimateFaces(image);
    this.detector.reset();
    return faces;
  }

  private getRemoveMotivation(numFaces: number, brightness: number): string {
    let motivations: string[] = [];
    if(numFaces == 0) {
      motivations.push("Nessun volto rilevato!");
    } else if(numFaces >= 2) {
      motivations.push("Ci sono troppi volti all'interno della foto!");
    }
    if(brightness <= 58) {
      motivations.push("L'immagine risulta essere troppo scura!");
    }
    return motivations.join('; ');
  }

  async runFaceRecognition(image: HTMLImageElement, fileName: string): Promise<Source | undefined> {
    console.log("runFaceRecognition");
    const faces = await this.detectFaces(image);
    const brightness = await this.getBrightness(image);
    if (faces) {
      const obj: Source = {
        image,
        fileName,
        faces: faces.length,
        facesBox: faces[0]?.box,
        toRemove: faces.length !== 1 || brightness <= 58,
        toRemoveMotivation: this.getRemoveMotivation(faces.length, brightness),
        finalSrc: ''
      };
      return obj;
    } else {
      return undefined;
    }
  }

}

export { ImageProcessor };