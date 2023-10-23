import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import * as moment from 'moment';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { CallModal } from '../../map-service/map-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';

@Component({
  selector: 'app-statistic-reports',
  templateUrl: './statistic-reports.component.html',
  styleUrls: ['./statistic-reports.component.css']
})
export class StatisticReportsComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  statisticReportsListT: Array<any>;
  statisticReportsListA: Array<any>;
  statisticReportsListE: Array<any>;
  statisticReportsItemSelectedT: any;
  statisticReportsItemSelectedA: any;
  statisticReportsItemSelectedE: any;
  openDate: any;
  closeDate: any;
  availableResults: Array<any>;

  constructor(private apiService: ApiService, private mapService: MapService) { }

  ngOnInit() {
    this.fillStatisticReports();
    this.loadDropDownStatisticReports();
  }

  private fillStatisticReports(): void {
    this.statisticReportsListT = new Array<any>();
    this.statisticReportsListT.push({ value: 'MantenimientosRealizados', text: 'Mantenimientos Realizados' });
    this.statisticReportsListT.push({ value: 'MantenimientosPendientes', text: 'Mantenimientos Pendientes' });
    this.statisticReportsListT.push({ value: 'MantenimientoTotal', text: 'Mantenimiento Total' });
  }

  private loadDropDownStatisticReports() {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerActividades,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadDropDownStatisticReportsCompleted(JSON.parse(json[0]));
        }
      });
  }

  private loadDropDownStatisticReportsCompleted(json: any) {
    if (json['Table1'] != null) {
      this.statisticReportsListA = json['Table1'];
    }
  }

  statisticReportsItemChanged(itemSelected: any): void {
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerElementosActividad,
          [new InputParameter('una_actividad', itemSelected.CODIGO)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[1] != null) {
          this.statisticReportsItemChangedCompleted(JSON.parse(json[1]));
        }
      });
  }

  private statisticReportsItemChangedCompleted(json: any) {
    if (json['Table1'] != null) {
      this.statisticReportsListE = json['Table1'];
    }
  }

  onAceptarClick(): void {
    if (!this.validate()) {
      return;
    }

    this.startProgress();

    const spParams = this.getParams();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          `MANTENIMIENTO.${this.statisticReportsItemSelectedT.value}`,
          spParams
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[4] != null) {
          this.statisticReports(JSON.parse(json[4]));
        }
      });
  }

  private validate(): boolean {
    const messages = new Array<string>();

    // tslint:disable-next-line:max-line-length
    if (this.statisticReportsItemSelectedT == null || this.statisticReportsItemSelectedA == null || this.statisticReportsItemSelectedE == null || this.openDate == null || this.closeDate == null) {
      messages.push('Debe completar la información de todos los campos.');
    }

    if (messages.length > 0) {
      alert(messages.join('\n'));
    }

    return messages.length === 0;
  }

  private getParams(): Array<InputParameter> {
    const params = new Array();

    let activityParamValue = '';
    if (this.statisticReportsItemSelectedA != null) {
      activityParamValue = this.statisticReportsItemSelectedA.CODIGO;
    }
    params.push(new InputParameter('una_actividad', activityParamValue));

    let elementParamValue = '';
    if (this.statisticReportsItemSelectedE != null) {
      elementParamValue = this.statisticReportsItemSelectedE.ELEMENTO;
    }
    params.push(new InputParameter('un_elemento', elementParamValue));

    const fechai = moment(this.openDate).format('YYYY-MM-DD');
    params.push(new InputParameter('una_fechai', fechai));

    const fechaf = moment(this.closeDate).format('YYYY-MM-DD');
    params.push(new InputParameter('una_fechaf', fechaf));

    return params;
  }

  private statisticReports(json): void {
    if (json['Table1'] != null && json['Table1'].length >= 0) {
      const responseValues = Object.values(json);
      ResultToGraphicCollection.convert(
        <Array<any>>responseValues[0],
        results => {
          this.availableResults = results;
          this.mapService.executeMapAction(<CallModal>{
            EMapAction: EmapActions.CallModal,
            EModal: Emodal.ViewSelection,
            parameters: this.availableResults
          });
        }
      );
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
    this.statisticReportsItemSelectedT = null;
    this.statisticReportsItemSelectedA = null;
    this.statisticReportsItemSelectedE = null;
    this.openDate = null;
    this.closeDate = null;
  }
}
