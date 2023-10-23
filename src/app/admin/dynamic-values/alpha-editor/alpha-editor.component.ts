import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alpha-editor',
  templateUrl: './alpha-editor.component.html',
  styleUrls: ['./alpha-editor.component.css']
})
export class AlphaEditorComponent implements OnInit {


  textValue: string;
  eventReturn: Function;
  closeFunction: Function;

  constructor() { }

  ngOnInit() {
  }

  start(evt: any): void {
    this.textValue = '';
    this.eventReturn = evt.returnData;
    if (evt.value) {
      this.textValue = evt.value;
    }
  }

  executeSave() {
    this.eventReturn(this.textValue);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }


}
