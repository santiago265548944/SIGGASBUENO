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
import { MemoryService } from '../../cache/memory.service';
import { InputParameter } from '../../api/request/input-parameter';
import { GlobalService } from '../../Globals/global.service';
import { ModificationModel } from './modification-model';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-modification',
  templateUrl: './modification.component.html',
  styleUrls: ['./modification.component.css']
})
export class ModificationComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  subscription: Subscription;
  departmentValues: Array<CodeValue>;
  cityValues: Array<CodeValue>;
  modificationModel: ModificationModel;
  arrModel: Array<ModificationModel>;
  modificationSelectType = OwnerSelection.stationModification;
  stationSelected: any;
  storeAction: string;
  indexArray = 0;
  countResult: string;

  constructor(
    private mapService: MapService,
    private apiService: ApiService,
    private memoryService: MemoryService,
    private globals: GlobalService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.handleSelectAction(mapAction));
    this.departmentValues = new Array<CodeValue>();
    this.cityValues = new Array<CodeValue>();
    this.modificationModel = new ModificationModel();
    this.countResult = 'Seleccione';
  }

  ngOnInit() {
    this.disableControls(true);
  }

  private disableControls(evt: boolean) {
    if (evt) {
      $('#divControlsModificacion *').attr('disabled', 'disabled');
    } else {
      $('#divControlsModificacion *').removeAttr('disabled');
    }
  }

  ngAfterViewInit() {
    this.startProgress();

    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerDepartamentos,
            []
          )
        )
        .subscribe(json => {
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.departmentValues.push(<CodeValue>{
                  Value: element.NOMBRE,
                  Code: element.CODIGO.toString()
                });
              });
            }
          }
          this.stopProgress();
          this.stationSelected = this.globals.getStationSelect();
          if (this.stationSelected) {
            this.getAllRecords();
          }
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  onDepartmentChange(evt: string) {
    this.startProgress();
    this.cityValues = new Array<CodeValue>();
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerLocalidades,
            [new InputParameter('un_Departamento', evt)]
          )
        )
        .subscribe(json => {
          if (json['1']) {
            const jsonTable = JSON.parse(json['1']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.cityValues.push(<CodeValue>{
                  Value: element.NOMBRE,
                  Code: element.CODIGO.toString()
                });
              });
            }
          }
          this.stopProgress();
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  handleSelectAction(mapAction: SelectAction) {
    if (mapAction.owner === this.modificationSelectType) {
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
      this.modificationModel = new ModificationModel();
      this.indexArray = 0;
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerModificaciones,
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
    }
  }

  private createArrayModel(evt: any) {
    if (evt && evt.length > 0) {
      this.arrModel = new Array<ModificationModel>();
      evt.forEach(element => {
        const keysObject = Object.keys(element);
        const valuesObject = Object.keys(element).map(e => element[e]);
        const modelNew = new ModificationModel();
        for (let i = 0; i < keysObject.length; i++) {
          modelNew[keysObject[i].toLowerCase()] = valuesObject[i];
        }
        modelNew.fechamodificacion = moment(modelNew.fechamodificacion).format(
          'YYYY-MM-DD'
        );
        this.arrModel.push(modelNew);
      });

      this.setModel();
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

      this.modificationModel = this.arrModel[this.indexArray];
      this.onDepartmentChange(this.modificationModel.departamento);
      this.setCountResult();
    }
  }

  executeAddRow() {
    if (this.stationSelected) {
      this.disableControls(false);
      this.storeAction = 'insert';
      this.indexArray = 0;
      this.modificationModel = new ModificationModel();
      this.modificationModel.tag = this.stationSelected.attributes['TAG'];
      this.modificationModel.codigo = '';
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
    this.modificationModel.fechamodificacion = moment(
      this.modificationModel.fechamodificacion
    ).format('DD/MM/YYYY');
    this.executeDBProcess();
  }

  executeCancel() {
    this.getAllRecords();
  }

  private executeDBProcess() {
    if (this.storeAction) {
      this.startProgress();
      try {
        const xml = this.GetXMLFromModel();
        console.log(xml);
        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.ManejoModificaciones,
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
      } catch (error) {
        console.log(error);
      }
    }
  }

  // TDODO: esto debe ser un metodo generico
  private GetXMLFromModel(): string {
    let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';
    const keysObject = Object.keys(this.modificationModel);
    const valuesObject = Object.keys(this.modificationModel).map(
      e => this.modificationModel[e]
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
