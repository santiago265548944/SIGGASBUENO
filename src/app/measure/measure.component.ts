import { Component, OnInit } from '@angular/core';
import { MapService } from '../map-service/map.service';
import { EmapActions, EMeasureActions } from '../map-service/emap-actions.enum';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { MeasureAction } from '../map-service/map-action';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.css']
})
export class MeasureComponent implements OnInit {
  private subscription: Subscription;
  measureDistance: string;
  constructor(private mapService: MapService) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeMeasureAction(mapAction));
  }

  ngOnInit() {}

  private executeMeasureAction(measureAction: MeasureAction) {
    switch (measureAction.EMeasureAction) {
      case EMeasureActions.MeasureLine:
        this.measureDistance =
          measureAction.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
          ' m';
        break;
      case EMeasureActions.MeasurePolygon:
        this.measureDistance =
          measureAction.value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
          ' m2';
        break;
    }
  }

  executeMeasureLine(): void {
    this.clearGraphic();
    this.measureDistance = '';
    this.mapService.executeMapAction({ EMapAction: EmapActions.MeasureLine });
  }

  executeMeasurePolygon(): void {
    this.clearGraphic();
    this.measureDistance = '';
    this.mapService.executeMapAction({
      EMapAction: EmapActions.MeasurePolygon
    });
  }

  private clearGraphic() {
    this.mapService.executeMapAction({
      EMapAction: EmapActions.ClearGraphic
    });
  }
}
