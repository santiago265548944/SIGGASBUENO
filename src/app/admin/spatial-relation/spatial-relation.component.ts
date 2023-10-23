import { Component, OnInit, ComponentRef } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { environment } from '../../../environments/environment';
import { CodeValue } from '../../generic-class/code-vale';
import { ModalService } from '../../modal.module';
import { EtaEditorComponent } from './eta-editor/eta-editor.component';
import { ThetaEditorComponent } from './theta-editor/theta-editor.component';

@Component({
  selector: 'app-spatial-relation',
  templateUrl: './spatial-relation.component.html',
  styleUrls: ['./spatial-relation.component.css']
})

export class SpatialRelationComponent implements OnInit {

  tableValues: Array<CodeValue>;
  methodValues: Array<CodeValue>;
  model: any;
  eventReturn: Function;
  closeFunction: Function;
  private modalEtaEditor: ComponentRef<any> = null;
  private modalThetaEditor: ComponentRef<any> = null;

  constructor(private apiService: ApiService,
    private modalService: ModalService) {
    this.tableValues = new Array<CodeValue>();
    this.methodValues = new Array<CodeValue>();
    const nonValue = <CodeValue>{ Value: "", Code: undefined };
    this.tableValues.push(nonValue);
    this.methodValues.push(nonValue);
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
            StoreProcedures.ObtenerComboRelaciones,
            []
          )
        )
        .subscribe(json => {
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.methodValues.push(<CodeValue>{
                  Value: element.DESCRIPTION,
                  Code: element.METHOD
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
  }

  editValueInfo() {
    switch (this.model.VALUEMETHOD) {
      case "MUST_OVERLAP":
        this.callModalEtaEditor();
        break;
      case "MUST_NOT_OVERLAP":
        this.callModalEtaEditor();
        break;
      case "MUST_OVERLAP_ANY":
        if (this.modalThetaEditor == null) {
          this.modalThetaEditor = this.modalService.create(
            ThetaEditorComponent,
            {
              modalTitle: 'Editor',
              height: 280,
              width: 350,
              resizable: false
            }
          );
        } else {
          this.modalThetaEditor.instance.open();
        }
        this.modalThetaEditor.instance.start({
          value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
            if(data) this.model.VALUEINFO = data;
          }
        });
        break;
    }
  }

  callModalEtaEditor() {
    if (this.modalEtaEditor == null) {
      this.modalEtaEditor = this.modalService.create(
        EtaEditorComponent,
        {
          modalTitle: 'Editor',
          height: 130,
          width: 350,
          resizable: false
        }
      );
    } else {
      this.modalEtaEditor.instance.open();
    }
    this.modalEtaEditor.instance.start({
      value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
        if(data) this.model.VALUEINFO = data;
      }
    });
  }

  executeSave() {
    this.eventReturn(this.model);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn(null);
    this.closeFunction();
  }
}