import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { MapService } from '../../map-service/map.service';
import { MemoryService } from '../../cache/memory.service';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { loadModules } from 'esri-loader';
import { CodeValue } from '../../generic-class/code-vale';
import { EmapActions } from '../../map-service/emap-actions.enum';
import {
  GeoZoomAction,
  GeoZoomActionType
} from '../../map-service/map-actions/geozoom-action';
import { SquareSchemeModel } from './square-model';
import { PlottingParams, ElementNames } from './plotting-params';

@Component({
  selector: 'app-square-scheme',
  templateUrl: './square-scheme.component.html',
  styleUrls: ['./square-scheme.component.css']
})
export class SquareSchemeComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  private subscription: Subscription;
  departmentValues: Array<CodeValue>;
  locationValues: Array<CodeValue>;
  squareSchemeModel = new SquareSchemeModel();
  private outField: Array<string> = ['CODIGO', 'NOMBRE'];
  private outField2: Array<string> = [
    'TAG',
    'DEPARTAMENTO',
    'LOCALIDAD',
    'MANZANACATASTRAL'
  ];
  genericUrl: string;
  map: any;
  firstVisibility = 'visibilityShow';
  secondVisibility = 'visibilityHide';
  geometry: any;

  constructor(
    private mapService: MapService,
    private memoryService: MemoryService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeGeoZoomAction(mapAction));
  }

  ngOnInit() {}
  ngAfterViewInit() {
    this.mapService.executeMapAction(<GeoZoomAction>{
      EMapAction: EmapActions.GeoZoom,
      geoZoomActionType: GeoZoomActionType.FillServicesRequest
    });
  }

  private executeGeoZoomAction(geoZoomAction: GeoZoomAction) {
    switch (geoZoomAction.geoZoomActionType) {
      case GeoZoomActionType.FillServicesResponse:
        this.map = geoZoomAction.map;
        this.executeDepartamentQuery();
        break;
    }
  }

  startProgress(): void {
    this.jqxLoader.open();
  }

  stopProgress(): void {
    this.jqxLoader.close();
  }

  private executeDepartamentQuery(): void {
    // TODO: this generic url should be a generic function
    const argisServerName = this.memoryService.getItem('ArcGISServerName');
    const argisServerPort = this.memoryService.getItem('ArcGISServerPort');
    this.genericUrl = this.memoryService
      .getItem('ArcGISServerURL')
      .replace('{0}', argisServerName)
      .replace('{1}', argisServerPort);

    this.executeQuery(1);
  }

  executeQuery(type: number): void {
    loadModules(['esri/tasks/QueryTask', 'esri/tasks/query'])
      .then(([QueryTask, Query]) => {
        let servicio = '';
        let layer = '';
        let url = '';
        let where = '';

        switch (type) {
          case 1: // Depto
            this.departmentValues = new Array<CodeValue>();
            servicio = this.memoryService.getItem('DepartamentoServiceName');
            layer = this.memoryService.getItem('DepartamentoLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = '1=1';
            break;
          case 2: // Local
            servicio = this.memoryService.getItem('LocalidadServiceName');
            layer = this.memoryService.getItem('LocalidadLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = 'DEPARTAMENTO = ' + this.squareSchemeModel.department;
            this.locationValues = new Array<CodeValue>();
            break;
          case 3: // Barrio
            servicio = this.memoryService.getItem('BarrioServiceName');
            layer = this.memoryService.getItem('BarrioLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = '1=1';
            break;
        }

        if (
          this.squareSchemeModel.department !== '' ||
          this.squareSchemeModel.location !== ''
        ) {
          const queryTask = new QueryTask(url);
          const query = new Query();
          query.outSpatialReference = this.map.spatialReference;
          query.returnGeometry = false;
          query.outFields = this.outField;
          query.orderByFields = ['TAG'];
          query.where = where;
          if (this.geometry) {
            query.geometry = this.geometry;
            query.spatialRelationship = Query.SPATIAL_REL_WITHIN;
          }

          this.startProgress();
          queryTask.execute(
            query,
            callback => {
              if (callback.features.length !== 0) {
                for (const item of callback.features) {
                  switch (type) {
                    case 1: // Depto
                      this.departmentValues.push(<CodeValue>{
                        Value: item.attributes.NOMBRE,
                        Code: item.attributes.CODIGO
                      });
                      break;
                    case 2: // Local
                      this.locationValues.push(<CodeValue>{
                        Value: item.attributes.NOMBRE,
                        Code: item.attributes.CODIGO
                      });
                      break;
                    case 3: // Local
                      this.squareSchemeModel.codigoBarrio =
                        item.attributes.CODIGO;
                      this.squareSchemeModel.nombreBarrio =
                        item.attributes.NOMBRE;
                      break;
                  }

                  if (type === 3) {
                    this.setVisibilityContent();
                    break;
                  }
                }
              } else {
                if (type === 3) {
                  alert(
                    'No se encontró el barrio con los datos suministrados.'
                  );
                }
              }
              this.stopProgress();
            },
            errback => {
              this.stopProgress();
              console.error(errback);
            }
          );
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  executeZoom() {
    if (
      this.squareSchemeModel.department &&
      this.squareSchemeModel.location &&
      this.squareSchemeModel.zona &&
      this.squareSchemeModel.sector &&
      this.squareSchemeModel.manzana
    ) {
      loadModules([
        'esri/tasks/QueryTask',
        'esri/tasks/query',
        'esri/graphic',
        'esri/symbols/SimpleFillSymbol',
        'esri/Color',
        'esri/symbols/SimpleLineSymbol',
        'esri/geometry/Extent'
      ])
        .then(
          ([
            QueryTask,
            Query,
            Graphic,
            SimpleFillSymbol,
            Color,
            SimpleLineSymbol,
            Extent
          ]) => {
            let servicio = '';
            let layer = '';
            let url = '';
            let where = '';
            const factor = 1;

            servicio = this.memoryService.getItem('ManzanaServiceName');
            layer = this.memoryService.getItem('ManzanaLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = 'DEPARTAMENTO = ' + this.squareSchemeModel.department;
            where += ' AND LOCALIDAD = ' + this.squareSchemeModel.location;
            where += ' AND ZONACATASTRAL = ' + this.squareSchemeModel.zona;
            where += ' AND SECTORCATASTRAL = ' + this.squareSchemeModel.sector;
            where +=
              ' AND MANZANACATASTRAL = ' + this.squareSchemeModel.manzana;

            const queryTask = new QueryTask(url);
            const query = new Query();
            query.outSpatialReference = this.map.spatialReference;
            query.returnGeometry = true;
            query.outFields = this.outField2;
            query.where = where;
            this.startProgress();
            queryTask.execute(
              query,
              callback => {
                if (callback.features.length !== 0) {
                  const fillSymbol = new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(
                      SimpleLineSymbol.STYLE_SOLID,
                      Color.fromRgb('rgb(0, 0, 255)'),
                      2
                    ),
                    Color.fromRgb('rgba(0, 0, 255, 0.5)')
                  );

                  this.geometry = callback.features[0].geometry;
                  callback.features.forEach(item => {
                    this.map.graphics.add(
                      new Graphic(item.geometry, fillSymbol)
                    );
                  });

                  let widthExpand = 0,
                    heightExpand = 0,
                    xMax = Number.MIN_VALUE,
                    yMax = Number.MIN_VALUE,
                    xMin = Number.MAX_VALUE,
                    yMin = Number.MAX_VALUE;

                  callback.features.forEach(feature => {
                    const geometry = feature.geometry;
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
                  });

                  const selectedGraphicsExtent = new Extent(
                    xMin,
                    yMin,
                    xMax,
                    yMax,
                    this.map.spatialReference
                  );

                  widthExpand =
                    (selectedGraphicsExtent.getWidth() * factor) / 2.5;
                  heightExpand =
                    (selectedGraphicsExtent.getHeight() * factor) / 2.5;

                  const displayExtent = new Extent(
                    selectedGraphicsExtent.xmin - widthExpand,
                    selectedGraphicsExtent.ymin - heightExpand,
                    selectedGraphicsExtent.xmax + widthExpand,
                    selectedGraphicsExtent.ymax + heightExpand,
                    selectedGraphicsExtent.spatialReference
                  );

                  this.map.setExtent(displayExtent);
                  this.executeQuery(3);
                } else {
                  alert(
                    'No se encontró la manzana con los datos suministrados.'
                  );
                }

                this.stopProgress();
              },
              errback => {
                this.stopProgress();
                console.error(errback);
              }
            );
          }
        )
        .catch(err => {
          console.error(err);
        });
    } else {
      alert('Debe seleccionar una manzana.');
    }
  }

  setVisibilityContent() {
    this.firstVisibility =
      this.firstVisibility === 'visibilityHide'
        ? 'visibilityShow'
        : 'visibilityHide';
    this.secondVisibility =
      this.secondVisibility === 'visibilityHide'
        ? 'visibilityShow'
        : 'visibilityHide';

    this.squareSchemeModel.ordenTrabajo = '';
    this.squareSchemeModel.paquete = '';
    this.squareSchemeModel.contratista = '';
    this.squareSchemeModel.supervisor = '';
    this.squareSchemeModel.responsable = '';
  }

  executeGenerate() {
    if (
      this.squareSchemeModel.ordenTrabajo &&
      this.squareSchemeModel.paquete &&
      this.squareSchemeModel.contratista &&
      this.squareSchemeModel.supervisor &&
      this.squareSchemeModel.responsable
    ) {
      this.startProgress();
      // arrayElemen = new Array
      // ElementNames
      const plottingParams = new PlottingParams();
      plottingParams.Element_Names = new Array<ElementNames>();
      const typeValue = 'TEXT_ELEMENT';
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'DEPARTAMENTO',
        type: typeValue,
        content: this.squareSchemeModel.department.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'LOCALIDAD',
        type: typeValue,
        content: this.squareSchemeModel.location.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'ORDEN',
        type: typeValue,
        content: this.squareSchemeModel.ordenTrabajo.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'NOMBREBARRIO',
        type: typeValue,
        content: this.squareSchemeModel.nombreBarrio.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'ZONA',
        type: typeValue,
        content: this.squareSchemeModel.zona.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'SECTOR',
        type: typeValue,
        content: this.squareSchemeModel.sector.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'MANZANA',
        type: typeValue,
        content: this.squareSchemeModel.manzana.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'PAQUETE',
        type: typeValue,
        content: this.squareSchemeModel.paquete.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'BARRIO',
        type: typeValue,
        content: this.squareSchemeModel.codigoBarrio.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'NOMBRECONTRATISTA',
        type: typeValue,
        content: this.squareSchemeModel.contratista.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'NOMBRESUPERVISOR',
        type: typeValue,
        content: this.squareSchemeModel.supervisor.toString()
      });
      plottingParams.Element_Names.push(<ElementNames>{
        name: 'NOMBRERESPONSABLE',
        type: typeValue,
        content: this.squareSchemeModel.responsable.toString()
      });

      const jsonParameters = JSON.stringify(plottingParams);

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
            Layout_Template: 'ESQUEMA_MANZANA',
            Params: jsonParameters,
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
    } else {
      alert('Debe llenar todos los campos.');
    }
  }

  start(evt: any) {
    this.firstVisibility = 'visibilityHide';
    this.secondVisibility = 'visibilityShow';
    this.squareSchemeModel = new SquareSchemeModel();
    this.setVisibilityContent();
  }
}
