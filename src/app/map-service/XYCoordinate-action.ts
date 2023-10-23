import { MapAction } from './map-action';

export interface XYCoordinateAction extends MapAction {
  x: number;
  y: number;
  typeAction: number; // 0=Acercar, 1 = marcar, 2=Flash
}
