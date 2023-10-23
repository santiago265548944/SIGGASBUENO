import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AdminBaseInterface } from '../admin-container/admin-base-interface';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { GlobalService } from '../../Globals/global.service';
import {
  AdminGridConfig,
  UIControlNames
} from '../admin-editable-grid/admin-editable-grid-config';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import {
  ElementsItemConfig,
  ElementsProcedures
} from '../elements/elements-items';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs/observable/forkJoin';
import {
  AplicacionesItems,
  AplicacionesItemConfiguration,
  AplicacionesItemProcedures
} from '../aplicaciones/aplicaciones-items';

@Component({
  selector: 'app-generic-with-two-grids',
  templateUrl: './generic-with-two-grids.component.html',
  styleUrls: ['./generic-with-two-grids.component.css']
})
export class GenericWithTwoGridsComponent
  implements OnInit, AdminBaseInterface {
  @Input()
  data: any;
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  gridData1stGrid: any[];
  gridData2ndGrid: any[];
  config1stGrid: AdminGridConfig;
  config2ndGrid: AdminGridConfig;
  storeProcedures1stGrid: any;
  storeProcedures2ndGrid: any;
  current1stRow: any;
  current2ndRow: any;
  dropDownListFieldNames1stGrid: string[];
  gridDataListFieldsIndexValues1stGrid: any;
  dropDownListFieldNames2ndGrid: string[];
  gridDataListFieldsIndexValues2ndGrid: any;
  tranformModel1stGridFunction: Function;
  tranformModel2ndGridFunction: Function;

  constructor(
    private apiService: ApiService,
    private globalService: GlobalService
  ) {
    this.gridData1stGrid = new Array();
    this.config1stGrid = new AdminGridConfig();
    this.config2ndGrid = new AdminGridConfig();
    this.current1stRow = {};
    this.tranformModel1stGridFunction = model => this.tranform1stGridModel(model);
    this.tranformModel2ndGridFunction = model => this.tranform2ndGridModel(model);
  }

  ngOnInit() {
    this.setConfig();
    this.getData1stGrid();
  }

  private setConfig(): void {
    switch (this.data.elementName) {
      case AplicacionesItems.Ploteo.Name:
        this.config1stGrid = AplicacionesItemConfiguration.ploteo1stGrid();
        this.storeProcedures1stGrid = AplicacionesItemProcedures.ploteo1stGrid();
        this.config2ndGrid = AplicacionesItemConfiguration.ploteo2ndGrid();
        this.storeProcedures2ndGrid = AplicacionesItemProcedures.ploteo2ndGrid();
        break;
      case AplicacionesItems.Busquedas.Name:
        this.config1stGrid = AplicacionesItemConfiguration.busquedas1stGrid();
        this.storeProcedures1stGrid = AplicacionesItemProcedures.busquedas1stGrid();
        this.config2ndGrid = AplicacionesItemConfiguration.busquedas2ndGrid();
        this.storeProcedures2ndGrid = AplicacionesItemProcedures.busquedas2ndGrid();
        break;
      case AplicacionesItems.Consultas.Name:
        this.config1stGrid = AplicacionesItemConfiguration.consultas1stGrid();
        this.storeProcedures1stGrid = AplicacionesItemProcedures.consultas1stGrid();
        this.config2ndGrid = AplicacionesItemConfiguration.consultas2ndGrid();
        this.storeProcedures2ndGrid = AplicacionesItemProcedures.consultas2ndGrid();
        break;
      case AplicacionesItems.Tematicos.Name:
        this.config1stGrid = AplicacionesItemConfiguration.tematicos1stGrid();
        this.storeProcedures1stGrid = AplicacionesItemProcedures.tematicos1stGrid();
        this.config2ndGrid = AplicacionesItemConfiguration.tematicos2ndGrid();
        this.storeProcedures2ndGrid = AplicacionesItemProcedures.tematicos2ndGrid();
        break;
      default:
        this.config1stGrid = ElementsItemConfig.elementos1stGrid();
        this.config2ndGrid = ElementsItemConfig.elementos2ndGrid();
        this.storeProcedures1stGrid = ElementsProcedures.elements1stGrid(
          this.globalService.DatabaseOwner,
          this.data.elementName
        );
        this.storeProcedures2ndGrid = ElementsProcedures.elements2ndGrid();
    }
  }

  private initVars(which: string): void {
    if (which === '1st') {
      this.dropDownListFieldNames1stGrid = this.dropDownListFieldNames2ndGrid = new Array<
        string
      >();
      this.gridDataListFieldsIndexValues1stGrid = this.gridDataListFieldsIndexValues2ndGrid = new Object();

      this.dropDownListFieldNames2ndGrid = new Array<string>();
      this.gridDataListFieldsIndexValues2ndGrid = new Object();
      this.gridData2ndGrid = [];
    } else {
      this.dropDownListFieldNames2ndGrid = new Array<string>();
      this.gridDataListFieldsIndexValues2ndGrid = new Object();
      this.gridData2ndGrid = [];
    }
  }

  getElementsCompleted(result): void {
    const data = this.handleErrorResponse(result);
    if (data != null) {
      if (data.Table1 != null && data.Table1.length > 0) {
        this.gridData1stGrid = data.Table1;
        return;
      }
    }
    this.clean1stGrid();
  }

  /// THIS IS FOR THE 1ST GRID
  private getData1stGrid(): void {
    this.initVars('1st');

    const observables = [this.getGrid1stData()].concat(
      this.getDropdownListsData1stGrid()
    );
    const data = forkJoin(...observables);
    data.subscribe(result => this.getDataCompleted1stGrid(result));
  }

  private getGrid1stData(): Observable<any> {
    return this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(
        this.storeProcedures1stGrid.Read,
        this.storeProcedures1stGrid.ReadParameters || []
      )
    );
  }

  private getDropdownListsData1stGrid(): Observable<any>[] {
    const observables = new Array<Observable<any>>();
    if (this.config1stGrid.columns) {
      const keys = Object.keys(this.config1stGrid.columns);
      keys.forEach(key => {
        if (
          this.config1stGrid.columns[key].uiControl ===
          UIControlNames.DropDownList
        ) {
          if (this.config1stGrid.columns[key].dataSource != null) {
            this.dropDownListFieldNames1stGrid.push(key);
            observables.push(this.getDropDownListData1stGrid(key));
          }
        }
      });
    }
    return observables;
  }

  private getDropDownListData1stGrid(columnName: string): Observable<any> {
    return this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(
        this.config1stGrid.columns[columnName].dataSource,
        this.config1stGrid.columns[columnName].dataSourceParameters ||
          new Array<InputParameter>()
      )
    );
  }

  private getDataCompleted1stGrid(result: Array<any>): void {
    if (result != null && result.length > 0) {
      // procesar los datos para dropDownLists
      if (
        this.dropDownListFieldNames1stGrid.length > 0 &&
        this.dropDownListFieldNames1stGrid.length === result.length - 1
      ) {
        for (let i = 0; i < this.dropDownListFieldNames1stGrid.length; i++) {
          this.getDropDownListData1stGridComplete(
            result[i + 1],
            this.dropDownListFieldNames1stGrid[i]
          );
        }
      }

      // procesar resultado del grid
      this.get1stGridDataCompleted(result[0]);
    }
  }

  private get1stGridDataCompleted(result): void {
    const data = this.handleErrorResponse(result);
    if (data != null) {
      if (data.Table1 != null && data.Table1.length > 0) {
        this.gridData1stGrid = this.transform1stGridData(data.Table1);
        return;
      }
    }
    this.clean1stGrid();
  }

  private transform1stGridData(data: Array<any>): Array<any> {
    return data.map(item => {
      const newItem = {};
      this.gridDataListFieldsIndexValues1stGrid[
        item[this.config1stGrid.idField]
      ] = {};
      this.dropDownListFieldNames1stGrid.forEach(listFieldName => {
        // capturar el id del campo del los datos del grid que van a cambiar de valor
        // para mostrar nombre en vez de id
        this.gridDataListFieldsIndexValues1stGrid[
          item[this.config1stGrid.idField]
        ][listFieldName] = item[listFieldName];
        // cambiar los valores del item del arreglo de datos para mostrar nombre en vez de id
        newItem[listFieldName] = this.getDropDownListValueText(
          listFieldName,
          item[listFieldName],
          this.config1stGrid
        );
      });
      // envio el item con los valores modificados
      return { ...item, ...newItem };
    });
  }

  private getDropDownListValueText(
    columnName: string,
    idValue: any,
    configGrid: AdminGridConfig
  ): any {
    const column = configGrid.columns[columnName];
    const result = column.data.find(
      item => {
        if (item[column.valueField] != null && idValue != null) {
          return item[column.valueField].toString() === idValue.toString();
        }
        return false;
      }
    );
    if (result != null) {
      return result[column.textField];
    } else {
      return idValue;
    }
  }

  private getDropDownListData1stGridComplete(
    json: any,
    columnName: string
  ): void {
    const result = this.handleErrorResponse(json);
    if (result != null && result.Table1) {
      this.config1stGrid.columns[columnName].data = this.transformComboData(
        result.Table1
      );
      if (this.data.elementName === AplicacionesItems.Consultas.Name) {
        if (columnName === 'PERFILES') {
          this.config1stGrid.columns[columnName].data.push({Key: '*', Value: 'Todos'});
        }
      }
    }
  }

  private transformComboData(data: Array<any>): Array<any> {
    if (data != null && data.length > 0) {
      const keys = Object.keys(data[0]);
      const newData = data.map(item => ({
        Key: item[keys[0]],
        Value: item[keys[1]] || item[keys[0]]
      }));
      return newData;
    } else {
      return data;
    }
  }

  // THIS IS THE END FOR THE 1ST GRID

  // THIS IS FOR THE 2ND GRID

  private getData2ndGrid(row1stSelected: any): void {
    this.initVars('2nd');

    const observables = [this.getGrid2ndData(row1stSelected)].concat(
      this.getDropdownListsData2ndGrid()
    );
    const data = forkJoin(...observables);
    data.subscribe(result => this.getDataCompleted2ndGrid(result));
  }

  private getGrid2ndData(row1stSelected: any): Observable<any> {
    const paramValue = this.getXMLParameter(row1stSelected, this.dropDownListFieldNames2ndGrid, this.config2ndGrid);
    const params = [
      new InputParameter('xml_Params', paramValue),
      ...(this.storeProcedures2ndGrid.ReadParameters || [])
    ];

    return this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(
        this.storeProcedures2ndGrid.Read,
        params
      )
    );
  }

  private getDropdownListsData2ndGrid(): Observable<any>[] {
    const observables = new Array<Observable<any>>();
    if (this.config2ndGrid.columns) {
      const keys = Object.keys(this.config2ndGrid.columns);
      keys.forEach(key => {
        if (
          this.config2ndGrid.columns[key].uiControl ===
          UIControlNames.DropDownList
        ) {
          if (this.config2ndGrid.columns[key].dataSource != null) {
            this.dropDownListFieldNames2ndGrid.push(key);
            observables.push(this.getDropDownListData2ndGrid(key));
          }
        }
      });
    }
    return observables;
  }

  private getDropDownListData2ndGrid(columnName: string): Observable<any> {
    return this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(
        this.config2ndGrid.columns[columnName].dataSource,
        this.config2ndGrid.columns[columnName].dataSourceParameters ||
          new Array<InputParameter>()
      )
    );
  }

  private getDataCompleted2ndGrid(result: Array<any>): void {
    if (result != null && result.length > 0) {
      // procesar los datos para dropDownLists
      if (
        this.dropDownListFieldNames2ndGrid.length > 0 &&
        this.dropDownListFieldNames2ndGrid.length === result.length - 1
      ) {
        for (let i = 0; i < this.dropDownListFieldNames2ndGrid.length; i++) {
          this.getDropDownListData2ndGridComplete(
            result[i + 1],
            this.dropDownListFieldNames2ndGrid[i]
          );
        }
      }

      // procesar resultado del grid
      this.get2ndGridDataCompleted(result[0]);
    }
  }

  private get2ndGridDataCompleted(result): void {
    const data = this.handleErrorResponse(result);
    if (data != null) {
      if (data.Table1 != null && data.Table1.length > 0) {
        this.gridData2ndGrid = this.transform2ndGridData(data.Table1);
        return;
      }
    }
    this.clean2ndGrid();
  }

  private transform2ndGridData(data: Array<any>): Array<any> {
    return data.map(item => {
      const newItem = {};
      this.gridDataListFieldsIndexValues2ndGrid[
        item[this.config2ndGrid.idField]
      ] = {};
      this.dropDownListFieldNames2ndGrid.forEach(listFieldName => {
        // capturar el id del campo del los datos del grid que van a cambiar de valor
        // para mostrar nombre en vez de id
        this.gridDataListFieldsIndexValues2ndGrid[
          item[this.config2ndGrid.idField]
        ][listFieldName] = item[listFieldName];
        // cambiar los valores del item del arreglo de datos para mostrar nombre en vez de id
        newItem[listFieldName] = this.getDropDownListValueText(
          listFieldName,
          item[listFieldName],
          this.config2ndGrid
        );
      });
      // envio el item con los valores modificados
      return { ...item, ...newItem };
    });
  }

  private getDropDownListData2ndGridComplete(
    json: any,
    columnName: string
  ): void {
    const result = this.handleErrorResponse(json);
    if (result != null && result.Table1) {
      this.config2ndGrid.columns[columnName].data = this.transformComboData(
        result.Table1
      );
    }
  }

  // THIS IS THE END FOR THE 2ND GRID

  // EMPIEZA ACCIONES SOBRE EL 1ST GRID

  initialGridRowDoubleClickHandler(row: any) {
    this.current1stRow = row;
    this.getData2ndGrid(row);
  }

  saveNewOn1stGrid(data: any): void {
    const paramValue = this.getXMLParameter(data, this.dropDownListFieldNames1stGrid, this.config1stGrid);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures1stGrid.Create,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.on1stGridActionComplete(json);
      });
  }

  private on1stGridActionComplete(result: any): void {
    this.handleErrorResponse(result);
    this.getData1stGrid();
  }

  saveEditedOn1stGrid(data: any): void {
    const paramValue = this.getXMLParameter(data, this.dropDownListFieldNames1stGrid, this.config1stGrid);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures1stGrid.Update,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.on1stGridActionComplete(json);
      });
  }

  deleteOn1stGrid(data: any): void {
    const paramValue = this.getXMLParameter(data, this.dropDownListFieldNames1stGrid, this.config1stGrid);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures1stGrid.Delete,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.on1stGridActionComplete(json);
      });
  }

  // TERMINA ACCIONES SOBRE EL 1ST GRID

  // EMPIEZA ACCIONES SOBRE EL 2ND GRID

  saveNewOnSecondGrid(data: any): void {
    const paramValue = this.getXMLParameter(data, this.dropDownListFieldNames2ndGrid, this.config2ndGrid);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures2ndGrid.Create,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.onSecondGridActionComplete(json);
      });
  }

  private onSecondGridActionComplete(result: any): void {
    this.handleErrorResponse(result);
    this.getData2ndGrid(this.current1stRow);
  }

  saveEditedOnSecondGrid(data: any): void {
    const paramValue = this.getXMLParameter(data, this.dropDownListFieldNames2ndGrid, this.config2ndGrid);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures2ndGrid.Update,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.onSecondGridActionComplete(json);
      });
  }

  deleteOnSecondGrid(data: any): void {
    const paramValue = this.getXMLParameter(data, this.dropDownListFieldNames2ndGrid, this.config2ndGrid);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures2ndGrid.Delete,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.onSecondGridActionComplete(json);
      });
  }

  // TERMINA ACCIONES SOBRE EL 2ND GRID

  private tranform1stGridModel(model: any): any {
    const newValues = {};
    if (this.dropDownListFieldNames1stGrid.length > 0) {
      const id = model[this.config1stGrid.idField];
      const dropDownListIdValues = this.gridDataListFieldsIndexValues1stGrid[id];
      this.dropDownListFieldNames1stGrid.forEach(fieldName => {
        const listIdValue = dropDownListIdValues[fieldName];
        const columnConfig = this.config1stGrid.columns[fieldName];
        const newValue = columnConfig.data.find(
          item => item[columnConfig.valueField] === listIdValue
        );
        if (newValue != null) {
          newValues[fieldName] = newValue;
        }
      });
    }
    return { ...model, ...newValues };
  }

  private tranform2ndGridModel(model: any): any {
    const newValues = {};
    if (this.dropDownListFieldNames2ndGrid.length > 0) {
      const id = model[this.config2ndGrid.idField];
      const dropDownListIdValues = this.gridDataListFieldsIndexValues2ndGrid[id];
      this.dropDownListFieldNames2ndGrid.forEach(fieldName => {
        const listIdValue = dropDownListIdValues[fieldName];
        const columnConfig = this.config2ndGrid.columns[fieldName];
        const newValue = columnConfig.data.find(
          item => item[columnConfig.valueField] === listIdValue
        );
        if (newValue != null) {
          newValues[fieldName] = newValue;
        }
      });
    }
    return { ...model, ...newValues };
  }

  private getXMLParameterValue(model: any, key: string, dropDownListFieldNames: Array<any>, configGrid: AdminGridConfig) {
    if (dropDownListFieldNames.length > 0) {
      if (dropDownListFieldNames.indexOf(key) >= 0) {
        const column = configGrid.columns[key];
        // the model in this key will have an object representing the dropDownList item {value, text} shaped
        return model[key][column.valueField];
      }
    }

    if (configGrid.foreignIdField != null && key === configGrid.foreignIdField) {
      // obtener el valor asociado del primer grid para el segundo grid
      return this.current1stRow[this.config1stGrid.idField];
    }
    return model[key] || '';
  }

  private getXMLParameter(listValues: any, dropDownListFieldNames: Array<any>, configGrid: AdminGridConfig): string {
    let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';
    Object.keys(listValues).forEach(key => {
      if (key !== 'uid') {
        xmlValues += '<param>';
        xmlValues += `<name>${key}</name>`;
        xmlValues += `<value>${this.getXMLParameterValue(listValues, key, dropDownListFieldNames, configGrid)}</value>`;
        xmlValues += '</param>';
      }
    });
    xmlValues += '</params>';
    return xmlValues;
  }

  private clean1stGrid(): void {
    this.gridData1stGrid = [];
    this.initVars('1st');
  }

  private clean2ndGrid(): void {
    this.gridData2ndGrid = [];
    this.initVars('2nd');
  }

  private handleErrorResponse(json): any {
    this.stopProgress();
    const values = Object.keys(json).map(key => json[key]);
    if (values != null && values.length > 0) {
      const result = typeof(values[0]) === 'string' ? JSON.parse(values[0].toString()) : values[0];
      if (!result['ErrorMessage']) {
        return result;
      } else {
        alert(result['ErrorMessage']);
      }
    }
    return null;
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
}
