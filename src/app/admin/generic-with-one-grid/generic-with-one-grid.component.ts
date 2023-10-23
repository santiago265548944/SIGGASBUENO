import { Component, OnInit, Input, ViewChild, ComponentRef } from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import {
  AdminGridConfig,
  UIControlNames
} from '../admin-editable-grid/admin-editable-grid-config';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { AdminBaseInterface } from '../admin-container/admin-base-interface';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import {
  SecurityItems,
  SecurityItemProcedures,
  SecurityItemConfiguration
} from '../security/security-items';
import { forkJoin } from 'rxjs/observable/forkJoin';
import {
  ArcSdeitems,
  ArcSDEItemConfiguration,
  ArcSDEItemProcedures
} from '../arcsde/arc-sdeitems';
import {
  AplicacionesItems,
  AplicacionesItemConfiguration,
  AplicacionesItemProcedures
} from '../aplicaciones/aplicaciones-items';
import { GlobalService } from '../../Globals/global.service';
import { SpatialRelationComponent } from '../spatial-relation/spatial-relation.component';
import { ModalService } from '../../modal.module';
import { DynamicValuesComponent } from '../dynamic-values/dynamic-values.component';
import { HistoricComponent } from '../historic/historic.component';
import { ChangePasswordComponent } from '../../login/change-password/change-password.component';
import { StoreProcedures } from '../../api/request/store-procedures.enum';

@Component({
  selector: 'app-generic-with-one-grid',
  templateUrl: './generic-with-one-grid.component.html',
  styleUrls: ['./generic-with-one-grid.component.css']
})
export class GenericWithOneGridComponent implements OnInit, AdminBaseInterface {
  @Input()
  data: any;
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  gridDataFirstGrid: any[];
  configFirstGrid: AdminGridConfig;
  currentFirstRow: any;
  storeProcedures: any;
  dropDownListFieldNames: string[];
  gridDataListFieldsIndexValues: any;
  tranformModelFunction: Function;
  private modalSpatialRelation: ComponentRef<any> = null;
  private modalDynamicValues: ComponentRef<any> = null;
  private modalHistoricValues: ComponentRef<any> = null;
  private modalCambiarContrasenia: ComponentRef<any> = null;

  constructor(
    private apiService: ApiService,
    private globalService: GlobalService,
    private modalService: ModalService
  ) {
    this.gridDataFirstGrid = new Array();
    this.configFirstGrid = new AdminGridConfig();
    this.tranformModelFunction = model => this.tranformModel(model);
  }

  ngOnInit() {
    this.setConfig();
    this.getData();
  }

  private initVars(): void {
    this.dropDownListFieldNames = new Array<string>();
    this.gridDataListFieldsIndexValues = new Object();
  }

