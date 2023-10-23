import { EmapActions, EMeasureActions, Emodal } from './emap-actions.enum';

export interface MapAction {
  EMapAction: EmapActions;
}

export interface AddGeometry extends MapAction {
  geometries: Array<any>;
  color: string;
}

export interface FlashToGeometry extends MapAction {
  geometry: any;
}

export interface ZoomToGeometries extends MapAction {
  geometries: any;
}

export interface CallModal extends MapAction {
  EModal: Emodal;
  parameters: any;
  additionalParameters: any;
}

export interface PrintAction extends MapAction {
  imageExtension: string;
  printFormat: string;
}

export interface MeasureAction extends MapAction {
  EMeasureAction: EMeasureActions;
  value: number;
}

// If exists another requirements with the same functionality, we need to change as a generic
export interface ReturnElementAction extends MapAction {
  geometry: any;
  map: any;
}
