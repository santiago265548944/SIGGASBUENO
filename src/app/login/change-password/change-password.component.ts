import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { MemoryService } from '../../cache/memory.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  closeFunction: Function;
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  model: any;
  userName: any;
  isAdmin: boolean;

  constructor(private apiService: ApiService, private memoryService: MemoryService) {
    this.model = {};
  }

  ngOnInit() {
  }

  start(evt: any) {
    this.model = {};
    this.userName = evt.data;
    this.isAdmin = evt.isAdmin;
  }

  onCancelarClick(): void {
    this.model = {};
    this.closeFunction();
  }

  onAceptarClick(): void {
    if (this.validarContrasenia()) {
      this.startProgress();
      this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.CambiarContrasenia,
          [new InputParameter('un_usuario', this.userName)
          , new InputParameter('una_contrasena', this.model.NuevaContrasenia)]
        )
      )
      .subscribe(json => {
        this.postCambiarContrasenia(json);
      });
    }
  }

  private postCambiarContrasenia(json: any): any {
    const result = this.handleErrorResponse(json);
    if (result != null) {
      alert('La contraseña fue cambiada exitosamente!');
      this.closeFunction();
    }
  }

  private validarContrasenia(): boolean {
    let result = true;
    if (!this.isAdmin && this.memoryService.getItem('currentPass') !== this.model.ContraseniaActual) {
      alert('La contraseña actual es incorrecta.');
      result = false;
    } else if (this.model.NuevaContrasenia !== this.model.RepeticionNuevaContrasenia) {
      alert('Las nuevas contraseñas deben coincidir.');
      result = false;
    }
    return result;
  }

  private handleErrorResponse(json): any {
    this.stopProgress();
    const values = Object.keys(json).map(key => json[key]);
    if (values != null && values.length > 0) {
      const result = typeof(values[0]) === 'string' && values[0].indexOf('}') > 0 ? JSON.parse(values[0].toString()) : values[0];
      if (!result['ErrorMessage']) {
        return result;
      } else {
        alert(result['ErrorMessage']);
      }
    }
    return null;
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
