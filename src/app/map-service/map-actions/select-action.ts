import { MapAction } from '../map-action';

export interface SelectAction extends MapAction {
  selectActionType: SelectActionType;
  selectGeometry: any;
  map: any;
  selectedFeatures: any;
  idLayer: number;
  owner: OwnerSelection;
  featureSelected: any;
}

export enum OwnerSelection {
  SelectionTool = 1,
  Attachment = 2,
  RadiograficalTest = 3,
  pNeumaticTest = 4,
  stationComponent = 5,
  stationModification = 6,
  risksManagement = 7,
  genericAction = 8,
  ChangeStratum = 9,
  QueryBuilder = 10,
  AislarTuberia = 11,
  ManejoPrensas = 12,
  ModifyAffectedUsers = 13
}

export enum SelectActionType {
  FillServicesRequest = 1,
  FillServicesResponse = 2,
  SelectWithRectangle = 3,
  SelectWithLine = 4,
  SelectWithCircle = 5,
  SelectWithPolygon = 6,
  DeleteSelection = 7,
  PerformSelect = 8,
  ZoomToSelection = 9,
  ViewSelectionRequest = 10,
  ViewSelectionResponse = 11
}
