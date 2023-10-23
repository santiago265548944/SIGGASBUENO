import { Component, OnInit } from '@angular/core';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { environment } from '../../../environments/environment';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { ApiService } from '../../api/api.service';
import { CodeValue } from '../../generic-class/code-vale';

@Component({
  selector: 'app-historic',
  templateUrl: './historic.component.html',
  styleUrls: ['./historic.component.css']
})
export class HistoricComponent implements OnInit {


  tableValues: Array<CodeValue>;
  historicFieldValues: Array<CodeValue>;
  fieldValues: Array<CodeValue>;
  model: any;
  historicTable: string;
  historicField: string;
  eventReturn: Function;
  closeFunction: Function;

  constructor(private apiService: ApiService) {
    this.tableValues = new Array<CodeValue>();
    this.historicFieldValues = new Array<CodeValue>();
    this.fieldValues = new Array<CodeValue>();
    const nonValue = <CodeValue>{ Value: "", Code: undefined };
    this.tableValues.push(nonValue);
    this.historicFieldValues.push(nonValue);
    this.fieldValues.push(nonValue);
  }

  ngOnInit() {
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerTablasGraficas,
            [new InputParameter('un_Dueno', environment.dbOwner)]
          )
        )
        .subscribe(json => {
          if (json['1']) {
            const jsonTable = JSON.parse(json['1']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.tableValues.push(<CodeValue>{
                  Value: element[Object.getOwnPropertyNames(element)[0]],
                  Code: element[Object.getOwnPropertyNames(element)[0]]
                });
              });
            }
          }
        });

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerCamposHistoria,
            []
          )
        )
        .subscribe(json => {
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.historicFieldValues.push(<CodeValue>{
                  Value: element.METHOD,
                  Code: element.METHOD
                });
              });
            }
          }
        });

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerCamposfcsg,
            [new InputParameter('un_FeatureClass', "")]
          )
        )
        .subscribe(json => {
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.fieldValues.push(<CodeValue>{
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

  start(evt: any): void {
    this.model = evt.data;
    this.eventReturn = evt.returnData
    this.historicTable = this.model.VALUEINFO;
    const values = this.historicTable.split(environment.editorSeparator);
    if (values.length > 0) {
      this.historicTable = values[0];
      this.historicField = values[1]
    }
    this.loadHistoricFields();
  }

  loadHistoricFields() {
    this.historicTable = this.model.TABLENAME.substring(0, this.model.TABLENAME.indexOf(".") + 1) + "Histo" + this.model.TABLENAME.substring(this.model.TABLENAME.indexOf(".") + 1);
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerComboCampos,
          [new InputParameter('un_dueno', environment.dbOwner),
          new InputParameter('una_tabla', this.model.TABLENAME)]
        )
      )
      .subscribe(json => {
        if (json['2']) {
          const jsonTable = JSON.parse(json['2']);
          if (jsonTable['Table1']) {
            this.fieldValues = new Array<CodeValue>();
            jsonTable['Table1'].forEach(element => {
              this.fieldValues.push(<CodeValue>{
                Value: element[Object.getOwnPropertyNames(element)[0]],
                Code: element[Object.getOwnPropertyNames(element)[0]]
              });
            });
            this.fieldValues.push(<CodeValue>{ Value: "USUARIO", Code: <any>"USUARIO" });
            this.fieldValues.push(<CodeValue>{ Value: "ACCION", Code: <any>"ACCION" });
            this.fieldValues.push(<CodeValue>{ Value: "FECHAMODIFICACION", Code: <any>"FECHAMODIFICACION" });
            this.fieldValues.push(<CodeValue>{ Value: "MAQUINA", Code: <any>"MAQUINA" });
          }
        }
      });
  }

  executeSave() {
    this.model.VALUEINFO = this.historicTable + environment.editorSeparator + this.historicField
    this.eventReturn(this.model);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn(null);
    this.closeFunction();
  }

}
