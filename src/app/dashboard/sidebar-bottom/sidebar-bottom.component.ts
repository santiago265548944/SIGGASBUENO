import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../Globals/global.service';
import { Subscription } from 'rxjs/Subscription';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxChartComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxchart';

@Component({
  selector: 'app-sidebar-bottom',
  templateUrl: './sidebar-bottom.component.html',
  styleUrls: ['./sidebar-bottom.component.css']
})
export class SidebarBottomComponent implements OnInit {

  height: string;
  datosDashboard: Subscription = null;
  optionDashboard: Subscription = null;
  codSeleccionado: number;
  datos: any;
  titulo: string = null;
  nombreSeleccionado: string;

  suma: any;
  longPatru: any;
  longAsig: any;
  values: any;
  ValueMax: any;
  elementoSeleccionado: string;

  xAxis: any = {
    dataField: 'Semana',
    showGridLines: false,
    description: 'Semanas'
  };

  valueAxis: any = {
    minValue: 0,
    description: 'Longitud(m)'
  };

  seriesGroups: any[] = [
    {
      type: 'column',
      columnsGapPercent: 40,
      // toolTipFormatSettings: { thousandsSeparator: ',' },
      series: [
        { dataField: 'longAsignada', displayText: 'Long. Asignada' },
        { dataField: 'longPatrullada', displayText: 'Long. Patrullada' }
      ]
    }
  ];

  tooltip: any = {
    visible: true,
    formatFunction: (value: string): string => {
      // tslint:disable-next-line: radix
      const realVal = parseInt(value);
      return ('Year: 2016<br/>Price Index: ' + realVal);
    }
  };

  constructor(private globalService: GlobalService, private apiService: ApiService) {
    const tamanhoMapa = (window.innerHeight / 1.7) - 121;
    this.height = window.innerHeight - tamanhoMapa - 121 + 'px';

    globalService.sidebarBottomHeight$.subscribe((height) => {
      this.height = height;
    }, error => {
      console.error(error);
    });

    this.datosDashboard = this.globalService.datosDashboard$.subscribe((datos) => {
      this.codSeleccionado = datos;
    }, (error) => {
      console.error(error);
    });

    this.optionDashboard = this.globalService.optionDashboard$.subscribe((option) => {
      if (option === '1') {
        this.cargarDepartamento();

        this.elementoSeleccionado = 'Departamento';
        this.mostrarDepartamento();
      } else if (option === '2') {
        this.cargarContratista();

        this.elementoSeleccionado = 'Contratista';
        this.mostrarContratista();
      }
    }, (error) => {
      console.error(error);
    });

    globalService.nombreSeleccionado$.subscribe((nombre) => {
      this.nombreSeleccionado = nombre;
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
  }

  ngOnInit() {

  }

  cargarDepartamento(): void {
    this.titulo = 'Departamento';

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.PruebaDepartamentoSemana,
          [
            new InputParameter('codDepartamento', this.codSeleccionado)
          ]
        )
      ).subscribe(json => {
        if (json[1]) {
          this.datosBarras(JSON.parse(json[1]));
        }
      });
  }

  cargarContratista(): void {
    this.titulo = 'Contratista';

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.PruebaDashboard,
          [
            new InputParameter('codPatru', this.codSeleccionado)
          ]
        )
      ).subscribe(json => {
        if (json[1]) {
          this.datosBarras(JSON.parse(json[1]));
        }
      });
  }

  datosBarras(json: any): void {
    this.datos = json['Table1'].map(item => ({
      Semana: item.SEMANA,
      longAsignada: item.LONGITUD_ASIGNADA,
      longPatrullada: item.LONGITUD_PATRULLADA
    }));
  }

  mostrarDepartamento() {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.SumaDashboardDepartamento,
          [
            new InputParameter('codDepa', this.codSeleccionado)
          ]
        )
      ).subscribe(json => {
        if (json[1]) {
          this.almacenarSuma(JSON.parse(json[1]));
        }
      });
  }

  mostrarContratista() {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.SumaDashboardContratista,
          [
            new InputParameter('codContra', this.codSeleccionado)
          ]
        )
      ).subscribe(json => {
        if (json[1]) {
          this.almacenarSuma(JSON.parse(json[1]));
        }
      });
  }

  almacenarSuma(json: any): void {
    if (json['Table1'].length > 0) {
      this.suma = json['Table1'].map(item => ({
        longAsignada: item.LONGITUD_ASIGNADA,
        longPatrullada: item.LONGITUD_PATRULLADA
      }));

      this.longPatru = this.suma['0'].longPatrullada;
      this.longAsig = this.suma['0'].longAsignada;
      this.values = [this.longPatru, this.longAsig];
      this.ValueMax = this.suma['0'].longAsignada;
    } else {
      this.values = null;
      this.ValueMax = null;
    }
  }

  deleteData(): void {
    this.titulo = null;
    this.datos = [];
    this.nombreSeleccionado = null;
    this.elementoSeleccionado = null;
    this.values = null;
    this.ValueMax = null;
  }

}
