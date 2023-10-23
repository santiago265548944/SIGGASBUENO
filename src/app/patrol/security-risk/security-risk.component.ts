import { Component, OnInit } from '@angular/core';
import { loadModules } from 'esri-loader';
import { MapService } from '../../map-service/map.service';
import { MemoryService } from '../../cache/memory.service';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { ReturnElementAction, MapAction, AddGeometry } from '../../map-service/map-action';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { GlobalService } from '../../Globals/global.service';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { _localeFactory } from '@angular/core/src/application_module';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { GeoZoomAction, GeoZoomActionType } from '../../map-service/map-actions/geozoom-action';

@Component({
  selector: 'app-security-risk',
  templateUrl: './security-risk.component.html',
  styleUrls: ['./security-risk.component.css']
})
export class SecurityRiskComponent implements OnInit {
  subscription: Subscription;
  map: any;
  dataAdapter: any;
  codigomanzana: any;
  manzana: Array<any>;
  dataTableColumns: Array<any>;
  codigorow: any;
  listElements: any;
  selectedElement: any;
  cantidadManzanas: any;
  codigomanzanaAdiccionar: any;
  genericUrl: string;
  onOff = 'Activar';

  constructor(
    private mapService: MapService,
    private memoryService: MemoryService,
    private apiService: ApiService,
    private globals: GlobalService
  ) {
    this.subscription = this.mapService.getMapAction().subscribe(mapAction => this.executeGeoZoomAction(mapAction)),
      this.subscription = this.mapService.getMapAction().subscribe(mapAction => this.executeReturnElementAction(mapAction));
    this.manzana = new Array<any>();
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
  }

  ngOnInit() {
    this.loadListManzana();

    this.mapService.executeMapAction(<GeoZoomAction>{
      EMapAction: EmapActions.GeoZoom,
      geoZoomActionType: GeoZoomActionType.FillServicesRequest
    });
  }

