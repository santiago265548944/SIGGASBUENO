import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CodeValue } from '../../generic-class/code-vale';
import { loadModules } from 'esri-loader';
import { MapService } from '../../map-service/map.service';
import { MemoryService } from '../../cache/memory.service';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import {
  GeoZoomAction,
  GeoZoomActionType
} from '../../map-service/map-actions/geozoom-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';
import { ProjectInfoModel } from './project-info-model';
import { jqxNavigationBarComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxnavigationbar';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { CallModal } from '../../map-service/map-action';

@Component({
  selector: 'app-project-information',
  templateUrl: './project-information.component.html',
  styleUrls: ['./project-information.component.css']
})
export class ProjectInformationComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  @ViewChild('jqxNav') jqxNav: jqxNavigationBarComponent;
  private subscription: Subscription;
  departmentValues: Array<CodeValue>;
  map: any;
  selectedDepartment: string;
  model: ProjectInfoModel;
  navSelected: number;

  constructor(
    private mapService: MapService,
    private memoryService: MemoryService,
    private apiService: ApiService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeGeoZoomAction(mapAction));
    this.model = new ProjectInfoModel();
  }

  ngOnInit() {}
  ngAfterViewInit() {
    this.mapService.executeMapAction(<GeoZoomAction>{
      EMapAction: EmapActions.GeoZoom,
      geoZoomActionType: GeoZoomActionType.FillServicesRequest
    });
  }

  private executeGeoZoomAction(geoZoomAction: GeoZoomAction) {
    switch (geoZoomAction.geoZoomActionType) {
      case GeoZoomActionType.FillServicesResponse:
        this.map = geoZoomAction.map;
        this.executeQuery();
        break;
    }
  }

  private executeQuery(): void {
    const argisServerName = this.memoryService.getItem('ArcGISServerName');
    const argisServerPort = this.memoryService.getItem('ArcGISServerPort');
    const genericUrl = this.memoryService
      .getItem('ArcGISServerURL')
      .replace('{0}', argisServerName)
      .replace('{1}', argisServerPort);

    loadModules(['esri/tasks/QueryTask', 'esri/tasks/query'])
      .then(([QueryTask, Query]) => {
        let servicio = '';
        let layer = '';
        let url = '';
        let where = '';

        this.departmentValues = new Array<CodeValue>();
        servicio = this.memoryService.getItem('DepartamentoServiceName');
        layer = this.memoryService.getItem('DepartamentoLayerIndex');
        url = genericUrl + servicio + '/MapServer/' + layer;
        where = '1=1';

        const queryTask = new QueryTask(url);
        const query = new Query();
        query.outSpatialReference = this.map.spatialReference;
        query.returnGeometry = false;
        query.outFields = ['CODIGO', 'NOMBRE'];
        query.orderByFields = ['TAG'];
        query.where = where;

        this.startProgress();
        queryTask.execute(
          query,
          callback => {
            if (callback.features.length !== 0) {
              for (const item of callback.features) {
                this.departmentValues.push(<CodeValue>{
                  Value: item.attributes.NOMBRE,
                  Code: item.attributes.CODIGO
                });
              }
            }
            this.stopProgress();
          },
          errback => {
            this.stopProgress();
            console.error(errback);
          }
        );
      })
      .catch(err => {
        console.error(err);
      });
  }

  startProgress(): void {
    this.jqxLoader.open();
  }

  stopProgress(): void {
    this.jqxLoader.close();
  }

  clearFields() {
    this.model = new ProjectInfoModel();
  }

  expandedItem(evt: any) {
    this.navSelected = evt.item;
    // 0 = orde diseño
    // 1 = Orden factibilidad
    // 2 = Estado
  }

  executeSearch(evt: string) {
    this.startProgress();
    let arrayParams = Array<InputParameter>();
    let procedure: string;
    switch (this.navSelected) {
      case 0:
        if (
          this.model.OrdenGenUno &&
          this.model.OrdenGenDos &&
          this.model.OrdenGenTres
        ) {
          arrayParams = [
            new InputParameter('un_departamento', this.model.department),
            new InputParameter('es_material', evt),
            new InputParameter('un_departamento_ot', this.model.OrdenGenUno),
            new InputParameter('una_localidad_ot', this.model.OrdenGenDos),
            new InputParameter('una_ot', this.model.OrdenGenTres)
          ];
          procedure = StoreProcedures.ConsultaPorOT;
        } else {
          alert('Debe completar todos los campos asociados a la orden.');
        }
        break;
      case 1:
        if (
          this.model.OrdenFacUno &&
          this.model.OrdenFacDos &&
          this.model.OrdenFacTres
        ) {
          arrayParams = [
            new InputParameter('un_departamento', this.model.department),
            new InputParameter('es_material', evt),
            new InputParameter('un_departamento_ot', this.model.OrdenFacUno),
            new InputParameter('una_localidad_ot', this.model.OrdenFacDos),
            new InputParameter('una_atencion_ot', this.model.OrdenFacTres)
          ];
          procedure = StoreProcedures.ConsultaPorAtencion;
        } else {
          alert('Debe completar todos los campos asociados a la Atención.');
        }
        break;
      case 2:
        if (this.model.Estado) {
          arrayParams = [
            new InputParameter('un_departamento', this.model.department),
            new InputParameter('un_estado', this.model.Estado),
            new InputParameter('es_material', evt)
          ];
          procedure = StoreProcedures.ConsultaPorEstado;
        } else {
          alert('Debe seleccionar un estado.');
        }
        break;
    }

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(procedure, arrayParams)
      )
      .subscribe(json => {
        if (json['0']) {
          alert('El proyecto ingresado no se ha podido encontrar.');
        } else if (json['5']) {
          const result = JSON.parse(json['5']);
          if (result['Table1'] != null && result['Table1'].length > 0) {
            ResultToGraphicCollection.convert(result['Table1'], results =>
              this.convertCallback(results)
            );
          } else {
            alert('El proyecto ingresado no se ha podido encontrar.');
          }
        }
        this.stopProgress();
      });
  }

  private convertCallback(results: any) {
    this.mapService.executeMapAction(<CallModal>{
      EMapAction: EmapActions.CallModal,
      EModal: Emodal.ViewInformation,
      parameters: results
    });
  }
}
