import { Component, OnInit } from '@angular/core';
import { CodeValue } from '../../../generic-class/code-vale';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../api/api.service';
import { RequestHelper } from '../../../api/request/request-helper';
import { StoreProcedures } from '../../../api/request/store-procedures.enum';
import { InputParameter } from '../../../api/request/input-parameter';

@Component({
  selector: 'app-beta-editor',
  templateUrl: './beta-editor.component.html',
  styleUrls: ['./beta-editor.component.css']
})
export class BetaEditorComponent implements OnInit {

  tableValues: Array<CodeValue>;
  fielNameValues: Array<CodeValue>;
  fieldNameValue: string;
  tableNameValue: string;
  eventReturn: Function;
  closeFunction: Function;

  constructor(private apiService: ApiService) { 
    this.fielNameValues = new Array<CodeValue>();
  }

  ngOnInit() {
  }

  start(evt: any): void {
    this.tableNameValue = "";
    this.fieldNameValue = "";
    this.eventReturn = evt.returnData;
    this.tableValues = evt.tableData;
    if (evt.value) {
      const values = evt.value.split(environment.editorSeparator);
      this.tableNameValue = values[0];
      if (values[1])
        this.fieldNameValue = values[1];
    }

    this.loadFieldNameValues();
  }

  onTableChange() {
    this.fieldNameValue = "";
    this.loadFieldNameValues();
  }

  loadFieldNameValues() {
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerCamposfcsg,
            [new InputParameter('un_featureclass', this.tableNameValue)]
          )
        )
        .subscribe(json => {
          if (json['1']) {
            const jsonTable = JSON.parse(json['1']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.fielNameValues.push(<CodeValue>{
                  Value: element[Object.getOwnPropertyNames(element)[0]],
                  Code: element[Object.getOwnPropertyNames(element)[0]]
                });
              });
            }
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  executeSave() {
    this.eventReturn(this.tableNameValue + environment.editorSeparator + this.fieldNameValue);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }

}
