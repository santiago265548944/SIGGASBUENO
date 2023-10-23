import { Component, OnInit, Input } from '@angular/core';
import { XYCoordinateAction } from '../map-service/XYCoordinate-action';
import { EmapActions } from '../map-service/emap-actions.enum';
import { MapService } from '../map-service/map.service';

@Component({
  selector: 'app-xycoordinate',
  templateUrl: './xycoordinate.component.html',
  styleUrls: ['./xycoordinate.component.css']
})
export class XycoordinateComponent implements OnInit {
  constructor(private mapService: MapService) {}

  coorX: number;
  coorY: number;

  ngOnInit() {}

  executeZoomXY(action: number) {
    if (!!this.coorX && !!this.coorY) {
      const xyAction = <XYCoordinateAction>{
        EMapAction: EmapActions.XYCoordinate,
        x: +this.coorX,
        y: +this.coorY,
        typeAction: action
      };
      this.mapService.executeMapAction(xyAction);
    }
  }
}
