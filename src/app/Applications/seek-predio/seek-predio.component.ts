import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MapService } from '../../map-service/map.service';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { ReturnElementAction } from '../../map-service/map-action';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { loadModules } from 'esri-loader';
import { MemoryService } from '../../cache/memory.service';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { parseString } from 'xml2js';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxTabsComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtabs';

@Component({
  selector: 'app-seek-predio',
  templateUrl: './seek-predio.component.html',
  styleUrls: ['./seek-predio.component.css']
})
export class SeekPredioComponent implements OnInit {
  subscription: Subscription;
  domPredio: string;
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  @ViewChild('tabsElement') jqxTabs: jqxTabsComponent;

  constructor(
    private mapService: MapService,
    private memoryService: MemoryService,
    private apiService: ApiService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeReturnElementAction(mapAction));
  }

  startProgress(): void {
    this.jqxLoader.open();
  }

  stopProgress(): void {
    this.jqxLoader.close();
  }

  ngOnInit() {}

  private executeReturnElementAction(
    returnElementAction: ReturnElementAction
  ): void {
    if (returnElementAction.EMapAction === EmapActions.SeekPredioGeometry) {
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
          // TODO: this generic url should be a generic function
          const argisServerName = this.memoryService.getItem(
            'ArcGISServerName'
          );
          const argisServerPort = this.memoryService.getItem(
            'ArcGISServerPort'
          );
          const genericUrl = this.memoryService
            .getItem('ArcGISServerURL')
            .replace('{0}', argisServerName)
            .replace('{1}', argisServerPort);
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
      IdentifyParametersClass.LAYER_OPTION_VISIBLE;
    identifyParameters.spatialReference =
      returnElementAction.map.spatialReference;
    identifyParameters.layerIds = new Array<number>();
    identifyParameters.tolerance = 1;
    identifyParameters.returnGeometry = true;
    identifyParameters.layerIds = [
      this.memoryService.getItem('PredioLayerIndex')
    ];
    return identifyParameters;
  }

  onIdentifyTaskComplete(
    identifyResultsArg: Array<any>,
    identifyParameters: any
  ): void {
    const elemDelete = this.jqxTabs.length();
    for (let i = 0; i < elemDelete - 1; i++) {
      this.jqxTabs.removeLast();
    }

    if (identifyResultsArg.length > 0) {
      const unTagParam = new InputParameter(
        'un_Tag',
        identifyResultsArg[0].feature.attributes.ETIQUETA
      );
      this.domPredio = this.createDOMPredio(
        identifyResultsArg[0].feature.attributes
      );

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerIdentificacionPredio,
            [unTagParam]
          )
        )
        .subscribe(json => {
          if (json['1']) {
            const jsonTable = JSON.parse(json['1']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                const itemName = element.TABLE_NAME;
                const itemInfo = element.TABLE_ROWS;
                if (itemName !== 'PREDIO') {
                  let content: any;
                  parseString(itemInfo, { trim: true }, function(err, result) {
                    content = result;
                  });
                  this.jqxTabs.addLast(
                    itemName,
                    this.createDOMInformation(content.ROWSET)
                  );
                }
              });
            }
          }
          this.jqxTabs.select(0);
          this.stopProgress();
          this.jqxTabs.createComponent();
        });
    } else {
      this.stopProgress();
      alert('No se logró encontrar un predio.');
    }
  }

  createDOMInformation(data: any): string {
    const arrayProperty = Object.keys(data.ROW[0]);
    let html = `<div style="width:100%; overflow:auto; height:100%">
    <table class="table table-bordered table-hover">
        <thead>
            <tr>`;
    arrayProperty.forEach(elem => {
      html += '<th>' + elem + '</th>';
    });
    html += `</tr>
        </thead>
        <tbody>`;
    data.ROW.forEach(tr => {
      const arrayValues = Object.values(tr);
      html += `<tr>`;
      arrayValues.forEach(elem => {
        html += '<td>' + elem + '</td>';
      });
      html += `</tr>`;
    });
    html += `</tbody>
    </table></div>
    `;
    return html;
  }

  createDOMPredio(data: any): string {
    const arrayProperty = Object.keys(data);
    const arrayValues = Object.values(data);
    let html = `<div style="width:490px; overflow:auto; height:100%">
    <table class="table table-bordered table-hover">
        <thead>
            <tr>`;
    arrayProperty.forEach(elem => {
      html += '<th>' + elem + '</th>';
    });
    html += `</tr>
        </thead>
        <tbody>
            <tr>`;
    arrayValues.forEach(elem => {
      html += '<td>' + elem + '</td>';
    });
    html += `</tr>
        </tbody>
    </table></div>
    `;

    return html;
  }

  onIdentifyError(error: string, identifyParameters: any): void {
    this.stopProgress();
    console.error(error);
  }
}
