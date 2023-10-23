import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxExpanderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxExpander';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { OwnerSelection } from '../../map-service/map-actions/select-action';
import { loadModules } from 'esri-loader';
import { MemoryService } from '../../cache/memory.service';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { MapService } from '../../map-service/map.service';
import { EmapActions } from '../../map-service/emap-actions.enum';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { ReturnElementAction } from '../../map-service/map-action';

@Component({
  selector: 'app-risks-management',
  templateUrl: './risks-management.component.html',
  styleUrls: ['./risks-management.component.css']
})
export class RisksManagementComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  @ViewChild('jqxDataTable') jqxDataTableResults: jqxDataTableComponent;
  subscription: Subscription;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  risksManagementSelection: OwnerSelection.risksManagement;
  deparmentSelected: any;
  departments: Array<any>;
  localidadSelected: any;
  localidades: Array<any>;
  arcServerUrl: string;
  radioOptionSelected: string;
  progressMessage: string;
  resultsExpanded: boolean;
  tipoRiesgoExpanded: boolean;

  constructor(private memoryService: MemoryService, private apiService: ApiService
              , private mapService: MapService) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.arcServerUrl = this.memoryService
                        .getItem('ArcGISServerURL')
                        .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
                        .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));
    this.resultsExpanded = false;
    this.tipoRiesgoExpanded = true;
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeReturnElementForRiskZone(mapAction));
  }

  ngOnInit() {
    this.fillDepartments();
  }

  private fillDepartments(): void {
    const fields = ['CODIGO', 'NOMBRE'];
    this.queryTask(this.memoryService.getItem('DepartamentoServiceName')
                  , this.memoryService.getItem('DepartamentoLayerIndex')
                  , fields, [fields[0]], null, (result) => this.fillDepartmentsCompleted(result)
                  , error => this.queryTaskError(error)
                );
  }

  private fillDepartmentsCompleted(result: any): void {
    try {
      if (result.features && result.features.length > 0) {
        this.departments = new Array<any>();
        result.features.forEach(feature => {
          this.departments.push({ value: feature.attributes.CODIGO, text: feature.attributes.NOMBRE });
        });
      }
    } catch (error) {
        console.error(error);
    } finally {
      this.stopProgress();
    }
  }

  onDeparmentSelectChanged(department: any): void {
    if (department != null) {
      this.fillLocalidades(department.value);
    }
  }

  private fillLocalidades(departmentId): void {
    const fields = ['CODIGO', 'NOMBRE'];
    this.startProgress();
    this.queryTask(this.memoryService.getItem('LocalidadServiceName')
                  , this.memoryService.getItem('LocalidadLayerIndex')
                  , fields, [fields[0]], `DEPARTAMENTO = ${departmentId}`
                  , result => this.fillLocalidadesCompleted(result)
                  , error => this.queryTaskError(error)
                );
  }

  fillLocalidadesCompleted(result: any): void {
    try {
      if (result.features && result.features.length > 0) {
        this.localidadSelected = null;
        this.localidades = new Array<any>();
        result.features.forEach(feature => {
          this.localidades.push({ value: feature.attributes.CODIGO, text: feature.attributes.NOMBRE });
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.stopProgress();
    }
  }

  onAceptarTipoRiesgoClickHandler(): void {
    this.executeTipoRiesgo();
  }

  private executeTipoRiesgo(): void {
    if (!this.validateTipoRiesgo()) {
      return;
    }

    const params = new Array();
    params.push(new InputParameter('un_Departamento', this.deparmentSelected.value));
    params.push(new InputParameter('una_Localidad', this.localidadSelected.value));

    this.startProgressWithMessage('Consultando datos de zonas de riesgo...');
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.TipoRiesgo,
          params
        )
      )
      .subscribe(json => {
        this.stopProgress();
        this.processTipoRiesgoResult(json);
      });
  }

  private validateTipoRiesgo(): boolean {
    const messages = new Array<string>();
    if (this.deparmentSelected == null || this.deparmentSelected.value === '') {
      messages.push('Debe seleccionar un departamento.');
    }
    if (this.localidadSelected == null || this.localidadSelected.value === '') {
      messages.push('Debe seleccionar una localidad.');
    }
    if (messages.length > 0) {
      alert(messages.join('\n'));
    }
    return messages.length === 0;
  }

  private queryTask(service: string, layerIndex: string, outputFields: Array<string>, orderByFields: Array<string>,
    whereClause: string, resultCallback: Function, errorCallback: Function) {
    loadModules(['esri/tasks/QueryTask'
      , 'esri/tasks/query'
      , 'esri/SpatialReference'])
      .then(([QueryTask, Query, SpatialReference]) => {
        const url = this.arcServerUrl + service + '/MapServer/' + layerIndex;
        const queryTask = new QueryTask(url);
        const query = new Query();
        query.returnGeometry = false;
        query.outFields = outputFields;
        query.orderByFields = orderByFields;
        query.where = whereClause || '1=1';
        queryTask.execute(query,
        resultCallback,
        errorCallback);
      }
    );
  }

  onZonaRiesgoExpanded(event): void {
    this.tipoRiesgoExpanded = false;
  }

  onZonaTipoExpanded(event): void {
    this.tipoRiesgoExpanded = true;
  }

  processTipoRiesgoResult(jsonResult: any) {
    if (jsonResult != null) {
      if (jsonResult[0] != null) {
        const result = JSON.parse(jsonResult[0]);
        alert(result.ErrorMessage);
        this.cleanGrid();
      } else if (jsonResult[2] != null) {
        this.fillGrid(JSON.parse(jsonResult[2]));
      } else {
        alert('El resultado de tipo riesgo no pudo ser procesado');
        this.cleanGrid();
      }
    }
  }

  private prepareDataTableColumns(firstRow: any): void {
    this.dataTableColumns.splice(0, this.dataTableColumns.length);
    const keys = Object.keys(firstRow);
    for (let index = 0; index < keys.length; index ++) {
      this.dataTableColumns.push({ text: keys[index], dataField: keys[index], minWidth: 100 });
    }
  }

  prepareDataTableSource(data: any): void {
    const keys = Object.keys(data[0]);
    const dataFields = [];
    for (let index = 0; index < keys.length; index ++) {
      dataFields.push({ name: keys[index], type: 'string' });
    }
    const source: any = {
      localData: data,
      dataType: 'array',
      dataFields: dataFields
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  onAceptarZonaRiesgoClickHandler(): void {
    if (!this.validateZonaRiesgo()) {
      return;
    }
    this.startProgressWithMessage('Haga click sobre una zona de riesgo.');
    this.mapService.executeMapAction({
      EMapAction: EmapActions.RiskZone
    });
  }

  private validateZonaRiesgo(): boolean {
    if (this.radioOptionSelected == null || this.radioOptionSelected === '') {
      alert('Debe seleccionar una opción para administración de riesgo.');
      return false;
    }
    return true;
  }

  private executeReturnElementForRiskZone(
    returnElementAction: ReturnElementAction
  ): void {
    if (returnElementAction.EMapAction === EmapActions.RiskZoneGeometry) {
      loadModules(
        [
          'esri/tasks/IdentifyTask',
          'esri/tasks/IdentifyParameters',
          'esri/layers/ArcGISDynamicMapServiceLayer'
        ],
        { url: 'https://js.arcgis.com/3.23/' }
      ).then(
        ([IdentifyTask, IdentifyParameters, ArcGISDynamicMapServiceLayer]) => {
          const identifyParameters = this.createIdentifyParameters(
            IdentifyParameters,
            returnElementAction
          );
          this.startProgress();
          const genericUrl = this.memoryService
            .getItem('ArcGISServerURL')
            .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
            .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));
          const iTask = new IdentifyTask(
            genericUrl +
              this.memoryService.getItem('PredioServiceName') +
              '/MapServer'
          );
          iTask.execute(
            identifyParameters,
            identifyResults =>
              this.onIdentifyTaskComplete(identifyResults, identifyParameters),
            error => this.onIdentifyError(error, identifyParameters)
          );
        }
      );
    }
  }

  private createIdentifyParameters(
    IdentifyParametersClass: any,
    returnElementAction: ReturnElementAction
  ): any {
    const identifyParameters = new IdentifyParametersClass();
    identifyParameters.geometry = returnElementAction.geometry;
    identifyParameters.mapExtent = returnElementAction.map.extent;
    identifyParameters.width = returnElementAction.map.width;
    identifyParameters.height = returnElementAction.map.height;
    identifyParameters.layerOption =
      IdentifyParametersClass.LAYER_OPTION_ALL;
    identifyParameters.spatialReference =
      returnElementAction.map.spatialReference;
    identifyParameters.layerIds = new Array<number>();
    identifyParameters.tolerance = 1;
    identifyParameters.returnGeometry = true;
    return identifyParameters;
  }

  onIdentifyTaskComplete(identifyResultsArg: Array<any>, identifyParameters: any): void {
    let zoneCode = 0;
    for (let i = 0; i < identifyResultsArg.length; i++) {
      if (identifyResultsArg[i].layerName === 'Riesgo') {
        zoneCode = identifyResultsArg[i].feature.attributes.ETIQUETA;
        break;
      }
    }

    if (zoneCode !== 0) {
      if (this.radioOptionSelected === 'ZonaRiesgo') {
        this.processRiskZone(zoneCode);
      } else {
        this.processUpdateRisks(zoneCode);
      }
    } else {
      this.stopProgress();
      alert('No se logró detectar una zona de riesgo.');
    }
  }

  onIdentifyError(error: string, identifyParameters: any): void {
    this.stopProgress();
    console.error(error);
  }

  private processRiskZone(zoneCode: number) {
    this.startProgressWithMessage('Consultando datos de zonas de riesgo...');
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ZonaRiesgo,
          [new InputParameter('una_Zona', zoneCode)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[1] != null) {
          this.fillGrid(JSON.parse(json[1]));
        }
      });
  }

  fillGrid(jsonTable: any) {
    try {
      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        this.resultsExpanded = true;
        this.prepareDataTableColumns(jsonTable['Table1'][0]);
        this.prepareDataTableSource(jsonTable['Table1']);
      } else {
        this.cleanGrid();
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.stopProgress();
    }
  }

  private processUpdateRisks(zoneCode: number) {
    this.startProgressWithMessage('Actualizando información de riesgos...');
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ActualizarRiesgos,
          [new InputParameter('un_Tag', zoneCode)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[1] != null) {
          alert(json[1]);
        }
      });
  }

  onManejoRiesgosCollapsed(event): void {
    this.resultsExpanded = false;
  }

  private startProgress(): void {
    this.startProgressWithMessage('Cargando...');
  }

  private startProgressWithMessage(message: string): void {
    this.progressMessage = message;
    if (this.jqxLoader) {
      this.jqxLoader.open();
    }
  }

  private stopProgress(): void {
    if (this.jqxLoader) {
      this.jqxLoader.close();
    }
  }

  private queryTaskError(err) {
    this.stopProgress();
    alert('Error executing task: ' + err);
  }

  private cleanGrid(): void {
    this.resultsExpanded = false;
    this.jqxDataTableResults.clear();
  }
}
