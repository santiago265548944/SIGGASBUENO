import { Component, OnInit, ComponentRef } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ModalService } from '../../modal.module';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { environment } from '../../../environments/environment';
import { CodeValue } from '../../generic-class/code-vale';
import { BetaEditorComponent } from './beta-editor/beta-editor.component';
import { GammaEditorComponent } from './gamma-editor/gamma-editor.component';
import { DeltaEditorComponent } from './delta-editor/delta-editor.component';
import { DsetaEditorComponent } from './dseta-editor/dseta-editor.component';
import { EpsilonEditorComponent } from './epsilon-editor/epsilon-editor.component';
import { AlphaEditorComponent } from './alpha-editor/alpha-editor.component';

@Component({
  selector: 'app-dynamic-values',
  templateUrl: './dynamic-values.component.html',
  styleUrls: ['./dynamic-values.component.css']
})
export class DynamicValuesComponent implements OnInit {

  tableValues: Array<CodeValue>;
  methodValues: Array<CodeValue>;
  fielNameValues: Array<CodeValue>;
  model: any;
  eventReturn: Function;
  closeFunction: Function;
  FCGeometryType: string;
  private modalBetaEditor: ComponentRef<any> = null;
  private modalGammaEditor: ComponentRef<any> = null;
  private modalDeltaEditor: ComponentRef<any> = null;
  private modalDsetaEditor: ComponentRef<any> = null;
  private modalEpsilonEditor: ComponentRef<any> = null;
  private modalAlphaEditor: ComponentRef<any> = null;

  constructor(private apiService: ApiService,
    private modalService: ModalService) {
    this.tableValues = new Array<CodeValue>();
    this.methodValues = new Array<CodeValue>();
    this.fielNameValues = new Array<CodeValue>();
    const nonValue = <CodeValue>{ Value: "", Code: undefined };
    this.tableValues.push(nonValue);
    this.methodValues.push(nonValue);
    this.fielNameValues.push(nonValue);
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
            StoreProcedures.ObtenerComboMetodos,
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

  onTableChange() {
    this.model.FIELDNAME = "";
    this.loadFieldNameValues();
  }

  loadFieldNameValues() {
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerComboCampos,
            [new InputParameter('un_Dueno', environment.dbOwner),
            new InputParameter('una_tabla', this.model.TABLENAME)]
          )
        )
        .subscribe(json => {
          if (json['2']) {
            const jsonTable = JSON.parse(json['2']);
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

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerTipoElemento,
            [new InputParameter('una_tabla', this.model.TABLENAME)]
          )
        )
        .subscribe(json => {
          if (json['1']) {
            const jsonTable = JSON.parse(json['1']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.FCGeometryType = element.SHAPETYPE
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
    this.loadFieldNameValues();
    this.eventReturn = evt.returnData
  }

  editValueInfo() {
    switch (this.model.VALUEMETHOD) {
      case "INTERSECTING_FEATURE":
        if (this.modalBetaEditor == null) {
          this.modalBetaEditor = this.modalService.create(
            BetaEditorComponent,
            {
              modalTitle: 'Editor',
              height: 130,
              width: 350,
              resizable: false
            }
          );
        } else {
          this.modalBetaEditor.instance.open();
        }
        this.modalBetaEditor.instance.start({
          value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
            if (data) this.model.VALUEINFO = data;
          }
        });
        break;
      case "JUNCTION_ROTATION":
        if (this.modalGammaEditor == null) {
          this.modalGammaEditor = this.modalService.create(
            GammaEditorComponent,
            {
              modalTitle: 'Editor',
              height: 130,
              width: 350,
              resizable: false
            }
          );
        } else {
          this.modalGammaEditor.instance.open();
        }
        this.modalGammaEditor.instance.start({
          value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
            if (data) this.model.VALUEINFO = data;
          }
        });
        break;
      case "NEAREST_FEATURE":
        if (this.modalDeltaEditor == null) {
          this.modalDeltaEditor = this.modalService.create(
            DeltaEditorComponent,
            {
              modalTitle: 'Editor',
              height: 350,
              width: 350,
              resizable: false
            }
          );
        } else {
          this.modalDeltaEditor.instance.open();
        }
        this.modalDeltaEditor.instance.start({
          value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
            if (data) this.model.VALUEINFO = data;
          }
        });
        break;
      case "ANGLE":
        switch (this.FCGeometryType) {
          case "esriGeometryPoint":
            if (this.modalDsetaEditor == null) {
              this.modalDsetaEditor = this.modalService.create(
                DsetaEditorComponent,
                {
                  modalTitle: 'Editor',
                  height: 130,
                  width: 350,
                  resizable: false
                }
              );
            } else {
              this.modalDsetaEditor.instance.open();
            }
            this.modalDsetaEditor.instance.start({
              value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
                if (data) this.model.VALUEINFO = data;
              }
            });
            break;
          default:
            if (this.modalEpsilonEditor == null) {
              this.modalEpsilonEditor = this.modalService.create(
                EpsilonEditorComponent,
                {
                  modalTitle: 'Editor',
                  height: 130,
                  width: 350,
                  resizable: false
                }
              );
            } else {
              this.modalEpsilonEditor.instance.open();
            }
            this.modalEpsilonEditor.instance.start({
              value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
                if (data != undefined) this.model.VALUEINFO = data;
              }
            });
            break;
        }
        break;
      default:
        if (this.modalAlphaEditor == null) {
          this.modalAlphaEditor = this.modalService.create(
            AlphaEditorComponent,
            {
              modalTitle: 'Editor',
              height: 130,
              width: 350,
              resizable: false
            }
          );
        } else {
          this.modalAlphaEditor.instance.open();
        }
        this.modalAlphaEditor.instance.start({
          value: this.model.VALUEINFO, tableData: this.tableValues, returnData: (data: any) => {
            if (data != undefined) this.model.VALUEINFO = data;
          }
        });
        break;
    }
  }

  executeSave() {
    if (!this.model.RUN_WEIGHT) this.model.RUN_WEIGHT = 0;
    this.eventReturn(this.model);
    this.closeFunction();
  }

  executeCancel() {
    this.eventReturn();
    this.closeFunction();
  }

}
