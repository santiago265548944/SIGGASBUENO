import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input
} from '@angular/core';
import { MapService } from '../map-service/map.service';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from '../map-service/map-actions/select-action';
import { EmapActions } from '../map-service/emap-actions.enum';
import { loadModules } from 'esri-loader';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import * as _ from 'underscore';
import { GlobalService } from '../Globals/global.service';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.css']
})
export class SelectionComponent implements OnInit, OnDestroy {
  @Input()
  ownerTool: OwnerSelection;
  private subscription: Subscription;
  selectedMapService: any;
  mapServices: Array<any>;
  map: any;
  layerIdSelected: any;

  @ViewChild('selectLayers')
  selectLayers: ElementRef;

  constructor(private mapService: MapService, private globals: GlobalService) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeSelectAction(mapAction));
  }

  ngOnInit() {
    if (!this.ownerTool) {
      this.ownerTool = OwnerSelection.SelectionTool;
    }
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.FillServicesRequest,
      owner: this.ownerTool
    });
  }

  private executeSelectAction(selectAction: SelectAction) {
    if (
      selectAction.owner === this.ownerTool ||
      selectAction.owner === OwnerSelection.genericAction
    ) {
      switch (selectAction.selectActionType) {
        case SelectActionType.FillServicesResponse:
          this.map = selectAction.map;
          this.executeFillServices();
          break;
        case SelectActionType.PerformSelect:
          this.initSelect(selectAction.selectGeometry);
          break;
        case SelectActionType.DeleteSelection:
          this.removeSelectedFeatures();
          break;
        case SelectActionType.ViewSelectionRequest:
          this.sendViewSelectionData();
          break;
      }
    }
  }

  private executeFillServices(): void {
    loadModules(['esri/layers/ArcGISDynamicMapServiceLayer'], {
      url: 'https://js.arcgis.com/3.23/'
    }).then(([ArcGISDynamicMapServiceLayer]) => {
      if (this.mapServices == null) {
        this.mapServices = new Array<any>();
      }
      this.map.layerIds.forEach(layerId => {
        const layer = this.map.getLayer(layerId);
        if (layer instanceof ArcGISDynamicMapServiceLayer) {
          this.mapServices.push(layer);
        }
      });

      if (this.mapServices.length > 0) {
        this.selectedMapService = this.mapServices[0];
        this.onMapServiceChange(this.selectedMapService);
      }
    });
  }

  onMapServiceChange(newMapService: any): void {
    if (newMapService != null) {
      this.clearSelectElements();
      this.fillSelectLayers(newMapService);
    }
  }

  fillSelectLayers(mapService: any): void {
    this.layerIdSelected = null;
    const parentLayerInfos = _.filter(
      mapService.layerInfos,
      (layerInfo: any) => {
        return layerInfo.parentLayerId === -1;
      }
    );

    parentLayerInfos.forEach(parentLayerInfo => {
      this.createLayersGroup(parentLayerInfo, mapService.layerInfos, 0);
    });
  }

  createLayersGroup(
    parentLayerInfo: any,
    layersInfo: any,
    depth: number
  ): void {
    let optionParent: any;
    if (parentLayerInfo.subLayerIds != null) {
      optionParent = <HTMLOptGroupElement>document.createElement('optgroup');
      optionParent.label = parentLayerInfo.name;
      if (depth > 0) {
        optionParent.setAttribute('style', 'font-style:italic');
      }
      this.selectLayers.nativeElement.appendChild(optionParent);
      const layerChilds = _.filter(layersInfo, (layerInfo: any) => {
        return layerInfo.parentLayerId === parentLayerInfo.id;
      });

      layerChilds.forEach(layerChild => {
        if (layerChild.subLayerIds != null) {
          this.createLayersGroup(layerChild, layersInfo, ++depth);
        } else {
          if (this.layerIdSelected == null) {
            this.layerIdSelected = layerChild.id;
          }
          const optionItem = <HTMLOptionElement>(
            document.createElement('option')
          );
          optionItem.value = layerChild.id;
          optionItem.text = layerChild.name;
          this.selectLayers.nativeElement.appendChild(optionItem);
        }
      });
    } else {
      if (this.layerIdSelected == null) {
        this.layerIdSelected = parentLayerInfo.id;
      }
      optionParent = <HTMLOptionElement>document.createElement('option');
      optionParent.value = parentLayerInfo.id;
      optionParent.text = parentLayerInfo.name;
      this.selectLayers.nativeElement.appendChild(optionParent);
    }
  }

  clearSelectElements() {
    let firstChild = this.selectLayers.nativeElement.firstChild;

    while (firstChild) {
      this.selectLayers.nativeElement.removeChild(firstChild);
      firstChild = this.selectLayers.nativeElement.firstChild;
    }
  }

  private initSelect(geometry: any) {
    if (this.globals.getFeatureMapAdded() != null) {
      this.map.removeLayer(this.globals.getFeatureMapAdded());
      this.globals.setFeatureMapAdded(null);
    }

    loadModules(
      [
        'esri/layers/FeatureLayer',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Color',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleFillSymbol'
      ],
      { url: 'https://js.arcgis.com/3.23/' }
    ).then(
      ([
        FeatureLayer,
        SimpleMarkerSymbol,
        Color,
        SimpleLineSymbol,
        SimpleFillSymbol
      ]) => {
        const url =
          this.selectedMapService.url.replace('MapServer', 'FeatureServer') +
          '/' +
          this.layerIdSelected;
        const options = {
          mode: FeatureLayer.MODE_SELECTION,
          id: 'Selection',
          outFields: ['*']
        };
        this.globals.setFeatureMapAdded(new FeatureLayer(url, options));
        this.globals.getFeatureMapAdded().on('load', evt => {
          let symbol: any;
          switch (this.globals.getFeatureMapAdded().geometryType) {
            case 'esriGeometryPoint':
              symbol = this.createSimpleMarkerSymbol(SimpleMarkerSymbol, Color);
              break;
            case 'esriGeometryPolygon':
              symbol = this.createSimpleFillSymbol(
                SimpleFillSymbol,
                SimpleLineSymbol,
                Color
              );
              break;
            case 'esriGeometryPolyline':
              symbol = this.createSimpleLineSymbol(SimpleLineSymbol, Color);
              break;
          }
          this.globals.getFeatureMapAdded().setSelectionSymbol(symbol);
          this.globals
            .getFeatureMapAdded()
            .on('selection-clear', () => this.onSelectionClear());
          this.globals
            .getFeatureMapAdded()
            .on('selection-complete', eventArg =>
              this.onSelectionComplete(eventArg)
            );
          this.selectFeatures(geometry);
        });
        this.map.addLayer(this.globals.getFeatureMapAdded());
      }
    );
  }

  onSelectionComplete(eventArg): void {
    this.performViewSelectionResponse();
  }

  onSelectionClear(): void {
    this.performViewSelectionResponse();
  }

  private performViewSelectionResponse(): void {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.ViewSelectionResponse,
      idLayer: this.layerIdSelected,
      owner: this.ownerTool,
      selectedFeatures: this.globals.getFeatureMapAdded().getSelectedFeatures()
    });
  }

  private restartSelect(geometry: any): void {
    this.map.removeLayer(this.globals.getFeatureMapAdded());
    this.globals.setFeatureMapAdded(null);
    this.initSelect(geometry);
  }

  private selectFeatures(geometry: void): void {
    loadModules(['esri/layers/FeatureLayer', 'esri/tasks/query'], {
      url: 'https://js.arcgis.com/3.23/'
    }).then(([FeatureLayer, Query]) => {
      const selectQuery = new Query();
      selectQuery.geometry = geometry;
      this.globals
        .getFeatureMapAdded()
        .selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW);
    });
  }

  private isRightFeatureLayer(): boolean {
    const url =
      this.selectedMapService.url.replace('MapServer', 'FeatureServer') +
      '/' +
      this.layerIdSelected;
    return this.globals.getFeatureMapAdded().url === url;
  }

  private createSimpleMarkerSymbol(SimpleMarkerSymbol: any, Color: any): any {
    const markerSymbol = new SimpleMarkerSymbol();

    markerSymbol.setColor(new Color('rgb(0,0,255)'));
    markerSymbol.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);

    return markerSymbol;
  }

  private createSimpleFillSymbol(
    SimpleFillSymbol: any,
    SimpleLineSymbol: any,
    Color: any
  ): any {
    return new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        new Color('rgb(0,0,255)'),
        1
      ),
      new Color('rgba(0,0,255,0.5)')
    );
  }

  private createSimpleLineSymbol(SimpleLineSymbol: any, Color: any): any {
    const simpleSymbol = new SimpleLineSymbol();
    simpleSymbol.setColor(new Color('rgb(0,0,255)'));
    simpleSymbol.setWidth(2);
    return simpleSymbol;
  }

  private removeSelectedFeatures(): void {
    if (this.globals.getFeatureMapAdded() != null) {
      this.globals.getFeatureMapAdded().clearSelection();
    }
  }

  private sendViewSelectionData(): void {
    if (this.globals.getFeatureMapAdded() != null) {
      const selectedFeatures = this.globals
        .getFeatureMapAdded()
        .getSelectedFeatures();
      if (selectedFeatures != null && selectedFeatures.length > 0) {
        const selectAction = <SelectAction>{
          EMapAction: EmapActions.Select,
          selectActionType: SelectActionType.ViewSelectionResponse,
          idLayer: this.layerIdSelected,
          owner: this.ownerTool,
          selectedFeatures: selectedFeatures
        };
        this.mapService.executeMapAction(selectAction);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
