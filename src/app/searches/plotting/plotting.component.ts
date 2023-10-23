import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CodeValue, ParamPlotting } from '../../generic-class/code-vale';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { MemoryService } from '../../cache/memory.service';
import { loadModules } from 'esri-loader';
import { MapService } from '../../map-service/map.service';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { EmapActions } from '../../map-service/emap-actions.enum';
import {
  GeoZoomActionType,
  GeoZoomAction
} from '../../map-service/map-actions/geozoom-action';
import { PlottingParams, ElementNames } from '../square-scheme/plotting-params';
declare var $: any;

@Component({
  selector: 'app-plotting',
  templateUrl: './plotting.component.html',
  styleUrls: ['./plotting.component.css']
})
export class PlottingComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  private subscription: Subscription;
  plottingValues: Array<CodeValue>;
  paramsValues: Array<ParamPlotting>;
  plotting: string;
  jsonParameters: string;
  map: any;
  selectRow: string;

  constructor(
    private apiService: ApiService,
    private memoryService: MemoryService,
    private mapService: MapService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeGeoZoomAction(mapAction));
  }

  ngOnInit() {
    this.plottingValues = new Array<CodeValue>();
    this.paramsValues = new Array<ParamPlotting>();
  }

  private executeGeoZoomAction(geoZoomAction: GeoZoomAction) {
    switch (geoZoomAction.geoZoomActionType) {
      case GeoZoomActionType.FillServicesResponse:
        this.map = geoZoomAction.map;
        break;
    }
  }

  ngAfterViewInit() {
    this.mapService.executeMapAction(<GeoZoomAction>{
      EMapAction: EmapActions.GeoZoom,
      geoZoomActionType: GeoZoomActionType.FillServicesRequest
    });

    this.startProgress();
    // TODO: usuario debe ser el logs
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerPlantillasPloteo,
          [new InputParameter('un_usuario', 'siggas')]
        )
      )
      .subscribe(json => {
        if (json['1']) {
          const jsonTable = JSON.parse(json['1']);
          if (jsonTable['Table1']) {
            jsonTable['Table1'].forEach(element => {
              this.plottingValues.push(<CodeValue>{
                Value: element.NOMBREPLANTILLA,
                Code: element.IDPLANTILLA
              });
            });
          }
        }
        this.stopProgress();
      });
  }

  onChangePlotting(evt: any): void {
    this.startProgress();
    this.paramsValues = new Array<ParamPlotting>();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerParametrosPlantilla,
          [
            new InputParameter('un_usuario', 'siggas'),
            new InputParameter('una_plantilla', evt)
          ]
        )
      )
      .subscribe(json => {
        if (json['2']) {
          const jsonTable = JSON.parse(json['2']);
          if (jsonTable['Table1']) {
            jsonTable['Table1'].forEach(element => {
              this.paramsValues.push(<ParamPlotting>{
                Value: element.NOMBREPARAMETRO,
                Guid: Math.random().toString(),
                Class: 'unSelectedRow',
                ExternalValue:
                  element.NOMBREPARAMETRO + '|' + element.TIPOPARAMETRO
              });
            });
          }
        }
        this.stopProgress();
      });
  }

  executeGenerate() {
    const arrElements = $('#tableContent :input');
    const plottingParams = new PlottingParams();
    plottingParams.Element_Names = new Array<ElementNames>();

    for (let i = 0; i < arrElements.length; i = i + 2) {
      if (arrElements[i + 1].value !== '') {
        plottingParams.Element_Names.push(<ElementNames>{
          name: arrElements[i].value,
          type: arrElements[i + 1].id.split('|')[1],
          content: arrElements[i + 1].value
        });
      }
    }
    this.jsonParameters = JSON.stringify(plottingParams);
    this.generatePDF(this.plotting);
  }

  private generatePDF(layout: string) {
    this.startProgress();
    loadModules(
      [
        'esri/tasks/PrintTask',
        'esri/tasks/PrintParameters',
        'esri/tasks/PrintTemplate',
        'esri/tasks/ParameterValue'
      ],
      {
        url: 'https://js.arcgis.com/3.23/'
      }
    )
      .then(([PrintTask, PrintParameters, PrintTemplate, ParameterValue]) => {
        const printTask = new PrintTask(
          this.memoryService.getItem('PlottingURL'),
          { async: true }
        );
        const params = new PrintParameters();
        const template = new PrintTemplate();
        params.map = this.map;
        params.extraParameters = {
          Layout_Template: layout,
          Params: this.jsonParameters,
          Georef_info: true
        };
        params.template = template;
        printTask.execute(params);
        printTask.on('complete', evt => {
          window.open(evt.result.url, '_blank');
          this.stopProgress();
        });
        printTask.on('error', evt => {
          alert(evt);
          console.log(evt);
          this.stopProgress();
        });
      })
      .catch(err => {
        console.error(err);
        this.stopProgress();
      });
  }

  addRow() {
    this.paramsValues.push(<ParamPlotting>{
      Value: '',
      Guid: Math.random().toString(),
      Class: 'unSelectedRow',
      ExternalValue: '|TEXT_ELEMENT'
    });
  }

  deleteRow() {
    if (this.selectRow) {
      this.paramsValues = this.paramsValues.filter(
        e => e.Guid !== this.selectRow
      );
      this.selectRow = undefined;
    }
  }

  setRowSelect(evt: string) {
    this.paramsValues.forEach(element => {
      element.Class = 'unSelectedRow';
    });

    this.paramsValues[this.paramsValues.findIndex(e => e.Guid === evt)].Class =
      'selectedRow';
    this.selectRow = evt;
  }
  private startProgress(): void {
    this.jqxLoader.open();
  }

  private stopProgress(): void {
    this.jqxLoader.close();
  }
}
