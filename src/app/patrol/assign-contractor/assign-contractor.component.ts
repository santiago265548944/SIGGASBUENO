import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';

@Component({
  selector: 'app-assign-contractor',
  templateUrl: './assign-contractor.component.html',
  styleUrls: ['./assign-contractor.component.css']
})
export class AssignContractorComponent implements OnInit {
  listarDepartamentos: any;
  departamentoSeleccionado: any;
  listarUnidadesOperativas: any;
  unidadOperativaSeleccionada: any;
  listarContratistas: any;
  contratistaSeleccionado: any;
  listarOrdenPadre: any;
  ordenPadreSeleccionada: any;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadDepartamento();
    this.loadOrdenPadre();
  }

  loadDepartamento(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.Departamento,
          []
        )
      )
      .subscribe(json => {
        if (json[0]) {
          this.loadDepartamentoCompleted(JSON.parse(json[0]));
        }
      });
  }

  loadDepartamentoCompleted(json: any): void {
    if (json['Table1']) {
      this.listarDepartamentos = json['Table1'];
    }
  }

  loadUnidadOperativa(event: any): void {
    const codDepartamento = event.CODIGO;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerUnidades,
          [
            new InputParameter('undepartamento', codDepartamento)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadUnidadOperativaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadUnidadOperativaCompleted(json: any): void {
    if (json['Table1']) {
      this.listarUnidadesOperativas = json['Table1'];
    }
  }

  loadContratista(event: any): void {
    const codUnidadOperativa = event.OPERATING_UNIT_ID;

    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ContratistaxUniOperativa,
          [
            new InputParameter('uniOperativa', codUnidadOperativa)
          ]
        )
      )
      .subscribe(json => {
        if (json[1]) {
          this.loadContratistaCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadContratistaCompleted(json: any): void {
    if (json['Table1']) {
      this.listarContratistas = json['Table1'];
    }
  }

  loadOrdenPadre(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.OrdenesPadreSinContratista,
          []
        )
      )
      .subscribe(json => {
        if (json[0]) {
          this.loadOrdenPadreCompleted(JSON.parse(json[0]));
        }
      });
  }

  loadOrdenPadreCompleted(json: any): void {
    if (json['Table1']) {
      this.listarOrdenPadre = json['Table1'];
    }
  }

  btnAsignar(): void {
    if (
      this.ordenPadreSeleccionada !== null && this.ordenPadreSeleccionada !== '' &&
      this.contratistaSeleccionado !== null && this.contratistaSeleccionado !== ''
    ) {
      const codContratista = this.contratistaSeleccionado.COD_CONTRATISTA;

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.AsociarContratistaOrdenPadre,
            [
              new InputParameter('orden', this.ordenPadreSeleccionada),
              new InputParameter('contratista', codContratista)
            ]
          )
        )
        .subscribe(json => {
          if (json[2]) {
            this.start();
            alert('Contratista asignado correctamente.');
          }
        });
    } else {
      alert('Debe seleccionar un contratista y una orden padre.');
    }
  }

  start(): void {
    this.listarUnidadesOperativas = null;
    this.listarContratistas = null;
    this.listarOrdenPadre = null;
    this.departamentoSeleccionado = null;
    this.unidadOperativaSeleccionada = null;
    this.contratistaSeleccionado = null;
    this.ordenPadreSeleccionada = null;
    this.loadOrdenPadre();
  }
}
