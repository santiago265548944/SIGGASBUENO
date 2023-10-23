import { Component, OnInit, ViewChild, ComponentRef } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { MapService } from '../../map-service/map.service';
import { InputParameter } from '../../api/request/input-parameter';
import { ModalService } from '../../modal.module';
import { CrearPrensasComponent } from './crear-prensas/crear-prensas.component';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { OwnerSelection } from '../../map-service/map-actions/select-action';
import { EmapActions } from '../../map-service/emap-actions.enum';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { MapAction, ReturnElementAction } from '../../map-service/map-action';
import { loadModules } from 'esri-loader';
import { GlobalService } from '../../Globals/global.service';
import { MemoryService } from '../../cache/memory.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-manejo-prensas',
  templateUrl: './manejo-prensas.component.html',
  styleUrls: ['./manejo-prensas.component.css']
})
export class ManejoPrensasComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  subscription: Subscription;
  private modalCrearPrensas: ComponentRef<any> = null;
  inserting: boolean;
  pipes: Array<any>;
  pipeSelected: any;
  rowSelected: any;
  prensasList: any;
  OwnerSelection = OwnerSelection;

  constructor(
    private apiService: ApiService,
    private modalService: ModalService,
    private mapService: MapService,
    private globals: GlobalService,
    private memoryService: MemoryService
  ) {
    this.inserting = false;
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeReturnElementAction(mapAction));
  }

  ngOnInit() { }

  start(evt: any): void {
    this.getTodasPrensas();
    this.fillPipes();
  }

  private executeReturnElementAction(evt: MapAction): void {
    if (evt.EMapAction == EmapActions.ManejoPrensasGeometry) {
      loadModules(
        [
          'esri/tasks/BufferParameters',
          'esri/config',
          'esri/units',
          'esri/tasks/GeometryService'
        ],
        { url: 'https://js.arcgis.com/3.23/' }
      )
        .then(
          ([BufferParameters, esriConfig, Units, GeometryService]) => {
            const userGeo = (<ReturnElementAction>evt).geometry
            this.globals.mapPoint = userGeo;
            var params = new BufferParameters();
            params.bufferSpatialReference = userGeo.spatialReference;
            params.outSpatialReference = userGeo.spatialReference;
            params.unit = GeometryService.UNIT_METER;
            params.distances = [2];
            params.geometries = [userGeo];
            esriConfig.defaults.geometryService.buffer(params, evt => {
              this.globals.bufferGeometry = evt[0];

              loadModules(['esri/tasks/QueryTask', 'esri/tasks/query']).then(
                ([QueryTask, Query]) => {
                  const arcServerUrl = this.memoryService
                    .getItem('ArcGISServerURL')
                    .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
                    .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));

                  const url =
                    arcServerUrl +
                    this.memoryService.getItem('TuberiaServiceName') +
                    '/MapServer/' + this.globals.pipeLayer.value;
                  const queryTask = new QueryTask(url);
                  const query = new Query();
                  query.returnGeometry = true;
                  query.geometry = this.globals.bufferGeometry;
                  query.outFields = ['TAG'];
                  query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                  queryTask.execute(
                    query,
                    result => this.queryCompleted(result),
                    error => (error) => { console.error(error); }
                  );
                });
            });
          }
        )
        .catch(err => {
          console.error(err);
        });
    }
  }

  private queryCompleted(resultGeo: any): void {

    if (resultGeo.features && resultGeo.features.length == 1) {
      loadModules(['esri/geometry/Point']).then(
        ([Point]) => {
          try {
            this.startProgress();
            this.globals.clickCount++;
            const intersectPolyLine = resultGeo.features[0].geometry;
            const principalPoint = this.globals.mapPoint;
            const point = principalPoint;
            const first = new Point(intersectPolyLine.paths[0][0][0], intersectPolyLine.paths[0][0][1], principalPoint.spatialReference)
            const last = first;
            let start = new Point(last.x, last.y, last.spatialReference)

            const result = 0;
            let distance = 9999999;
            let distanceTemp = 0;
            let intr: any;


            for (let element of intersectPolyLine.paths[0]) {
              const tmp = element;
              const end = new Point(tmp[0], tmp[1]);
              let calculateValue = 1;
              let intrTemp: any;

              const LineMag = this.Magnitude(end, start);
              const U = parseFloat(((((point.x - start.x) * (end.x - start.x)) +
                ((point.y - start.y) * (end.y - start.y))) / (LineMag * LineMag)).toString());

              if (U < parseFloat("0.0") || U > parseFloat("1.0") || !U) {
                calculateValue = 0;
              }

              if (calculateValue == 1) {
                intrTemp = new Point((start.x + U * (end.x - start.x)), (start.y + U * (end.y - start.y)));
                distanceTemp = this.Magnitude(point, intrTemp);

                if (distanceTemp < distance) {
                  intr = intrTemp;
                  distance = distanceTemp;
                }
              }
              start = end;
            }

            const actualConsecutive = this.globals.consecutivePressCode[this.globals.clickCount - 1];
            this.apiService
              .callStoreProcedureV2(
                RequestHelper.getParamsForStoredProcedureV2(
                  StoreProcedures.InsertaPrensa,
                  [
                    new InputParameter('una_CoordenadaX', intr.x),
                    new InputParameter('una_CoordenadaY', intr.y),
                    new InputParameter('un_Consecutivo', actualConsecutive),
                    new InputParameter('un_IDPrensa', this.globals.pressID)
                  ]
                )
              )
              .subscribe(json => {
                this.crearPrensaCompleted(json);
              });

          } catch (error) {
            console.error(error);
            this.stopProgress();
          }
        });
    }
  }

  private crearPrensaCompleted(json: any) {
    this.stopProgress();
    if (Object.values(json).length > 0) {
      alert(json[0]);
      console.error(json[0]);
    } else {
      alert("Prensa creada satisfactoriamente");
    }

    if (this.globals.clickCount >= this.globals.pressNumber) {
      this.globals.setManejoPrensas(null, null, null, null, null, false);
      this.startProgress();
      this.getTodasPrensas();
    }
  }

  private Magnitude(Point1: any, Point2: any): number {
    const x = Point2.x - Point1.x;
    const y = Point2.y - Point1.y;

    return parseFloat(Math.sqrt(x * x + y * y).toString());
  }

  private getTodasPrensas(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerPrensas,
          []
        )
      )
      .subscribe(json => {
        this.fillGrid(json);
      });
  }

  private fillGrid(jsonResult: any): void {
    try {
      if (jsonResult['0']) {
        const jsonTable = JSON.parse(jsonResult['0']);
        if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
          ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
            this.stopProgress();
            this.prensasList = results;
          });
        } else {
          if (jsonTable['ErrorMessage']) {
            alert(jsonTable['ErrorMessage']);
          }
          this.cleanGrid();
        }
      } else {
        this.cleanGrid();
      }
    } catch (error) {
      this.stopProgress();
      this.cleanGrid();
      console.error(error);
    }
  }

  fillPipes(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerTuberiasPrensado,
          []
        )
      )
      .subscribe(json => {
        this.fillPipesCompleted(json);
      });
  }

  private fillPipesCompleted(json: any): void {
    const values = Object.values(json);
    if (values.length > 0) {
      const result = JSON.parse(values[0].toString());
      if (result['Table1'] != null) {
        this.pipes = result['Table1'].map(element => ({
          value: element['VALORPARAMETRO'],
          text: element['NOMBREPARAMETRO']
        }));
      }
    }
  }

  onInsertClick(): void {
    if (this.rowSelected) {
      this.inserting = true;
    } else {
      alert("Debe seleccionar una emergencia");
    }
  }

  onPipeSelected() {
    const cantidadPresas = this.rowSelected.attributes["Cantidad de Prensas"];
    const idPresa = this.rowSelected.attributes["Emergencia"];

    if (cantidadPresas > 0) {
      const arrPrensas = new Array;
      for (let i = 1; i <= cantidadPresas; i++) {
        arrPrensas.push(i);
      }

      this.globals.setManejoPrensas(arrPrensas,
        idPresa, this.pipeSelected, 0,
        cantidadPresas, true);

      this.mapService.executeMapAction({
        EMapAction: EmapActions.ManejoPrensas
      });
    } else {
      alert("La emergencia no tiene asignadas presas a colocar");
    }

    this.inserting = false;
  }

  onCrearClickHandler(): void {
    this.openCrearPrensas();
  }

  onRowSelectHandler(event: any): void {
    this.rowSelected = event;
  }

  onEliminarClickHandler() {
    if (this.rowSelected != null) {
      this.startProgress();
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.EliminarPrensa,
            [new InputParameter('un_IDPrensa', this.rowSelected.attributes.Emergencia)]
          )
        )
        .subscribe(json => {
          this.stopProgress();
          this.eliminarCompleted(json);
        });
    }
  }

  private eliminarCompleted(json: any) {
    const values = Object.values(json);
    alert(values[0]);
    this.startProgress();
    this.getTodasPrensas();
    // TODO: Recargar layer
  }

  openCrearPrensas(): void {
    if (this.modalCrearPrensas == null) {
      this.modalCrearPrensas = this.modalService.create(CrearPrensasComponent, {
        modalTitle: 'Crear Prensas',
        height: 180,
        width: 400,
        resizable: true
      });
    } else {
      this.modalCrearPrensas.instance.open();
    }
    this.modalCrearPrensas.instance.start(() => {
      this.startProgress();
      this.getTodasPrensas();

      this.mapService.executeMapAction({
        EMapAction: EmapActions.ManejoPrensas
      });
    });
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

  private cleanGrid(): void {
    this.prensasList = new Array();
  }
}
