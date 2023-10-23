import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DynamicFieldCombo } from '../dynamic-field';
import { ApiService } from '../../../api/api.service';
import { RequestHelper } from '../../../api/request/request-helper';
import { InputParameter } from '../../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  _dataSource: Array<any>;

  get dataSource() {
    return this._dataSource;
  }

  @Input()
  set dataSource(dataSource: Array<any>) {
    this._dataSource = dataSource;
    if (this._dataSource != null) {
      this.configComboxes();
    }
  }

  constructor(private apiService: ApiService) { }

  ngOnInit() {
  }

  private configComboxes() {
    this.dataSource.forEach(item => {
      if (item.TipoParametro === 'COMBO') {
        this.configCombobox(item);
      }
    });
  }

  private configCombobox(comboData: DynamicFieldCombo) {
    if (comboData.ComboHijo != null) {
      comboData.OnModelChanged = (newValue, parentComboData) => this.loadDependentCombobox(newValue, parentComboData);
    } else {
      comboData.OnModelChanged = () => null;
    }

    if (comboData.ComboPadre === null) {
      this.loadCombobox(comboData);
    }
  }

  private loadCombobox(comboData: DynamicFieldCombo) {
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          comboData.Procedimiento,
          []
        )
      )
      .subscribe(json => {
        this.stopProgress();
        const values = Object.values(json);
        if (values[0] != null) {
          this.loadComboboxCompleted(comboData, JSON.parse(values[0].toString()));
        }
      });
  }

  private loadComboboxCompleted(comboData: DynamicFieldCombo, json: any) {
    comboData.DataList = new Array<any>();
    if (json['Table1'] != null) {
      json['Table1'].forEach(item => {
        const keys = Object.keys(item);
        const values = Object.values(item);
        if (keys.length >= 2) {
          comboData.DataList.push({ value: values[0], text: values[1] });
        } else if (keys.length === 1) {
          comboData.DataList.push({ value: values[0], text: values[0] });
        }
      });
    }
  }

  private loadDependentCombobox(newValue: any, parentComboData: DynamicFieldCombo) {
    let mainComboBoxData = null;
    for (let i = 0; i < this.dataSource.length; i++) {
      if (parentComboData.ComboHijo === this.dataSource[i].Parametro) {
        mainComboBoxData = this.dataSource[i];
        break;
      } else if (this.dataSource[i].ComboHijo === null) {
        mainComboBoxData = this.dataSource[i];
      }
    }
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          mainComboBoxData.Procedimiento,
          [new InputParameter(parentComboData.Parametro, newValue.value)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        const values = Object.values(json);
        if (values[0] != null) {
          this.loadComboboxCompleted(mainComboBoxData, JSON.parse(values[0].toString()));
        }
      });
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
}