  private loadListManzana(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarManzanas,
          []
        )
      )
      .subscribe(json => {
        if (json[0]) {
          this.loadListManzanaCompleted(json);
        }
      });
  }

  private loadListManzanaCompleted(jsonResult: any): void {
    if (jsonResult['0']) {
      const jsonTable = JSON.parse(jsonResult['0']);

      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
          this.loadGrid(results);
        });
      }
    }
  }

  private loadGrid(selectedGraphics: any): void {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.listElements = selectedGraphics;
      this.clearGrid();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumns(selectedGraphics);
        this.prepareDataTableSource(selectedGraphics);
      }
    }
  }

  prepareDataTableColumns(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSource(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  private clearGrid(): void {
    if (this.dataAdapter != null) {
      this.dataAdapter = new jqx.dataAdapter({});
    }

    if (this.dataTableColumns != null) {
      this.dataTableColumns = new Array<any>();
    }
  }

  tableOnRowSelect(event: any): void {
    this.selectedElement = this.listElements[event.args.index];
    this.codigorow = this.selectedElement.attributes.TAG;
  }

  //  MANDA LOS VALORES POR CADA QUE PRESIONE EL BOTÓN.
  executeMeasureLine(): void {
    this.cantidadManzanas = null;

    this.mapService.executeMapAction({
      EMapAction: EmapActions.SecurityRisk
    });
  }

  executeZoom(type: number): void {
    if (this.codigorow == null) {
      alert('No se a seleccionado el tag de una manzana');
    } else if (
      this.codigorow !== ''
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

            switch (type) {

              case 4:
                servicio = this.memoryService.getItem('ManzanaServiceName');
                layer = this.memoryService.getItem('ManzanaLayerIndex');
                url = this.genericUrl + servicio + '/MapServer/' + layer;
                // tslint:disable-next-line:quotemark
                where = "TAG = '" + this.codigorow + "'";
                break;
            }

            const queryTask = new QueryTask(url);
            const query = new Query();
            query.outSpatialReference = this.map.spatialReference;
            query.returnGeometry = true;
            query.outFields = ['TAG'];
            query.where = where;
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

                  widthExpand = selectedGraphicsExtent.getWidth() * factor / 2;
                  heightExpand =
                    selectedGraphicsExtent.getHeight() * factor / 2;

                  const displayExtent = new Extent(
                    selectedGraphicsExtent.xmin - widthExpand,
                    selectedGraphicsExtent.ymin - heightExpand,
                    selectedGraphicsExtent.xmax + widthExpand,
                    selectedGraphicsExtent.ymax + heightExpand,
                    selectedGraphicsExtent.spatialReference
                  );

                  this.map.setExtent(displayExtent);
                }
              },
              errback => {
                console.error(errback);
              }
            );
          }
        )
        .catch(err => {
          console.error(err);
        });
    }
  }

  adiccionarManzana(): void {
    if (this.manzana.length === 0) {
      alert('No hay ninguna manzana seleccionada.');
    } else {

      for (let index = 0; index < this.manzana.length; index++) {
        this.codigomanzanaAdiccionar = this.manzana[index];

        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.ManzanaRiesgo,
              [
                new InputParameter('manzana', this.codigomanzanaAdiccionar)
              ]
            )
          )
          .subscribe(json => {
            this.codigomanzanaAdiccionar = this.manzana[index];

            if (json[1] === '0') {

              if (this.manzana.length >= 1) {
                alert('Esta manzana ya esta restringida.');
              }

            } else {
              this.apiService
                .callStoreProcedureV2(
                  RequestHelper.getParamsForStoredProcedureV2(
                    StoreProcedures.AdicionarManzna,
                    [
                      new InputParameter('tagManzana', this.codigomanzanaAdiccionar)
                    ]
                  )
                )
                // tslint:disable-next-line:no-shadowed-variable
                .subscribe(json => {
                  if (this.manzana.length >= 1) {
                    this.loadListManzana();
                    this.manzanasRiesgo();
                    alert('Manzana restringida.');
                    this.cantidadManzanas = null;
                    this.limpiarmanzana();
                  }
                });
            }
          });
      }

    }
  }

  eliminarManzana(): void {
    if (this.manzana.length === 0) {
      alert('No hay ninguna manzana seleccionada.');
    } else {

      for (let index = 0; index < this.manzana.length; index++) {
        this.codigomanzana = this.manzana[index];

        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.ManzanaRiesgoSeguridad,
              [
                new InputParameter('manzana', this.codigomanzana)
              ]
            )
          )
          .subscribe(json => {
            this.codigomanzana = this.manzana[index];

            if (json[2] === '1') {
              alert('La manzana seleccionada no esta restringida.');
            } else {
              this.apiService
                .callStoreProcedureV2(
                  RequestHelper.getParamsForStoredProcedureV2(
                    StoreProcedures.EliminarManzana,
                    [
                      new InputParameter('codigo', this.codigomanzana)
                    ]
                  )
                )
                // tslint:disable-next-line:no-shadowed-variable
                .subscribe(json => {
                  if (this.manzana.length >= 1) {
                    this.loadListManzana();
                    this.manzanasRiesgo();
                    alert('Manzana quitada');
                    this.cantidadManzanas = null;
                    this.limpiarmanzana();
                  }
                });
            }
          });
      }

    }
  }

  btnOnOff(): void {
    if (this.onOff === 'Activar') {
      this.manzanasRiesgo();
      this.onOff = 'Desactivar';
    } else if (this.onOff === 'Desactivar') {
      this.limpiarmanzana();
      this.onOff = 'Activar';
    }
  }

  private manzanasRiesgo(): any {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ManzanaRiesgoSeguridad,
          []
        )
      )
      .subscribe(json => {
        this.pintarRiesgo(json);
      });
  }

  private pintarRiesgo(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);
    const jsonData = JSON.parse(json[posResult[0]]);

    if (jsonData['Table1']) {

      const responseValues = Object.values(jsonData);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues[0],
        results => {
          if (this.validateGeometry(results[0].geometry)) {
            this.mapService.executeMapAction(<AddGeometry>{
              EMapAction: EmapActions.AddGeometry,
              geometries: results,
              color: 'rgba(252,6,107,0.5)'
            });
          }
        }
      );

    }
  }

  private validateGeometry(geometry: any) {
    if (geometry === null) {
      alert('El elemento seleccionado no tiene geometria.');
      return false;
    }

    return true;
  }

  private limpiarmanzana(): void {
    if (this.manzana != null) {
      this.manzana = new Array<any>();

      this.mapService.executeMapAction({
        EMapAction: EmapActions.ClearGraphic
      });
    }
  }

  private executeGeoZoomAction(geoZoomAction: GeoZoomAction) {
    switch (geoZoomAction.geoZoomActionType) {
      case GeoZoomActionType.FillServicesResponse:
        this.map = geoZoomAction.map;
        this.executeDepartamentQuery();
        break;
    }
  }

  private executeDepartamentQuery(): void {
    // TODO: this generic url should be a generic function
    const argisServerName = this.memoryService.getItem('ArcGISServerName');
    const argisServerPort = this.memoryService.getItem('ArcGISServerPort');
    this.genericUrl = this.memoryService
      .getItem('ArcGISServerURL')
      .replace('{0}', argisServerName)
      .replace('{1}', argisServerPort);
  }

  // SELECCIONAR MANZANA
  private executeReturnElementAction(evt: MapAction): void {
    switch (evt.EMapAction) {
      case EmapActions.SecurityManzanaGeometry:
        if ((<ReturnElementAction>evt).geometry) {
          this.executeReturnElementAction1((<ReturnElementAction>evt).geometry);
        }
        break;
    }
  }

  private executeReturnElementAction1(evt) {
    loadModules(['esri/tasks/QueryTask', 'esri/tasks/query']).then(

      ([QueryTask, Query]) => {
        if (this.globals.getLastKeyPress() !== 16) {
          const arcServerUrl = this.memoryService
            .getItem('ArcGISServerURL')
            .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
            .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));

          const url =
            arcServerUrl +
            this.memoryService.getItem('ManzanaServiceName') +
            '/MapServer/' +
            this.memoryService.getItem('ManzanaLayerIndex');
          const queryTask = new QueryTask(url);
          const query = new Query();
          query.returnGeometry = true;
          query.geometry = evt;
          query.outFields = ['*'];
          queryTask.execute(
            query,
            result => this.onIdentifyTaskComplete(result)
          );
        }
      }

    );
  }

  onIdentifyTaskComplete(result: any): void {
    if (result.features && result.features.length > 0) {
      this.mapService.executeMapAction(<AddGeometry>{
        EMapAction: EmapActions.AddGeometry,
        geometries: result.features,
        color: 'rgba(0,0,255,0.5)'
      });

      this.selectManzana(result.features);
    }
  }

  private selectManzana(eventArg): void {
    for (const element1 of eventArg) {
      this.manzana.push(element1.attributes.TAG);
    }

    this.cantidadManzanas = this.manzana.length;
  }

  start(): void {
    this.limpiarmanzana();
    this.manzana = [];
    this.codigorow = null;
    this.cantidadManzanas = null;
    this.onOff = 'Activar';
  }
}
