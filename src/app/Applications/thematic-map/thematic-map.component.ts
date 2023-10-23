import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ComponentRef
} from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import {
  DynamicFieldCombo,
  DynamicField
} from '../dynamic-input/dynamic-field';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { AddGeometry } from '../../map-service/map-action';
import { ModalService } from '../../modal.module';
import { LegendThematicComponent } from './legend-thematic/legend-thematic.component';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from '../../map-service/map-actions/select-action';
import { CodeValue } from '../../generic-class/code-vale';

@Component({
  selector: 'app-thematic-map',
  templateUrl: './thematic-map.component.html',
  styleUrls: ['./thematic-map.component.css']
})
export class ThematicMapComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;
  @ViewChild('dataTable')
  dataTable: jqxDataTableComponent;

  modalLegend: ComponentRef<any> = null;
  thematicList: Array<any>;
  thematicItemSelected: any;
  resultItemSelected: any;
  dynamicItems: Array<any>;
  paramItems: Array<any>;
  legendValues: any;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  listElements: any;
  fullExtent: any;
  closeFunction: Function;
  dataReport: any;
  resultList: Array<CodeValue>;
  report = true;
  export = true;
  legend = true;
  select = true;

  constructor(
    private apiService: ApiService,
    private mapService: MapService,
    private modalService: ModalService
  ) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.resultList = new Array<CodeValue>();
    this.resultList.push(<CodeValue>{
      Code: <any>1,
      Value: 'Elementos Gráficos'
    });
    this.resultList.push(<CodeValue>{ Code: <any>2, Value: 'Reporte' });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadDropDownThematic();
  }

  private loadDropDownThematic() {
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerTematicos,
          []
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[0] != null) {
          this.loadDropDownThematicCompleted(JSON.parse(json[0]));
        }
      });
  }

  private loadDropDownThematicCompleted(json: any) {
    if (json['Table1'] != null) {
      // ATTR: IDTEMATICO, DESCRIPCION, PROCEDIMIENTO, TIENEREPORTE, REPORTE
      this.thematicList = json['Table1'];
    }
  }

  thematicItemChanged(itemSelected: any): void {
    this.startProgress();
    this.report = !(itemSelected.TIENEREPORTE === 'S');
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerParametrosTematicos,
          [new InputParameter('un_tematico', itemSelected.IDTEMATICO)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[1] != null) {
          this.createDynamicInputs(JSON.parse(json[1]));
        }
      });
  }

  resultItemChanged(itemSelected: any): void {
    if (itemSelected === 1) {
      if (this.listElements) {
        this.convertCallback(this.listElements);
      }
    } else {
      if (this.dataReport) {
        this.populateReport();
      }
    }
  }

  private createDynamicInputs(json: any) {
    /* ARRAY ATTRIBUTES:
      IDTEMATICO, PARAMETRO, ORDEN, TIPOPARAMETRO, PROCEDIMIENTO, TIPODATO, CLASEPARAMETRO
      , ETIQUETA, COMBODEPARTAMENTO, COMBOLOCALIDAD, COMBOPADRE, COMBOHIJO, CODIGO, COMBOSECTOR*/
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

  onShowThematicClick(task: number): void {
    let procedure: string;
    this.resultItemSelected = task;
    if (task === 1) {
      procedure = this.thematicItemSelected.PROCEDIMIENTO;
    } else {
      procedure = this.thematicItemSelected.REPORTE;
    }

    this.startProgress();
    const parameters = this.getSearchParameters();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(procedure, parameters)
      )
      .subscribe(json => {
        if (procedure === this.thematicItemSelected.PROCEDIMIENTO) {
          const posResult = Object.getOwnPropertyNames(json);
          if (posResult.length === 3) {
            /*
            4 => Data
            5 => Full extent
            6 => legend (NOMBRE-COLOR)
             */
            this.toggleBotton(false);
            const jsonData = JSON.parse(json[posResult[0]]);
            const jsonExtent = [{ SHAPE: json[posResult[1]] }];
            this.legendValues = JSON.parse(json[posResult[2]])['Table1'];
            if (jsonData['Table1']) {
              ResultToGraphicCollection.convert(jsonExtent, results =>
                this.convertFullExtent(results)
              );
              ResultToGraphicCollection.convert(jsonData['Table1'], results =>
                this.convertCallback(results)
              );
            } else {
              this.toggleBotton(true);
              alert('El temático No Arrojó Resultados');
            }
          } else if (json[3] != null && (json[4] != null && json[5]) != null) {
            this.toggleBotton(false);
            const jsonData = JSON.parse(json[3]);
            const jsonExtent = [{ SHAPE: json[4] }];
            this.legendValues = JSON.parse(json[5])['Table1'];
            if (jsonData['Table1']) {
              ResultToGraphicCollection.convert(jsonExtent, results =>
                this.convertFullExtent(results)
              );
              ResultToGraphicCollection.convert(jsonData['Table1'], results =>
                this.convertCallback(results)
              );
            } else {
              this.toggleBotton(true);
              alert('El temático No Arrojó Resultados');
            }
          } else {
            this.toggleBotton(true);
            alert('El temático No Arrojó Resultados');
          }
        } else {
          if (json[0]) {
            this.dataReport = JSON.parse(json[0])['Table1'];
            this.populateReport();
          } else {
            alert('El reporte No Arrojó Resultados');
          }
        }
        this.stopProgress();
      });
  }

  private populateReport() {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();

    const localData = new Array<any>();
    const results = this.dataReport;
    // tslint:disable-next-line:forin
    for (const index in results[0]) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }
    // tslint:disable-next-line:forin
    for (const element of results) {
      localData.push(element);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  private toggleBotton(arg: boolean) {
    this.export = arg;
    this.legend = arg;
    this.select = arg;
  }

  private convertFullExtent(results: any) {
    this.fullExtent = results[0].geometry;
    // this.mapService.executeMapAction(<FlashToGeometry>{
    //   EMapAction: EmapActions.ZoomToGeometry,
    //   geometry: this.fullExtent
    // });
  }

  private convertCallback(results: any) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();

    this.listElements = results;
    const localData = new Array<any>();
    const firstGraphic = results[0];
    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }
    // tslint:disable-next-line:forin
    for (const element of results) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapter = new jqx.dataAdapter(source);

    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: results
    });

    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.ZoomToSelection,
      featureSelected: this.listElements,
      owner: OwnerSelection.genericAction
    });
  }

  onSelectClick() {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.ZoomToSelection,
      featureSelected: this.listElements,
      owner: OwnerSelection.genericAction
    });

    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: this.listElements
    });
  }

  onExportClick() {
    this.dataTable.exportData('xls');
  }

  onCancelClick() {
    this.closeFunction();
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

  onLegendClick() {
    if (this.modalLegend == null) {
      this.modalLegend = this.modalService.create(LegendThematicComponent, {
        modalTitle: 'Leyenda',
        height: 210,
        width: 200,
        resizable: true
      });
    } else {
      this.modalLegend.instance.open();
    }
    this.modalLegend.instance.start(this.legendValues);
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
    this.thematicItemSelected = null;
    this.dynamicItems = null;
    this.dataTableColumns = null;
  }
}
