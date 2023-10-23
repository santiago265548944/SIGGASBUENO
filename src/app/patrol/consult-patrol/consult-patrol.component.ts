import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { ApiService } from '../../api/api.service';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { FlashToGeometry, AddGeometry } from '../../map-service/map-action';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { MapService } from '../../map-service/map.service';

@Component({
  selector: 'app-consult-patrol',
  templateUrl: './consult-patrol.component.html',
  styleUrls: ['./consult-patrol.component.css']
})
export class ConsultPatrolComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  RowSelected = new EventEmitter();
  RowSelectedHistorico = new EventEmitter();
  departments: any;
  listarContratistas: any;
  unidadOperativa: any;
  consultPatrullero: any;
  dataTableColumns: Array<any>;
  dataAdapter: any;
  listarDatosPatrol: any;
  dataTableColumnsHistPatrol: Array<any>;
  dataAdapterHistPatrol: any;
  selectedElement: any;
  listElements: any;
  capturarOrden: any;
  codigoPatrol: any;
  selectedElementHistorico: any;
  listElements1: any;
  capturarHistorico: any;
  datosAvance: any;
  datosAvanceTotal: any;
  departamentoSelect: any;
  modelUnidad: any;
  contratista: any;
  listarOrdenPadre: any;
  patrulleroSeleccionado: any;
  ordenPadreSeleccionada: any;

  constructor(private apiService: ApiService, private mapService: MapService) {
    this.dataTableColumns = new Array<any>();
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumnsHistPatrol = new Array<any>();
    this.dataAdapterHistPatrol = new jqx.dataAdapter({});
  }

  ngOnInit() {
    this.loadDepartamento();
  }

  // Departamento.
  private loadDepartamento(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.Departamento,
          []
        )
      )
      .subscribe(json => {
        if (json[0]) {
          this.loadDepartamentoCompleted(JSON.parse(json[0]));
        }
      });
  }

  loadDepartamentoCompleted(json: any): void {
    if (json['Table1']) {
      this.departments = json['Table1'];
    }
  }

  // Unidad Operatia.
  loadUnidadOperativa(event: any): void {
    const unitOperatin = event.CODIGO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerUnidades,
          [
            new InputParameter('undepartamento', unitOperatin)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadUnidadOperativaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadUnidadOperativaCompleted(json: any): void {
    if (json['Table1']) {
      this.unidadOperativa = json['Table1'];
    }
  }

  // Contratista.
  loadContratista(event: any): void {
    const contratistaCod = event.OPERATING_UNIT_ID;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ContratistaxUniOperativa,
          [
            new InputParameter('uniOperativa', contratistaCod)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadContratistaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadContratistaCompleted(json: any): void {
    if (json['Table1']) {
      this.listarContratistas = json['Table1'];
    }
  }

  // Patrullero.
  loadPatrulleros(event: any): void {
    const codPatrullero = event.COD_CONTRATISTA;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarPatrulleroPorContratista,
          [
            new InputParameter('contratista', codPatrullero)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadPatrullerosCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadPatrullerosCompleted(json: any): void {
    if (json['Table1']) {
      this.consultPatrullero = json['Table1'];
    }
  }

  loadOrdenPadre(codPatrullero: any): void {
    this.codigoPatrol = codPatrullero.COD_PATRULLERO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarOrdenPadreXPatrullero,
          [
            new InputParameter('patrullero', this.codigoPatrol)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadOrdenPadreCompleted(JSON.parse(json[1]));
          this.loadDatosPatrullero(this.codigoPatrol);
        }
      });
  }

  loadOrdenPadreCompleted(json: any): void {
    if (json['Table1']) {
      this.listarOrdenPadre = json['Table1'];
    }
  }

  // Listar ordenes hijas por patrullero.
  loadOrdenesHijas(codOrdenPadre: any): void {
    this.datosAvance = null;
    this.datosAvanceTotal = null;
    this.clearGrid();
    this.clearGridHistPatrol();

    if (codOrdenPadre !== '') {
      const ordenPadre = codOrdenPadre.COD_ORDEN_PADRE;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ListarOrdenHijaXPatrullero,
            [
              new InputParameter('ordenPadre', ordenPadre),
              new InputParameter('patrullero', this.codigoPatrol)
            ]
          )
        )
        .subscribe(json => {
          if (json[2]) {
            this.limpiarManzanaPintada();
            this.loadOrdenHijaCompleted(json);
            this.loadAvanceTotalPatrol(ordenPadre);
            this.listarHistPatrullero(ordenPadre);
          }
        });
    }
  }

  loadOrdenHijaCompleted(jsonResult: any): void {
    if (jsonResult['2']) {
      const jsonTable = JSON.parse(jsonResult['2']);

      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
          this.loadGrid(results);
        });
      }
    }
  }

  private loadGrid(selectedGraphics: any): void {
    if (selectedGraphics && selectedGraphics.length > 0) {
      // Capturar los datos.
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

  // Cargar datos básicos del patrullero.
  loadDatosPatrullero(codigoPatrol: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarDatosPatrullero,
          [
            new InputParameter('patrullero', codigoPatrol)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadDatosPatrulleroCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadDatosPatrulleroCompleted(json: any): void {
    if (json['Table1']) {
      this.listarDatosPatrol = json['Table1'];
    }
  }

  // Avance total de patrullaje.
  loadAvanceTotalPatrol(codOrdenPadre: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.AvcTotalPatruXOrdPadre,
          [
            new InputParameter('ordenPadre', codOrdenPadre),
            new InputParameter('patrullero', this.codigoPatrol)
          ]
        )
      )
      .subscribe(json => {
        if (json[2]) {
          this.loadAvancePatrolCompleted(JSON.parse(json[2]));
        }
      });
  }

  loadAvancePatrolCompleted(json: any): void {
    if (json['Table1']) {
      this.datosAvanceTotal = json['Table1'];
    }
  }

  tableOnRowSelect(event: any): void {
    this.selectedElement = this.listElements[event.args.index];
    this.capturarOrden = this.selectedElement.attributes.COD_ORDEN_HIJA;

    this.loadAvanceOrdenHija();
  }

  // Cargar avance de la orden seleccionada.
  loadAvanceOrdenHija(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.DatosOrdenHija,
          [
            new InputParameter('ordenHija', this.capturarOrden)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadAvanceOrdenHijaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadAvanceOrdenHijaCompleted(json: any): void {
    if (json['Table1']) {
      this.datosAvance = json['Table1'];
    }
  }

  listarHistPatrullero(ordenPadre: any): void {
    if (this.codigoPatrol !== undefined && ordenPadre !== undefined) {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.histpatrullero,
            [
              new InputParameter('codPatrullero', this.codigoPatrol),
              new InputParameter('codOrdenPadre', ordenPadre)
            ]
          )
        )
        .subscribe(json => {
          if (json[2]) {
            this.clearGridHistPatrol();
            this.loadHistoricoPatrollero(json);
            this.acercarSector1(json);
          }
        });
    }
  }

  loadHistoricoPatrollero(jsonResult: any): void {
    if (jsonResult['2']) {
      const jsonTable = JSON.parse(jsonResult['2']);

      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
          this.loadGridHistPatrol(results);
        });
      }
    }
  }

  private loadGridHistPatrol(selectedGraphics: any): void {
    if (selectedGraphics && selectedGraphics.length > 0) {
      // Capturar los datos.
      this.listElements1 = selectedGraphics;
      this.clearGridHistPatrol();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumnsHistPatrol(selectedGraphics);
        this.prepareDataTableSource1(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumnsHistPatrol(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumnsHistPatrol.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSource1(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapterHistPatrol = new jqx.dataAdapter(source);
  }

  private clearGridHistPatrol(): void {
    if (this.dataAdapterHistPatrol != null) {
      this.dataAdapterHistPatrol = new jqx.dataAdapter({});
    }

    if (this.dataTableColumnsHistPatrol != null) {
      this.dataTableColumnsHistPatrol = new Array<any>();
    }
  }

  acercarSector1(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);

    const jsonExtent = [{ SHAPE: json[posResult[1]] }];

    const jsonDataPintarmanzanas = JSON.parse(json[posResult[1]]);
    const jsonDataRecorrido = JSON.parse(json[posResult[2]]);
    // const jsonDataPuntos = JSON.parse(json[posResult[3]]);
    const jsonDatalegalizada = JSON.parse(json[posResult[4]]);

    const jsonDataPuntos = JSON.parse(json[posResult[5]]);
    const jsonDataPuntos1 = JSON.parse(json[posResult[6]]);
    const jsonDataPuntos2 = JSON.parse(json[posResult[7]]);
    const jsonDataPuntos3 = JSON.parse(json[posResult[8]]);
    const jsonDataPuntos4 = JSON.parse(json[posResult[9]]);
    const jsonDataPuntos5 = JSON.parse(json[posResult[10]]);
    const jsonDataPuntos6 = JSON.parse(json[posResult[11]]);

    const validar = JSON.parse(json[posResult[12]]);

    if (validar === 1) {

      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtent,
        results => {
          if (this.validateGeometry(results[0].geometry)) {
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.ZoomToGeometry,
              geometry: results[0].geometry
            });
          }
        }
      );

      const responseValuesmanzana = Object.values(jsonDataPintarmanzanas);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuesmanzana[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgba(244,25,32,0.5)'
          });
        }
      );

      const responseValues = Object.values(jsonDataRecorrido);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results
          });
        }
      );

      const responseValueslegalizada = Object.values(jsonDatalegalizada);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValueslegalizada[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgba(82,255,51,0.5)'
          });
        }
      );

      const responseValuespuntos = Object.values(jsonDataPuntos);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(255,165,0)'
          });
        }
      );

      const responseValuespuntos1 = Object.values(jsonDataPuntos1);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos1[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(255,165,0)'
          });
        }
      );

      const responseValuespuntos2 = Object.values(jsonDataPuntos2);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos2[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(255,165,0)'
          });
        }
      );

      const responseValuespuntos3 = Object.values(jsonDataPuntos3);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos3[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(249,10,245)'
          });
        }
      );

      const responseValuespuntos4 = Object.values(jsonDataPuntos4);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos4[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(245,54,11)'
          });
        }
      );

      const responseValuespuntos5 = Object.values(jsonDataPuntos5);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos5[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(27,168,249)'
          });
        }
      );

      const responseValuespuntos6 = Object.values(jsonDataPuntos6);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos6[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(234,249,10)'
          });
        }
      );

    } else {
      const poslegaizada = Object.getOwnPropertyNames(json);

      const jsonExtentLeg = [{ SHAPE: json[posResult[4]] }];

      const jsonDataPintarmanzanasLeg = JSON.parse(json[posResult[1]]);
      const jsonDataRecorridoLeg = JSON.parse(json[poslegaizada[2]]);
      const jsonDatalegalizadaLeg = JSON.parse(json[poslegaizada[4]]);

      // const jsonDataPuntos = JSON.parse(json[posResult[3]]);
      const jsonDataPuntosLeg = JSON.parse(json[poslegaizada[5]]);
      const jsonDataPuntosLeg1 = JSON.parse(json[poslegaizada[6]]);
      const jsonDataPuntosLeg2 = JSON.parse(json[poslegaizada[7]]);
      const jsonDataPuntosLeg3 = JSON.parse(json[poslegaizada[8]]);
      const jsonDataPuntosLeg4 = JSON.parse(json[poslegaizada[9]]);
      const jsonDataPuntosLeg5 = JSON.parse(json[poslegaizada[10]]);
      const jsonDataPuntosLeg6 = JSON.parse(json[poslegaizada[11]]);

      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtentLeg,
        results => {
          if (this.validateGeometry(results[0].geometry)) {
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.ZoomToGeometry,
              geometry: results[0].geometry
            });
          }
        }
      );

      const responseValuesmanzana = Object.values(jsonDataPintarmanzanasLeg);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuesmanzana[0],
        results => {
          console.log(results);

          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgba(244,25,32,0.5)'
          });
        }
      );

      const responseValues = Object.values(jsonDataRecorridoLeg);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results
          });
        }
      );

      const responseValueslegalizada = Object.values(jsonDatalegalizadaLeg);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValueslegalizada[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgba(82,255,51,0.5)'
          });
        }
      );

      const responseValuespuntos = Object.values(jsonDataPuntosLeg);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(255,165,0)'
          });
        }
      );

      const responseValuespuntos1 = Object.values(jsonDataPuntosLeg1);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos1[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(255,165,0)'
          });
        }
      );

      const responseValuespuntos2 = Object.values(jsonDataPuntosLeg2);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos2[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(255,165,0)'
          });
        }
      );

      const responseValuespuntos3 = Object.values(jsonDataPuntosLeg3);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos3[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(249,10,245)'
          });
        }
      );

      const responseValuespuntos4 = Object.values(jsonDataPuntosLeg4);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos4[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(245,54,11)'
          });
        }
      );

      const responseValuespuntos5 = Object.values(jsonDataPuntosLeg5);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos5[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(27,168,249)'
          });
        }
      );

      const responseValuespuntos6 = Object.values(jsonDataPuntosLeg6);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValuespuntos6[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgb(234,249,10)'
          });
        }
      );

    }
  }

  // Pintar historico de patrullero.
  mostrarManzanasPatrulleros(): void {
    if (this.codigoPatrol !== undefined && this.capturarOrden !== undefined) {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.PatrulleroManzana,
            [
              new InputParameter('codPatrullero', this.codigoPatrol),
              new InputParameter('orden_hijaP', this.capturarOrden)
            ]
          )
        )
        .subscribe(json => {
          // this.limpiarManzanaPintada();

          if (json[2]) {
            this.acercarManzanasPatrol(json);
          }
        });
    } else {
      alert('Debe seleccionar un patrullero y una orden hija.');
    }
  }

  acercarManzanasPatrol(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);

    const jsonExtent = [{ SHAPE: json[posResult[0]] }];

    const jsonData = JSON.parse(json[posResult[0]]);
    const jsonDataManSi = JSON.parse(json[posResult[2]]);
    const jsonDataSig = JSON.parse(json[posResult[3]]);
    const jsonDataAsi = JSON.parse(json[posResult[4]]);

    if (jsonDataAsi === 1) {

      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtent,
        results => {
          if (this.validateGeometry(results[0].geometry)) {
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.ZoomToGeometry,
              geometry: results[0].geometry
            });
          }
        }
      );

      // const responseValues0 = Object.values(jsonData);
      // ResultToGraphicCollection.convert(
      //   <Array<any>>responseValues0[0],
      //   results => {
      //     if (this.validateGeometry(results)) {
      //       this.mapService.executeMapAction(<AddGeometry>{
      //         EMapAction: EmapActions.AddGeometry,
      //         geometries: results,
      //         color: 'rgba(244,25,32,0.5)'
      //       });
      //     }
      //   }
      // );

      // const responseValues = Object.values(jsonDataManSi);
      // ResultToGraphicCollection.convert(
      //   <Array<any>>responseValues[0],
      //   results => {
      //     if (this.validateGeometry(results)) {
      //       this.mapService.executeMapAction(<AddGeometry>{
      //         EMapAction: EmapActions.AddGeometry,
      //         geometries: results
      //       });
      //     }
      //   }
      // );

      // const responseValues1 = Object.values(jsonDataSig);
      // ResultToGraphicCollection.convert(
      //   <Array<any>>responseValues1[0],
      //   results => {
      //     if (this.validateGeometry(results)) {
      //       this.mapService.executeMapAction(<AddGeometry>{
      //         EMapAction: EmapActions.AddGeometry,
      //         geometries: results,
      //         color: 'rgb(205,19,231)'
      //       });
      //     }
      //   }
      // );

    } else {

      const posResultLegalizada = Object.getOwnPropertyNames(json);

      const jsonExtentLega = [{ SHAPE: json[posResultLegalizada[1]] }];

      const jsonDataLega = JSON.parse(json[posResultLegalizada[1]]);
      const jsonDataLegaM = JSON.parse(json[posResultLegalizada[2]]);
      const jsonDataLegaMan = JSON.parse(json[posResultLegalizada[3]]);

      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtentLega,
        results => {
          if (this.validateGeometry(results[0].geometry)) {
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.ZoomToGeometry,
              geometry: results[0].geometry
            });
          }
        }
      );

      // const responseValues = Object.values(jsonDataLega);
      // ResultToGraphicCollection.convert(
      //   <Array<any>>responseValues[0],
      //   results => {
      //     if (this.validateGeometry(results)) {
      //       this.mapService.executeMapAction(<AddGeometry>{
      //         EMapAction: EmapActions.AddGeometry,
      //         geometries: results,
      //         color: 'rgba(82,255,51,0.5)'
      //       });
      //     }
      //   }
      // );

      // const responseValuesMa = Object.values(jsonDataLegaM);
      // ResultToGraphicCollection.convert(
      //   <Array<any>>responseValuesMa[0],
      //   results => {
      //     if (this.validateGeometry(results)) {
      //       this.mapService.executeMapAction(<AddGeometry>{
      //         EMapAction: EmapActions.AddGeometry,
      //         geometries: results
      //       });
      //     }
      //   }
      // );

      // const responseValuesOr = Object.values(jsonDataLegaMan);
      // ResultToGraphicCollection.convert(
      //   <Array<any>>responseValuesOr[0],
      //   results => {
      //     if (this.validateGeometry(results)) {
      //       this.mapService.executeMapAction(<AddGeometry>{
      //         EMapAction: EmapActions.AddGeometry,
      //         geometries: results,
      //         color: 'rgb(205,19,231)'
      //       });
      //     }
      //   }
      // );

    }
  }

  tableOnRowSelectHistorico(event: any): void {
    this.selectedElementHistorico = this.listElements1[event.args.boundIndex];
    this.capturarHistorico = this.selectedElementHistorico.attributes.COD_HISTORICO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.PintarHistorico,
          [
            new InputParameter('codigo', this.capturarHistorico)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.acercarHistorico(json);
        }
      });
  }

  acercarHistorico(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);
    const jsonExtent = [{ SHAPE: json[posResult[0]] }];
    // ZoomToGeometry: Este me permite acercar al punto que quiero.
    // FlashToGeometry: Este me permite resaltar el punto que quiero.

    ResultToGraphicCollection.convert(
      <Array<any>>jsonExtent,
      results => {
        if (this.validateGeometry(results[0].geometry)) {
          this.mapService.executeMapAction(<FlashToGeometry>{
            EMapAction: EmapActions.FlashToGeometry,
            geometry: results[0].geometry
          });
        }
      }
    );
  }

  private validateGeometry(geometry: any): boolean {
    if (geometry === null) {
      alert('Esta manzana no tiene geometría.');
      return false;
    }

    return true;
  }

  private limpiarManzanaPintada(): void {
    this.mapService.executeMapAction({
      EMapAction: EmapActions.ClearGraphic
    });
  }

  start(): void {
    this.departamentoSelect = null;
    this.modelUnidad = null;
    this.contratista = null;
    this.patrulleroSeleccionado = null;
    this.unidadOperativa = null;
    this.listarContratistas = null;
    this.consultPatrullero = null;
    this.clearGrid();
    this.clearGridHistPatrol();
    this.listarDatosPatrol = null;
    this.datosAvanceTotal = null;
    this.datosAvance = null;
    this.ordenPadreSeleccionada = null;
    this.listarOrdenPadre = null;
    this.limpiarManzanaPintada();
  }
}
