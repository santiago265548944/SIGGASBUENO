import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ComponentRef
} from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { MapService } from '../../map-service/map.service';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from '../../map-service/map-actions/select-action';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { CodeValue } from '../../generic-class/code-vale';
import { RadiograficalModel } from './radiografical-model';
import { MemoryService } from '../../cache/memory.service';
import { InputParameter } from '../../api/request/input-parameter';
import * as moment from 'moment';
import { GlobalService } from '../../Globals/global.service';
declare var $: any;

@Component({
  selector: 'app-radiografical-test',
  templateUrl: './radiografical-test.component.html',
  styleUrls: ['./radiografical-test.component.css']
})
export class RadiograficalTestComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  subscription: Subscription;
  contractorValues: Array<CodeValue>;
  interventorValues: Array<CodeValue>;
  technicianValues: Array<CodeValue>;
  radiograficalModel: RadiograficalModel;
  arrModel: Array<RadiograficalModel>;
  radiograficalSelectType = OwnerSelection.RadiograficalTest;
  stationSelected: any;
  storeAction: string;
  indexArray = 0;
  countResult: string;
  pendingRequest: number;

  constructor(
    private mapService: MapService,
    private apiService: ApiService,
    private memoryService: MemoryService,
    private globals: GlobalService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.handleSelectAction(mapAction));
    this.contractorValues = new Array<CodeValue>();
    this.interventorValues = new Array<CodeValue>();
    this.technicianValues = new Array<CodeValue>();
    this.radiograficalModel = new RadiograficalModel();
    this.countResult = 'Seleccione';
  }

  ngOnInit() {
    this.disableControls(true);
  }

  private disableControls(evt: boolean) {
    if (evt) {
      $('#divControlsRadiografical *').attr('disabled', 'disabled');
    } else {
      $('#divControlsRadiografical *').removeAttr('disabled');
    }
  }

  ngAfterViewInit() {
    this.pendingRequest = 3;
    this.startProgress();
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerContratistas,
            []
          )
        )
        .subscribe(json => {
          this.pendingRequest--;
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.contractorValues.push(<CodeValue>{
                  Value: element.VALUE,
                  Code: element.CODE
                });
              });
            }
          }

          this.validatePendingRequest();
        });

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerInterventor,
            []
          )
        )
        .subscribe(json => {
          this.pendingRequest--;
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.interventorValues.push(<CodeValue>{
                  Value: element.VALUE,
                  Code: element.CODE
                });
              });
            }
          }
          this.validatePendingRequest();
        });

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerTecnico,
            []
          )
        )
        .subscribe(json => {
          this.pendingRequest--;
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.technicianValues.push(<CodeValue>{
                  Value: element.VALUE,
                  Code: element.CODE
                });
              });
            }
          }
          this.validatePendingRequest();
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  private validatePendingRequest() {
    if (this.pendingRequest <= 0) {
      this.stopProgress();
      this.stationSelected = this.globals.getStationSelect();
      if (this.stationSelected) {
        this.getAllRecords();
      }
    }
  }

  handleSelectAction(mapAction: SelectAction) {
    if (mapAction.owner === this.radiograficalSelectType) {
      if (mapAction.EMapAction === EmapActions.Select) {
        if (
          mapAction.selectActionType === SelectActionType.ViewSelectionResponse
        ) {
          // TODO validar mapAction.idLayer cuando se actualice la base de datos
          if (27 === parseInt(this.memoryService.getItem('EstacionLayerIndex'), null) || 
            32 === parseInt(this.memoryService.getItem('EstacionLayerIndex'), null)
          ) {
            this.fillElements(mapAction.selectedFeatures);
          } else {
            alert('Debe seleccionar una estación.');
          }
        }
      }
    }
  }

  private fillElements(selectFeatures: any) {
    this.stationSelected = selectFeatures[0];
    this.globals.setStationSelect(this.stationSelected);
    if (this.stationSelected) {
      this.getAllRecords();
    }
  }

  private getAllRecords() {
    try {
      this.startProgress();
      this.disableControls(true);
      this.storeAction = '';
      this.arrModel = null;
      this.radiograficalModel = new RadiograficalModel();
      this.indexArray = 0;
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerPruebaRadiologica,
            [
              new InputParameter(
                'un_Tag',
                this.stationSelected.attributes['TAG']
              )
            ]
          )
        )
        .subscribe(json => {
          try {
            this.setCountResult();
            if (json['1']) {
              const jsonTable = JSON.parse(json['1']);
              if (jsonTable['Table1']) {
                this.createArrayModel(jsonTable['Table1']);
              }
            }
          } catch (error) {
            console.log(error);
          } finally {
            this.stopProgress();
          }
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  private createArrayModel(evt: any) {
    if (evt && evt.length > 0) {
      this.arrModel = new Array<RadiograficalModel>();
      evt.forEach(element => {
        const keysObject = Object.keys(element);
        const valuesObject = Object.values(element);
        const modelNew = new RadiograficalModel();
        for (let i = 0; i < keysObject.length; i++) {
          modelNew[keysObject[i].toLowerCase()] = valuesObject[i];
        }
        modelNew.fecha = moment(modelNew.fecha).format('YYYY-MM-DD');
        this.arrModel.push(modelNew);
      });

      this.radiograficalModel = this.arrModel[0];
      this.setCountResult();
    }
  }

  executeFirstRow() {
    this.indexArray = 0;
    this.setModel();
  }

  executeNextRow() {
    this.indexArray++;
    this.setModel();
  }

  executePreviousRow() {
    this.indexArray--;
    this.setModel();
  }

  executeLastRow() {
    if (this.arrModel) {
      this.indexArray = this.arrModel.length - 1;
      this.setModel();
    }
  }

  private setCountResult() {
    if (this.arrModel) {
      this.countResult =
        (this.indexArray + 1).toString() +
        ' de ' +
        this.arrModel.length.toString();
    } else {
      this.countResult = 'Seleccione';
    }
  }
  private setModel() {
    if (this.arrModel) {
      if (this.indexArray < 0) {
        this.indexArray = 0;
      } else if (this.indexArray > this.arrModel.length - 1) {
        this.indexArray = this.arrModel.length - 1;
      }

      this.radiograficalModel = this.arrModel[this.indexArray];
      this.setCountResult();
    }
  }

  executeAddRow() {
    if (this.stationSelected) {
      this.disableControls(false);
      this.storeAction = 'insert';
      this.indexArray = 0;
      this.radiograficalModel = new RadiograficalModel();
      this.radiograficalModel.tag = this.stationSelected.attributes['TAG'];
      this.radiograficalModel.codigo = '';
    }
  }

  executeEditRow() {
    this.disableControls(false);
    this.storeAction = 'update';
  }

  executeDeleteRow() {
    if (confirm('Seguro desea eliminar este registro?')) {
      this.storeAction = 'delete';
      this.executeDBProcess();
    }
  }

  executeSaveRow() {
    this.radiograficalModel.fecha = moment(
      this.radiograficalModel.fecha
    ).format('DD/MM/YYYY');
    this.executeDBProcess();
  }

  executeCancel() {
    this.getAllRecords();
  }

  private executeDBProcess() {
    try {
      if (this.storeAction) {
        this.startProgress();
        const xml = this.GetXMLFromModel();
        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.ManejoPruebaRadiologica,
              [
                new InputParameter('xml_Params', xml),
                new InputParameter('procedimiento', this.storeAction)
              ]
            )
          )
          .subscribe(json => {
            alert(json['2']);
            this.getAllRecords();
          });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // TDODO: esto debe ser un metodo generico
  private GetXMLFromModel(): string {
    let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';
    const keysObject = Object.keys(this.radiograficalModel);
    const valuesObject = Object.keys(this.radiograficalModel).map(
      e => this.radiograficalModel[e]
    );

    for (let i = 0; i < keysObject.length; i++) {
      xmlValues += '<param>';
      xmlValues += '<name>' + keysObject[i] + '</name>';
      xmlValues += '<value>' + valuesObject[i] + '</value>';
      xmlValues += '</param>';
    }

    xmlValues += '</params>';
    return xmlValues;
  }

  private startProgress(): void {
    this.jqxLoader.open();
  }

  private stopProgress(): void {
    this.jqxLoader.close();
  }
}
