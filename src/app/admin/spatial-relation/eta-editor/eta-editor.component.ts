import { Component, OnInit } from '@angular/core';
import { CodeValue } from '../../../generic-class/code-vale';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-eta-editor',
  templateUrl: './eta-editor.component.html',
  styleUrls: ['./eta-editor.component.css']
})
export class EtaEditorComponent implements OnInit {

  tableValues: Array<CodeValue>;
  distanceValue: Number;
  tableNameValue: string;
  eventReturn: Function;
  closeFunction: Function;

  constructor() { }

  ngOnInit() {
  }

  start(evt: any): void {
    this.tableNameValue = "";
    this.distanceValue = 0;
    this.eventReturn = evt.returnData;
    if (evt.value) {
      const values = evt.value.split(environment.editorSeparator);
      this.tableNameValue = values[0];
      if (values[1])
        this.distanceValue = values[1];
    }
    this.tableValues = evt.tableData;
  }

  executeSave() {
    this.eventReturn(this.tableNameValue + (this.distanceValue === 0 ? "" : environment.editorSeparator + this.distanceValue));
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }

}
