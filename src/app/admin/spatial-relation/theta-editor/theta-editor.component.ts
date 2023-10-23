import { Component, OnInit, ViewChild, AfterContentInit } from '@angular/core';
import { CodeValue } from '../../../generic-class/code-vale';
import { jqxListBoxComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxlistbox';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-theta-editor',
  templateUrl: './theta-editor.component.html',
  styleUrls: ['./theta-editor.component.css']
})
export class ThetaEditorComponent implements OnInit, AfterContentInit {

  @ViewChild('jqxListBox') listTables: jqxListBoxComponent;
  tableValues: Array<string>;
  eventReturn: Function;
  closeFunction: Function;
  evt: any;

  constructor() { }

  ngAfterContentInit() {
    this.initialEnvironment();
  }

  ngOnInit() {
  }

  start(evt: any): void {
    this.evt = evt;
    this.eventReturn = evt.returnData;
    this.tableValues = evt.tableData.map(a => a.Value);

  }
  initialEnvironment() {
    try {
      this.listTables.uncheckAll();
      if (this.evt.value) {
        this.listTables.getItems().forEach(element => { if (element.value && this.evt.value.indexOf(element.value) >= 0) { this.listTables.checkIndex(element.index); } });
      }
    } catch{ }
  }

  executeSave() {
    let selectedItems = '';
    this.listTables.getCheckedItems().forEach(element => { selectedItems += element.value + environment.editorSeparator });
    selectedItems = selectedItems.substring(0, selectedItems.length - 1);
    this.eventReturn(selectedItems);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }

}
