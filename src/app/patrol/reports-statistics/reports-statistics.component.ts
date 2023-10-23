import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from './../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';

@Component({
  selector: 'app-reports-statistics',
  templateUrl: './reports-statistics.component.html',
  styleUrls: ['./reports-statistics.component.css']
})
export class ReportsStatisticsComponent implements OnInit {

  @ViewChild('dataTable') jqxDataTableResults: jqxDataTableComponent;
  fechaInicial: any = null;
  fechaFinal: any = null;
  listarDepartamentos: any = null;
  departamentoSeleccionado: any = null;
  listarUnidadesOperativas: any = null;
  unidadOperativaSeleccionada: any = null;
  listarContratistas: any = null;
  contratistaSeleccionado: any = null;
  listarOrdenesPadre: any = null;
  ordenPadreSeleccionada: any = null;
  listarPatrulleros: any = null;
  patrulleroSeleccionado: any = null;
  resumenPromedio: any = null;
  dataAdapterGeneralTable: any;
  dataTableColumnsGeneralTable: Array<any>;
  dataAdapterSpecificTable: any;
  dataTableColumnsSpecificTable: Array<any>;
  m = new Date();
  fechaActual = `${this.m.getUTCFullYear()}-${('0' + (this.m.getUTCMonth() + 1)).slice(-2)}-${('0' + this.m.getUTCDate()).slice(-2)}`;

