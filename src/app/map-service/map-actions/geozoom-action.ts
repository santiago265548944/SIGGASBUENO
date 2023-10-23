import { MapAction } from '../map-action';

export interface GeoZoomAction extends MapAction {
  geoZoomActionType: GeoZoomActionType;
  map: any;
}

export enum GeoZoomActionType {
  FillServicesRequest = 1,
  FillServicesResponse = 2,
  Department = 3,
  location = 4,
  sector = 5,
  block = 6
}
