import { Component, OnInit, EventEmitter } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { CrearEquipoModel } from './crear-equipo-model';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import * as moment from 'moment';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  dataAdapter: any;
  listElements: any;
  selectedElement: any;
  dataTableColumns: Array<any>;
  RowSelected = new EventEmitter();
  cod: any;
  fecha: any;
  disabled: boolean;
  model: CrearEquipoModel;
  modi = true;
  adicio = true;
  botonCancelar = false;
  m = new Date();
  fechaActual = `${this.m.getUTCFullYear()}-${('0' + (this.m.getUTCMonth() + 1)).slice(-2)}-${('0' + this.m.getUTCDate()).slice(-2)}`;

  constructor(private apiService: ApiService) {
    this.model = new CrearEquipoModel();
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
  }

  ngOnInit() {
    this.loadList();
  }

  private loadList(): any {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListarEquipo,
          []
        )
      )
      .subscribe(json => {
        if (json[0]) {
          this.loadListTeamCompleted(json);
          this.toggleBotton1(false);
        }
      });
  }

  private loadListTeamCompleted(jsonResult: any): void {
    if (jsonResult['0']) {
      const jsonTable = JSON.parse(jsonResult['0']);

      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        ResultToGraphicCollection.convert(jsonTable['Table1'], results => {
          this.loadGrid(results);
        });
      }
    }
  }

  private loadGrid(selectedGraphics: any) {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.listElements = selectedGraphics;
      this.clearGrid();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumns(selectedGraphics);
        this.prepareDataTableSource(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumns(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSource(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  private clearGrid(): void {
    if (this.dataAdapter != null) {
      this.dataAdapter = new jqx.dataAdapter({});
    }

    if (this.dataTableColumns != null) {
      this.dataTableColumns = new Array<any>();
    }
  }

  tableOnRowSelect(event: any): void {
    this.disabled = true;
    this.botonCancelar = true;
    this.toggleBotton(false);
    this.toggleBotton1(true);

    this.selectedElement = this.listElements[event.args.index];
    this.RowSelected.emit(this.selectedElement);
    this.cod = this.selectedElement.attributes.SERIAL_EQUIPO;
    const fechaEquipo = moment(this.selectedElement.attributes.VIGENCIA_CALIB).format('YYYY-MM-DD');
    this.fecha = fechaEquipo;
  }

  onAdicionar(): void {
    if (this.validate(true)) {
      this.createTeam();
    }
  }

  private validate(showMessages: boolean): boolean {
    const messages = new Array<string>();

    if (this.model.CodigoEquipo == null) {
      messages.push('Debe ingresar un equipo.');
    }

    if (this.model.FechaCalibracion == null) {
      messages.push('Debe ingresar una fecha calibración.');
    }

    if (messages.length > 0 && showMessages === true) {
      alert(messages.join('\n'));
    }

    return messages.length === 0;
  }

  private createTeam(): void {
    if (this.model.CodigoEquipo != null && this.model.FechaCalibracion != null) {
      const fechaEquipo = moment(this.model.FechaCalibracion).format('YYYY-MM-DD');

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.AdicionarEquipo,
            [
              new InputParameter('codigo', this.model.CodigoEquipo),
              new InputParameter('fecha', fechaEquipo)
            ]
          )
        )
        .subscribe(json => {
          if (json[2]) {
            this.createTeamCompleted1(json);
          }
        });
    }
  }

  private createTeamCompleted1(json: any): void {
    const values = Object.values(json);

    if (values[0] === 'ORA-00001: unique constraint (SIGGAS.PTJ_EQUIPOS_DET_PK) violated') {
      alert('El código del equipo ya existe.');
    } else {
      this.loadList();
      this.start();
      alert(values[0]);
    }
  }

  onModificarClickHandler(): void {
    this.toggleBotton(false);

    if (this.cod != null && this.model.FechaCalibracion != null) {

      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ModificarEquipo,
            [
              new InputParameter('codigo', this.cod),
              new InputParameter('fecha', this.model.FechaCalibracion)
            ]
          )
        )
        .subscribe(json => {
          if (json[2]) {
            this.modificarCompleted();
          }
        });

    } else {
      this.disabled = false;
      this.toggleBotton(true);
      this.toggleBotton1(false);

      this.loadList();
      this.start();
      alert('La fecha no fue modificada');
    }
  }

  private modificarCompleted(): void {
    this.toggleBotton(false);

    if (this.fecha != null || this.cod != null) {
      this.disabled = false;
      this.toggleBotton(true);

      this.loadList();
      alert('La fecha fue modificada correctamente ' + this.model.FechaCalibracion);
      this.start();
    } else {
      this.disabled = false;

      this.loadList();
      alert('Ocurrió un problema al modificar un equipo.');
      this.start();
    }
  }

  onCancelar(): void {
    this.start();
  }

  toggleBotton(arg: boolean) {
    this.modi = arg;
  }

  toggleBotton1(arg: boolean) {
    this.adicio = arg;
  }

  start(): void {
    this.disabled = false;
    this.botonCancelar = false;
    this.loadList();
    this.toggleBotton(true);
    this.toggleBotton1(false);
    this.cod = null;
    this.fecha = null;
    this.model.CodigoEquipo = null;
    this.model.FechaCalibracion = null;
  }
}
