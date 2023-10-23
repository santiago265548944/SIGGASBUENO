import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';

@Component({
  selector: 'app-mailing-list',
  templateUrl: './mailing-list.component.html',
  styleUrls: ['./mailing-list.component.css']
})
export class MailingListComponent implements OnInit {
  dataAdapter: any;
  listElements: any;
  selectedElement: any;
  dataTableColumns: Array<any>;
  nombre: any;
  checkBox: any;
  listMailing: any;
  dano: boolean;
  fuga: boolean;
  fraude: boolean;
  ubicacion: boolean;
  botonE = true;
  display = true;
  botonC = false;
  checkedV0 = false;
  checkedV1 = false;
  checkedV2 = false;
  checkedV3 = false;
  botonAdicionar = false;
  personasA: any;
  codPersona: any;
  codigoPersona: any;
  codigoEliminarA: any;

  constructor(private apiService: ApiService) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
  }

  ngOnInit() {
    this.loadList();
    this.loadMailing();
  }

  private loadList(): any {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ListaAlertaPersona,
          []
        )
      )
      .subscribe(json => {
        this.loadListTeamCompleted(json);
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
    const index = [];
    let i = 0;

    for (index[i++] in firstGraphic.attributes) {

    }

    const lista1 = index[1];
    const lista2 = index[2];
    const lista3 = index[3];
    const lista4 = index[4];
    const lista5 = index[5];
    const resultadoLista = [lista1, lista2, lista3, lista4, lista5];

    for (const key of resultadoLista) {
      this.dataTableColumns.push({ text: key, dataField: key });
    }
  }

  prepareDataTableSource(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      const prueba = Object.values(element.attributes);

      const NOMBRE = prueba[1];
      const FUGA = prueba[2];
      const DANO = prueba[3];
      const FRAUDE = prueba[4];
      const UBICACION = prueba[5];
      const resultado = { NOMBRE, FUGA, DANO, FRAUDE, UBICACION };

      localData.push(resultado);
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

  loadMailing(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.PersonasSinAlertas,
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
      this.listMailing = json['Table1'];
    }
  }

  personaSinAlerta(persona: any): void {
    this.codigoPersona = persona.COD_PERSONA;
  }

  tableOnRowSelect(event: any): void {
    this.botonC = true;
    this.botonAdicionar = true;
    this.botonE = false;
    this.display = false;

    this.selectedElement = this.listElements[event.args.index];

    this.codPersona = this.selectedElement.attributes.COD_PERSONA;
    this.nombre = this.selectedElement.attributes.NOMBRE;
    this.checkBox = this.selectedElement.attributes;

    if (this.checkBox.DANO === 'X') {
      this.dano = true;
    } else {
      this.dano = false;
    }

    if (this.checkBox.FRAUDE === 'X') {
      this.fraude = true;
    } else {
      this.fraude = false;
    }

    if (this.checkBox.FUGA === 'X') {
      this.fuga = true;
    } else {
      this.fuga = false;
    }

    if (this.checkBox.UBICACION === 'X') {
      this.ubicacion = true;
    } else {
      this.ubicacion = false;
    }
  }

  onCancelar(): void {
    this.botonE = true;
    this.display = true;
    this.dano = false;
    this.fuga = false;
    this.botonC = false;
    this.fraude = false;
    this.ubicacion = false;
    this.botonAdicionar = false;

    this.checkedV0 = false;
    this.checkedV1 = false;
    this.checkedV2 = false;
    this.checkedV3 = false;

    this.loadList();
  }

  onAdicionar(): void {
    const constante = [this.checkedV0, this.checkedV1, this.checkedV2, this.checkedV3];

    if (this.codigoPersona !== undefined) {

      if (this.checkedV0 === true || this.checkedV1 === true || this.checkedV2 === true || this.checkedV3 === true) {

        for (let i = 0; i < constante.length; i++) {
          const element = constante[i];

          if (element === true) {
            const alerta = i + 1;

            this.apiService
              .callStoreProcedureV2(
                RequestHelper.getParamsForStoredProcedureV2(
                  StoreProcedures.AdicionarAlerta,
                  [
                    new InputParameter('codPersona', this.codigoPersona),
                    new InputParameter('tipoAlerta', alerta)
                  ]
                )
              )
              .subscribe(json => {
                this.loadList();
                this.loadMailing();
                this.onCancelar();
              });
          }
        }

        alert('La alerta a sido asignada.');

      } else {
        alert('Debe seleccionar por lo menos una alerta.');
      }

    } else {
      alert('Debe seleccionar una persona.');
    }
  }

  onEliminar(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.BorrarAlertaPersona,
          [
            new InputParameter('persona', this.codPersona)
          ]
        )
      )
      .subscribe(json => {
        this.loadList();
        this.loadMailing();
        this.onCancelar();
        if (json[1]) {
          alert(json[1]);
        }
      });
  }

  start(): void {
    // this.loadList();
    this.loadMailing();
    this.onCancelar();
  }
}
