import { MapAction } from '../map-action';

export enum IdentifyActionType {
  ActivateIdentifyDraw = 1,
  ReturnGeometry = 2,
  ZoomToGeometry = 3
}

export interface IdentifyAction extends MapAction {
  identifyActionType: IdentifyActionType;
  toolsOption?: string;
  geometry?: any;
  map?: any;
}