  private setConfig() {
    switch (this.data.elementName) {
      case SecurityItems.Usuarios.Name:
        this.configFirstGrid = SecurityItemConfiguration.usuarios();
        this.storeProcedures = SecurityItemProcedures.usuarios();
        break;
      case SecurityItems.Perfiles.Name:
        this.configFirstGrid = SecurityItemConfiguration.perfiles();
        this.storeProcedures = SecurityItemProcedures.perfiles();
        break;
      case SecurityItems.Funcionalidades.Name:
        this.configFirstGrid = SecurityItemConfiguration.funcionalidades();
        this.storeProcedures = SecurityItemProcedures.funcionalidades();
        break;
      case SecurityItems.OpcionesPorPerfil.Name:
        this.configFirstGrid = SecurityItemConfiguration.opcionesXPerfil();
        this.storeProcedures = SecurityItemProcedures.opcionesXPerfil();
        break;
      case SecurityItems.OpcionesPorGasera.Name:
        this.configFirstGrid = SecurityItemConfiguration.opcionesXGasera();
        this.storeProcedures = SecurityItemProcedures.opcionesXGasera();
        break;
      case ArcSdeitems.Estado.Name:
        this.configFirstGrid = ArcSDEItemConfiguration.estado();
        this.storeProcedures = ArcSDEItemProcedures.estado();
        break;
      case ArcSdeitems.Version.Name:
        this.configFirstGrid = ArcSDEItemConfiguration.version();
        this.storeProcedures = ArcSDEItemProcedures.version();
        break;
      case ArcSdeitems.Configuracion.Name:
        this.configFirstGrid = ArcSDEItemConfiguration.configuracion();
        this.storeProcedures = ArcSDEItemProcedures.configuracion();
        break;
      case ArcSdeitems.Estadisticas.Name:
        this.configFirstGrid = ArcSDEItemConfiguration.estadisticas();
        this.storeProcedures = ArcSDEItemProcedures.estadisticas();
        break;
      case ArcSdeitems.Monitor.Name:
        this.configFirstGrid = ArcSDEItemConfiguration.monitor();
        this.storeProcedures = ArcSDEItemProcedures.monitor();
        break;
      case AplicacionesItems.General.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.general();
        this.storeProcedures = AplicacionesItemProcedures.general();
        break;
      case AplicacionesItems.CambioDireccion.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.cambioDireccion();
        this.storeProcedures = AplicacionesItemProcedures.cambioDireccion();
        break;
      case AplicacionesItems.MapaBase.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.mapasBase();
        this.storeProcedures = AplicacionesItemProcedures.mapasBase();
        break;
      case AplicacionesItems.Edicion.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.edicion();
        this.storeProcedures = AplicacionesItemProcedures.edicion();
        break;
      case AplicacionesItems.ConfiguracionEdicion.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.configuracionEdicion();
        this.storeProcedures = AplicacionesItemProcedures.configuracionEdicion();
        break;
      case AplicacionesItems.AuditoriaGeografica.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.auditoriaGeografica(
          this.globalService
        );
        this.storeProcedures = AplicacionesItemProcedures.auditoriaGeografica();
        break;
      case AplicacionesItems.AuditoriaAlfanumerica.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.auditoriaAlfanumerica(
          this.globalService
        );
        this.storeProcedures = AplicacionesItemProcedures.auditoriaAlfanumerica();
        break;
      case AplicacionesItems.RelacionesEspaciales.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.relacionesEspaciales();
        this.storeProcedures = AplicacionesItemProcedures.relacionesEspaciales();
        break;
      case AplicacionesItems.AtributosDinamicos.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.atributosDinamicos();
        this.storeProcedures = AplicacionesItemProcedures.atributosDinamicos();
        break;
      case AplicacionesItems.Historico.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.historicos();
        this.storeProcedures = AplicacionesItemProcedures.historicos();
        break;
      case AplicacionesItems.Secuencia.Name:
        this.configFirstGrid = AplicacionesItemConfiguration.secuencia();
        this.storeProcedures = AplicacionesItemProcedures.secuencia();
        break;
    }
  }

  private getData(): void {
    this.initVars();

    const observables = [this.getGridData()].concat(
      this.getDropdownListsData()
    );
    const data = forkJoin(...observables);
    data.subscribe(result => this.getDataCompleted(result));
  }

  private getDataCompleted(result: Array<any>): void {
    if (result != null && result.length > 0) {
      // procesar los datos para dropDownLists
      if (
        this.dropDownListFieldNames.length > 0 &&
        this.dropDownListFieldNames.length === result.length - 1
      ) {
        for (let i = 0; i < this.dropDownListFieldNames.length; i++) {
          this.getDropDownListDataComplete(
            result[i + 1],
            this.dropDownListFieldNames[i]
          );
        }
      }

      // procesar resultado del grid
      this.getGridDataCompleted(result[0]);
    }
  }

