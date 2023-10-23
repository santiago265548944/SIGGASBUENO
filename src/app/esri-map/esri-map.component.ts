import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { loadModules } from 'esri-loader';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../map-service/map.service';
import {
  MapAction,
  FlashToGeometry,
  PrintAction,
  MeasureAction,
  AddGeometry,
  CallModal,
  ZoomToGeometries
} from '../map-service/map-action';
import { ZoomAction } from '../map-service/zoom-action';
import {
  EmapActions,
  EMeasureActions,
  Emodal
} from '../map-service/emap-actions.enum';
import {
  IdentifyAction,
  IdentifyActionType
} from '../map-service/map-actions/identify-action';
import { DrawService } from '../map-service/draw.service';
import { ExtentHistoryManager } from '../map-service/extent-history-manager';
import { XYCoordinateAction } from '../map-service/XYCoordinate-action';
import { ApiService } from '../api/api.service';
import { MemoryService } from '../cache/memory.service';
import { RequestHelper } from '../api/request/request-helper';
import {
  SelectAction,
  SelectActionType
} from '../map-service/map-actions/select-action';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import {
  GeoZoomAction,
  GeoZoomActionType
} from '../map-service/map-actions/geozoom-action';
import {
  BookmarkAction,
  BookmarkActionType
} from '../map-service/map-actions/bookmark-action';
import { environment } from '../../environments/environment';
import { GlobalService } from '../Globals/global.service';
import { StoreProcedures } from '../api/request/store-procedures.enum';
import { InputParameter } from '../api/request/input-parameter';
import { ResultToGraphicCollection } from '../map-service/result-to-graphic-collection';
import { GenericTasksService } from '../generic-class/generic-tasks.service';
declare var $: any;

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit, OnDestroy {
  // Private vars with default values
  @Input()
  public mapHeight = '0px';
  private _zoom = 10;
  private _center = [0.1278, 51.5074];
  private _basemap = 'streets';
  subscription: Subscription;
  map: any;
  extentHistoryManager: ExtentHistoryManager;
  strCoordinate: string;
  activeDeleteGraphic = false;
  activeEditGraphic = false;
  navigation: any;
  overviewMapDijit: any;
  baseMap = '';
  mapServiceDetails: any;
  printer: any;
  measurement: any;
  constrainedExtent: any;
  activeAI = false;
  toc: any;

  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;
  @Output()
  mapLoaded = new EventEmitter<boolean>();

  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode')
  private mapViewEl: ElementRef;

  constructor(
    private mapService: MapService,
    private drawService: DrawService,
    private apiService: ApiService,
    private memoryService: MemoryService,
    private globals: GlobalService,
    private genericTasks: GenericTasksService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeMapAction(mapAction));
  }

  public ngOnInit() {
    this.configDrawOptions();
    this.getMapasBase();
  } // ngOnInit

  onKeyDown(evt): void {
    this.globals.setLastKeyPress(evt.keyCode);
  }

  onKeyUp(evt: any) {
    this.globals.setLastKeyPress(null);
  }

  getMapServices(): void {
    this.apiService.callServicesDetail().subscribe(json => {
      this.initMap(json);
    });
  }

  startProgress(): void {
    this.jqxLoader.open();
  }

  stopProgress(): void {
    this.jqxLoader.close();
  }

  configDrawOptions(): void {
    if (!this.memoryService.containKey('TextMapDraw')) {
      this.memoryService.setItem('TextMapDraw', '');
    }
    // CallOut
    if (!this.memoryService.containKey('CallOutBackground')) {
      this.memoryService.setItem('CallOutBackground', 'FFFFFF');
    }

    if (!this.memoryService.containKey('CallOutBorderColor')) {
      this.memoryService.setItem('CallOutBorderColor', '000000');
    }

    if (!this.memoryService.containKey('CallOutFontFamily')) {
      this.memoryService.setItem('CallOutFontFamily', 'Arial');
    }

    if (!this.memoryService.containKey('CallOutFontColor')) {
      this.memoryService.setItem('CallOutFontColor', '000000');
    }

    if (!this.memoryService.containKey('CallOutBorderRadius')) {
      this.memoryService.setItem('CallOutBorderRadius', '5');
    }

    if (!this.memoryService.containKey('CallOutFontSize')) {
      this.memoryService.setItem('CallOutFontSize', '14');
    }

    // Draw
    if (!this.memoryService.containKey('PointColor')) {
      this.memoryService.setItem('PointColor', '00FF00');
    }
    if (!this.memoryService.containKey('TempLineColor')) {
      this.memoryService.setItem('TempLineColor', '0000FF');
    }
    if (!this.memoryService.containKey('TempFillColor')) {
      this.memoryService.setItem('TempFillColor', 'D3D3D3');
    }
    if (!this.memoryService.containKey('LineColor')) {
      this.memoryService.setItem('LineColor', '0000FF');
    }
    if (!this.memoryService.containKey('FillColor')) {
      this.memoryService.setItem('FillColor', 'D3D3D3');
    }

    if (!this.memoryService.containKey('PointSize')) {
      this.memoryService.setItem('PointSize', '14');
    }
    if (!this.memoryService.containKey('PointStyle')) {
      this.memoryService.setItem('PointStyle', '0');
    }
    if (!this.memoryService.containKey('TempLineWidth')) {
      this.memoryService.setItem('TempLineWidth', '4');
    }
    if (!this.memoryService.containKey('TempBorderThickness')) {
      this.memoryService.setItem('TempBorderThickness', '2');
    }
    if (!this.memoryService.containKey('BorderThickness')) {
      this.memoryService.setItem('BorderThickness', '2');
    }
    if (!this.memoryService.containKey('TempFillOpacity')) {
      this.memoryService.setItem('TempFillOpacity', '1');
    }
    if (!this.memoryService.containKey('LineWidth')) {
      this.memoryService.setItem('LineWidth', '4');
    }

    // Text
    if (!this.memoryService.containKey('FontFamily')) {
      this.memoryService.setItem('FontFamily', 'Arial');
    }
    if (!this.memoryService.containKey('FontSize')) {
      this.memoryService.setItem('FontSize', '14');
    }
    if (!this.memoryService.containKey('FontColor')) {
      this.memoryService.setItem('FontColor', '000000');
    }
  }

  getMapasBase(): void {
    this.apiService
      .callStoreProcedureV2(RequestHelper.getMapasBaseRequestBody())
      .subscribe(json => {
        if (json['1']) {
          this.memoryService.setItem('MapasBase', json['1']);
        }
        this.getMapServices();
      });
  }

  initMap(mapServiceDetailsArg: any): void {
    this.mapServiceDetails = mapServiceDetailsArg;
    const options = {
      url: 'https://js.arcgis.com/3.23/',
      dojoConfig: {
        async: true,
        packages: [
          {
            location: environment.urlDojo,
            name: 'agsjs'
          }
        ]
      }
    };

    loadModules(
      [
        'esri/map',
        'esri/layers/ArcGISDynamicMapServiceLayer',
        'dojo/_base/array',
        'esri/geometry/Extent',
        'esri/toolbars/navigation',
        'esri/dijit/Scalebar',
        'esri/dijit/OverviewMap',
        'esri/dijit/BasemapGallery',
        'esri/layers/ArcGISTiledMapServiceLayer',
        'esri/dijit/Print',
        'esri/tasks/GeometryService',
        'esri/config',
        'esri/dijit/Measurement',
        'esri/units'
      ],
      options
    )
      .then(
        ([
          Map,
          ArcGISDynamicMapServiceLayer,
          arrayUtils,
          Extent,
          Navigation,
          Scalebar,
          OverviewMap,
          BasemapGallery,
          ArcGISTiledMapServiceLayer,
          Print,
          GeometryService,
          esriConfig,
          Measurement,
          Units
        ]) => {
          const initialExtent = this.getInitialExtent(Extent);
          esriConfig.defaults.geometryService = new GeometryService(
            this.memoryService.getItem('GeometryURL')
          );

          this.setupMap(Map, initialExtent);
          this.onLayersAddResult(arrayUtils);
          this.loadMapServices(
            ArcGISDynamicMapServiceLayer,
            ArcGISTiledMapServiceLayer
          );
          this.setupWidgets(
            BasemapGallery,
            Navigation,
            Scalebar,
            OverviewMap,
            Print,
            Measurement,
            Units
          );
          this.mapLoaded.emit(true);
        }
      )
      .catch(err => {
        console.error(err);
      });
  }

  private executePrintTask(action: PrintAction): void {
    this.startProgress();
    loadModules(['esri/tasks/PrintTemplate', 'esri/tasks/LegendLayer'])
      .then(([PrintTemplate, LegendLayer]) => {
        const layersActive = this.map.getLayersVisibleAtScale();
        const legendLayers = new Array<any>();
        for (const item of layersActive) {
          const legendLayer = new LegendLayer();
          legendLayer.layerId = item.id;
          legendLayers.push(legendLayer);
        }

        this.printer.printMap({
          format: action.imageExtension,
          layout: action.printFormat,
          layoutOptions: {
            legendLayers: legendLayers
          },
          exportOptions: {
            width: this.map.width,
            height: this.map.height,
            dpi: 96
          }
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
  private setupWidgets(
    BasemapGallery: any,
    Navigation: any,
    Scalebar: any,
    OverviewMap: any,
    Print: any,
    Measurement: any,
    Units: any
  ): void {
    this.measurement = new Measurement(
      {
        map: this.map,
        defaultAreaUnit: Units.SQUARE_METERS,
        defaultLengthUnit: Units.METERS
      },
      'measure'
    );
    this.measurement.startup();
    this.measurement.on('measure', evt => {
      this.measurement.setTool(evt.toolName, false);

      switch (evt.toolName) {
        case 'distance':
          const lineAcion = <MeasureAction>{
            EMeasureAction: EMeasureActions.MeasureLine,
            value: evt.values
          };
          this.mapService.executeMapAction(lineAcion);
          break;
        case 'area':
          const polygonAcion = <MeasureAction>{
            EMeasureAction: EMeasureActions.MeasurePolygon,
            value: evt.values
          };
          this.mapService.executeMapAction(polygonAcion);
          break;
      }
    });

    this.navigation = new Navigation(this.map);
    const basemapGallery = new BasemapGallery(
      {
        showArcGISBasemaps: true,
        map: this.map
      },
      'basemapGallery'
    );
    basemapGallery.startup();
    basemapGallery.on('load', evt => {
      $('#galleryNode_basemap_0').hide();
    });
    basemapGallery.on('selection-change', evt => {
      const basemap = basemapGallery.getSelected();
      const layers = basemap.getLayers();
      this.baseMap = layers[0].url;
      this.updateLayer();
    });
    const scalebar = new Scalebar({
      map: this.map,
      // "dual" displays both miles and kilometers
      // "english" is the default, which displays miles
      // use "metric" for kilometers
      scalebarUnit: 'dual'
    });

    this.overviewMapDijit = new OverviewMap({
      map: this.map,
      visible: false
    });
    this.overviewMapDijit.startup();

    const url = this.memoryService.getItem('ExportMapURL');
    this.printer = new Print(
      {
        map: this.map,
        url: url
      },
      'printMap'
    );
    this.printer.startup();
    this.printer.on('print-complete', evt => {
      this.stopProgress();
      window.open(evt.result.url, '_blank');
    });
  }

  private updateLayer(): void {
    this.map.removeAllLayers();

    loadModules([
      'esri/layers/ArcGISDynamicMapServiceLayer',
      'esri/layers/ArcGISTiledMapServiceLayer'
    ])
      .then(([ArcGISDynamicMapServiceLayer, ArcGISTiledMapServiceLayer]) => {
        this.loadMapServices(
          ArcGISDynamicMapServiceLayer,
          ArcGISTiledMapServiceLayer
        );
      })
      .catch(err => {
        console.error(err);
      });
  }

  private setupMap(Map: any, initialExtent: any): void {
    this.map = new Map('mapViewNode', {
      extent: initialExtent
    });

    this.map.disableClickRecenter();
    this.map.disableRubberBandZoom();
    this.map.disableShiftDoubleClickZoom();

    this.drawService.setMap(this.map);
    this.map.on('load', () => {
      this.map.on('mouse-move', evt => {
        this.showCoordinate(evt.mapPoint);
      });
      this.map.on('mouse-drag', evt => {
        this.showCoordinate(evt.mapPoint);
      });

      this.map.on('extent-change', evt => {
        if (this.activeAI) {
          this.map.setExtent(this.constrainedExtent);
        }
      });

      this.map.graphics.on('click', evt => {
        this.globals.setCurrentGraphicSelected(evt.graphic);
        if (this.activeDeleteGraphic) {
          this.deleteGraphics(evt.graphic);
        } else if (this.activeEditGraphic) {
          this.drawService.prepareDraw(
            <MapAction>{ EMapAction: EmapActions.EditElement },
            evt.graphic
          );
        }
      });
    });
  }

  private onLayersAddResult(arrayUtils: any): void {
    this.map.on('layers-add-result', (layers, target) => {
      if (this.toc) {
        this.toc.destroy();
        this.toc = null;
        $('#legendDiv').html(null);
      }
      loadModules(['agsjs/dijit/TOC', 'dijit/registry'], {
        url: 'https://js.arcgis.com/3.23/'
      })
        .then(([TOC, registry]) => {
          registry.remove('legendDiv');
          const layerInfo = arrayUtils.map(layers.layers, function (
            layer,
            index
          ) {
            return { layer: layer.layer, title: layer.layer.id };
          });
          this.toc = new TOC(
            {
              map: this.map,
              layerInfos: layerInfo
            },
            'legendDiv'
          );
          this.toc.startup();

          this.createExtentHistoryManagerObject();
        })
        .catch(err => {
          console.error(err);
        });
    });
  }

  private loadMapServices(
    ArcGISDynamicMapServiceLayer: any,
    ArcGISTiledMapServiceLayer: any
  ): void {
    const temLayers = new Array();
    if (this.baseMap !== '') {
      const dynTiled = new ArcGISDynamicMapServiceLayer(this.baseMap, {
        id: 'Mapa Base'
      });
      temLayers.push(dynTiled);
    }
    this.mapServiceDetails.services.forEach(element => {
      if (element.type === 'MapServer') {
        const nameParts = element.name.split('/');
        const serviceName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
        const url = this.mapServiceDetails.baseUrl + serviceName + '/MapServer';
        const dynLayer = new ArcGISDynamicMapServiceLayer(url, {
          id: serviceName
        });
        temLayers.push(dynLayer);
      }
    });
    this.map.addLayers(temLayers);
  }

  getInitialExtent(Extent: any): any {
    return new Extent({
      xmin: 802725.2156030836,
      ymin: 1620927.0364904916,
      xmax: 995215.1753944783,
      ymax: 1723490.4635171671,
      spatialReference: { wkid: 3116 }
    });
  }

  @Input()
  set zoom(zoom: number) {
    this._zoom = zoom;
  }

  get zoom(): number {
    return this._zoom;
  }

  @Input()
  set center(center: any[]) {
    this._center = center;
  }

  @Input()
  set basemap(basemap: string) {
    this._basemap = basemap;
  }

  get basemap(): string {
    return this._basemap;
  }

  get center(): any[] {
    return this._center;
  }

  showCoordinate(mp: any) {
    this.strCoordinate =
      mp.x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      ' -   ' +
      mp.y.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  executeMapAction(mapAction: MapAction): void {
    this.activeDeleteGraphic = false;
    this.activeEditGraphic = false;
    let deactivateDraw = true;
    switch (mapAction.EMapAction) {
      case EmapActions.Zoom:
        this.executeZoomAction(<ZoomAction>mapAction);
        break;
      case EmapActions.ZoomInWithRectangle:
      case EmapActions.ZoomOutWithRectangle:
        this.executeDrawTool(mapAction);
        break;
      case EmapActions.Pan:
        deactivateDraw = true;
        break;
      case EmapActions.FullExtent:
        this.executeFullExtent();
        break;
      case EmapActions.NextExtent:
        this.executeNextExtent();
        break;
      case EmapActions.PreviousExtent:
        this.executePreviousExtent();
        break;
      case EmapActions.XYCoordinate:
        this.executeXYCoordinate(<XYCoordinateAction>mapAction);
        break;
      case EmapActions.DrawPoint:
      case EmapActions.DrawLine:
      case EmapActions.DrawPolygon:
      case EmapActions.DrawRectangle:
      case EmapActions.DrawArrow:
      case EmapActions.DrawEllipse:
      case EmapActions.DrawCircle:
      case EmapActions.DrawFreehandPolyLine:
      case EmapActions.DrawText:
        deactivateDraw = false;
        this.executeDrawTool(mapAction);
        break;
      case EmapActions.DeleteDraw:
        this.activeDeleteGraphic = true;
        break;
      case EmapActions.ClearGraphic:
        this.executeClearGraphic();
        break;
      case EmapActions.EditElement:
        this.activeEditGraphic = true;
        break;
      case EmapActions.Identify:
        deactivateDraw = false;
        this.executeIdentifyAction(<IdentifyAction>mapAction);
        break;
      case EmapActions.FlashToGeometry:
        deactivateDraw = false;
        this.executeFlashToGeometry((<FlashToGeometry>mapAction).geometry);
        break;
      case EmapActions.OverViewMap:
        this.overviewMapDijit.show();
        break;
      case EmapActions.Select:
        this.executeSelectAction(<SelectAction>mapAction);
        break;
      case EmapActions.RefreshMap:
        this.exexuteRefreshMap();
        break;
      case EmapActions.ExportMap:
        this.executePrintTask(<PrintAction>mapAction);
        break;
      case EmapActions.MeasureLine:
        this.measurement.setTool('distance', true);
        break;
      case EmapActions.MeasurePolygon:
        this.measurement.setTool('area', true);
        break;
      case EmapActions.GeoZoom:
        this.executeGeoZoomAction(<GeoZoomAction>mapAction);
        break;
      case EmapActions.Bookmark:
        this.executeBookmarkAction(<BookmarkAction>mapAction);
        break;
      case EmapActions.SetAI:
        this.executeSetAI();
        break;
      case EmapActions.SeekPredio:
      case EmapActions.RiskZone:
      case EmapActions.AvailableOperator:
      case EmapActions.ObviateValves:
      case EmapActions.ManejoPrensas:
      case EmapActions.ModifyAffectedUsers:
      case EmapActions.SecurityRisk:
      case EmapActions.OrderManagement:
        deactivateDraw = false;
        this.executeDrawTool(mapAction);
        break;
      case EmapActions.ZoomToGeometry:
        this.executeZoomToGeometry((<FlashToGeometry>mapAction).geometry);
        break;
      case EmapActions.AddGeometry:
        this.executeAddGeometries(
          (<AddGeometry>mapAction).geometries,
          (<AddGeometry>mapAction).color
        );
        break;
      case EmapActions.DeleteGeometries:
        (<AddGeometry>mapAction).geometries.forEach(element => {
          this.deleteGraphics(element);
        });
        break;
      case EmapActions.ZoomToGeometries:
        this.executeZoomToElements((<ZoomToGeometries>mapAction).geometries);
        break;
      case EmapActions.startProcess:
        this.startProgress();
        break;
      case EmapActions.stopProcess:
        this.stopProgress();
        break;
      default:
        deactivateDraw = false;
    }

    if (deactivateDraw) {
      this.drawService.deactivate();
    }
  }

  private prepareZoomToSelection(features: any): void {
    let selectedFeatures;
    if (
      this.globals.getFeatureMapAdded() != null &&
      this.globals.getFeatureMapAdded().getSelectedFeatures().length > 0
    ) {
      selectedFeatures = this.globals
        .getFeatureMapAdded()
        .getSelectedFeatures();
    } else if (features) {
      selectedFeatures = features;
    }

    if (selectedFeatures != null && selectedFeatures.length > 0) {
      this.executeZoomToElements(selectedFeatures);
    }
  }

  private executeZoomToElements(elementFeatures: any): void {
    loadModules(['esri/geometry/Extent', 'esri/geometry/Point'], {
      url: 'https://js.arcgis.com/3.23/'
    })
      .then(([Extent, Point]) => {
        const factor = 1;
        let isMapPoint = false;

        let widthExpand = 0,
          heightExpand = 0,
          xMax = Number.MIN_VALUE,
          yMax = Number.MIN_VALUE,
          xMin = Number.MAX_VALUE,
          yMin = Number.MAX_VALUE;

        let spatialReference: any;
        elementFeatures.forEach(feature => {
          const geometry = feature.geometry;

          if (geometry === null) {
            return;
          }

          spatialReference = geometry.spatialReference;

          if (geometry instanceof Point) {
            isMapPoint = true;
          }

          if (geometry instanceof Point) {
            if (geometry.x > xMax) {
              xMax = geometry.x;
            }
            if (geometry.y > yMax) {
              yMax = geometry.y;
            }
            if (geometry.x < xMin) {
              xMin = geometry.x;
            }
            if (geometry.y < yMin) {
              yMin = geometry.y;
            }
          } else {
            const extent = geometry.getExtent();
            if (extent.xmax > xMax) {
              xMax = extent.xmax;
            }
            if (extent.ymax > yMax) {
              yMax = extent.ymax;
            }
            if (extent.xmin < xMin) {
              xMin = extent.xmin;
            }
            if (extent.ymin < yMin) {
              yMin = extent.ymin;
            }
          }
        });
        const selectedGraphicsExtent = new Extent(
          xMin,
          yMin,
          xMax,
          yMax,
          spatialReference
        );

        if (isMapPoint) {
          widthExpand += 150;
          heightExpand += 150;
        } else {
          widthExpand = (selectedGraphicsExtent.getWidth() * factor) / 2;
          heightExpand = (selectedGraphicsExtent.getHeight() * factor) / 2;
        }

        const displayExtent = new Extent(
          selectedGraphicsExtent.xmin - widthExpand,
          selectedGraphicsExtent.ymin - heightExpand,
          selectedGraphicsExtent.xmax + widthExpand,
          selectedGraphicsExtent.ymax + heightExpand,
          selectedGraphicsExtent.spatialReference
        );

        this.map.setExtent(displayExtent);
      })
      .catch(err => {
        console.error(err);
      });
  }

  executeAddGeometries(elements: Array<any>, customColor: string): void {
    this.drawService.executeAddGeometries(elements, customColor);
  }

  executeSetAI(): void {
    this.activeAI = !this.activeAI;
    this.constrainedExtent = this.map.extent;
  }

  exexuteRefreshMap(): void {
    this.baseMap = '';
    this.updateLayer();
  }
  executeXYCoordinate(xyAction: XYCoordinateAction) {
    loadModules(
      [
        'esri/geometry/Point',
        'esri/graphic',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Color',
        'esri/InfoTemplate',
        'esri/geometry/Extent',
        'esri/config',
        'esri/SpatialReference'
      ],
      {}
    ).then(
      ([Point, Graphic, SimpleMarkerSymbol, Color, InfoTemplate, Extent, esriConfig, SpatialReference]) => {
        const xyPoint = new Point(
          xyAction.x,
          xyAction.y,
          this.map.spatialReference
        );
        switch (xyAction.typeAction) {
          case 0:
            this.setxyMapExtent(xyPoint, Extent);
            break;
          case 1:
            this.addxyPoint(xyAction, xyPoint, InfoTemplate, SimpleMarkerSymbol, Color, Graphic);
            break;
          case 2:
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.FlashToGeometry,
              geometry: xyPoint
            });
            break;
          case 3:
            esriConfig.defaults.geometryService.project([new Point(xyAction.x, xyAction.y)], new SpatialReference(environment.outSrId),
              (projectedPoints) => {
                this.setxyMapExtent(projectedPoints[0], Extent);
                this.addxyPoint(xyAction, projectedPoints[0], InfoTemplate, SimpleMarkerSymbol, Color, Graphic);
              });
            break;
        }
      }
    );
  }

  addxyPoint(xyAction: any, xyPoint: any, InfoTemplate: any, SimpleMarkerSymbol: any, Color: any, Graphic: any) {
    const pAttri = { x: xyAction.x, y: xyAction.y };
    const pInfoTemp = new InfoTemplate('Ubicación');
    const markerSymbol = new SimpleMarkerSymbol();
    markerSymbol.setColor(new Color('#FF0000'));
    markerSymbol.setSize(12);
    this.map.graphics.add(
      new Graphic(xyPoint, markerSymbol, pAttri, pInfoTemp)
    );
  }

  setxyMapExtent(xyAction: any, Extent: any) {
    const factor = 150; // TODO: debe ser parametros
    const extPoint = new Extent(
      xyAction.x - factor,
      xyAction.y - factor,
      xyAction.x + factor,
      xyAction.y + factor,
      this.map.spatialReference
    );
    this.map.setExtent(extPoint);
  }

  executeClearGraphic() {
    this.map.graphics.clear();
  }

  executeDrawTool(mapAction: MapAction) {
    this.drawService.prepareDraw(mapAction);
  }

  executeZoomAction(zoomAction: ZoomAction) {
    this.map.setZoom(zoomAction.factor);
  }

  executeFullExtent(): void {
    if (this.extentHistoryManager != null) {
      this.extentHistoryManager.executeFullExtent();
    }
  }

  executePreviousExtent(): void {
    this.navigation.zoomToPrevExtent();
  }

  executeNextExtent(): void {
    this.navigation.zoomToNextExtent();
  }

  private createExtentHistoryManagerObject(): void {
    if (this.extentHistoryManager == null) {
      this.extentHistoryManager = new ExtentHistoryManager(this.map);
    }
  }

  private deleteGraphics(evt: any) {
    this.map.graphics.remove(evt);
  }

  private executeIdentifyAction(identifyAction: IdentifyAction) {
    if (
      identifyAction.identifyActionType ===
      IdentifyActionType.ActivateIdentifyDraw
    ) {
      this.executeDrawTool(identifyAction);
    } else if (
      identifyAction.identifyActionType === IdentifyActionType.ZoomToGeometry
    ) {
      this.executeZoomToGeometry(identifyAction.geometry);
    }
  }

  private executeZoomToGeometry(geometryElement: any) {
    loadModules(['esri/geometry/Extent', 'esri/geometry/Point'], {
      url: 'https://js.arcgis.com/3.23/'
    })
      .then(([Extent, Point]) => {
        const factor = 1;
        const geometry = geometryElement;
        let widthExpand = 0,
          heightExpand = 0,
          xMax = 0,
          yMax = 0,
          xMin = 0,
          yMin = 0;
        if (geometry instanceof Point) {
          widthExpand += factor;
          heightExpand += factor;
          xMin = xMax = geometry.x;
          yMin = yMax = geometry.y;
        } else {
          const extent = geometry.getExtent();
          widthExpand = extent.getWidth() * factor;
          heightExpand = extent.getHeight() * factor;
          xMin = extent.xmin;
          xMax = extent.xmax;
          yMin = extent.ymin;
          yMax = extent.ymax;
        }

        const displayExtent = new Extent(
          xMin - widthExpand,
          yMin - heightExpand,
          xMax + widthExpand,
          yMax + heightExpand,
          geometry.spatialReference
        );

        this.map.setExtent(displayExtent);
      })
      .catch(err => {
        console.error(err);
      });
  }

  executeFlashToGeometry(geometry: any): void {
    this.drawService.prepareFlashToGeometry(geometry);
  }

  executeSelectAction(selectAction: SelectAction): void {
    switch (selectAction.selectActionType) {
      case SelectActionType.FillServicesRequest:
        this.sendSelectData(selectAction);
        break;
      case SelectActionType.SelectWithCircle:
      case SelectActionType.SelectWithLine:
      case SelectActionType.SelectWithPolygon:
      case SelectActionType.SelectWithRectangle:
        this.drawService.prepareDraw(selectAction);
        break;
      case SelectActionType.ZoomToSelection:
        this.prepareZoomToSelection(selectAction.featureSelected);
        break;
    }
  }

  // TODO: validar el uso del loadmodule para esta funcionalidad
  sendSelectData(action: SelectAction): void {
    loadModules(['esri/layers/ArcGISDynamicMapServiceLayer'], {
      url: 'https://js.arcgis.com/3.23/'
    }).then(
      ([IdentifyTask, IdentifyParameters, ArcGISDynamicMapServiceLayer]) => {
        const mapServicesResponse = <SelectAction>{
          EMapAction: EmapActions.Select,
          selectActionType: SelectActionType.FillServicesResponse,
          map: this.map,
          owner: action.owner
        };
        this.mapService.executeMapAction(mapServicesResponse); // this will be sent to selection.component
      }
    );
  }

  executeGeoZoomAction(geoZoomAction: GeoZoomAction) {
    switch (geoZoomAction.geoZoomActionType) {
      case GeoZoomActionType.FillServicesRequest:
        this.mapService.executeMapAction(<GeoZoomAction>{
          geoZoomActionType: GeoZoomActionType.FillServicesResponse,
          map: this.map
        });
        break;
    }
  }

  executeBookmarkAction(bookmarkAction: BookmarkAction): void {
    switch (bookmarkAction.bookmarkActionType) {
      case BookmarkActionType.BookmarkInitRequest:
        this.mapService.executeMapAction(<BookmarkAction>{
          EMapAction: EmapActions.Bookmark,
          bookmarkActionType: BookmarkActionType.BookmarkInitResponse,
          map: this.map
        });
        break;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
