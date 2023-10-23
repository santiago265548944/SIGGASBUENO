import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';

@Component({
  selector: 'app-quality-index',
  templateUrl: './quality-index.component.html',
  styleUrls: ['./quality-index.component.css']
})
export class QualityIndexComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  year: Array<any> = [];
  activity: Array<any>;
  yearSelected: any;
  activitySelected: any;
  budgeted: any;
  executed: any;
  qualityIndex: any;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadYears();
    this.loadDropDownActivity();
  }

  private loadYears(): void {
    const ano = new Date().getFullYear();

    for (let i = ano; i >= 1990; i--) {
      this.year.push(i).toString();
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

  onAceptarClick(): void {
    if (!this.validate()) {
      return;
    }

    this.startProgress();

    const spParams = this.getParams();

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.IndiceCalidad,
          spParams
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json != null) {
          this.processQualityIndexResponse(json);
        }
      });
  }

  private validate(): boolean {
    const messages = new Array<string>();

    // tslint:disable-next-line:max-line-length
    if (this.yearSelected == null || this.activitySelected == null) {
      messages.push('Debe completar la información de todos los campos.');
    }

    if (messages.length > 0) {
      alert(messages.join('\n'));
    }

    return messages.length === 0;
  }

  private getParams(): Array<InputParameter> {
    const params = new Array();

    params.push(new InputParameter('un_anno', this.yearSelected));

    let activityParamValue = '';
    if (this.activitySelected != null) {
      activityParamValue = this.activitySelected.CODIGO;
    }
    params.push(new InputParameter('una_actividad', activityParamValue));

    return params;
  }

  private processQualityIndexResponse(json: any): void {
    const values = Object.values(json);

    if (values.length > 0) {
      const responseContent = JSON.parse(values[0].toString());

      if (responseContent.ErrorMessage != null) {
        alert(responseContent.ErrorMessage);
      } else {
        this.resultsCompleted(values);
      }
    }
  }

  private resultsCompleted(json: any): void {
    if (json != null) {
      this.budgeted = json[0];
      this.executed = json[1];
      this.qualityIndex = json[2];
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
    this.yearSelected = null;
    this.activitySelected = null;
    this.budgeted = null;
    this.executed = null;
    this.qualityIndex = null;
  }
}
