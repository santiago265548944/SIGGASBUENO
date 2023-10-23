import { Component } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';

@Component({
  selector: 'app-father-order',
  templateUrl: './father-order.component.html',
  styleUrls: ['./father-order.component.css']
})
export class FatherOrderComponent {
  ordenPadre: any;
  codigoSector: any;

  constructor(private apiService: ApiService) { }

  btnCrearOrdenPadre(): void {
    if (
      this.ordenPadre !== undefined && this.ordenPadre !== null &&
      this.codigoSector !== undefined && this.codigoSector !== null
    ) {
      const m = new Date();
      const fecha = `${('0' + m.getUTCDate()).slice(-2)}/${('0' + (m.getUTCMonth() + 1)).slice(-2)}/${m.getUTCFullYear()}`;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.RegistraOrdenPadre,
            [
              new InputParameter('orden', this.ordenPadre),
              new InputParameter('fecha', fecha),
              new InputParameter('sector', this.codigoSector)
            ]
          )
        )
        .subscribe(json => {
          if (json[3]) {
            this.start();
            alert('Orden padre creada.');
          }
        });
    } else {
      alert('Debe ingresar una orden padre y un código de sector.');
    }
  }

  start(): void {
    this.ordenPadre = null;
    this.codigoSector = null;
  }
}
