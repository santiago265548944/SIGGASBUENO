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
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { CallModal, FlashToGeometry } from '../../map-service/map-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';

@Component({
  selector: 'app-searches',
  templateUrl: './searches.component.html',
  styleUrls: ['./searches.component.css']
})
export class SearchesComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  searchesList: Array<any>;
  searchItemSelected: any;
  dynamicItems: Array<any>;
  paramItems: Array<any>;
  searchResults: Array<any>;
  closeFunction: Function;

  constructor(private apiService: ApiService, private mapService: MapService) {}

  ngOnInit() {
    this.loadDropDownSearches();
  }

  private loadDropDownSearches() {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerBusquedas,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadDropDownSearchesCompleted(JSON.parse(json[0]));
        }
      });
  }

  private loadDropDownSearchesCompleted(json: any) {
    if (json['Table1'] != null) {
      // ATTR: IDBUSQUEDA, DESCRIPCION, PRODCEDIMIENTO
      this.searchesList = json['Table1'];
    }
  }

  searchItemChanged(itemSelected: any): void {
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerParametrosBusquedas,
          [new InputParameter('una_Busqueda', itemSelected.IDBUSQUEDA)]
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

  onBuscarButtonClick(): void {
    this.startProgress();
    this.searchResults = new Array<any>();
    const parameters = this.getSearchParameters();

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          this.searchItemSelected.PROCEDIMIENTO,
          parameters
        )
      )
      .subscribe(json => {
        this.stopProgress();
        this.processSearchResponse(json);
      });
  }

  getSearchParameters(): InputParameter[] {
    const inputParameters = new Array<InputParameter>();

    this.dynamicItems.forEach(item => {
      if (item.ClaseParametro === 'E') {
        switch (item.TipoParametro) {
          case 'TEXT':
          case 'DATE':
            inputParameters.push(
              new InputParameter(item.Parametro, item.Value)
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

  private processSearchResponse(json: any) {
    const values = Object.values(json);
    if (values.length > 0) {
      const responseContent = JSON.parse(values[0].toString());
      if (responseContent.ErrorMessage != null) {
        alert(responseContent.ErrorMessage);
      } else {
        const responseValues = Object.values(responseContent);
        if (responseValues == null || responseValues.length === 0) {
          alert('No hay resultados en la búsqueda.');
        } else {
          ResultToGraphicCollection.convert(
            <Array<any>>responseValues[0],
            results => {
              this.searchResults = results;
              this.mapService.executeMapAction(<FlashToGeometry>{
                EMapAction: EmapActions.ZoomToGeometry,
                geometry: results[0].geometry
              });
            }
          );
        }
      }
    }
  }

  onVerDatosClick(): void {
    if (this.searchResults != null && this.searchResults.length > 0) {
      this.mapService.executeMapAction(<CallModal>{
        EMapAction: EmapActions.CallModal,
        EModal: Emodal.ViewSelection,
        parameters: this.searchResults
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

  start(): void {
    this.searchItemSelected = null;
    this.dynamicItems = null;
    this.searchResults = null;
  }
}
