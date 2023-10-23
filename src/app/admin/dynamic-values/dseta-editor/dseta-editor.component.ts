import { Component, OnInit } from '@angular/core';
import { CodeValue } from '../../../generic-class/code-vale';

@Component({
  selector: 'app-dseta-editor',
  templateUrl: './dseta-editor.component.html',
  styleUrls: ['./dseta-editor.component.css']
})
export class DsetaEditorComponent implements OnInit {


  tableValues: Array<CodeValue>;
  tableNameValue: string;
  eventReturn: Function;
  closeFunction: Function;

  constructor() { }

  ngOnInit() {
  }

  start(evt: any): void {
    this.tableNameValue = "";
    this.eventReturn = evt.returnData;
    this.tableValues = evt.tableData;
    if (evt.value) {
      this.tableNameValue = evt.value;
    }
  }

  executeSave() {
    this.eventReturn(this.tableNameValue);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }


}
