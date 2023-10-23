import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { jqxSplitterComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxsplitter';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { loadModules } from 'esri-loader';
import { MapService } from '../map-service/map.service';
import { IdentifyAction, IdentifyActionType } from '../map-service/map-actions/identify-action';
import { EmapActions } from '../map-service/emap-actions.enum';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { FlashToGeometry } from '../map-service/map-action';
import { DataSharingService } from '../service/data-sharing.service';

@Component({
   selector: 'app-identify',
   templateUrl: './identify.component.html',
   styleUrls: ['./identify.component.css']
})
export class IdentifyComponent implements OnInit {
   @ViewChild('identifySplitter') identifySplitter: jqxSplitterComponent;
   @ViewChild('selectLayerOptions') selectLayerOptions: ElementRef;
   @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

   layerOptionsData: Array<any>;
   selectedLayerOption: any;
   subscription: Subscription;
   identifyResultsGrouped: _.Dictionary<any>;
   dataTableColumns: Array<any>;
   dataAdapter: any;
   resultQuantity = 0;
   identifyTasks = new Array<any>();
   identifyResults: Array<any>;

   constructor(private mapService: MapService, private dataSharingService: DataSharingService) {
      this.layerOptionsData = new Array<any>();

      this.subscription = this.mapService
         .getMapAction()
         .subscribe((mapAction) => this.executeIdentifyAction(mapAction));
   }

   ngOnInit() {
      this.setupIdentifySplitter();
      this.fillSelectLayerOptions();
   }

   fillSelectLayerOptions(): void {
      loadModules(['esri/tasks/IdentifyParameters'], { url: 'https://js.arcgis.com/3.23/' })
         .then(([IdentifyParameters]) => {
            this.selectedLayerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;

            this.layerOptionsData.push({
               text: '<Capa Activa>',
               value: IdentifyParameters.LAYER_OPTION_TOP
            });
            this.layerOptionsData.push({
               text: '<Capas Visibles>',
               value: IdentifyParameters.LAYER_OPTION_VISIBLE
            });
            this.layerOptionsData.push({
               text: '<Todas las Capas>',
               value: IdentifyParameters.LAYER_OPTION_ALL
            });

            for (const item of this.layerOptionsData) {
               const optionItem = <HTMLOptionElement>document.createElement('option');
               optionItem.value = item.value;
               optionItem.text = item.text;
               this.selectLayerOptions.nativeElement.appendChild(optionItem);
            }
         })
         .catch((err) => {
            console.error(err);
         });
   }

   setupIdentifySplitter(): void {
      this.identifySplitter.attrWidth = '100%';
      this.identifySplitter.attrHeight = '99%';
      this.identifySplitter.attrPanels = new Array<any>();
      this.identifySplitter.attrPanels.push({ size: '35%', min: '20%' });
   }

   private executeIdentifyAction(identifyAction: IdentifyAction): void {
      if (identifyAction.EMapAction === EmapActions.Identify) {
         if (identifyAction.identifyActionType === IdentifyActionType.ReturnGeometry) {
            loadModules(
               [
                  'esri/tasks/IdentifyTask',
                  'esri/tasks/IdentifyParameters',
                  'esri/layers/ArcGISDynamicMapServiceLayer'
               ],
               { url: 'https://js.arcgis.com/3.23/' }
            ).then(([IdentifyTask, IdentifyParameters, ArcGISDynamicMapServiceLayer]) => {
               this.clearControls();
               this.startProgress();

               const identifyParameters = this.createIdentifyParameters(
                  IdentifyParameters,
                  identifyAction
               );
               for (const i of identifyAction.map.layerIds) {
                  const layer = identifyAction.map.getLayer(i);
                  if (layer instanceof ArcGISDynamicMapServiceLayer) {
                     this.identifyTasks.push(new IdentifyTask(layer.url));
                     // TODO: is it neccesary to put visible layers in Identify as it is in silverlight?
                     // if (layer.visibleLayers != null) {
                     //   identifyParameters.layerIds.splice(0, identifyParameters.layerIds.length, layer.visibleLayers);
                     // }
                  }
               }
               this.controlIdentifyActionExecution(identifyParameters);
            });
         }
      }
   }

   private startProgress(): void {
      this.jqxLoader.open();
   }

   private stopProgress(): void {
      this.jqxLoader.close();
   }

   private controlIdentifyActionExecution(identifyParameters: any): void {
      if (this.identifyTasks.length > 0) {
         const identifyTask = this.identifyTasks.shift();
         identifyTask.execute(
            identifyParameters,
            (identifyResults) => this.onIdentifyTaskComplete(identifyResults, identifyParameters),
            (error) => this.onIdentifyError(error, identifyParameters)
         );
      } else {
         const groupedItems = _.groupBy(this.identifyResults, 'layerName');
         this.identifyResultsGrouped = _.map(groupedItems, (item, other) => {
            const object = new Object();
            object[other] = _.uniq(item, 'value');
            this.resultQuantity += object[other].length;
            return object;
         });
         // Enviar los resultados al servicio compartido antes de restablecer a null
         this.dataSharingService.sendData(this.identifyResults);
         this.identifyResults = null;
         this.stopProgress();
      }
   }

   private createIdentifyParameters(
      IdentifyParametersClass: any,
      identifyAction: IdentifyAction
   ): any {
      const identifyParameters = new IdentifyParametersClass();
      identifyParameters.geometry = identifyAction.geometry;
      identifyParameters.mapExtent = identifyAction.map.extent;
      identifyParameters.width = identifyAction.map.width;
      identifyParameters.height = identifyAction.map.height;
      identifyParameters.layerOption = this.selectedLayerOption;
      identifyParameters.spatialReference = identifyAction.map.spatialReference;
      identifyParameters.layerIds = new Array<number>();
      identifyParameters.tolerance = 0.5;
      identifyParameters.returnGeometry = true;
      return identifyParameters;
   }

   onIdentifyTaskComplete(identifyResultsArg: Array<any>, identifyParameters: any): void {
      try {
         if (this.identifyResultsGrouped == null) {
            this.identifyResultsGrouped = new Array<any>();
         }
         if (this.identifyResults == null) {
            this.identifyResults = new Array<any>();
         }
         this.identifyResults = this.identifyResults.concat(identifyResultsArg);
         this.controlIdentifyActionExecution(identifyParameters);
      } catch (e) {
         this.onIdentifyError(e, identifyParameters);
      }
   }

   onIdentifyError(error: string, identifyParameters: any): void {
      this.controlIdentifyActionExecution(identifyParameters);
      console.error(error);
   }

   prepareDataTableColumns(): void {
      this.dataTableColumns = [
         { text: 'Campo', dataField: 'field' },
         { text: 'Valor', dataField: 'value' }
      ];
   }

   prepareDataTableSource(data: any): void {
      const localData = new Array<any>();

      // tslint:disable-next-line:forin
      for (const index in data) {
         localData.push({ field: index, value: data[index] });
      }

      const source: any = {
         localData: localData,
         dataType: 'array',
         dataFields: [
            { name: 'field', type: 'string' },
            { name: 'value', type: 'string' }
         ]
      };

      this.dataAdapter = new jqx.dataAdapter(source);
   }

   itemSelectedEventHandler(itemData: any): void {
      this.prepareDataTableColumns();
      this.prepareDataTableSource(itemData.feature.attributes);
      this.executeIdentifyZoomToGeometry(itemData.feature.geometry);
      this.executeFlashToGeometry(itemData.feature.geometry);
   }

   private clearControls(): void {
      if (this.identifyResultsGrouped != null) {
         this.identifyResultsGrouped = new Array<any>();
      }
      if (this.identifyResults != null) {
         this.identifyResults = new Array<any>();
      }
      if (this.dataAdapter != null) {
         this.dataAdapter = new jqx.dataAdapter({});
      }
      if (this.dataTableColumns != null) {
         this.dataTableColumns = new Array<any>();
      }

      this.resultQuantity = 0;
   }

   private executeIdentifyZoomToGeometry(geometry: any): void {
      const identifyAction = <IdentifyAction>{
         EMapAction: EmapActions.Identify,
         identifyActionType: IdentifyActionType.ZoomToGeometry,
         geometry: geometry
      };
      this.mapService.executeMapAction(identifyAction);
   }

   private executeFlashToGeometry(geometry: any): void {
      this.mapService.executeMapAction(<FlashToGeometry>{
         EMapAction: EmapActions.FlashToGeometry,
         geometry: geometry
      });
   }
}