  constructor(private apiService: ApiService) {
    this.dataAdapterGeneralTable = new jqx.dataAdapter({});
    this.dataTableColumnsGeneralTable = new Array<any>();
    this.dataAdapterSpecificTable = new jqx.dataAdapter({});
    this.dataTableColumnsSpecificTable = new Array<any>();
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
    if (event !== '') {
      const codContratista = event.COD_CONTRATISTA;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ListarOrdesPadrexContra,
            [
              new InputParameter('codContratista', codContratista),
              new InputParameter('fechaI', this.fechaInicial),
              new InputParameter('fechaF', this.fechaFinal)
            ]
          )
        )
        .subscribe(json => {
          if (json[3]) {
            this.loadOrdenPadreCompleted(JSON.parse(json[3]));
          }
        });
    }
  }

  loadOrdenPadreCompleted(json: any): void {
    if (json['Table1'].length > 0) {
      this.listarOrdenesPadre = json['Table1'];
    } else {
      this.listarOrdenesPadre = null;
      this.listarPatrulleros = null;
      alert('No hay ordenes padre.');
    }
  }

  loadPatrullero(event: any): void {
    const codOrdenPadre = event.COD_ORDEN_PADRE;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarPatruXOrdenPadre,
          [
            new InputParameter('ordenPadre', codOrdenPadre)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadPatrulleroCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadPatrulleroCompleted(json: any): void {
    if (json['Table1']) {
      this.listarPatrulleros = json['Table1'];
    }
  }

  btnReporteContratista(): void {
    if (
      this.contratistaSeleccionado !== null && this.contratistaSeleccionado !== '' &&
      this.fechaInicial !== null && this.fechaInicial !== '' &&
      this.fechaFinal !== null && this.fechaFinal !== ''
    ) {
      this.reporteContratistaGeneral();
      this.reporteContratistaEspecifico();
      this.resumenPromedioContratista();
    } else {
      this.clearGridGeneralTable();
      this.clearGridSpecificTable();
      this.resumenPromedio = null;
      alert('Debe seleccionar una fecha inicial, una fecha final y un contratista.');
    }
  }

  reporteContratistaGeneral(): void {
    const codContratista = this.contratistaSeleccionado.COD_CONTRATISTA;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ReporteOrdPadrePorContratista,
          [
            new InputParameter('codContratista', codContratista),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.clearGridGeneralTable();

        if (json[3]) {
          this.loadGeneralTableCompleted(JSON.parse(json[3]));
        }
      });
  }

  reporteContratistaEspecifico(): void {
    const codContratista = this.contratistaSeleccionado.COD_CONTRATISTA;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ReporteOrdHijaPorContratista,
          [
            new InputParameter('codContratista', codContratista),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.clearGridSpecificTable();

        if (json[3]) {
          this.loadSpecificTableCompleted(JSON.parse(json[3]));
        }
      });
  }

  resumenPromedioContratista(): void {
    const codContratista = this.contratistaSeleccionado.COD_CONTRATISTA;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ResumenContratista,
          [
            new InputParameter('codContratista', codContratista),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.resumenPromedio = null;

        if (json[3]) {
          this.resumenPromedioContratistaCompleted(JSON.parse(json[3]));
        }
      });
  }

  resumenPromedioContratistaCompleted(json: any): void {
    if (json['Table1']) {
      this.resumenPromedio = json['Table1'];
    }
  }

  btnReporteOrdenPadre(): void {
    if (
      this.ordenPadreSeleccionada !== null && this.ordenPadreSeleccionada !== '' &&
      this.fechaInicial !== null && this.fechaInicial !== '' &&
      this.fechaFinal !== null && this.fechaFinal !== ''
    ) {
      this.reporteOrdenPadreGeneral();
      this.reporteOrdenPadreEspecifico();
      this.resumenPromedioOrdenPadre();
    } else {
      this.clearGridGeneralTable();
      this.clearGridSpecificTable();
      this.resumenPromedio = null;
      alert('Debe seleccionar una fecha inicial, una fecha final y una orden padre.');
    }
  }

  reporteOrdenPadreGeneral(): void {
    const codOrdenPadre = this.ordenPadreSeleccionada.COD_ORDEN_PADRE;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ReporteOrdPadrePorCOrdPadre,
          [
            new InputParameter('codOrdenPadre', codOrdenPadre),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.clearGridGeneralTable();

        if (json[3]) {
          this.loadGeneralTableCompleted(JSON.parse(json[3]));
        }
      });
  }

  reporteOrdenPadreEspecifico(): void {
    const codOrdenPadre = this.ordenPadreSeleccionada.COD_ORDEN_PADRE;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ReporteOrdHijaPorPadre,
          [
            new InputParameter('codOrdPadre', codOrdenPadre),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.clearGridSpecificTable();

        if (json[3]) {
          this.loadSpecificTableCompleted(JSON.parse(json[3]));
        }
      });
  }

  resumenPromedioOrdenPadre(): void {
    const codOrdenPadre = this.ordenPadreSeleccionada.COD_ORDEN_PADRE;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ResumenPorOrdPadre,
          [
            new InputParameter('codOrdPadre', codOrdenPadre),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.resumenPromedio = null;

        if (json[3]) {
          this.resumenPromedioOrdenPadreCompleted(JSON.parse(json[3]));
        }
      });
  }

  resumenPromedioOrdenPadreCompleted(json: any): void {
    if (json['Table1']) {
      this.resumenPromedio = json['Table1'];
    }
  }

  btnReportePatrullero(): void {
    if (
      this.patrulleroSeleccionado !== null && this.patrulleroSeleccionado !== '' &&
      this.fechaInicial !== null && this.fechaInicial !== '' &&
      this.fechaFinal !== null && this.fechaFinal !== ''
    ) {
      this.reportePatrulleroGeneral();
      this.reportePatrulleroEspecifico();
      this.resumenPromedioPatrullero();
    } else {
      this.clearGridGeneralTable();
      this.clearGridSpecificTable();
      this.resumenPromedio = null;
      alert('Debe seleccionar una fecha inicial, una fecha final y un patrullero.');
    }
  }

  reportePatrulleroGeneral(): void {
    const codPatrullero = this.patrulleroSeleccionado.COD_PATRULLERO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ReportePatrullero,
          [
            new InputParameter('fechainicial', this.fechaInicial),
            new InputParameter('fechaidfinal', this.fechaFinal),
            new InputParameter('patrulleropadre', codPatrullero)
          ]
        )
      )
      .subscribe(json => {
        this.clearGridGeneralTable();

        if (json[3]) {
          this.loadGeneralTableCompleted(JSON.parse(json[3]));
        }
      });
  }

  reportePatrulleroEspecifico(): void {
    const codPatrullero = this.patrulleroSeleccionado.COD_PATRULLERO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ReporteOrdHijaPatrullero,
          [
            new InputParameter('codPatrullero', codPatrullero),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.clearGridSpecificTable();

        if (json[3]) {
          this.loadSpecificTableCompleted(JSON.parse(json[3]));
        }
      });
  }

  resumenPromedioPatrullero(): void {
    const codPatrullero = this.patrulleroSeleccionado.COD_PATRULLERO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ResumenPatrullero,
          [
            new InputParameter('codPatrullero', codPatrullero),
            new InputParameter('fechaI', this.fechaInicial),
            new InputParameter('fechaF', this.fechaFinal)
          ]
        )
      )
      .subscribe(json => {
        this.resumenPromedio = null;

        if (json[3]) {
          this.resumenPromedioPatrulleroCompleted(JSON.parse(json[3]));
        }
      });
  }

  resumenPromedioPatrulleroCompleted(json: any): void {
    if (json['Table1']) {
      this.resumenPromedio = json['Table1'];
    }
  }

  // Primera Tabla.
  loadGeneralTableCompleted(jsonTable: any): void {
    if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
      ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
        this.loadGridGeneralTable(results);
      });
    }
  }

  private loadGridGeneralTable(selectedGraphics: any) {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.clearGridGeneralTable();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumnsGeneralTable(selectedGraphics);
        this.prepareDataTableSourceGeneralTable(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumnsGeneralTable(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumnsGeneralTable.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSourceGeneralTable(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapterGeneralTable = new jqx.dataAdapter(source);
  }

  private clearGridGeneralTable(): void {
    if (this.dataAdapterGeneralTable != null) {
      this.dataAdapterGeneralTable = new jqx.dataAdapter({});
    }

    if (this.dataTableColumnsGeneralTable != null) {
      this.dataTableColumnsGeneralTable = new Array<any>();
    }
  }

  // Segunda Tabla.
  loadSpecificTableCompleted(jsonTable: any): void {
    if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
      ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
        this.loadGridSpecificTable(results);
      });
    }
  }

  private loadGridSpecificTable(selectedGraphics: any) {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.clearGridSpecificTable();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumnsSpecificTable(selectedGraphics);
        this.prepareDataTableSourceSpecificTable(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumnsSpecificTable(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumnsSpecificTable.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSourceSpecificTable(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapterSpecificTable = new jqx.dataAdapter(source);
  }

  private clearGridSpecificTable(): void {
    if (this.dataAdapterSpecificTable != null) {
      this.dataAdapterSpecificTable = new jqx.dataAdapter({});
    }

    if (this.dataTableColumnsSpecificTable != null) {
      this.dataTableColumnsSpecificTable = new Array<any>();
    }
  }

  exportarExcel(): void {
    if (this.jqxDataTableResults.attrColumns.length > 0) {
      this.jqxDataTableResults.exportData('xls');
    } else {
      alert('No hay datos para exportar.');
    }
  }

  start(): void {
    this.fechaInicial = null;
    this.fechaFinal = null;
    this.departamentoSeleccionado = null;
    this.unidadOperativaSeleccionada = null;
    this.contratistaSeleccionado = null;
    this.ordenPadreSeleccionada = null;
    this.patrulleroSeleccionado = null;
    this.listarUnidadesOperativas = null;
    this.listarContratistas = null;
    this.listarOrdenesPadre = null;
    this.listarPatrulleros = null;
    this.resumenPromedio = null;
    this.clearGridGeneralTable();
    this.clearGridSpecificTable();
  }

}
