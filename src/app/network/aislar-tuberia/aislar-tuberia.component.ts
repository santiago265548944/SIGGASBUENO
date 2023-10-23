import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxLoaderComponent } from '../../../../node_modules/jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import {
  OwnerSelection,
  SelectAction,
  SelectActionType
} from '../../map-service/map-actions/select-action';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { MapService } from '../../map-service/map.service';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { MemoryService } from '../../cache/memory.service';
import { ApiService } from '../../api/api.service';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { environment } from '../../../environments/environment';
import { RequestHelper } from '../../api/request/request-helper';
import { DeferObservable } from '../../../../node_modules/rxjs/observable/DeferObservable';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { AddGeometry, ZoomToGeometries } from '../../map-service/map-action';
import { GlobalService } from '../../Globals/global.service';

@Component({
  selector: 'app-aislar-tuberia',
  templateUrl: './aislar-tuberia.component.html',
  styleUrls: ['./aislar-tuberia.component.css']
})
export class AislarTuberiaComponent implements OnInit {
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;
  subscription: Subscription;
  aislarTuberiaSelectType = OwnerSelection.AislarTuberia;

  constructor(
    private mapService: MapService,
    private apiService: ApiService,
    private memoryService: MemoryService,
    private globals: GlobalService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.handleSelectAction(mapAction));
  }

  ngOnInit() {}

  handleSelectAction(mapAction: SelectAction) {
    if (mapAction.owner === this.aislarTuberiaSelectType) {
      if (mapAction.EMapAction === EmapActions.Select) {
        if (
          mapAction.selectActionType === SelectActionType.ViewSelectionResponse
        ) {
          // if (mapAction.selectedFeatures.length > 0) {
          this.searchData(mapAction.selectedFeatures[0]);
          // } else {
          //   debugger;
          //   alert('Debe Realizar La Selección De Tuberia.');
          // }
        }
      }
    }
  }

  searchData(element: any) {
    if (element) {
      this.startProgress();
      try {
        // Validate in systemfeatures SL to know the variable that we need to use below
        if (true) {
          this.apiService
            .callStoreProcedureV2(
              RequestHelper.getParamsForStoredProcedureV2(
                StoreProcedures.spTraceAll,
                [
                  new InputParameter(
                    'isbId',
                    Number(element.attributes['TAG']) > 0
                      ? Number(element.attributes['TAG'])
                      : null
                  ),
                  new InputParameter('isbMachine', 'SIGGASWEB'),
                  new InputParameter('isbUsername', this.memoryService.getItem('currentUser'))
                ]
              )
            )
            .subscribe(json => {
              try {
                this.getTraceResult(json);
              } catch (error) {
                console.log(error);
              }
            });
        } else {
          // this.apiService
          //   .callStoreProcedureV2(
          //     RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.Trace, [
          //       new InputParameter(
          //         'un_inicio',
          //         Number(element.attributes['TAG']) > 0
          //           ? Number(element.attributes['TAG'])
          //           : null
          //       )
          //     ])
          //   )
          //   .subscribe(json => {
          //     try {
          //       this.getTraceResult(json);
          //     } catch (error) {
          //       console.log(error);
          //     }
          //   });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  getTraceResult(result: any) {
    this.stopProgress();
    const posResult = Object.getOwnPropertyNames(result);
    if (posResult.length >= 2) {
      ResultToGraphicCollection.convert(
        JSON.parse(result[posResult[1]])['Table1'],
        results => this.convertCallbackPoint(results)
      );

      ResultToGraphicCollection.convert(
        JSON.parse(result[posResult[0]])['Table1'],
        results => this.convertCallbackLine(results)
      );
    }
  }

  private convertCallbackPoint(results: any) {
    this.globals.setAislarPuntos(results);
    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: results,
      color: '#FFFF00'
    });
  }

  private convertCallbackLine(results: any) {
    this.globals.setAislarLineas(results);
    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: results,
      color: '#FF0000'
    });

    this.mapService.executeMapAction(<ZoomToGeometries>{
      EMapAction: EmapActions.ZoomToGeometries,
      geometries: results
    });
  }

  private startProgress(): void {
    this.jqxLoader.open();
  }

  private stopProgress(): void {
    this.jqxLoader.close();
  }
}
