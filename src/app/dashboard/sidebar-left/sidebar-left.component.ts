import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { GlobalService } from '../../Globals/global.service';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { InputParameter } from '../../api/request/input-parameter';

@Component({
  selector: 'app-sidebar-left',
  templateUrl: './sidebar-left.component.html',
  styleUrls: ['./sidebar-left.component.css']
})
export class SidebarLeftComponent implements OnInit {

  height: string;
  option: string = null;
  dataTableColumns: Array<any>;
  dataAdapter: any;
  listElements: any;
  longAsignada: number;

  constructor(private apiService: ApiService, private globalService: GlobalService) {
    this.height = window.innerHeight - 121 + 'px';

    globalService.sidebarHeight$.subscribe((height) => {
      setTimeout(() => {
        this.height = height;
      }, 500);
    }, error => {
      console.error(error);
    });

    globalService.flag$.subscribe(flag => {
      if (flag === true) {
        this.deleteData();
      }
    }, error => {
      console.error(error);
    });

    this.dataTableColumns = new Array<any>();
    this.dataAdapter = new jqx.dataAdapter({});
  }

  ngOnInit() {
  }

  cargarTabla(): void {
    if (this.option === '1') {

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ListarDepartamentosDashboard,
            []
          )
        )
        .subscribe(json => {
          if (json[0]) {
            this.clearGrid();
            this.loadDataCompleted(JSON.parse(json[0]));
          }
        });

    } else if (this.option === '2') {

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ListarContratistasDashboard,
            []
          )
        )
        .subscribe(json => {
          if (json[0]) {
            this.clearGrid();
            this.loadDataCompleted(JSON.parse(json[0]));
          }
        });

    }
  }

  loadDataCompleted(jsonResult: any): void {
    if (jsonResult['Table1'] && jsonResult['Table1'].length > 0) {
      ResultToGraphicCollection.convert(jsonResult['Table1'], results => {
        this.loadGrid(results);
      });
    }
  }

  private loadGrid(selectedGraphics: any): void {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.listElements = selectedGraphics;

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
    const selectedElement = this.listElements[event.args.index];
    const codSeleccionado = selectedElement.attributes.CODIGO;
    const nombreSeleccionado = selectedElement.attributes.NOMBRE;

    this.globalService.setDatosDashboard(codSeleccionado);
    this.globalService.setNombreSeleccionado(nombreSeleccionado);
    this.globalService.setOptionDashboard(this.option);

    if (this.option === '1') {
      this.longAsignadaDepartamento(codSeleccionado);
    } else if (this.option === '2') {
      this.longAsignadaContratista(codSeleccionado);
    }
  }

  longAsignadaDepartamento(codSeleccionado: number): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.SumaDashboardDepartamento,
          [
            new InputParameter('codDepa', codSeleccionado)
          ]
        )
      ).subscribe(json => {
        this.longAsignada = null;

        if (json[1]) {
          const result = JSON.parse(json[1]);

          if (result['Table1'].length > 0) {
            this.longAsignada = result['Table1'][0].LONGITUD_ASIGNADA;
          }
        }
      });
  }

  longAsignadaContratista(codSeleccionado: number): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.SumaDashboardContratista,
          [
            new InputParameter('codContra', codSeleccionado)
          ]
        )
      ).subscribe(json => {
        this.longAsignada = null;

        if (json[1]) {
          const result = JSON.parse(json[1]);

          if (result['Table1'].length > 0) {
            this.longAsignada = result['Table1'][0].LONGITUD_ASIGNADA;
          }
        }
      });
  }

  deleteData(): void {
    this.option = null;
    this.clearGrid();
    this.longAsignada = null;
  }

}
