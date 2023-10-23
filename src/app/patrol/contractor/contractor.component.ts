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
  selector: 'app-contractor',
  templateUrl: './contractor.component.html',
  styleUrls: ['./contractor.component.css']
})
export class ContractorComponent implements OnInit {
  listarDepartamentos: any;
  listarUnidadesOperativas: any;
  listarContratistas: any;
  departamentoSeleccionado: any;
  unidadOperativaSeleccionada: any;
  contratistaSeleccionado: any;
  dataTableColumns: Array<any>;
  dataAdapter: any;
  datosContratista: any;
  avanceContratista: any;
  listElements: any;
  selectedElement: any;
  avanceOrden: any;

  constructor(private apiService: ApiService, private mapService: MapService) {
    this.dataTableColumns = new Array<any>();
    this.dataAdapter = new jqx.dataAdapter({});
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
      this.listarUnidadesOperativas = json['Table1'];
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

  loadOrdenPadre(event: any): void {
    const codContratista = event.COD_CONTRATISTA;

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
          this.avanceOrden = null;
          this.clearGrid();
          this.loadDatosContratista(codContratista);
          this.loadAvanceContratista(codContratista);
          this.loadOrdenPadreCompleted(json);
        }
      });
  }

  loadDatosContratista(codigoContratista: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.DatosContratista,
          [
            new InputParameter('contratista', codigoContratista)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadDatosContratistaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadDatosContratistaCompleted(json: any): void {
    if (json['Table1']) {
      this.datosContratista = json['Table1'];
    }
  }

  loadAvanceContratista(codigoContratista: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.AvanceContratista,
          [
            new InputParameter('contratista', codigoContratista)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadAvanceContratistaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadAvanceContratistaCompleted(json: any): void {
    if (json['Table1']) {
      this.avanceContratista = json['Table1'];
    }
  }

  loadOrdenPadreCompleted(jsonResult: any): void {
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

    const codigoOrdenPadre = this.selectedElement.attributes.COD_ORDEN_PADRE;

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
          this.limpiarManzanas();
          this.loadAvanceOrdenCompleted(JSON.parse(json[1]));
          this.loadAcercarOrdenPadre(codigoOrdenPadre);
        }
      });
  }

  loadAvanceOrdenCompleted(json: any): void {
    if (json['Table1']) {
      this.avanceOrden = json['Table1'];
    }
  }

  loadAcercarOrdenPadre(codOrdenPadre: any): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ManzanaPorOrdenPadre,
          [
            new InputParameter('codOrden', codOrdenPadre)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadAcercarOrdenPadreCompleted(json);
        }
      });
  }

  loadAcercarOrdenPadreCompleted(json: any): void {
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

    }
  }

  limpiarManzanas(): void {
    this.mapService.executeMapAction({
      EMapAction: EmapActions.ClearGraphic
    });
  }

  start(): void {
    this.departamentoSeleccionado = null;
    this.unidadOperativaSeleccionada = null;
    this.contratistaSeleccionado = null;
    this.listarUnidadesOperativas = null;
    this.listarContratistas = null;
    this.datosContratista = null;
    this.avanceContratista = null;
    this.avanceOrden = null;
    this.clearGrid();
    this.limpiarManzanas();
  }
}
