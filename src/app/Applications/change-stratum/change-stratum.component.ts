import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
// import { jqxGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { MapService } from '../../map-service/map.service';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from '../../map-service/map-actions/select-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';
import { EmbeddedSelectionComponent } from '../../selection/embedded-selection/embedded-selection.component';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { MemoryService } from '../../cache/memory.service';
import { ChangeStratumModel } from './change-stratum-model';
import { InputParameter } from '../../api/request/input-parameter';
import { FlashToGeometry, CallModal } from '../../map-service/map-action';

@Component({
  selector: 'app-change-stratum',
  templateUrl: './change-stratum.component.html',
  styleUrls: ['./change-stratum.component.css']
})
export class ChangeStratumComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  @ViewChild('jqxDataTable') jqxDataTable: jqxDataTableComponent;
  tiposRecepcion: Array<any>;
  changeStratumSelectType = OwnerSelection.ChangeStratum;
  subscription: Subscription;
  selectedPredios: Array<string>;
  model: ChangeStratumModel;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  seleccionarCambioEstratoExpanded: boolean;
  selectionToolExpanded: boolean;
  dataNewStratumExpanded: boolean;
  stratumSelectionData: Array<any>;
  stratumTags: Array<string>;
  stratumSubscriptionIds: Array<string>;
  closeFunction: Function;

  constructor(
    private apiService: ApiService,
    private mapService: MapService,
    private memoryService: MemoryService
  ) {
    this.selectedPredios = new Array<string>();
    this.model = new ChangeStratumModel();
    this.seleccionarCambioEstratoExpanded = false;
    this.selectionToolExpanded = true;
    this.dataNewStratumExpanded = true;
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.handleSelectAction(mapAction));
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.fillTipoRecepcion();
  }

  fillTipoRecepcion(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListaTiposRecepcion,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.fillTipoRecepcionCompleted(JSON.parse(json[0]));
        }
      });
  }

  private fillTipoRecepcionCompleted(json: any): void {
    if (json['Table1'] != null) {
      this.tiposRecepcion = json['Table1'].map(item => ({
        value: item.ID,
        text: item.DESCRIPTION
      }));
    }
  }

  handleSelectAction(mapAction: SelectAction) {
    if (mapAction.owner === OwnerSelection.ChangeStratum) {
      if (mapAction.EMapAction === EmapActions.Select) {
        if (
          mapAction.selectActionType === SelectActionType.ViewSelectionResponse
        ) {
          this.createArraySelectedPredios(mapAction.selectedFeatures);
        }
      }
    }
  }

  private createArraySelectedPredios(selectedFeatures: Array<any>): void {
    const predioLayerIndex = this.memoryService.getItem('PredioLayerIndex');
    const predioServiceName = this.memoryService.getItem('PredioServiceName');
    let isValid = false;
    if (selectedFeatures.length > 0) {
      const layer = selectedFeatures[0].getLayer();
      if (
        layer.url.indexOf(predioServiceName) > 0 &&
        layer.url.indexOf(predioLayerIndex) > 0
      ) {
        isValid = true;
        this.selectionToolExpanded = false;
        this.selectedPredios = selectedFeatures.map(
          graphic => graphic.attributes.TAG
        );
      }
    }

    if (!isValid) {
      this.selectedPredios = new Array<string>();
    }
  }

  onAceptarClick(): void {
    this.seleccionarCambioEstratoExpanded = true;
    if (this.validatePrepare()) {
      this.prepareChangeStratum();
    }
  }

  private validatePrepare(): boolean {
    const messages = new Array<string>();
    if (this.selectedPredios.length === 0) {
      messages.push(
        'Debe seleccionar los predios a los cuales les desea cambiar el estrato.'
      );
    }

    if (
      this.model.Resolucion === '' ||
      this.model.NuevoEstrato == null ||
      this.model.FechaResolucion == null ||
      this.model.TipoRecepcion == null
    ) {
      messages.push('Debe ingresar los datos de todos los campos.');
    }

    if (this.model.Comentario.length < 20) {
      messages.push('La observación debe tener más de 20 caracteres.');
    }

    if (messages.length > 0) {
      alert(messages.join('\n'));
    }

    return messages.length === 0;
  }

  private prepareChangeStratum(): void {
    this.startProgress();
    const xmlParam = this.getXMLParameter(this.selectedPredios, 'tag');
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.VerificarEstratos,
          [
            new InputParameter('estrato', this.model.NuevoEstrato),
            new InputParameter('xml_tags', xmlParam)
          ]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        this.fillGrid(json);
      });
  }

  // private getXMLParameter(): string {
  //   let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';

  //   xmlValues += '<param name="tag">';
  //   this.selectedPredios.forEach((tag) => {
  //     xmlValues += `<value>${tag}</value>`;
  //   });
  //   xmlValues += '</param>';

  //   xmlValues += '</params>';
  //   return xmlValues;
  // }

  private getXMLParameter(listValues: Array<any>, paramName: string): string {
    let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';

    xmlValues += `<param name="${paramName}">`;
    listValues.forEach(item => {
      xmlValues += `<value>${item}</value>`;
    });
    xmlValues += '</param>';

    xmlValues += '</params>';
    return xmlValues;
  }

  fillGrid(jsonResult: any) {
    try {
      if (jsonResult['2']) {
        this.dataNewStratumExpanded = false;
        const jsonTable = JSON.parse(jsonResult['2']);
        if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
          this.prepareDataTableColumns(jsonTable['Table1'][0]);
          this.prepareDataTableSource(jsonTable['Table1']);
        } else {
          this.cleanGrid();
        }
      } else {
        // TODO: Mostrar error. No se ha identificado en que indice viene error su supone en el 0
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
    for (let index = 0; index < keys.length; index++) {
      this.dataTableColumns.push({
        text: keys[index],
        dataField: keys[index],
        width: '100'
      });
    }
  }

  prepareDataTableSource(data: any[]): void {
    const keys = Object.keys(data[0]);
    const dataFields = [];
    for (let index = 0; index < keys.length; index++) {
      dataFields.push({ name: keys[index], type: 'string' });
    }
    const source: any = {
      localData: data,
      dataFields: dataFields,
      dataType: 'json'
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  onCancelarClick(): void {
    this.closeFunction();
  }

  stratumChangeSelectionCollapsed(): void {
    this.seleccionarCambioEstratoExpanded = false;
  }

  selectionToolCollapsed(): void {
    this.selectionToolExpanded = false;
  }

  dataNewStratumCollapsed(): void {
    this.dataNewStratumExpanded = false;
  }

  private cleanGrid(): void {
    this.dataTableColumns = [];
    this.dataAdapter = new jqx.dataAdapter(null);
  }

  onChangeStratumClick(): void {
    const selection = this.jqxDataTable.getSelection();
    if (selection.length > 0) {
      const xmlTags = this.getXMLParameter(
        selection.map(item => item.TAG),
        'tag'
      );
      const xmlSuscriptions = this.getXMLParameter(
        selection.map(item => item.SUSCRIPTION_ID),
        'suscripcion'
      );

      this.startProgress();
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ActualizarEstratos,
            [
              new InputParameter(
                'reception_type',
                this.model.TipoRecepcion.value
              ),
              new InputParameter('resolucion', this.model.Resolucion),
              new InputParameter('estrato', this.model.NuevoEstrato),
              new InputParameter(
                'fecha_resolucion',
                this.model.FechaResolucion
              ),
              new InputParameter('comentario', this.model.Comentario),
              new InputParameter('xml_tags', xmlTags),
              new InputParameter('xml_susc', xmlSuscriptions)
            ]
          )
        )
        .subscribe(json => {
          this.stopProgress();
          alert(Object.values(json)[0]);
        });
    } else {
      alert('Debe seleccionar los predios para cambiar de estrato.');
    }
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
