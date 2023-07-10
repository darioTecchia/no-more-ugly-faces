import { BoundingBox } from "@tensorflow-models/face-landmarks-detection/dist/shared/calculators/interfaces/shape_interfaces";

export default class Source {
  image: HTMLImageElement = new HTMLImageElement;
  faces!: number;
  finalSrc: string = '';
  facesBox!: BoundingBox;
  toRemove: boolean = false;
  toRemoveMotivations: string[] = [];
  toRemoveAdditionalMotivation: string = '';
  fileName: string = ''
}