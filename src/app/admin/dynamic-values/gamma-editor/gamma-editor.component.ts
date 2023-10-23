import { Component, OnInit } from '@angular/core';
import { CodeValue } from '../../../generic-class/code-vale';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gamma-editor',
  templateUrl: './gamma-editor.component.html',
  styleUrls: ['./gamma-editor.component.css']
})
export class GammaEditorComponent implements OnInit {

  rotationTypeValues: Array<CodeValue>;
  anguloValue: Number;
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
    this.anguloValue = 0;
    this.eventReturn = evt.returnData;
    if (evt.value) {
      const values = evt.value.split(environment.editorSeparator);
      if (values.length > 1) {
        this.rotationTypeValue = "a";
        this.anguloValue = values[1];
      } else {
        this.rotationTypeValue = "";
        this.anguloValue = values[0];
      }
    }

  }

  executeSave() {
    this.eventReturn((this.rotationTypeValue === "" ? "" : (this.rotationTypeValue + environment.editorSeparator)) + this.anguloValue.toString());
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }
}
