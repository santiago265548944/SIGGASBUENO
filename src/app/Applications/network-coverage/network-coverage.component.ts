import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { loadModules } from 'esri-loader';
import { MemoryService } from '../../cache/memory.service';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import * as moment from 'moment';
@Component({
  selector: 'app-network-coverage',
  templateUrl: './network-coverage.component.html',
  styleUrls: ['./network-coverage.component.css']
})
export class NetworkCoverageComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  arcServerUrl: string;
  deparmentSelected: any;
  departments: Array<any>;
  networkCoverages: Array<any>;
  networkCoverageSelected: any;
  localidadSelected: any;
  localidades: Array<any>;
  sectorSelected: any;
  sectores: Array<any>;
  closeDate: any;
  processLabelText: string;

  constructor(private memoryService: MemoryService, private apiService: ApiService ) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.arcServerUrl = this.memoryService
                          .getItem('ArcGISServerURL')
                          .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
                          .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));
  }

  ngOnInit() {
    this.fillNetworkCoverages();
    this.fillDepartments();
  }

  private fillNetworkCoverages(): void {
    this.networkCoverages = new Array<any>();
    this.networkCoverages.push({value: 'ReporteCoberturaAnillados', text: 'Cobertura Anillos'});
    this.networkCoverages.push({value: 'ReporteCoberturaServicios', text: 'Cobertura Servicios'});
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
      this.cleanSectores();
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

  onLocalidadSelectChanged(localidad: any): void {
    if (localidad != null) {
      this.fillSectores(localidad.value);
    }
  }

  private fillSectores(localidadId: any): void {
    const fields = ['CODIGO', 'NOMBRE'];
    const whereClause = `DEPARTAMENTO = ${this.deparmentSelected.value} AND LOCALIDAD = ${localidadId}`;
    this.startProgress();
    this.queryTask(this.memoryService.getItem('SectorServiceName')
                  , this.memoryService.getItem('SectorLayerIndex')
                  , fields, [fields[0]], whereClause
                  , result => this.fillSectoresCompleted(result)
                  , error => this.queryTaskError(error)
                );
  }

  fillSectoresCompleted(result: any): void {
    try {
      if (result.features && result.features.length > 0) {
        this.sectorSelected = null;
        this.sectores = new Array<any>();
        result.features.forEach(feature => {
          this.sectores.push({ value: feature.attributes.CODIGO, text: feature.attributes.NOMBRE });
        });
      }
    } catch (error) {
        console.error(error);
    } finally {
      this.stopProgress();
    }
  }

  private cleanSectores(): void {
    this.sectores = new Array<any>();
    this.sectorSelected = null;
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

  private queryTaskError(err) {
    this.stopProgress();
    alert('Error executing task: ' + err);
  }

  onAceptarClickHandler(): void {

    if (!this.validate()) {
      return;
    }

    this.startProgress();

    const spParams = this.getParams();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          `REPORTES.${this.networkCoverageSelected.value}`,
          spParams
        )
      )
      .subscribe(json => {
        this.fillGrid(json);
      });
  }

  private validate(): boolean {
    const messages = new Array<string>();
    if (this.networkCoverageSelected == null) {
      messages.push('Debe seleccionar una cobertura de red.');
    }
    if (this.closeDate == null || this.closeDate === '') {
      messages.push('Debe ingresar la fecha de cierre.');
    }
    if (messages.length > 0) {
      alert(messages.join('\n'));
    }
    return messages.length === 0;
  }

  private getParams(): Array<InputParameter> {
    const params = new Array();

    params.push(new InputParameter('una_FechaCierre', this.closeDate));

    let departmentParamValue = '';
    if (this.deparmentSelected != null) {
      departmentParamValue = this.deparmentSelected.value;
    }
    params.push(new InputParameter('un_Departamento', departmentParamValue));

    let localidadParamValue = '';
    if (this.localidadSelected != null) {
      localidadParamValue = this.localidadSelected.value;
    }
    params.push(new InputParameter('una_Localidad', localidadParamValue));

    let sectorParamValue = '';
    if (this.sectorSelected != null) {
      sectorParamValue = this.sectorSelected.value;
    }
    params.push(new InputParameter('un_Sector', sectorParamValue));

    return params;
  }

  fillGrid(jsonResult: any) {
    try {
      if (jsonResult['4']) {
        const jsonTable = JSON.parse(jsonResult['4']);
        if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
          this.setProcessLabelText();
          this.prepareDataTableColumns(jsonTable['Table1'][0]);
          this.prepareDataTableSource(jsonTable['Table1']);
        } else {
          this.cleanGrid();
        }
      } else {
        this.cleanGrid();
      }
    } catch (error) {
      this.cleanGrid();
      console.error(error);
    } finally {
      this.stopProgress();
    }
  }

  prepareDataTableColumns(firstRow: any): void {
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

  private setProcessLabelText(): void {
    this.processLabelText = `${this.networkCoverageSelected.text}, Inicio: ${moment().format('YYYY-MM-DD')} Fin: ${this.closeDate}`;
  }

  private startProgress(): void {
    if (this.jqxLoader) {
      this.jqxLoader.open();
    }
  }

  private stopProgress(): void {
    if (this.jqxLoader) {
      this.jqxLoader.close();
    }
  }

  private cleanGrid(): void {
    this.processLabelText = '';
    this.dataTableColumns = [];
    this.dataAdapter = new jqx.dataAdapter(null);
  }
}
