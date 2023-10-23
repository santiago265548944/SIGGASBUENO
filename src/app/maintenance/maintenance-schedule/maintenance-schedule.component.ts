import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { MapService } from '../../map-service/map.service';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { CallModal } from '../../map-service/map-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';

@Component({
  selector: 'app-maintenance-schedule',
  templateUrl: './maintenance-schedule.component.html',
  styleUrls: ['./maintenance-schedule.component.css']
})
export class MaintenanceScheduleComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  initialYear: Array<any> = [];
  finalYear: Array<any> = [];
  activity: Array<any>;
  filter: Array<any>;
  initialYearSelected: any;
  finalYearSelected: any;
  activitySelected: any;
  filterSelected: any;
  maintenanceScheduleResults: any;

  constructor(private apiService: ApiService, private mapService: MapService) { }

  ngOnInit() {
    this.loadYears();
    this.loadDropDownActivity();
    this.loadDropDownFilter();
  }

  private loadYears(): void {
    const ano = new Date().getFullYear();

    for (let i = ano; i >= 1990; i--) {
      this.initialYear.push(i).toString();
      this.finalYear.push(i).toString();
    }
  }

  private loadDropDownActivity(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerActividades,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadDropDownActivityCompleted(JSON.parse(json[0]));
        }
      });
  }

  private loadDropDownActivityCompleted(json: any): void {
    if (json['Table1'] != null) {
      this.activity = json['Table1'];
    }
  }

  private loadDropDownFilter(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerElementosFiltro,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadDropDownFilterCompleted(JSON.parse(json[0]));
        }
      });
  }

  private loadDropDownFilterCompleted(json: any): void {
    if (json['Table1'] != null) {
      this.filter = json['Table1'];
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
          StoreProcedures.ReporteCronogramaMantenimiento,
          spParams
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json[4] != null) {
          this.maintenanceScheduleReports(JSON.parse(json[4]));
        }
      });
  }

  private validate(): boolean {
    const messages = new Array<string>();

    // tslint:disable-next-line:max-line-length
    if (this.initialYearSelected == null || this.finalYearSelected == null || this.activitySelected == null || this.filterSelected == null) {
      messages.push('Debe completar la información de todos los campos.');
    }

    if (messages.length > 0) {
      alert(messages.join('\n'));
    }

    return messages.length === 0;
  }

  private getParams(): Array<InputParameter> {
    const params = new Array();

    params.push(new InputParameter('un_anho', this.initialYearSelected));

    params.push(new InputParameter('un_anho2', this.finalYearSelected));

    let activityParamValue = '';
    if (this.activitySelected != null) {
      activityParamValue = this.activitySelected.CODIGO;
    }
    params.push(new InputParameter('una_actividad', activityParamValue));

    let filterParamValue = '';
    if (this.filterSelected != null) {
      filterParamValue = this.filterSelected.ATRIBUTOFILTRO;
    }
    params.push(new InputParameter('opcionfiltro', filterParamValue));

    return params;
  }

  private maintenanceScheduleReports(json): void {
    if (json['Table1'] != null && json['Table1'].length >= 0) {
      const responseValues = Object.values(json);

      ResultToGraphicCollection.convert(
        <Array<any>>responseValues[0],
        results => {
          this.maintenanceScheduleResults = results;
          this.mapService.executeMapAction(<CallModal>{
            EMapAction: EmapActions.CallModal,
            EModal: Emodal.ViewSelection,
            parameters: this.maintenanceScheduleResults
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
    this.initialYearSelected = null;
    this.finalYearSelected = null;
    this.activitySelected = null;
    this.filterSelected = null;
  }
}
