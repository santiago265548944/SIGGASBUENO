import { Component, OnInit, ViewChild } from '@angular/core';
import { loadModules } from 'esri-loader';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { MemoryService } from '../../cache/memory.service';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { AddressSearchModel } from './address-search-model';
import { InputParameter } from '../../api/request/input-parameter';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';
import { CallModal } from '../../map-service/map-action';

@Component({
  selector: 'app-address-search',
  templateUrl: './address-search.component.html',
  styleUrls: ['./address-search.component.css']
})
export class AddressSearchComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  model: AddressSearchModel;
  departments: Array<any>;
  localidades: Array<any>;
  tiposVia: Array<any>;
  tiposLugar: Array<any>;
  closeFunction: Function;
  arcServerUrl: string;
  progressMessage: string;

  constructor(
    private memoryService: MemoryService,
    private apiService: ApiService,
    private mapService: MapService
  ) {
    this.arcServerUrl = this.memoryService
      .getItem('ArcGISServerURL')
      .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
      .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));
    this.model = new AddressSearchModel();
  }

  ngOnInit() {
    this.fillDepartments();
    this.fillTiposVia();
    this.fillTiposLugar();
  }

  private fillDepartments(): void {
    const fields = ['CODIGO', 'NOMBRE'];
    this.queryTask(
      this.memoryService.getItem('DepartamentoServiceName'),
      this.memoryService.getItem('DepartamentoLayerIndex'),
      fields,
      [fields[0]],
      null,
      result => this.fillDepartmentsCompleted(result),
      error => this.queryTaskError(error)
    );
  }

  private fillDepartmentsCompleted(result: any): void {
    try {
      if (result.features && result.features.length > 0) {
        this.departments = new Array<any>();
        result.features.forEach(feature => {
          this.departments.push({
            value: feature.attributes.CODIGO,
            text: feature.attributes.NOMBRE
          });
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
    this.queryTask(
      this.memoryService.getItem('LocalidadServiceName'),
      this.memoryService.getItem('LocalidadLayerIndex'),
      fields,
      [fields[0]],
      `DEPARTAMENTO = ${departmentId}`,
      result => this.fillLocalidadesCompleted(result),
      error => this.queryTaskError(error)
    );
  }

  fillLocalidadesCompleted(result: any): void {
    try {
      if (result.features && result.features.length > 0) {
        this.model.Localidad = null;
        this.localidades = new Array<any>();
        result.features.forEach(feature => {
          this.localidades.push({
            value: feature.attributes.CODIGO,
            text: feature.attributes.NOMBRE
          });
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.stopProgress();
    }
  }

  private fillTiposVia(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerTiposVia,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.fillTiposViaCompleted(JSON.parse(json[0]));
        }
      });
  }

  private fillTiposViaCompleted(jsonTable: any): void {
    if (jsonTable['Table1'] != null) {
      this.tiposVia = this.getComboItems(jsonTable['Table1']);
    }
  }

  private fillTiposLugar(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerTiposLugar,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.fillTiposLugarCompleted(JSON.parse(json[0]));
        }
      });
  }

  private fillTiposLugarCompleted(jsonTable: any): void {
    if (jsonTable['Table1'] != null) {
      this.tiposLugar = this.getComboItems(jsonTable['Table1']);
    }
  }

  private getComboItems(jsonTable: Array<any>): Array<any> {
    return jsonTable.map(item => ({
      value: item.CODIGO,
      text: item.DESCRIPCION
    }));
  }

  private validate(showMessages: boolean): boolean {
    const messages = new Array<string>();

    if (this.model.Departamento == null) {
      messages.push('Debe seleccionar un departamento.');
    }
    if (this.model.Localidad == null) {
      messages.push('Debe seleccionar una localidad');
    }
    if (this.model.TipoViaInicial == null) {
      messages.push('Debe seleccionar el tipo de via inicial.');
    }
    if (
      this.model.NumeroViaInicial == null ||
      this.model.NumeroViaInicial === ''
    ) {
      messages.push('Debe ingresar el número de via inicial.');
    }
    if (this.model.TipoViaCruce == null) {
      messages.push('Debe seleccionar el tipo de via cruce.');
    }
    if (this.model.NumeroViaCruce == null || this.model.NumeroViaCruce === '') {
      messages.push('Debe ingresar el número de via cruce.');
    }

    if (messages.length > 0 && showMessages === true) {
      alert(messages.join('\n'));
    }

    return messages.length === 0;
  }

  onBlurHandler(): void {
    this.setupAddress();
  }

  private setupAddress(): void {
    if (this.validate(false)) {
      const params = new Array();
      params.push(
        new InputParameter(
          'un_Departamento',
          this.model.Departamento != null ? this.model.Departamento.value : null
        )
      );
      params.push(
        new InputParameter(
          'una_Localidad',
          this.model.Localidad != null ? this.model.Localidad.value : null
        )
      );
      params.push(
        new InputParameter(
          'un_Tipo_Via_Inicial',
          this.model.TipoViaInicial != null
            ? this.model.TipoViaInicial.value
            : null
        )
      );
      params.push(
        new InputParameter(
          'un_Numero_Via_Inicial',
          this.model.NumeroViaInicial != null &&
          this.model.NumeroViaInicial !== ''
            ? this.model.NumeroViaInicial
            : null
        )
      );
      params.push(
        new InputParameter(
          'un_Tipo_Via_Cruce',
          this.model.TipoViaCruce != null ? this.model.TipoViaCruce.value : null
        )
      );
      params.push(
        new InputParameter(
          'un_Numero_Via_Cruce',
          this.model.NumeroViaCruce != null && this.model.NumeroViaCruce !== ''
            ? this.model.NumeroViaCruce
            : null
        )
      );
      params.push(
        new InputParameter(
          'una_Letra_1_Via_Inicial',
          this.model.Letra1ViaInicial != null &&
          this.model.Letra1ViaInicial !== ''
            ? this.model.Letra1ViaInicial
            : null
        )
      );
      params.push(
        new InputParameter(
          'una_Letra_2_Via_Inicial',
          this.model.Letra2ViaInicial != null &&
          this.model.Letra2ViaInicial !== ''
            ? this.model.Letra1ViaInicial
            : null
        )
      );
      params.push(
        new InputParameter(
          'una_Letra_3_Via_Inicial',
          this.model.Letra3ViaInicial != null &&
          this.model.Letra3ViaInicial !== ''
            ? this.model.Letra3ViaInicial
            : null
        )
      );
      params.push(
        new InputParameter(
          'una_Letra_1_Via_Cruce',
          this.model.Letra1ViaCruce != null && this.model.Letra1ViaCruce !== ''
            ? this.model.Letra1ViaCruce
            : null
        )
      );
      params.push(
        new InputParameter(
          'una_Letra_2_Via_Cruce',
          this.model.Letra2ViaCruce != null && this.model.Letra2ViaCruce !== ''
            ? this.model.Letra2ViaCruce
            : null
        )
      );
      params.push(
        new InputParameter(
          'una_Letra_3_Via_Cruce',
          this.model.Letra3ViaCruce != null && this.model.Letra3ViaCruce !== ''
            ? this.model.Letra3ViaCruce
            : null
        )
      );
      params.push(
        new InputParameter(
          'un_Numero_Casa',
          this.model.NumeroCasa != null && this.model.NumeroCasa !== ''
            ? this.model.NumeroCasa
            : null
        )
      );
      params.push(
        new InputParameter(
          'una_Letra_Casa',
          this.model.LetraCasa != null && this.model.LetraCasa !== ''
            ? this.model.LetraCasa
            : null
        )
      );
      params.push(
        new InputParameter(
          'un_TipoLugar_1',
          this.model.TipoLugar1 != null ? this.model.TipoLugar1.value : null
        )
      );
      params.push(
        new InputParameter(
          'un_NumeroLugar_1',
          this.model.NumeroLugar1 != null && this.model.NumeroLugar1 !== ''
            ? this.model.NumeroLugar1
            : null
        )
      );
      params.push(
        new InputParameter(
          'un_TipoLugar_2',
          this.model.TipoLugar2 != null ? this.model.TipoLugar2.value : null
        )
      );
      params.push(
        new InputParameter(
          'un_NumeroLugar_2',
          this.model.NumeroLugar2 != null && this.model.NumeroLugar2 !== ''
            ? this.model.NumeroLugar2
            : null
        )
      );
      params.push(
        new InputParameter(
          'un_TipoLugar_3',
          this.model.TipoLugar3 != null ? this.model.TipoLugar3.value : null
        )
      );
      params.push(
        new InputParameter(
          'un_NumeroLugar_3',
          this.model.NumeroLugar3 != null && this.model.NumeroLugar3 !== ''
            ? this.model.NumeroLugar3
            : null
        )
      );
      // TODO: Esto no hace nada en silverlight o está fallando por ahora se deshabilita

      // this.apiService
      //   .callStoreProcedureV2(
      //     RequestHelper.getParamsForStoredProcedureV2(
      //       StoreProcedures.ArmarDireccion,
      //       params
      //     )
      //   )
      //   .subscribe(json => {
      //     // TODO: Poner valor en barra de estado
      //     console.log(json);
      //   });
    }
  }

  onSearchClick(): void {
    if (this.validate(true)) {
      this.search();
    }
  }

  private search() {
    try {
      this.startProgress();
      const mapModel = this.getMapModel();
      const xmlParams = this.getXMLFromModel(mapModel);

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.BusquedaDireccion,
            [
              new InputParameter('mode_op', 2),
              new InputParameter('xml_params', xmlParams)
            ]
          )
        )
        .subscribe(json => {
          // TODO: Terminar busqueda
          this.stopProgress();
          this.processSearchResult(json);
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  private processSearchResult(json: any) {
    if (json[0] != null) {
      const result = JSON.parse(json[0]);
      if (result['ErrorMessage'] != null) {
        alert(result['ErrorMessage']);
      }
    } else if (json[3] != null) {
      const result = JSON.parse(json[3]);
      if (result['Table1'] != null) {
        ResultToGraphicCollection.convert(result['Table1'], results =>
          this.convertCallback(results)
        );
      }
    }
  }

  private convertCallback(results: any) {
    this.mapService.executeMapAction(<CallModal>{
      EMapAction: EmapActions.CallModal,
      EModal: Emodal.ViewSelection,
      parameters: results
    });
  }

  private getXMLFromModel(mapKeys: any): string {
    let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';
    const keysObject = Object.keys(this.model);
    const valuesObject = Object.values(this.model).map(
      v => (typeof v === 'object' ? (v != null ? v.value : '') : v)
    );

    for (let i = 0; i < keysObject.length; i++) {
      xmlValues += `<param name="${mapKeys[keysObject[i]]}">`;
      xmlValues += '<value>' + valuesObject[i] + '</value>';
      xmlValues += '</param>';
    }

    xmlValues += '</params>';
    return xmlValues;
  }

  private getMapModel(): any {
    return {
      Departamento: 'un_Departamento',
      Localidad: 'una_Localidad',
      TipoViaInicial: 'un_Tipo_Via_Inicial',
      NumeroViaInicial: 'un_Numero_Via_Inicial',
      Letra1ViaInicial: 'una_Letra_1_Via_Inicial',
      Letra2ViaInicial: 'una_Letra_2_Via_Inicial',
      Letra3ViaInicial: 'una_Letra_3_Via_Inicial',
      TipoViaCruce: 'un_Tipo_Via_Cruce',
      NumeroViaCruce: 'un_Numero_Via_Cruce',
      Letra1ViaCruce: 'una_Letra_1_Via_Cruce',
      Letra2ViaCruce: 'una_Letra_2_Via_Cruce',
      Letra3ViaCruce: 'una_Letra_3_Via_Cruce',
      NumeroCasa: 'un_Numero_Casa',
      LetraCasa: 'una_Letra_Casa',
      TipoLugar1: 'un_TipoLugar_1',
      NumeroLugar1: 'un_NumeroLugar_1',
      TipoLugar2: 'un_TipoLugar_2',
      NumeroLugar2: 'un_NumeroLugar_2',
      TipoLugar3: 'un_TipoLugar_3',
      NumeroLugar3: 'un_NumeroLugar_3'
    };
  }

  onCleanClick(): void {
    this.clean();
  }

  private clean(): void {
    this.model = new AddressSearchModel();
  }

  onCancelarClick(): void {
    this.closeFunction();
  }

  private queryTask(
    service: string,
    layerIndex: string,
    outputFields: Array<string>,
    orderByFields: Array<string>,
    whereClause: string,
    resultCallback: Function,
    errorCallback: Function
  ) {
    loadModules(['esri/tasks/QueryTask', 'esri/tasks/query']).then(
      ([QueryTask, Query]) => {
        const url = this.arcServerUrl + service + '/MapServer/' + layerIndex;
        const queryTask = new QueryTask(url);
        const query = new Query();
        query.returnGeometry = false;
        query.outFields = outputFields;
        query.orderByFields = orderByFields;
        query.where = whereClause || '1=1';
        queryTask.execute(query, resultCallback, errorCallback);
      }
    );
  }

  private queryTaskError(err) {
    this.stopProgress();
    alert('Error executing task: ' + err);
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
}
