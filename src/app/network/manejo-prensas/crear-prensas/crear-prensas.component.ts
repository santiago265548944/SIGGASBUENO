import { Component, OnInit, ViewChild } from '@angular/core';
import { CrearPrensasModel } from './crear-prensas-model';
import { ApiService } from '../../../api/api.service';
import { RequestHelper } from '../../../api/request/request-helper';
import { StoreProcedures } from '../../../api/request/store-procedures.enum';
import { InputParameter } from '../../../api/request/input-parameter';
import * as moment from 'moment';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { GlobalService } from '../../../Globals/global.service';

@Component({
  selector: 'app-crear-prensas',
  templateUrl: './crear-prensas.component.html',
  styleUrls: ['./crear-prensas.component.css']
})
export class CrearPrensasComponent implements OnInit {
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;
  model: CrearPrensasModel;
  pipes: Array<any>;
  closeFunction: Function;
  postCreateFunction: Function;

  constructor(private apiService: ApiService,
    private globals: GlobalService) {
    this.model = new CrearPrensasModel();
  }

  ngOnInit() {
    this.fillPipes();
  }

  start(evt: Function) {
    if (evt != null) {
      this.postCreateFunction = evt;
      this.limpiarModel();
    }
  }

  private fillPipes(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerTuberiasPrensado,
          []
        )
      )
      .subscribe(json => {
        this.fillPipesCompleted(json);
      });
  }

  private fillPipesCompleted(json: any): void {
    const values = Object.values(json);
    if (values.length > 0) {
      const result = JSON.parse(values[0].toString());
      if (result['Table1'] != null) {
        this.pipes = result['Table1'].map(element => ({
          value: element['VALORPARAMETRO'],
          text: element['NOMBREPARAMETRO']
        }));
      }
    }
  }

  onAceptarClickHandler(): void {
    this.createPrensa();
  }

  private createPrensa() {
    if (
      this.model.CantidadPrensas != null &&
      this.model.FechaEmergencia != null
    ) {
      this.startProgress();
      const fechaEmergencia = moment(this.model.FechaEmergencia).format(
        'DD/MM/YYYY'
      );
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.CrearPrensa,
            [
              new InputParameter(
                'una_Descripcion',
                this.model.DespcripcionEmergencia
              ),
              new InputParameter('una_Fecha', fechaEmergencia),
              new InputParameter('una_Cantidad', this.model.CantidadPrensas)
            ]
          )
        )
        .subscribe(json => {
          this.crearPrensaCompleted(json);
        });
    }
  }

  private crearPrensaCompleted(json: any) {
    this.stopProgress();
    const values = Object.values(json);
    if (values[0] !== '-1') {
      const arrPrensas = new Array;
      for (let i = 1; i <= this.model.CantidadPrensas; i++) {
        arrPrensas.push(i);
      }

      this.globals.setManejoPrensas(arrPrensas,
        values[0], this.model.Tuberia, 0,
        +this.model.CantidadPrensas, true);

      alert('Registro de prensa creado satisfactoriamente.');
      if (this.postCreateFunction != null) {
        this.postCreateFunction();
      }
    } else {
      alert('Ocurrió un problema al crear la prensa..');
    }
    this.closeFunction();
  }

  private limpiarModel() {
    if (this.model != null) {
      this.model.CantidadPrensas = null;
      this.model.DespcripcionEmergencia = null;
      this.model.FechaEmergencia = null;
      this.model.Tuberia = null;
    }
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

  onCancelarClickHandler(): void {
    this.closeFunction();
  }
}
