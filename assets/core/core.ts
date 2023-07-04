import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import Source from 'assets/classes/Source';

const WIDTH = 413;
const HEIGHT = 531;

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

  private WIDTH: number = WIDTH;
  private HEIGHT: number = HEIGHT;
  private segmenter!: bodySegmentation.BodySegmenter;
  private detector!: faceLandmarksDetection.FaceLandmarksDetector;

  private isSetupDone: boolean = false;

  constructor() { }

  public static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
      ImageProcessor.instance.setup();
    }

    return ImageProcessor.instance;
  }

  async setup() {
    this.detector = await faceLandmarksDetection.createDetector(detectorModel, detectorConfig);
    this.segmenter = await bodySegmentation.createSegmenter(segmenterModel, segmenterConfig);
    this.isSetupDone = true;
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
    return await this.runFaceRecognition(image, file.name);
  }

  async removeBackground(sourceImage: HTMLImageElement): Promise<HTMLImageElement> {
    console.log("removeBackground");
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
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

  async runFaceRecognition(image: HTMLImageElement, fileName: string): Promise<Source | undefined> {
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
      return obj;
    } else {
      return undefined;
    }
  }

}

export { ImageProcessor };