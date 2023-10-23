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
import { MemoryService } from '../../cache/memory.service';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { PNeumaticModel } from './pneumatic-model';
import { CodeValue } from '../../generic-class/code-vale';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import * as moment from 'moment';
import { GlobalService } from '../../Globals/global.service';
declare var $: any;

@Component({
  selector: 'app-pneumatic-test',
  templateUrl: './pneumatic-test.component.html',
  styleUrls: ['./pneumatic-test.component.css']
})
export class PneumaticTestComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  pneumaticTestSelectType = OwnerSelection.pNeumaticTest;
  subscription: Subscription;
  pNeumaticModel: PNeumaticModel;
  contractorValues: Array<CodeValue>;
  manufacturerValues: Array<CodeValue>;
  pipelineValues: Array<CodeValue>;
  qualityValues: Array<CodeValue>;
  testValues: Array<CodeValue>;
  inspectorValues: Array<CodeValue>;
  contratanteValues: Array<CodeValue>;
  welderValues: Array<CodeValue>;
  stationSelected: any;
  storeAction: string;
  indexArray = 0;
  countResult: string;
  arrModel: Array<PNeumaticModel>;
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
    this.manufacturerValues = new Array<CodeValue>();
    this.pipelineValues = new Array<CodeValue>();
    this.qualityValues = new Array<CodeValue>();
    this.testValues = new Array<CodeValue>();
    this.inspectorValues = new Array<CodeValue>();
    this.contratanteValues = new Array<CodeValue>();
    this.welderValues = new Array<CodeValue>();
    this.pNeumaticModel = new PNeumaticModel();
    this.countResult = 'Seleccione';
  }

  ngOnInit() {
    this.disableControls(true);
  }

  ngAfterViewInit() {
    this.pendingRequest = 8;
    this.startProgress();
    this.loadList(StoreProcedures.ObtenerContratistas);
    this.loadList(StoreProcedures.Obtienefabricante);
    this.loadList(StoreProcedures.Obtienetuberias);
    this.loadList(StoreProcedures.Obtienecalidad);
    this.loadList(StoreProcedures.Obtienemedioprueba);
    this.loadList(StoreProcedures.Obtienecontratante);
    this.loadList(StoreProcedures.Obtieneinterventor);
    this.loadList(StoreProcedures.Obtienesoldador);
  }

  private loadList(procedure: string) {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(procedure, [])
      )
      .subscribe(json => {
        this.pendingRequest--;
        if (json['0']) {
          const jsonTable = JSON.parse(json['0']);
          if (jsonTable['Table1']) {
            jsonTable['Table1'].forEach(element => {
              switch (procedure) {
                case StoreProcedures.ObtenerContratistas:
                  this.contractorValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
                case StoreProcedures.Obtienefabricante:
                  this.manufacturerValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
                case StoreProcedures.Obtienetuberias:
                  this.pipelineValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
                case StoreProcedures.Obtienecalidad:
                  this.qualityValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
                case StoreProcedures.Obtienemedioprueba:
                  this.testValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
                case StoreProcedures.Obtienecontratante:
                  this.contratanteValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
                case StoreProcedures.Obtieneinterventor:
                  this.inspectorValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
                case StoreProcedures.Obtienesoldador:
                  this.welderValues.push(<CodeValue>{
                    Value: element.VALUE,
                    Code: element.CODE
                  });
                  break;
              }
            });
          }
        }

        if (this.pendingRequest <= 0) {
          this.stopProgress();
          this.stationSelected = this.globals.getStationSelect();
          if (this.stationSelected) {
            this.getAllRecords();
          }
        }
      });
  }

  handleSelectAction(mapAction: SelectAction) {
    if (mapAction.owner === this.pneumaticTestSelectType) {
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

      this.pNeumaticModel = this.arrModel[this.indexArray];
      this.setCountResult();
    }
  }

  executeAddRow() {
    if (this.stationSelected) {
      this.disableControls(false);
      this.storeAction = 'insert';
      this.indexArray = 0;
      this.pNeumaticModel = new PNeumaticModel();
      this.pNeumaticModel.tag = this.stationSelected.attributes['TAG'];
      this.pNeumaticModel.codigo = '';
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
    this.pNeumaticModel.fechafinalizacion = moment(
      this.pNeumaticModel.fechafinalizacion
    ).format('DD/MM/YYYY');
    this.pNeumaticModel.fechainiciacion = moment(
      this.pNeumaticModel.fechainiciacion
    ).format('DD/MM/YYYY');
    this.executeDBProcess();
  }

  executeCancel() {
    this.getAllRecords();
  }

  private getAllRecords() {
    try {
      this.startProgress();
      this.disableControls(true);
      this.storeAction = '';
      this.arrModel = null;
      this.pNeumaticModel = new PNeumaticModel();
      this.indexArray = 0;
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerPruebaNeumatica,
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

  // TDODO: esto debe ser un metodo generico
  private executeDBProcess() {
    try {
      if (this.storeAction) {
        this.startProgress();
        const xml = this.GetXMLFromModel();
        this.apiService
          .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
              StoreProcedures.ManejoPruebaNeumatica,
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
      this.stopProgress();
    }
  }

  private createArrayModel(evt: any) {
    if (evt && evt.length > 0) {
      this.arrModel = new Array<PNeumaticModel>();
      evt.forEach(element => {
        const keysObject = Object.keys(element);
        const valuesObject = Object.keys(element).map(e => element[e]);
        const modelNew = new PNeumaticModel();
        for (let i = 0; i < keysObject.length; i++) {
          modelNew[keysObject[i].toLowerCase()] = valuesObject[i];
        }
        modelNew.fechafinalizacion = moment(modelNew.fechafinalizacion).format(
          'YYYY-MM-DD'
        );
        modelNew.fechainiciacion = moment(modelNew.fechainiciacion).format(
          'YYYY-MM-DD'
        );
        this.arrModel.push(modelNew);
      });

      this.pNeumaticModel = this.arrModel[0];
      this.setCountResult();
    }
  }

  private GetXMLFromModel(): string {
    let xmlValues = '<?xml version="1.0" encoding="utf-16"?><params>';
    const keysObject = Object.keys(this.pNeumaticModel);
    const valuesObject = Object.keys(this.pNeumaticModel).map(
      e => this.pNeumaticModel[e]
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

  private disableControls(evt: boolean) {
    if (evt) {
      $('#divControlsPneumatic *').attr('disabled', 'disabled');
    } else {
      $('#divControlsPneumatic *').removeAttr('disabled');
    }
  }

  private startProgress(): void {
    this.jqxLoader.open();
  }

  private stopProgress(): void {
    this.jqxLoader.close();
  }
}
