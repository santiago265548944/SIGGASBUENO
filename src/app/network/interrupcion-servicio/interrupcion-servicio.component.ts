import { Component, OnInit, ViewChild } from '@angular/core';
import { InterrupcionServicioModel } from './interrupcion-servicio-model';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';

@Component({
  selector: 'app-interrupcion-servicio',
  templateUrl: './interrupcion-servicio.component.html',
  styleUrls: ['./interrupcion-servicio.component.css']
})
export class InterrupcionServicioComponent implements OnInit {
 @ViewChild('jqxLoader')  jqxLoader: jqxLoaderComponent;
  model: InterrupcionServicioModel;
  faultTypes: Array<any>;
  origenesSuspension: Array<any>;
  mediosComunicacion: Array<any>;
  closeFunction: Function;
  showDivProgramadaDependent: boolean;

  constructor(private apiService: ApiService) {
    this.model = new InterrupcionServicioModel();
  }

  ngOnInit() {
    this.fillFaultTypes();
    this.fillOrigenSuspension();
    this.fillMediosComunicacion();
  }

  start(): void {
    this.clear();
  }

  private fillFaultTypes(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerTipoFallas,
          []
        )
      )
      .subscribe(json => {
        this.fillFaultTypesCompleted(json);
      });
  }

  private fillFaultTypesCompleted(json): void {
    const result = this.handleErrorResponse(json);
    if (result != null) {
      if (result['Table1']) {
        this.faultTypes = result['Table1'].map(item => {
          const obj = {
            value: item.DAMAGE_TYPE_ID,
            text: item.DESCRIPTION
          };
          return obj;
        });
      }
    }
  }

  private fillOrigenSuspension(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.OrigenSuspension,
          []
        )
      )
      .subscribe(json => {
        this.fillOrigenSuspensionCompleted(json);
      });
  }

  private fillOrigenSuspensionCompleted(json): void {
    const result = this.handleErrorResponse(json);
    if (result != null) {
      if (result['Table1']) {
        this.origenesSuspension = result['Table1'].map(item => {
          const obj = {
            value: item.CODIGO,
            text: item.DESCRIPCION
          };
          return obj;
        });
      }
    }
  }

  private fillMediosComunicacion(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.MediosComunicacion,
          []
        )
      )
      .subscribe(json => {
        this.fillMediosComunicacionCompleted(json);
      });
  }

  private fillMediosComunicacionCompleted(json): void {
    const result = this.handleErrorResponse(json);
    if (result != null) {
      if (result['Table1']) {
        this.mediosComunicacion = result['Table1'].map(item => {
          const obj = {
            value: item.CODIGO,
            text: item.DESCRIPCION
          };
          return obj;
        });
      }
    }
  }

  programadaChangeHandler(evt: any): void {
    this.showDivProgramadaDependent = evt === 'Y';
  }

  private handleErrorResponse(json): any {
    const values = Object.values(json);

    if (values != null && values.length > 0) {
      const result = JSON.parse(values[0].toString());
      if (!result['ErrorMessage']) {
        return result;
      } else {
        alert(result['ErrorMessage']);
      }
    }
    return null;
  }

  private clear(): void {
    this.model = new InterrupcionServicioModel();
    this.showDivProgramadaDependent = false;
  }

  onAceptarClickHandler(): void {
    if (this.validateSave()) {
        this.startProgress();
      const parameters = this.getSaveParameters();
      this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.FueraServicio,
          parameters
        )
      )
      .subscribe(json => {
          this.stopProgress();
        this.saveCompleted(json);
      });
    }
  }

  saveCompleted(json: any): any {
    console.log(json);
    const values = Object.values(json);
    if (values != null && values.length > 0) {
      const result = JSON.parse(values[0].toString());
      if (!result['ErrorMessage']) {
        this.model = new InterrupcionServicioModel();
        alert('Interrupción correcta, Código:  ' + values[0] + ', cantidad afectados: ' + values[3]);
      } else {
        alert(result['ErrorMessage']);
      }
    }
  }

  private validateSave(): boolean {
    let result = true;
    if (this.model.TipoFalla == null) {
      result = false;
    }
    if (this.model.NumeroOrden == null) {
      result = false;
    }

    if (result === false) {
      alert(
        'Debe completar la información del tipo de falla y código de la falla.'
      );
    }

    return result;
  }

  private getSaveParameters(): Array<InputParameter> {
    const parameters = new Array<InputParameter>();

    parameters.push(
      new InputParameter('inuFaultTypeId', this.model.TipoFalla.value)
    );
    parameters.push(new InputParameter('InuOrderId', this.model.NumeroOrden));
    parameters.push(
      new InputParameter('inuTime', this.model.TiempoEstimadoSuspension)
    );
    parameters.push(new InputParameter('isbScheduled', this.model.Programada));
    parameters.push(new InputParameter('isbComment', this.model.Observacion));

    // TODO: Activar el if cuando se tenga claridad de configuraciones por cliente
    // if (this.memoryService.getItem('CutServices')) {

    if (this.model.Programada === 'Y') {
      parameters.push(
        new InputParameter('isbOrigen', this.model.OrigenSuspension.value)
      );
      parameters.push(
        new InputParameter(
          'isbComunicacion',
          this.model.MedioComunicacion.value
        )
      );
      parameters.push(
        new InputParameter(
          'idtFechahoraSuspension',
          this.model.FechaHoraProgramadaSuspension
        )
      );
      parameters.push(
        new InputParameter(
          'inuDuracionSuspHora',
          this.model.DuracionProgramadaSuspension
        )
      );
    }
    // }

    return parameters;
  }

  onCancelarClickHandler(): void {
    this.closeFunction();
  }

  private startProgress(): void {
    if (this.jqxLoader) {
      this.jqxLoader.open();
    }
  }

  private stopProgress(): void {
    if (this.jqxLoader) {
      this.jqxLoader.close();
    }
  }
}
