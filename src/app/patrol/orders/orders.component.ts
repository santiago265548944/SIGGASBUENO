import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { FlashToGeometry, AddGeometry } from '../../map-service/map-action';
import { EmapActions } from '../../map-service/emap-actions.enum';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  listarDepartamentos: any;
  listarUnidadOperativa: any;
  listarContratistas: any;
  departamentoSeleccionado: any;
  unidadOperativaSeleccionada: any;
  contratistaSeleccionado: any;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  dataAdapterOrdenesHija: any;
  dataTableColumnsOrdenesHija: Array<any>;
  dataAdapterOrdenesCorrectivas: any;
  dataTableColumnsOrdenesCorrectivas: Array<any>;
  listElements: any;
  listElementsOrdenesHija: any;
  listElementsOrdenesCorrectivas: any;
  selectedElement: any;
  datosOrdenPadre: any;
  datosOrdenHija: any;
  datosOrdenCorrectiva: any;
  codigoOrdenPadre: any;
  codigoOrdenHija: any;
  codOrdenPadreBuscar: any;
  codOrdenHijaAcercar: any;
  imagenes = [];

  constructor(private apiService: ApiService, private mapService: MapService) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.dataAdapterOrdenesHija = new jqx.dataAdapter({});
    this.dataTableColumnsOrdenesHija = new Array<any>();
    this.dataAdapterOrdenesCorrectivas = new jqx.dataAdapter({});
    this.dataTableColumnsOrdenesCorrectivas = new Array<any>();
  }

  ngOnInit() {
    this.loadDepartamento();
  }

  loadDepartamento(): void {
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
      this.listarDepartamentos = json['Table1'];
    }
  }

  loadUnidadOperativa(event: any): void {
    const codDepartamento = event.CODIGO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerUnidades,
          [
            new InputParameter('undepartamento', codDepartamento)
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
      this.listarUnidadOperativa = json['Table1'];
    }
  }

  loadContratista(event: any): void {
    const codUnidadOperativa = event.OPERATING_UNIT_ID;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ContratistaxUniOperativa,
          [
            new InputParameter('uniOperativa', codUnidadOperativa)
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

  btnMostrarOrdenes(): void {
    if (
      this.departamentoSeleccionado !== undefined && this.departamentoSeleccionado !== '' &&
      this.unidadOperativaSeleccionada !== undefined && this.unidadOperativaSeleccionada !== '' &&
      this.contratistaSeleccionado !== undefined && this.contratistaSeleccionado !== ''
    ) {

      const codContratista = this.contratistaSeleccionado.COD_CONTRATISTA;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.OrdenesPadrePorContratista,
            [
              new InputParameter('contratista', codContratista)
            ]
          )
        )
        .subscribe(json => {
          if (json[1]) {
            this.datosOrdenPadre = null;
            this.datosOrdenHija = null;
            this.codigoOrdenPadre = '';
            this.codigoOrdenHija = '';
            this.codOrdenPadreBuscar = undefined;
            this.datosOrdenCorrectiva = null;
            this.imagenes = [];
            this.clearGrid();
            this.clearGridOrdenesHija();
            this.clearGridOrdenesCorrectivas();
            this.loadMostrarOrdenesCompleted(json);
          }
        });

    } else {
      alert('Debe seleccionar todos los campos.');
    }
  }

  loadMostrarOrdenesCompleted(jsonResult: any): void {
    if (jsonResult['1']) {
      const jsonTable = JSON.parse(jsonResult['1']);

      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
          this.loadGrid(results);
        });
      }
    }
  }

  private loadGrid(selectedGraphics: any) {
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

  tableOnRowSelect(event: any): void {
    this.selectedElement = this.listElements[event.args.index];

    const codOrdenPadre = this.selectedElement.attributes.COD_ORDEN_PADRE;

    this.codigoOrdenPadre = codOrdenPadre;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.OrdenesHijaOrdenPadre,
          [
            new InputParameter('ordenPadre', codOrdenPadre)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.datosOrdenHija = null;
          this.codigoOrdenHija = '';
          this.codOrdenPadreBuscar = undefined;
          this.datosOrdenCorrectiva = null;
          this.imagenes = [];
          this.clearGridOrdenesHija();
          this.clearGridOrdenesCorrectivas();
          this.loadDatosOrdenPadre(codOrdenPadre);
          this.loadMostrarOrdenesHijaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadDatosOrdenPadre(codigoOrdenPadre: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.DatosOrdenPadre,
          [
            new InputParameter('ordenPadre', codigoOrdenPadre)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadDatosOrdenPadreCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadDatosOrdenPadreCompleted(json: any): void {
    if (json['Table1']) {
      this.datosOrdenPadre = json['Table1'];
    }
  }

  loadMostrarOrdenesHijaCompleted(jsonResult: any): void {
    if (jsonResult['Table1'] && jsonResult['Table1'].length > 0) {
      ResultToGraphicCollection.convert(jsonResult['Table1'], results => {
        this.loadGridOrdenesHija(results);
      });
    }
  }

  private loadGridOrdenesHija(selectedGraphics: any) {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.listElementsOrdenesHija = selectedGraphics;
      this.clearGridOrdenesHija();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumnsOrdenesHija(selectedGraphics);
        this.prepareDataTableSourceOrdenesHija(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumnsOrdenesHija(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumnsOrdenesHija.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSourceOrdenesHija(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapterOrdenesHija = new jqx.dataAdapter(source);
  }

  private clearGridOrdenesHija(): void {
    if (this.dataAdapterOrdenesHija != null) {
      this.dataAdapterOrdenesHija = new jqx.dataAdapter({});
    }

    if (this.dataTableColumnsOrdenesHija != null) {
      this.dataTableColumnsOrdenesHija = new Array<any>();
    }
  }

  tableOnRowSelectOrdenesHija(event: any): void {
    this.selectedElement = this.listElementsOrdenesHija[event.args.index];

    const codOrdenHija = this.selectedElement.attributes.COD_ORDEN_HIJA;

    this.codigoOrdenHija = codOrdenHija;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.DatosOrdenHija,
          [
            new InputParameter('ordenHija', codOrdenHija)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.datosOrdenCorrectiva = null;
          this.imagenes = [];
          this.codOrdenHijaAcercar = undefined;
          this.loadOrdenesHijaCompleted(JSON.parse(json[1]));
          this.loadOrdenesCorrectivas(codOrdenHija);
        }
      });
  }

  loadOrdenesHijaCompleted(json: any): void {
    if (json['Table1']) {
      this.datosOrdenHija = json['Table1'];
    }
  }

  loadOrdenesCorrectivas(codOrdenHija: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.OrdenCorrectivaXOrdenHija,
          [
            new InputParameter('ordenHija', codOrdenHija)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.clearGridOrdenesCorrectivas();
          this.loadOrdenesCorrectivasCompleted(json);
        }
      });
  }

  loadOrdenesCorrectivasCompleted(jsonResult: any): void {
    if (jsonResult['1']) {
      const jsonTable = JSON.parse(jsonResult['1']);

      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
          this.loadGridOrdenesCorrectivas(results);
        });
      }
    }
  }

  private loadGridOrdenesCorrectivas(selectedGraphics: any) {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.listElementsOrdenesCorrectivas = selectedGraphics;
      this.clearGridOrdenesCorrectivas();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumnsOrdenesCorrectivas(selectedGraphics);
        this.prepareDataTableSourceOrdenesCorrectivas(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumnsOrdenesCorrectivas(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumnsOrdenesCorrectivas.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSourceOrdenesCorrectivas(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapterOrdenesCorrectivas = new jqx.dataAdapter(source);
  }

  private clearGridOrdenesCorrectivas(): void {
    if (this.dataAdapterOrdenesCorrectivas != null) {
      this.dataAdapterOrdenesCorrectivas = new jqx.dataAdapter({});
    }

    if (this.dataTableColumnsOrdenesCorrectivas != null) {
      this.dataTableColumnsOrdenesCorrectivas = new Array<any>();
    }
  }

  tableOnRowSelectOrdenesCorrectivas(event: any): void {
    this.selectedElement = this.listElementsOrdenesCorrectivas[event.args.index];

    const codOrdenCorrectiva = this.selectedElement.attributes.COD_ORDEN_CORR;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.DatosOrdenCorrectiva,
          [
            new InputParameter('ordenCorrectiva', codOrdenCorrectiva)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.datosOrdenCorrectiva = null;
          this.imagenes = [];
          this.acercarOrdenCorrectiva(json);
          this.loadDatosOrdenCorrectivoCompleted(JSON.parse(json[1]));
          this.mostrarListaImagenes(JSON.parse(json[1]));
        }
      });
  }

  acercarOrdenCorrectiva(json: any): void {
    const jsonExtent = [{ SHAPE: json[2] }];
    // const jsonData = JSON.parse(json[2]);

    if (jsonExtent.length > 0) {

      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtent,
        results => {
          this.mapService.executeMapAction(<FlashToGeometry>{
            EMapAction: EmapActions.ZoomToGeometry,
            geometry: results[0].geometry
          });
        }
      );

      // const responseValues = Object.values(jsonData);
      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtent,
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results
          });
        }
      );

    }
  }

  loadDatosOrdenCorrectivoCompleted(json: any): void {
    if (json['Table1']) {
      this.datosOrdenCorrectiva = json['Table1'];
    }
  }

  mostrarListaImagenes(json: any): void {
    const nombreImgs = json['Table1'][0].NOM_IMGS;

    this.imagenes = nombreImgs.split(';');
  }

  btnBuscarOrdenPadre(): void {
    if (this.codOrdenPadreBuscar !== undefined && this.codOrdenPadreBuscar !== '') {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.DatosOrdenPadre,
            [
              new InputParameter('ordenPadre', this.codOrdenPadreBuscar)
            ]
          )
        )
        .subscribe(json => {
          if (json[1]) {
            this.departamentoSeleccionado = undefined;
            this.unidadOperativaSeleccionada = undefined;
            this.contratistaSeleccionado = undefined;
            this.listarUnidadOperativa = null;
            this.listarContratistas = null;
            this.clearGrid();
            this.loadBuscarOrdenPadreCompleted(JSON.parse(json[1]));
          }
        });
    } else {
      alert('Debe ingresar una orden padre.');
    }
  }

  loadBuscarOrdenPadreCompleted(json: any): void {
    if (json['Table1'].length !== 0) {
      this.datosOrdenPadre = json['Table1'];

      const codOrdenPadre = json['Table1'][0].COD_ORDEN_PADRE;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.OrdenesHijaOrdenPadre,
            [
              new InputParameter('ordenPadre', codOrdenPadre)
            ]
          )
        )
        .subscribe(json1 => {
          if (json1[1]) {
            this.clearGridOrdenesHija();
            this.loadMostrarOrdenesHijaCompleted(JSON.parse(json1[1]));
          }
        });
    } else {
      this.datosOrdenPadre = null;
      this.clearGridOrdenesHija();
      alert('No hay ninguna orden padre con este código.');
    }
  }

  btnAcercarOrdenPadre(): void {
    if (this.codOrdenPadreBuscar !== undefined && this.codOrdenPadreBuscar !== '') {

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ManzanaPorOrdenPadre,
            [
              new InputParameter('codOrden', this.codOrdenPadreBuscar)
            ]
          )
        )
        .subscribe(json => {
          if (json[1]) {
            this.limpiarManzanas();
            this.acercarOrdenPadre(json);
          }
        });

    } else if (this.codigoOrdenPadre !== '') {

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ManzanaPorOrdenPadre,
            [
              new InputParameter('codOrden', this.codigoOrdenPadre)
            ]
          )
        )
        .subscribe(json => {
          if (json[1]) {
            this.limpiarManzanas();
            this.acercarOrdenPadre(json);
          }
        });

    } else {
      alert('Debe digitar una orden padre o seleccionar una orden padre de la tabla.');
    }
  }

  acercarOrdenPadre(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);

    const jsonExtent = [{ SHAPE: json[posResult[0]] }];

    const jsonData = JSON.parse(json[posResult[0]]);
    const jsonDataManSi = JSON.parse(json[posResult[1]]);
    const jsonDataSig = JSON.parse(json[posResult[2]]);

    const jsonDataPuntos = JSON.parse(json[posResult[3]]);
    const jsonDataPuntos1 = JSON.parse(json[posResult[4]]);
    const jsonDataPuntos2 = JSON.parse(json[posResult[5]]);
    const jsonDataPuntos3 = JSON.parse(json[posResult[6]]);
    const jsonDataPuntos4 = JSON.parse(json[posResult[7]]);
    const jsonDataPuntos5 = JSON.parse(json[posResult[8]]);
    const jsonDataPuntos6 = JSON.parse(json[posResult[9]]);
    // const jsonDataPuntos7 = JSON.parse(json[posResult[10]]);

    // const jsonDataAsi = JSON.parse(json[posResult[10]]);
    const jsonDataLegalizada = JSON.parse(json[posResult[10]]);

    if (jsonData['Table1'].length !== 0) {

      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtent,
        results => {
          this.mapService.executeMapAction(<FlashToGeometry>{
            EMapAction: EmapActions.ZoomToGeometry,
            geometry: results[0].geometry
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
            color: 'rgba(255,255,0,0.5)'
          });
        }
      );

      const responseValues0 = Object.values(jsonDataManSi);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues0[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgba(244,25,32,0.5)'
          });
        }
      );

      const responseValues1 = Object.values(jsonDataSig);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues1[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results
          });
        }
      );

      // const responseValues2 = Object.values(jsonDataAsi);
      // ResultToGraphicCollection.convert(
      //   <Array<any>>responseValues2[0],
      //   results => {
      //     this.mapService.executeMapAction(<AddGeometry>{
      //       EMapAction: EmapActions.AddGeometry,
      //       geometries: results
      //     });
      //   }
      // );

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

      const responseValues3 = Object.values(jsonDataLegalizada);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues3[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgba(18,155,45,0.65)'
          });
        }
      );

    } else {
      alert('No hay ninguna orden padre con este código.');
    }
  }

  btnAcercarOrdenHija(): void {
    if (this.codOrdenHijaAcercar !== undefined && this.codOrdenHijaAcercar !== '') {

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ManzanasPorOrdenHija,
            [
              new InputParameter('orden_hijaP', this.codOrdenHijaAcercar)
            ]
          )
        )
        .subscribe(json => {
          if (json[1]) {
            this.acercarOrdenHija(json);
          }
        });

    } else if (this.codigoOrdenHija !== '') {

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ManzanasPorOrdenHija,
            [
              new InputParameter('orden_hijaP', this.codigoOrdenHija)
            ]
          )
        )
        .subscribe(json => {
          if (json[1]) {
            this.acercarOrdenHija(json);
          }
        });

    } else {
      alert('Debe digitar una orden hija o seleccionar una orden hija de la tabla.');
    }
  }

  acercarOrdenHija(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);

    const jsonExtent = [{ SHAPE: json[posResult[0]] }];

    const jsonData = JSON.parse(json[posResult[0]]);
    const jsonDataManSi = JSON.parse(json[posResult[1]]);
    const jsonDataSig = JSON.parse(json[posResult[2]]);
    const jsonDataAsi = JSON.parse(json[posResult[3]]);

    if (jsonData['Table1'].length !== 0) {

      ResultToGraphicCollection.convert(
        <Array<any>>jsonExtent,
        results => {
          this.mapService.executeMapAction(<FlashToGeometry>{
            EMapAction: EmapActions.ZoomToGeometry,
            geometry: results[0].geometry
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
            color: 'rgba(0,0,255,0.5)'
          });
        }
      );

      const responseValues0 = Object.values(jsonDataManSi);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues0[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results,
            color: 'rgba(244,25,32,0.5)'
          });
        }
      );

      const responseValues1 = Object.values(jsonDataSig);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues1[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results
          });
        }
      );

      const responseValues2 = Object.values(jsonDataAsi);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues2[0],
        results => {
          this.mapService.executeMapAction(<AddGeometry>{
            EMapAction: EmapActions.AddGeometry,
            geometries: results
          });
        }
      );

    } else {
      alert('No se pudo acercar la orden hija.');
    }
  }

  limpiarManzanas(): void {
    this.mapService.executeMapAction({
      EMapAction: EmapActions.ClearGraphic
    });
  }

  start(): void {
    this.departamentoSeleccionado = undefined;
    this.unidadOperativaSeleccionada = undefined;
    this.contratistaSeleccionado = undefined;
    this.listarUnidadOperativa = null;
    this.listarContratistas = null;
    this.clearGrid();
    this.clearGridOrdenesHija();
    this.clearGridOrdenesCorrectivas();
    this.datosOrdenPadre = null;
    this.datosOrdenHija = null;
    this.codigoOrdenPadre = '';
    this.codigoOrdenHija = '';
    this.codOrdenPadreBuscar = undefined;
    this.codOrdenHijaAcercar = undefined;
    this.datosOrdenCorrectiva = null;
    this.imagenes = [];
  }
}
