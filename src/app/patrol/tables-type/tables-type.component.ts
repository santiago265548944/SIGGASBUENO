import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';

@Component({
  selector: 'app-tables-type',
  templateUrl: './tables-type.component.html',
  styleUrls: ['./tables-type.component.css']
})
export class TablesTypeComponent implements OnInit {
  listTablesType: any;
  listTypePause: any;
  newType: any;
  description: any;
  nameTable: any;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadTablesType();
  }

  loadTablesType(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarTablasT,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadTablesTypeCompleted(JSON.parse(json[0]));
        }
      });
  }

  loadTablesTypeCompleted(json: any): void {
    if (json['Table1']) {
      this.listTablesType = json['Table1'];
    }
  }

  loadTypePause(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarTablasTipos,
          [new InputParameter('tablaTipo', this.nameTable)]
        )
      )
      .subscribe(json => {
        if (json[1] != null) {
          this.loadTypePauseCompleted(JSON.parse(json[1]));
        }
      });
  }

  loadTypePauseCompleted(json: any): void {
    if (json['Table1']) {
      this.listTypePause = json['Table1'];
    }
  }

  onAdd(): void {
    if (this.nameTable) {

      if (this.newType && this.description) {
        this.addTypePause();
        this.cleanTypePause();
      } else {
        alert('Debe llenar todos los campos.');
      }

    } else {
      alert('Debe seleccionar una tabla.');
    }

  }

  addTypePause(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.CrearTablasTipos,
          [
            new InputParameter('tablasTipo', this.nameTable),
            new InputParameter('tipoT', this.newType),
            new InputParameter('descripcionTIPO', this.description)
          ]
        )
      )
      .subscribe(json => {
        if (json[3] === 'ORA-00001: unique constraint (SIGGAS.PK1) violated') {
          alert('El nuevo tipo ya existe.');
        } else {
          alert(json[3]);
          this.loadTypePause();
        }
      });
  }

  cleanTypePause(): void {
    if (this.newType || this.description) {
      this.newType = null;
      this.description = null;
    }
  }

  start(): void {
    this.loadTablesType();
    this.newType = null;
    this.description = null;
    this.listTypePause = null;
  }

}
