import { MapAction } from './map-action';

export interface ZoomAction extends MapAction {
  factor: Number;
}
