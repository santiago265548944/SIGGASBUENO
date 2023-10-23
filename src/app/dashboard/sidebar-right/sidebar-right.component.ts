import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { GlobalService } from '../../Globals/global.service';

@Component({
  selector: 'app-sidebar-right',
  templateUrl: './sidebar-right.component.html',
  styleUrls: ['./sidebar-right.component.css']
})
export class SidebarRightComponent implements OnInit {

  height: string;
  codSeleccionado: number;
  suma: any;
  longPatru: any;
  longAsig: any;
  values: any;
  ValueMax: any;
  elementoSeleccionado: string;

  tooltip: any = {
    visible: true,
    formatFunction: (value: string): string => {
      // tslint:disable-next-line: radix
      const realVal = parseInt(value);
      return ('Year: 2016<br/>Price Index: ' + realVal);
    }
  };

  constructor(private apiService: ApiService, private globalService: GlobalService) {
    this.height = window.innerHeight - 121 + 'px';
    globalService.sidebarHeight$.subscribe((height) => {
      setTimeout(() => {
        this.height = height;
      }, 500);
    });

    globalService.datosDashboard$.subscribe((datos) => {
      this.codSeleccionado = datos;
    }, (error) => {
      console.error(error);
    });

    globalService.optionDashboard$.subscribe((option) => {
      if (option === '1') {
        this.elementoSeleccionado = 'Departamento';
        this.mostrarDepartamento();
      } else if (option === '2') {
        this.elementoSeleccionado = 'Contratista';
        this.mostrarContratista();
      }
    }, (error) => {
      console.error(error);
    });
  }

  ngOnInit() {
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

}
