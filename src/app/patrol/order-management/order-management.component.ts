import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { OrderManagementhModel } from './order-management-model';
import { InputParameter } from '../../api/request/input-parameter';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { loadModules } from 'esri-loader';
import { MapService } from '../../map-service/map.service';
import { MemoryService } from '../../cache/memory.service';
import { GlobalService } from '../../Globals/global.service';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { FlashToGeometry, AddGeometry, MapAction, ReturnElementAction } from '../../map-service/map-action';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css']
})
export class OrderManagementComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  subscription: Subscription;
  model: OrderManagementhModel;
  listpadre: Array<any>;
  departments: Array<any>;
  listarUnidades: Array<any>;
  padrehija: any;
  loadorden: any;
  dataAdapter: any;
  listElements: any;
  selectedElement: any;
  manzana: Array<any>;
  dataTableColumns: Array<any>;
  RowSelected = new EventEmitter();
  estadoSeleccionado: any;
  team: any;
  dateC: any;
  fechaC: any;
  patrol: any;
  teamDisabled = true;
  patrolDisabled = true;
  ordenhijaa: number;
  numEnteroAsignarE: number;
  codAsignar: any;
  cantidadOH: any;
  nombrePatrol: any;
  btnEquipo = true;
  ordenhija = true;
  btnPatrol = true;
  ordenhija1 = true;
  tagManzana: any;
  cantidadManzanas: any;
  seleccionarManzana = true;
  btnPatrolDesasignar = true;
  btnEquipoDesasignar = true;
  cont: any;
  cont1: any;
  ordenPadre: any;
  btnLimpiarSelect = true;
  btnManzanaPatrol = true;

  constructor(
    private apiService: ApiService,
    private mapService: MapService,
    private memoryService: MemoryService,
    private globals: GlobalService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeReturnElementAction(mapAction));
    this.model = new OrderManagementhModel();
    this.dataTableColumns = new Array<any>();
    this.dataAdapter = new jqx.dataAdapter({});
    this.manzana = new Array<any>();
  }

  ngOnInit() {
    this.loadDepartamento();
  }

  private loadDepartamento(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.Departamento,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadDepartamentosCompleted(JSON.parse(json[0]));
        }
      });
  }

  loadDepartamentosCompleted(json: any): void {
    if (json['Table1']) {
      this.fillDepartmentsCompleted(json['Table1']);
    }
  }

  private fillDepartmentsCompleted(result: any): void {
    if (result && result.length > 0) {
      this.departments = new Array<any>();

      result.forEach(feature => {
        this.departments.push({
          value: feature.CODIGO,
          text: feature.NOMBRE
        });
      });
    }
  }

  onDeparmentSelectChanged(department: any): void {
    if (department != null) {
      this.loadUnidades(department.value);
    }
  }

  private loadUnidades(jsonresult: any): void {
    this.startProgress();

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerUnidades,
          [
            new InputParameter('undepartamento', jsonresult)
          ]
        )
      )
      .subscribe(json => {
        this.stopProgress();

        if (json[1] != null) {
          this.loadUnidadesCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadUnidadesCompleted(json: any): void {
    if (json['Table1']) {
      this.loadUnidadestable(json['Table1']);
    }
  }

  private loadUnidadestable(result: any): void {
    if (result && result.length > 0) {
      this.listarUnidades = new Array<any>();

      result.forEach(unidadopereitva => {
        this.listarUnidades.push({
          value: unidadopereitva.OPERATING_UNIT_ID,
          text: unidadopereitva.OPER_UNIT_CODE
        });
      });
    }
  }

  onUnidadesChange(unidad: any): void {
    if (unidad != null) {
      this.loadOrdenPadre(unidad.value);
    }
  }

  private loadOrdenPadre(orden: any) {
    this.startProgress();

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerOrdenPadre,
          [
            new InputParameter('unidad', orden)
          ]
        )
      )
      .subscribe(json => {
        this.stopProgress();

        if (json[1] != null) {
          this.loadOrdenPadreCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadOrdenPadreCompleted(json: any): void {
    if (json['Table1']) {
      this.fillDepartmentsCompleted2(json['Table1']);
    }
  }

  private fillDepartmentsCompleted2(result: any): void {
    if (result && result.length > 0) {
      this.listpadre = new Array<any>();

      result.forEach(ordenpadre => {
        this.listpadre.push({
          value: ordenpadre.COD_ORDEN_PADRE
        });
      });
    }
  }

  onUnidadesChange1(padre: any): void {
    if (padre !== null && padre !== '') {
      this.btnPatrol = true;
      this.btnPatrolDesasignar = true;
      this.patrolDisabled = false;

      this.teamDisabled = true;
      this.btnEquipo = true;
      this.btnEquipoDesasignar = true;

      this.cantidadManzanas = null;
      this.nombrePatrol = null;
      this.fechaC = null;
      this.dateC = null;

      this.btnManzanaPatrol = false;
      this.btnLimpiarSelect = false;

      this.puedeLegalizar(padre.value);
      this.onTieneOrdenesHija(padre.value);

      this.ordenPadre = padre.value;
      this.padrehija = this.model.Padre.value;
    }
  }

  puedeLegalizar(padre3: any): void {
    this.startProgress();

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.PuedeLegalizar,
          [
            new InputParameter('orden', padre3)
          ]
        )
      )
      .subscribe(json => {
        this.stopProgress();

        if (json[1]) {
          this.ordenhija1 = true;
        } else {
          this.ordenhija1 = false;
        }
      });
  }

  onTieneOrdenesHija(padre1: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.TieneOrdenesHija,
          [
            new InputParameter('codOrden', padre1)
          ]
        )
      )
      .subscribe(json => {
        if (json[3] === '1') {
          this.ordenhija = true;
          this.seleccionarManzana = false;
          this.limpiarManzanaPintada();
          this.loadListOrdenhija();
          this.loadPatrol();
          this.acercarSector(json);
        } else {
          this.ordenhija = false;
          this.seleccionarManzana = true;
          this.clearGrid();
        }
      });
  }

  acercarSector(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);

    if (posResult.length === 4) {
      const jsonExtent = [{ SHAPE: json[posResult[0]] }];
      const jsonData = JSON.parse(json[posResult[1]]);
      const jsonDataLegalizada = JSON.parse(json[posResult[3]]);

      if (jsonData['Table1']) {
        ResultToGraphicCollection.convert(
          <Array<any>>jsonExtent,
          results => {
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.ZoomToGeometry,
              geometry: results[0].geometry
            });
          }
        );

        ResultToGraphicCollection.convert(
          <Array<any>>jsonExtent,
          results => {
            this.mapService.executeMapAction(<AddGeometry>{
              EMapAction: EmapActions.AddGeometry,
              geometries: results,
              color: 'rgba(255,255,0,0.5)'
            });
          }
        );

        const responseValues = Object.values(jsonData);
        ResultToGraphicCollection.convert(
          <Array<any>>responseValues[0],
          results => {
            this.mapService.executeMapAction(<AddGeometry>{
              EMapAction: EmapActions.AddGeometry,
              geometries: results,
              color: 'rgba(244,25,32,0.5)'
            });
          }
        );

        const responseValuesLegalizada = Object.values(jsonDataLegalizada);
        ResultToGraphicCollection.convert(
          <Array<any>>responseValuesLegalizada[0],
          results => {
            this.mapService.executeMapAction(<AddGeometry>{
              EMapAction: EmapActions.AddGeometry,
              geometries: results,
              color: 'rgba(18,155,45,0.65)'
            });
          }
        );
      }
    }
  }

  private limpiarManzanaPintada(): void {
    this.mapService.executeMapAction({
      EMapAction: EmapActions.ClearGraphic
    });
  }

  private loadListOrdenhija(): any {
    this.loadorden = this.model.Padre.value;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarOrdenHIja,
          [
            new InputParameter('ordenpadre', this.loadorden)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          const ordenesHija = JSON.parse(json[1]);
          this.cantidadOH = ordenesHija['Table1'].length;

          this.loadListTeamCompleted(json);
        }
      });
  }

  private loadListTeamCompleted(jsonResult: any): void {
    if (jsonResult['1']) {
      const jsonTable = JSON.parse(jsonResult['1']);

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

  private prepareDataTableColumns(selectedGraphics: any): void {
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

  onCrearOrdenHIja(): void {
    if (this.model.Departamento1 && this.model.Unidad && this.model.Padre) {
      this.startProgress();
      this.ordenhija = true;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.CrearOrdenHIja,
            [
              new InputParameter('ordenpadre', this.padrehija)
            ]
          )
        )
        .subscribe(json => {
          this.stopProgress();

          if (json != null) {
            this.loadListOrdenhija();
            this.onTieneOrdenesHija(this.ordenPadre);
            alert('Ordenes hijas creadas.');
          }
        });
    } else {
      alert('Debe seleccionar todos los campos.');
    }
  }

  executeMeasureLine(): void {
    if (this.manzana != null) {
      this.manzana = new Array<any>();
    }

    this.mapService.executeMapAction({
      EMapAction: EmapActions.OrderManagement
    });
  }

  asignarPatrullero(): void {
    if (this.nombrePatrol !== undefined && this.nombrePatrol !== '' && this.nombrePatrol !== null) {
      let a = 0;
      this.cont = 0;
      this.cont1 = 0;
      const asginadas = this.manzana.length;
      const codPatrol = this.nombrePatrol.COD_PATRULLERO;

      for (let i = 0; i < this.manzana.length; i++) {
        const element = this.manzana[i];

        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.PuedeManzana,
              [
                new InputParameter('manzana', this.manzana[i])
              ]
            )
          )
          .subscribe(json => {
            if (json[1] === '1') {
              this.cont++;
            } else {
              this.cont1++;
            }

            a = this.cont + this.cont1;

            if (json[1] === '1') {

              if (asginadas === a) {

                if (this.cont1 === 0) {
                  alert(`La cantidad de manzanas asignadas al patrullero fueron: ${this.cont}.`);
                } else if (this.cont === 0) {
                  alert(`Hay ${this.cont1} manzanas que ya estan asignadas a un patrullero.`);
                } else {
                  alert(`La cantidad de manzanas asignadas al patrullero fueron: ${this.cont}.`);
                  alert(`Hay ${this.cont1} manzanas que ya estan asignadas a un patrullero.`);
                }

              }

              this.apiService
                .callStoreProcedureV2(
                  RequestHelper.getParamsForStoredProcedureV2(
                    StoreProcedures.UpdatePatrulleroOrden,
                    [
                      new InputParameter('manzana', element),
                      new InputParameter('estado', 2),
                      new InputParameter('asignado', codPatrol)
                    ]
                  )
                )
                .subscribe(json1 => {
                  if (this.manzana.length >= 1) {
                    this.loadListOrdenhija();
                    this.nombrePatrol = null;
                    this.onTieneOrdenesHija(this.model.Padre.value);
                    this.cantidadManzanas = null;
                    this.btnManzanaPatrol = false;
                  }
                });

            } else {
              if (asginadas === a) {

                if (this.cont1 === 0) {
                  alert(`La cantidad de manzanas asignadas al patrullero fueron: ${this.cont}.`);
                } else if (this.cont === 0) {
                  alert(`Hay ${this.cont1} manzanas que ya estan asignadas a un patrullero.`);
                } else {
                  alert(`La cantidad de manzanas asignadas al patrullero fueron: ${this.cont}.`);
                  alert(`Hay ${this.cont1} manzanas que ya estan asignadas a un patrullero.`);
                }

                this.nombrePatrol = null;

              }
            }
          });
      }
    } else {
      alert('Debe seleccionar un patrullero.');
    }
  }

  desasignarPatrullero(): void {
    for (let i = 0; i < this.manzana.length; i++) {
      const element = this.manzana[i];

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.validacionManzana,
            [
              new InputParameter('tagManzana', element)
            ]
          )
        )
        .subscribe(json => {
          if (json[1]) {

            if (json[2] === '0') {
              alert('La manzana no esta asignada a ningún patrullero.');
            } else if (json[2] === '1') {

              if (json[1] === '0') {
                const mensajeConfirmacion = confirm('¿Está seguro de que desea desasignar el patrullero?.');

                if (mensajeConfirmacion === true) {
                  this.desasignarPatrulleroHistorial(element);
                }
              } else if (json[1] === '1') {
                // tslint:disable-next-line:max-line-length
                const mensajeConfirmacion = confirm('Esta manzana tiene historial de patrullaje, ¿Está seguro que desea desasignar el patrullero y borrar el historial de la manzana?.');

                if (mensajeConfirmacion === true) {
                  this.desasignarPatrulleroHistorial(element);
                }
              }

            }

          }
        });
    }
  }

  desasignarPatrulleroHistorial(tagManzana: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.desasignarmanzanas,
          [
            new InputParameter('tagManzana', tagManzana)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadListOrdenhija();
          this.onTieneOrdenesHija(this.model.Padre.value);
          this.btnManzanaPatrol = false;
        }
      });
  }

  fechaCalibracion(fecha: any): void {
    this.dateC = fecha.VIGENCIA_CALIB;
  }

  assignEquipment(): void {
    this.cont = 0;

    if (this.fechaC !== undefined && this.fechaC !== '' && this.fechaC !== null) {
      const numEnteroAsignarE = this.fechaC.SERIAL_EQUIPO;

      for (let i = 0; i < this.manzana.length; i++) {
        this.cont++;
        const element = this.manzana[i];

        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.UpdateEquipoOrden,
              [
                new InputParameter('manzana', element),
                new InputParameter('asignado', numEnteroAsignarE)
              ]
            )
          )
          .subscribe(json => {
            if (json[2]) {
              this.loadListOrdenhija();
              this.dateC = null;
              this.fechaC = null;
              this.btnManzanaPatrol = false;
            }
          });
      }

      alert(`Equipo asignado a ${this.cont} manzanas.`);

    } else {
      alert('Debe seleccionar un equipo de detección.');
    }
  }

  desasignarEquipo(): void {
    const confirmacion = confirm('Esta seguro de que desea desasignar el equipo de detección.');

    if (confirmacion === true) {

      for (let i = 0; i < this.manzana.length; i++) {
        const element = this.manzana[i];

        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.DesasignarEquipoOrden,
              [
                new InputParameter('manzana', element)
              ]
            )
          )
          .subscribe(json => {
            if (json[2]) {
              this.loadListOrdenhija();
              this.btnManzanaPatrol = false;
              alert(json[2]);
            }
          });
      }

    }
  }

  // SELECCIONAR MANZANA
  private executeReturnElementAction(evt: MapAction): void {
    switch (evt.EMapAction) {
      case EmapActions.OrderManzanaGeometry:
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

      this.SelectManzana(result.features);
    }
  }

  private SelectManzana(eventArg): void {
    this.loadPatrol();
    this.loadTeam();
    for (const element1 of eventArg) {
      this.manzana.push(element1.attributes.TAG);
      this.tagManzana = element1.attributes.TAG;
    }
    this.cantidadManzanas = this.manzana.length;

    this.btnPatrol = false;
    this.btnPatrolDesasignar = false;
    this.btnEquipo = false;
    this.teamDisabled = false;
    this.btnEquipoDesasignar = false;
    this.btnManzanaPatrol = true;
  }

  loadPatrol(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarPatrullerosUnidad,
          [
            new InputParameter('unidad', this.model.Unidad.value)
          ]
        )
      )
      .subscribe(json => {
        if (json != null) {
          this.loadPatrolCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadPatrolCompleted(json: any): void {
    if (json['Table1']) {
      this.patrol = json['Table1'];
    }
  }

  loadTeam(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarEquipos,
          []
        )
      )
      .subscribe(json => {
        if (json != null) {
          this.loadTeamCompleted(JSON.parse(json[0]));
        }
      });
  }

  loadTeamCompleted(json: any): void {
    if (json['Table1']) {
      this.team = json['Table1'];
    }
  }

  mostrarManzanasPatrulleros(): void {
    if (this.nombrePatrol === null) {
      alert('Debe seleccionar un patrullero');
    } else {
      const codPatrol1 = this.nombrePatrol.COD_PATRULLERO;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.TieneManzanasPatrulleroUnd,
            [
              new InputParameter('codPatrullero', codPatrol1),
              new InputParameter('codOrden', this.model.Padre.value)
            ]
          )
        )
        .subscribe(json => {
          if (json[3] === '0' && json[4] === '0') {
            alert('Este patrullero no tiene manzanas asignada en esta orden.');
            this.btnManzanaPatrol = false;
          } else {
            this.acercarSector1(json);
            this.btnManzanaPatrol = true;
          }
        });
    }
  }

  acercarSector1(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);
    const jsonData = JSON.parse(json[posResult[0]]);

    if (jsonData['Table1']) {
      const responseValues = Object.values(jsonData);

      ResultToGraphicCollection.convert(
        <Array<any>>responseValues[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results
          });
        }
      );
    }
  }

  limpiarManzanaSeleccionada(): void {
    this.btnManzanaPatrol = false;
    this.onTieneOrdenesHija(this.model.Padre.value);
    this.cantidadManzanas = null;
    this.nombrePatrol = null;
  }

  private limpiarmanzana(): void {
    if (this.manzana != null) {
      this.manzana = new Array<any>();
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

  start(): void {
    this.listpadre = null;
    this.listarUnidades = null;
    this.model.Padre = null;
    this.model.Unidad = null;
    this.model.Departamento1 = null;
    this.dateC = null;
    this.padrehija = null;
    this.cantidadOH = null;
    this.team = null;
    this.patrol = null;
    this.cantidadManzanas = null;
    this.btnEquipo = true;
    this.btnPatrol = true;
    this.ordenhija = true;
    this.teamDisabled = true;
    this.patrolDisabled = true;
    this.manzana = [];
    this.clearGrid();
    this.limpiarmanzana();
    this.seleccionarManzana = true;
    this.btnPatrolDesasignar = true;
    this.btnEquipoDesasignar = true;
    this.btnLimpiarSelect = true;
    this.btnManzanaPatrol = true;
  }
}
