import { Component, OnInit } from '@angular/core';
import { CodeValue } from '../../../generic-class/code-vale';

@Component({
  selector: 'app-epsilon-editor',
  templateUrl: './epsilon-editor.component.html',
  styleUrls: ['./epsilon-editor.component.css']
})
export class EpsilonEditorComponent implements OnInit {


  rotationTypeValues: Array<CodeValue>;
  rotationTypeValue: string;
  eventReturn: Function;
  closeFunction: Function;

  constructor() {
    this.rotationTypeValues = new Array<CodeValue>();
    this.rotationTypeValues.push(<CodeValue>{ Value: "Aritmética", Code: <any>"a" });
    this.rotationTypeValues.push(<CodeValue>{ Value: "Geográfica", Code: <any>"" });
  }

  ngOnInit() {
  }

  start(evt: any): void {
    this.rotationTypeValue = "";
    this.eventReturn = evt.returnData;
    if (evt.value) {
      if (evt.value === "a") {
        this.rotationTypeValue = "a";
      } else {
        this.rotationTypeValue = "";
      }
    }
  }

  executeSave() {
    this.eventReturn(this.rotationTypeValue);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }

}