  private getGridData(): Observable<any> {
    return this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(this.storeProcedures.Read, [])
    );
  }

  private getGridDataCompleted(result): void {
    const data = this.handleErrorResponse(result);
    if (data != null) {
      if (data.Table1 != null && data.Table1.length > 0) {
        this.gridDataFirstGrid = this.transformGridData(data.Table1);
        return;
      }
    }
    this.cleanGrid();
  }

  private transformGridData(data: Array<any>): Array<any> {
    return data.map(item => {
      const newItem = {};
      this.gridDataListFieldsIndexValues[
        item[this.configFirstGrid.idField]
      ] = {};
      this.dropDownListFieldNames.forEach(listFieldName => {
        // capturar el id del campo del los datos del grid que van a cambiar de valor
        // para mostrar nombre en vez de id
        this.gridDataListFieldsIndexValues[item[this.configFirstGrid.idField]][
          listFieldName
        ] = item[listFieldName];
        // cambiar los valores del item del arreglo de datos para mostrar nombre en vez de id
        newItem[listFieldName] = this.getDropDownListValueText(
          listFieldName,
          item[listFieldName]
        );
      });
      // envio el item con los valores modificados
      return { ...item, ...newItem };
    });
  }

  private realoadGridData() {
    this.startProgress();
    this.getGridData().subscribe(result => {
      this.stopProgress();
      this.getGridDataCompleted(result);
    });
  }

  private getDropDownListValueText(columnName: string, idValue: any): any {
    const column = this.configFirstGrid.columns[columnName];
    const result = column.data.find(
      item => item[column.valueField] === idValue
    );
    if (result != null) {
      return result[column.textField];
    } else {
      return idValue;
    }
  }

  private getDropdownListsData(): Observable<any>[] {
    const observables = new Array<Observable<any>>();
    if (this.configFirstGrid.columns) {
      const keys = Object.keys(this.configFirstGrid.columns);
      keys.forEach(key => {
        if (
          this.configFirstGrid.columns[key].uiControl ===
          UIControlNames.DropDownList
        ) {
          if (this.configFirstGrid.columns[key].dataSource != null) {
            this.dropDownListFieldNames.push(key);
            observables.push(this.getDropDownListData(key));
          }
        }
      });
    }
    return observables;
  }

  private getDropDownListData(columnName: string): Observable<any> {
    return this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(
        this.configFirstGrid.columns[columnName].dataSource,
        this.configFirstGrid.columns[columnName].dataSourceParameters ||
        new Array<InputParameter>()
      )
    );
  }

  private getDropDownListDataComplete(json: any, columnName: string): void {
    const result = this.handleErrorResponse(json);
    if (result != null && result.Table1) {
      this.configFirstGrid.columns[columnName].data = this.transformComboData(
        result.Table1
      );
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

  firstGridRowClickHandler(row: any) {
    this.currentFirstRow = row;
  }

  firstGridRowDoubleClickHandler(row: any) {
    switch (this.data.elementName) {
      case AplicacionesItems.RelacionesEspaciales.Name:
        this.showSpatialRelationForm(row, false);
        break;
      case AplicacionesItems.AtributosDinamicos.Name:
        this.showDynamicValuesForm(row, false);
        break;
      case AplicacionesItems.Historico.Name:
        this.showHistoricForm(row, false);
        break;
    }
    this.currentFirstRow = row;
  }

  executeDelete() {
    if (this.currentFirstRow) {
      this.deleteOnFirstGrid(this.currentFirstRow);
    } else {
      alert('Debe seleccionar una fila.');
    }
  }

  executeAddNew() {
    switch (this.data.elementName) {
      case AplicacionesItems.RelacionesEspaciales.Name:
        this.showSpatialRelationForm({ TABLENAME: '', VALUEMETHOD: '', VALUEINFO: '', ON_CREATE: 0, ON_CHANGE: 0, RESTRICTED: 0 }, true);
        break;
      case AplicacionesItems.AtributosDinamicos.Name:
        this.showDynamicValuesForm({ TABLENAME: '', FIELDNAME: '', VALUEMETHOD: '', VALUEINFO: '', ON_CREATE: 0
                                      , ON_CHANGE: 0, ON_CHANGEGEO: 0, RUN_WEIGHT: 0 }, true);
        break;
      case AplicacionesItems.Historico.Name:
        this.showHistoricForm({ TABLENAME: '', FIELDNAME: '', VALUEINFO: '', ON_CREATE: 0, ON_DELETE: 0, ON_CHANGE: 0 }, true);
        break;
    }
  }

  showHistoricForm(row: any, newRow: boolean) {
    if (this.modalHistoricValues == null) {
      this.modalHistoricValues = this.modalService.create(
        HistoricComponent,
        {
          modalTitle: 'Editor Historico',
          height: 290,
          width: 350,
          resizable: false
        }
      );
    } else {
      this.modalHistoricValues.instance.open();
    }
    this.modalHistoricValues.instance.start({
      data: row, returnData: (data: any) => {
        if (data) {
          if (newRow) {
            this.saveNewOnFirstGrid(data);
          } else {
            this.saveEditedOnFirstGrid(data);
          }
        }
      }
    });
  }

  showDynamicValuesForm(row: any, newRow: boolean) {
    if (this.modalDynamicValues == null) {
      this.modalDynamicValues = this.modalService.create(
        DynamicValuesComponent,
        {
          modalTitle: 'Editor Atributos Dinámicos',
          height: 290,
          width: 350,
          resizable: false
        }
      );
    } else {
      this.modalDynamicValues.instance.open();
    }
    this.modalDynamicValues.instance.start({
      data: row, returnData: (data: any) => {
        if (data) {
          if (newRow) {
            this.saveNewOnFirstGrid(data);
          } else {
            this.saveEditedOnFirstGrid(data);
          }
        }
      }
    });
  }

  showSpatialRelationForm(row: any, newRow: boolean) {
    if (this.modalSpatialRelation == null) {
      this.modalSpatialRelation = this.modalService.create(
        SpatialRelationComponent,
        {
          modalTitle: 'Editor Relaciones Espaciales',
          height: 230,
          width: 350,
          resizable: false
        }
      );
    } else {
      this.modalSpatialRelation.instance.open();
    }
    this.modalSpatialRelation.instance.start({
      data: row, returnData: (data: any) => {
        if (data) {
          if (newRow) {
            this.saveNewOnFirstGrid(data);
          } else {
            this.saveEditedOnFirstGrid(data);
          }
        }
      }
    });
  }

  executeCambiarContrasenia(): void {
    if (this.currentFirstRow) {
      if (this.modalCambiarContrasenia == null) {
        this.modalCambiarContrasenia = this.modalService.create(
          ChangePasswordComponent,
          {
            modalTitle: `Cambiar Contraseña a ${this.currentFirstRow.NOMBREUSUARIO}`,
            height: 150,
            width: 450,
            resizable: true
          }
        );
      } else {
        this.modalCambiarContrasenia.instance.open();
      }
      this.modalCambiarContrasenia.instance.start({ data: this.currentFirstRow.NOMBREUSUARIO, isAdmin: true }, `Cambiar Contraseña a ${this.currentFirstRow.NOMBREUSUARIO}`);
    } else {
      alert('Debe seleccionar una fila.');
    }
  }

  executeDesbloquearUsuario(): void {
    if (this.currentFirstRow) {
      this.startProgress();
      this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.DesbloquearUsuario,
          [new InputParameter('un_usuario', this.currentFirstRow.NOMBREUSUARIO)]
        )
      )
      .subscribe(json => {
        this.onDesbloquearUsuarioComplete(json);
      });
    } else {
      alert('Debe seleccionar una fila.');
    }
  }

  onDesbloquearUsuarioComplete(json: any) {
    const result = this.handleErrorResponse(json);
    if (result != null) {
      alert('El usuario ha sido desbloqueado exitosamente!');
    }
  }

  executeOtorgarPermisos(): void {
    if (this.currentFirstRow) {
      this.startProgress();
      this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.AsignarPermisosUsuario,
          [new InputParameter('un_usuario', this.currentFirstRow.NOMBREUSUARIO)]
        )
      )
      .subscribe(json => {
        this.onOtorgarPermisosComplete(json);
      });
    } else {
      alert('Debe seleccionar una fila.');
    }
  }

  onOtorgarPermisosComplete(json: any) {
    const result = this.handleErrorResponse(json);
    if (result != null) {
      alert('Los permisos han sido creados satisfactoriamente!');
    }
  }

  saveNewOnFirstGrid(data: any): void {
    const paramValue = this.getXMLParameter(data);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures.Create,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.onFirstGridActionComplete(json);
      });
  }

  private onFirstGridActionComplete(result: any): void {
    this.handleErrorResponse(result);
    this.realoadGridData();
  }

  saveEditedOnFirstGrid(data: any): void {
    const paramValue = this.getXMLParameter(data);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures.Update,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.onFirstGridActionComplete(json);
      });
  }

  deleteOnFirstGrid(data: any): void {
    const paramValue = this.getXMLParameter(data);
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.storeProcedures.Delete,
          [new InputParameter('xml_Params', paramValue)]
        )
      )
      .subscribe(json => {
        this.onFirstGridActionComplete(json);
      });
  }

  private tranformModel(model: any): any {
    const newValues = {};
    if (this.dropDownListFieldNames.length > 0) {
      const id = model[this.configFirstGrid.idField];
      const dropDownListIdValues = this.gridDataListFieldsIndexValues[id];
      this.dropDownListFieldNames.forEach(fieldName => {
        const listIdValue = dropDownListIdValues[fieldName];
        const columnConfig = this.configFirstGrid.columns[fieldName];
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

  private getXMLParameter(listValues: any): string {
    delete listValues.originalRecord;
    let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';
    Object.keys(listValues).forEach(key => {
      if (key !== 'uid') {
        xmlValues += '<param>';
        xmlValues += `<name>${key}</name>`;
        xmlValues += `<value>${this.getXMLParameterValue(
          listValues,
          key
        )}</value>`;
        xmlValues += '</param>';
      }
    });
    xmlValues += '</params>';
    return xmlValues;
  }

  private getXMLParameterValue(model: any, key: string) {
    if (this.dropDownListFieldNames.length > 0) {
      if (this.dropDownListFieldNames.indexOf(key) >= 0) {
        const column = this.configFirstGrid.columns[key];
        // the model in this key will have an object representing the dropDownList item {value, text} shaped
        return model[key][column.valueField];
      }
    }
    return model[key];
  }

  private cleanGrid(): void {
    this.gridDataFirstGrid = [];
  }

  private handleErrorResponse(json): any {
    this.stopProgress();
    const values = Object.keys(json).map(key => json[key]);
    if (values != null && values.length > 0) {
      const result = typeof (values[0]) === 'string' && values[0].indexOf('}') >= 0 ? JSON.parse(values[0].toString()) : values[0];
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
