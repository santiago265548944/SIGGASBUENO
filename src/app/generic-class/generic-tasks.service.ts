import { Injectable } from '@angular/core';
import { MapService } from '../map-service/map.service';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import {
  ReturnElementAction,
  MapAction,
  CallModal,
  AddGeometry
} from '../map-service/map-action';
import { EmapActions, Emodal } from '../map-service/emap-actions.enum';
import { ApiService } from '../api/api.service';
import { RequestHelper } from '../api/request/request-helper';
import { StoreProcedures } from '../api/request/store-procedures.enum';
import { InputParameter } from '../api/request/input-parameter';
import { ResultToGraphicCollection } from '../map-service/result-to-graphic-collection';
import { loadModules } from 'esri-loader';
import { MemoryService } from '../cache/memory.service';
import { GlobalService } from '../Globals/global.service';

@Injectable()
export class GenericTasksService {
  subscription: Subscription;

  constructor(
    private mapService: MapService,
    private apiService: ApiService,
    private memoryService: MemoryService,
    private globals: GlobalService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeReturnElementAction(mapAction));
  }

  private executeReturnElementAction(evt: MapAction): void {
    switch (evt.EMapAction) {
      case EmapActions.AvailableOperatorGeometry:
        if ((<ReturnElementAction>evt).geometry) {
          this.loadAvailableData((<ReturnElementAction>evt).geometry);
        }
        break;
      case EmapActions.ObviateValvesGeometry:
        if ((<ReturnElementAction>evt).geometry) {
          this.ObviateValvesTask((<ReturnElementAction>evt).geometry);
        }
        break;
      case EmapActions.ModifyAffectedUsersGeometry:
        if ((<ReturnElementAction>evt).geometry) {
            this.modifyAffectedUsersTask((<ReturnElementAction>evt).geometry);
        }
        break;
    }
  }

  modifyAffectedUsersTask(geometry: any): void {
    loadModules(['esri/tasks/QueryTask', 'esri/tasks/query']).then(
      ([QueryTask, Query]) => {
      if (this.globals.getLastKeyPress() !== 16) {
        const arcServerUrl = this.memoryService
          .getItem('ArcGISServerURL')
          .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
          .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));

        const url =
          arcServerUrl +
          this.memoryService.getItem('PredioServiceName') +
          '/MapServer/' +
          this.memoryService.getItem('PredioLayerIndex');

          const queryTask = new QueryTask(url);
          const query = new Query();
          query.returnGeometry = true;
          query.geometry = geometry;
          query.outFields = ['TAG'];

          queryTask.execute(
            query,
            result => this.modifyAffectedUsersTaskCompleted(result),
            error => this.queryTaskError(error)
          );
        } else {
          if (this.globals.getCurrentGraphicSelected() != null) {
            this.apiService
              .callStoreProcedureV2(
                RequestHelper.getParamsForStoredProcedureV2(
                  StoreProcedures.EliminarUsuarioAfectado,
                  [
                    new InputParameter(
                      'un_tag',
                      this.globals.getCurrentGraphicSelected().attributes.TAG
                    )
                  ]
                )
              )
              .subscribe(json => {
                this.mapService.executeMapAction(<AddGeometry>{
                  EMapAction: EmapActions.DeleteGeometries,
                  geometries: [this.globals.getCurrentGraphicSelected()]
                });
              });
          }
        }
      });
  }

  modifyAffectedUsersTaskCompleted(result: any): void {
    if (result.features && result.features.length > 0) {
      this.mapService.executeMapAction(<AddGeometry>{
        EMapAction: EmapActions.AddGeometry,
        geometries: result.features
      });

      result.features.forEach(element => {
        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.InsertarUsuarioAfectado,
              [new InputParameter('un_tag', element.attributes.TAG)]
            )
          )
          .subscribe(json => { });
      });
    }
  }

  private ObviateValvesTask(evt) {
    loadModules(['esri/tasks/QueryTask', 'esri/tasks/query']).then(
      ([QueryTask, Query]) => {
        if (this.globals.getLastKeyPress() !== 16) {
          // shift
          const arcServerUrl = this.memoryService
            .getItem('ArcGISServerURL')
            .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
            .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));

          const url =
            arcServerUrl +
            this.memoryService.getItem('TuberiaServiceName') +
            '/MapServer/' +
            this.memoryService.getItem('ValvulaLayerIndex');
          const queryTask = new QueryTask(url);
          const query = new Query();
          query.returnGeometry = true;
          query.geometry = evt;
          query.outFields = ['*'];
          queryTask.execute(
            query,
            result => this.queryCompleted(result),
            error => this.queryTaskError(error)
          );
        } else {
          this.globals.setLastKeyPress(1);
          this.apiService
            .callStoreProcedureV2(
              RequestHelper.getParamsForStoredProcedureV2(
                StoreProcedures.LimpiaValvula,
                [
                  new InputParameter(
                    'un_tag',
                    this.globals.getCurrentGraphicSelected().attributes.TAG
                  )
                ]
              )
            )
            .subscribe(json => {
              this.mapService.executeMapAction(<AddGeometry>{
                EMapAction: EmapActions.DeleteGeometries,
                geometries: [this.globals.getCurrentGraphicSelected()]
              });
            });
        }
      }
    );
  }

  private queryTaskError(err) {
    alert('Error executing task: ' + err);
  }

  queryCompleted(result: any): void {
    try {
      if (result.features && result.features.length > 0) {
        this.mapService.executeMapAction(<AddGeometry>{
          EMapAction: EmapActions.AddGeometry,
          geometries: result.features
        });

        if (result.features.length === 1) {
          this.globals.setCurrentGraphicSelected(result.features[0]);
        }
        result.features.forEach(element => {
          this.apiService
            .callStoreProcedureV2(
              RequestHelper.getParamsForStoredProcedureV2(
                StoreProcedures.InsertaValvula,
                [new InputParameter('un_tag', element.attributes.TAG)]
              )
            )
            .subscribe(json => { });
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private loadAvailableData(itemSelected) {
    this.mapService.executeMapAction({
      EMapAction: EmapActions.startProcess
    });

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerOperarios,
          [
            new InputParameter('una_CoordenadaX', itemSelected.x),
            new InputParameter('Una_CoordenadaY', itemSelected.y)
          ]
        )
      )
      .subscribe(json => {
        if (json[2] != null) {
          const jsonResult = JSON.parse(json[2]);

          if (jsonResult['Table1'] != null && jsonResult['Table1'].length > 0) {
            const responseValues = Object.values(jsonResult);

            ResultToGraphicCollection.convert(
              <Array<any>>responseValues[0],
              results => {
                this.mapService.executeMapAction(<CallModal>{
                  EMapAction: EmapActions.CallModal,
                  EModal: Emodal.ViewSelection,
                  parameters: results
                });
                this.mapService.executeMapAction({
                  EMapAction: EmapActions.stopProcess
                });
              }
            );
          }
        }
      });
  }
}
