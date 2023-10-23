import { Component, OnInit, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { jqxListBoxComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxlistbox';
import { environment } from '../../../../environments/environment';
import { CodeValue } from '../../../generic-class/code-vale';
import { RequestHelper } from '../../../api/request/request-helper';
import { StoreProcedures } from '../../../api/request/store-procedures.enum';
import { InputParameter } from '../../../api/request/input-parameter';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'app-delta-editor',
  templateUrl: './delta-editor.component.html',
  styleUrls: ['./delta-editor.component.css']
})
export class DeltaEditorComponent implements OnInit, AfterContentInit, AfterViewInit {


  @ViewChild('jqxListBox') listTables: jqxListBoxComponent;
  tableValues: Array<string>;
  fielNameValues: Array<CodeValue>;
  eventReturn: Function;
  closeFunction: Function;
  distanceValue: number;
  fieldNameValue: string;
  evt: any;

  constructor(private apiService: ApiService) {
    this.fielNameValues = new Array<CodeValue>();
  }

  ngAfterContentInit() {
    this.initialEnvironment(true);
  }

  ngAfterViewInit() {
    this.initialEnvironment(false);
  }

  ngOnInit() {
  }

  start(evt: any): void {
    this.evt = evt;
    this.eventReturn = evt.returnData;
    this.tableValues = evt.tableData.map(a => a.Value);
    this.listTables.uncheckAll();
    this.initialEnvironment(true);
  }

  initialEnvironment(setModel: boolean) {
    try {
      if (this.evt.value) {
        const values = this.evt.value.split(environment.editorSeparator);
        const tableNameValue = values[0];
        if (setModel) this.fieldNameValue = values[1];
        if (values.length > 2) {
          if (setModel) this.distanceValue = values[2];
        }
        this.listTables.getItems().forEach(element => { if (element.value && tableNameValue.indexOf(element.value) >= 0) { this.listTables.checkIndex(element.index); } });
        this.loadFieldNames();
      }
    } catch{ }
  }

  private getTablesNames(): string {
    let selectedItems = '';
    this.listTables.getCheckedItems().forEach(element => { selectedItems += element.value + environment.editorSeparator2 });
    selectedItems = selectedItems.substring(0, selectedItems.length - 1);
    return selectedItems;
  }

  loadFieldNames() {
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerCamposComunesfcsg,
            [new InputParameter('unos_featureclass', this.getTablesNames().replace(environment.dbOwner + ".", "").toUpperCase())]
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

  selectTableName(event: any): void {
    this.loadFieldNames();
  }

  executeSave() {
    this.eventReturn(this.getTablesNames() + environment.editorSeparator + this.fieldNameValue + environment.editorSeparator + this.distanceValue.toString());
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }

}
