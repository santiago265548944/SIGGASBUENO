import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import {
  DynamicField,
  DynamicFieldCombo
} from '../dynamic-input/dynamic-field';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';
import { CallModal } from '../../map-service/map-action';
import * as moment from 'moment';

@Component({
  selector: 'app-consult',
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.css']
})
export class ConsultComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  @ViewChild('dataTable') dataTable: jqxDataTableComponent;

  consultList: Array<any>;
  consultItemSelected: any;
  dynamicItems: Array<any>;
  paramItems: Array<any>;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  consult: boolean;
  consultResults: Array<any>;
  closeFunction: Function;

  constructor(private apiService: ApiService, private mapService: MapService) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.consult = false;
  }

  ngOnInit() {
    this.loadDropDownConsult();
  }

  private loadDropDownConsult() {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerConsulta,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadDropDownConsultCompleted(JSON.parse(json[0]));
        }
      });
  }

  private loadDropDownConsultCompleted(json: any) {
    if (json['Table1'] != null) {
      // ATTR: IDBUSQUEDA, DESCRIPCION, PROCEDIMIENTO
      this.consultList = json['Table1'];
    }
  }

  consultItemChanged(itemSelected: any): void {
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerParametro,
          [new InputParameter('una_Consulta', itemSelected.IDCONSULTA)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[1] != null) {
          this.createDynamicInputs(JSON.parse(json[1]));
        }
      });
  }

  private createDynamicInputs(json: any) {
    /* ARRAY ATTRIBUTES:
      IDBUSQUEDA, PARAMETRO, ORDEN, TIPOPARAMETRO, PROCEDIMIENTO, TIPODATO, CLASEPARAMETRO
      , ETIQUETA, COMBODEPARTAMENTO, COMBOLOCALIDAD, COMBOPADRE, COMBOHIJO, CODIGO*/
    if (json['Table1'] != null) {
      this.paramItems = json['Table1'];
      this.dynamicItems = this.paramItems.map(item => {
        let control = null;
        if (item.TIPOPARAMETRO === 'COMBO') {
          control = new DynamicFieldCombo(item);
        } else {
          control = new DynamicField(item);
        }
        return control;
      });
    }
  }

  onBuscarClick(): void {
    this.startProgress();
    const parameters = this.Buscarconsulta();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.consultItemSelected.PROCEDIMIENTO,
          parameters
        )
      )
      .subscribe(json => {
        this.stopProgress();
        this.processConsultResponse(json);
      });
  }

  private Buscarconsulta(): InputParameter[] {
    const inputParameters = new Array<InputParameter>();
    this.dynamicItems.forEach(item => {
      if (item.ClaseParametro === 'E') {
        switch (item.TipoParametro) {
          case 'TEXT':
          inputParameters.push(
            new InputParameter(item.Parametro, item.Value)
          );
          break;
          case 'DATE':
          const fecha = moment(item.Value).format('DD-MM-YYYY');
            inputParameters.push(
              new InputParameter(item.Parametro, fecha)
            );
            break;
          case 'COMBO':
            inputParameters.push(
              new InputParameter(
                item.Parametro,
                item.Value != null ? item.Value.value : null
              )
            );
            break;
          case 'CHECK':
            inputParameters.push(
              new InputParameter(item.Parametro, item.Value ? '1' : '0')
            );
            break;
        }
      }
    });
    return inputParameters;
  }

  private processConsultResponse(json: any) {
    const values = Object.values(json);
    if (values.length > 0) {
      const responseContent = JSON.parse(values[0].toString());
      if (responseContent.ErrorMessage != null) {
        alert(responseContent.ErrorMessage);
      } else {
        const responseValues = Object.values(responseContent);
        if (responseValues == null || responseValues.length === 0) {
          alert('No hay resultados en la consulta.');
        } else {
          ResultToGraphicCollection.convert(
            <Array<any>>responseValues[0],
            results => {
              this.consultResults = results;
            }
          );
        }
      }
    }
  }

  onVerDatosClick(): void {
    if (this.consultResults != null && this.consultResults.length > 0) {
      this.mapService.executeMapAction(<CallModal>{
        EMapAction: EmapActions.CallModal,
        EModal: Emodal.ViewSelection,
        parameters: this.consultResults
      });
    }
  }

  onCancelarClick(): void {
    this.closeFunction();
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

  exportExcel(): void {
    this.dataTable.exportData('pdf');
  }

  start(): void {
   this.consultItemSelected = null;
   this.dynamicItems = null;
   this.consultResults = null;
  }
}
