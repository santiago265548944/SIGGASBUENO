import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { RestablecerServicioModel } from './restablecer-servicio-model';
import { InputParameter } from '../../api/request/input-parameter';
import { MemoryService } from '../../cache/memory.service';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';

@Component({
  selector: 'app-restablecer-servicio',
  templateUrl: './restablecer-servicio.component.html',
  styleUrls: ['./restablecer-servicio.component.css']
})
export class RestablecerServicioComponent implements OnInit {
  faultTypes: Array<any>;
  causeTypes: Array<any>;
  model: RestablecerServicioModel;
  closeFunction: Function;
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;

  constructor(
    private apiService: ApiService,
    private memoryService: MemoryService
  ) {
    this.model = new RestablecerServicioModel();
  }

  ngOnInit() {
    this.fillFaultTypes();
    this.fillCauseTypes();
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

  private fillCauseTypes(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerTiposCausas,
          []
        )
      )
      .subscribe(json => {
        this.fillCauseTypesCompleted(json);
      });
  }

  private fillCauseTypesCompleted(json): void {
    const result = this.handleErrorResponse(json);
    if (result != null) {
      if (result['Table1']) {
        this.causeTypes = result['Table1'].map(item => {
          const obj = {
            value: item.CAUSAL_ID,
            text: item.DESCRIPTION
          };
          return obj;
        });
      }
    }
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

  onAceptarClickHandler(): void {
    if (this.validateRestablecerServicio()) {
      this.startProgress();
      const inputParameters = this.createRestablecerPermisosParameters();

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ReestablecerServicio,
            inputParameters
          )
        )
        .subscribe(json => {
          this.stopProgress();
          this.restablecerServicioCompleted(json);
        });
    }
  }

  private createRestablecerPermisosParameters(): InputParameter[] {
    const inputParameters = new Array<InputParameter>();
    inputParameters.push(
      new InputParameter('inuFaultId', Number(this.model.IdFalla))
    );
    inputParameters.push(
      new InputParameter('inuFaultTypeId', Number(this.model.TipoFalla.value))
    );
    inputParameters.push(
      new InputParameter('inuCauseId', Number(this.model.IdCausa.value))
    );
    inputParameters.push(
      new InputParameter('idtOutageEnd', this.model.FechaFinFormat)
    );

    // TODO: Activar el if cuando se tenga claridad de configuraciones por cliente
    // if (this.memoryService.getItem('CutServices')) {
    inputParameters.push(
      new InputParameter('una_justificacion', this.model.Justificacion)
    );
    // }

    return inputParameters;
  }
  private validateRestablecerServicio(): boolean {
    let result = true;
    if (this.model.IdFalla == null || this.model.IdFalla === '') {
      result = false;
    }

    if (this.model.TipoFalla == null) {
      result = false;
    }

    if (this.model.IdCausa == null) {
      result = false;
    }

    if (this.model.FechaFin == null || this.model.FechaFin === '') {
      result = false;
    }

    if (!result) {
      alert('Debe completar la información de todos los campos.');
    }

    return result;
  }

  private restablecerServicioCompleted(json): void {
    // TODO: manipular resultado cuando se pueda obtener
    console.log(json);
    const values = Object.values(json);
    if (values != null && values.length > 0) {
      const result = JSON.parse(values[0].toString());
      if (!result['ErrorMessage']) {
        this.model = new RestablecerServicioModel();
        alert('Se ha restablecido el servicio correctamente. Cantidad: ' + values[2]);
      } else {
        alert(result['ErrorMessage']);
      }
    }
  }

  start(): void {
    this.model.clear();
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
