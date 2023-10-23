import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { ProjectBudgetModel, ProjectBudgetBaseModel } from './project-budget-model';
import { InputParameter } from '../../api/request/input-parameter';

@Component({
  selector: 'app-project-budget',
  templateUrl: './project-budget.component.html',
  styleUrls: ['./project-budget.component.css']
})
export class ProjectBudgetComponent implements OnInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  @ViewChild('jqxDataTable') jqxDataTableResults: jqxDataTableComponent;
  projects: Array<any>;
  listasUsar: Array<any>;
  tiposTuberia: Array<any>;
  model: ProjectBudgetModel;
  anilloTroncalVisible: boolean;
  anilloTempModel: ProjectBudgetBaseModel;
  troncalTempModel: ProjectBudgetBaseModel;

  progressMessage: string;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  resultExpand: boolean;


  constructor(private apiService: ApiService) {
    this.model = new ProjectBudgetModel();
    this.anilloTempModel = new ProjectBudgetBaseModel();
    this.troncalTempModel = new ProjectBudgetBaseModel();
    this.anilloTroncalVisible = true;
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.resultExpand = false;
  }

  ngOnInit() {
    this.startFillProjects();
    this.startFillListasUsar();
    this.defineTiposTuberia();
  }

  private defineTiposTuberia(): void {
    this.tiposTuberia = new Array<any>();
    this.tiposTuberia.push({value: 0, text: 'Anillo'});
    this.tiposTuberia.push({value: 1, text: 'Troncal'});
    this.tiposTuberia.push({value: 2, text: 'Unidad constructiva'});

    this.model.TipoTuberia = this.tiposTuberia[0];
  }

  private startFillProjects(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerProyectos,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.fillProjectsCompleted(JSON.parse(json[0]));
        }
      });
  }

  private fillProjectsCompleted(json: any): void {
    if (json['Table1'] != null) {
      this.projects = json['Table1'].map((item) => ({value: item.CODIGOPROYECTO, text: item.NOMBRE}));
    }
  }

  private startFillListasUsar(): void {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerListas,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.fillListasUsarCompleted(JSON.parse(json[0]));
        }
      });
  }

  private fillListasUsarCompleted(json: any): void {
    if (json['Table1'] != null) {
      this.listasUsar = json['Table1'].map((item) => ({value: item.CODIGO, text: item.DESCRIPCION}));
    }
  }

  onProyectoChanged(project): void {
    // TODO: Establecer valor de descripción de proyecto

    this.executeMetrosLineales(project.value);
  }

  private executeMetrosLineales(projectId: string) {
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.MetrosLineales,
          [new InputParameter('un_ID', projectId)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        this.postExecuteMetrosLineales(json);
      });
  }

  private postExecuteMetrosLineales(jsonResult: any) {
    if (jsonResult != null) {
      this.model.TuberiaAnillo = +jsonResult[0] || 0;
      this.model.TuberiaTroncal = +jsonResult[1] || 0;
    }
  }

  onTipoTuberiaChanged(tipoTuberia: any) {
    this.anilloTroncalVisible = (tipoTuberia.value < 2);
    if (tipoTuberia.value === 0) {
      this.setModelValuesWithTipoTuberiaModel(this.anilloTempModel);
    } else {
      this.setModelValuesWithTipoTuberiaModel(this.troncalTempModel);
    }
  }

  onInputBlur(source: string) {
    if (this.model.TipoTuberia.value === 0) {
      this.setAnilloTempValues(source);
    } else if (this.model.TipoTuberia.value === 1) {
      this.setTroncalTempValues(source);
    }
  }

  private setAnilloTempValues(source: string): void {
    this.anilloTempModel[source] = this.model[source];
  }

  private setTroncalTempValues(source: string): void {
    this.troncalTempModel[source] = this.model[source];
  }

  private setModelValuesWithTipoTuberiaModel(tipoTuberiaModel: ProjectBudgetBaseModel): void {
    this.model.ConcretoMetrosArena = tipoTuberiaModel.ConcretoMetrosArena;
    this.model.ConcretoMetrosCaliche = tipoTuberiaModel.ConcretoMetrosCaliche;
    this.model.ConcretoMetrosPiedra = tipoTuberiaModel.ConcretoMetrosPiedra;
    this.model.ConcretoSimple = tipoTuberiaModel.ConcretoSimple;
    this.model.ConcretoEspecial = tipoTuberiaModel.ConcretoEspecial;
    this.model.NaturalMetrosArena = tipoTuberiaModel.NaturalMetrosArena;
    this.model.NaturalMetrosCaliche = tipoTuberiaModel.NaturalMetrosCaliche;
    this.model.NaturalMetrosPiedra = tipoTuberiaModel.NaturalMetrosPiedra;
  }

  onAceptarClick(): void {
    this.executeParametrosPresupuesto();
  }

  private executeParametrosPresupuesto(): void {
    const anilloMeters = this.anilloTempModel.getAnilloTroncalMeters();
    const troncalMeters = this.troncalTempModel.getAnilloTroncalMeters();
    const unidadConstructivaMeters = this.model.getUnidadConstructivaMeters();

    if (this.validate(anilloMeters, troncalMeters, unidadConstructivaMeters)) {
      let storeProcedure = StoreProcedures.ParametrosPresupuesto;
      let parameters = this.getParametersForAnilloTroncal();

      if (this.model.TipoTuberia.value === 2) {
        storeProcedure = StoreProcedures.ParametrosPresupuestoUc;
        parameters = this.getParametersForUnidadConstructiva();
      }

      this.startProgressWithMessage('Calculando presupuesto...');
      this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          storeProcedure,
          parameters
        )
      )
      .subscribe(json => {
        this.postExecuteParametrosPresupuesto(json);
      });
    }
  }

  private getParametersForAnilloTroncal(): Array<InputParameter> {
    const parameters = new Array<InputParameter>();
    parameters.push(new InputParameter('MLABCA_', this.anilloTempModel.ConcretoMetrosArena));
    parameters.push(new InputParameter('MLCBCA_', this.anilloTempModel.ConcretoMetrosCaliche));
    parameters.push(new InputParameter('MLPBCA_', this.anilloTempModel.ConcretoMetrosPiedra));
    parameters.push(new InputParameter('CSBCA_', this.anilloTempModel.ConcretoSimple));
    parameters.push(new InputParameter('CEBCA_', this.anilloTempModel.ConcretoEspecial));
    parameters.push(new InputParameter('MLATNA_', this.anilloTempModel.NaturalMetrosArena));
    parameters.push(new InputParameter('MLCTNA_', this.anilloTempModel.NaturalMetrosCaliche));
    parameters.push(new InputParameter('MLPTNA_', this.anilloTempModel.NaturalMetrosPiedra));

    parameters.push(new InputParameter('MLABCT_', this.troncalTempModel.ConcretoMetrosArena));
    parameters.push(new InputParameter('MLCBCT_', this.troncalTempModel.ConcretoMetrosCaliche));
    parameters.push(new InputParameter('MLPBCT_', this.troncalTempModel.ConcretoMetrosPiedra));
    parameters.push(new InputParameter('CSBCT_', this.troncalTempModel.ConcretoSimple));
    parameters.push(new InputParameter('CEBCT_', this.troncalTempModel.ConcretoEspecial));
    parameters.push(new InputParameter('MLATNT_', this.troncalTempModel.NaturalMetrosArena));
    parameters.push(new InputParameter('MLCTNT_', this.troncalTempModel.NaturalMetrosCaliche));
    parameters.push(new InputParameter('MLPTNT_', this.troncalTempModel.NaturalMetrosPiedra));

    parameters.push(new InputParameter('LISTA_', this.model.ListaUsar.value));

    return parameters;
  }

  getParametersForUnidadConstructiva(): Array<InputParameter> {
    const parameters = new Array<InputParameter>();
    parameters.push(new InputParameter('concreto', this.model.ConcretoEnConcreto));
    parameters.push(new InputParameter('asfalto', this.model.ConcretoEnAsfalto));
    parameters.push(new InputParameter('anden', this.model.ConcretoEnAndenTableta));
    parameters.push(new InputParameter('zonaverde', this.model.ConcretoEnZonaVerde));
    parameters.push(new InputParameter('destapado', this.model.ConcretoEnDestapado));

    parameters.push(new InputParameter('lista', this.model.ListaUsar.value));

    return parameters;
  }

  private validate(anilloMeters: number, troncalMeters: number, unidadConstructivaMeters: number): boolean {
    const messages = Array<string>();
    if (this.model.Proyecto == null) {
      messages.push('Debe seleccionar un proyecto.');
    }

    if (this.model.ListaUsar == null) {
      messages.push('Debe seleccionar una lista.');
    }

    if (this.model.TipoCalculo == null) {
      messages.push('Debe seleccionar un tipo de cálculo.');
    }

    if (this.model.TipoTuberia.value < 2) {
      if (this.model.TuberiaAnillo !== anilloMeters || this.model.TuberiaTroncal !== troncalMeters) {
        messages.push('Los metrajes de los campos deben ir acorde al metraje del proyecto.');
      }
    } else if (this.model.TipoTuberia.value === 2) {
      if ((this.model.TuberiaAnillo + this.model.TuberiaTroncal) !== unidadConstructivaMeters) {
        messages.push('Los metrajes de los campos deben ir acorde al metraje del proyecto.');
      }
    }

    if (messages.length > 0) {
      alert(messages.join('\n'));
    }

    return messages.length === 0;
  }

  private postExecuteParametrosPresupuesto(json: any): void {
    this.executeEstimatedValues();
  }

  private executeEstimatedValues(): void {
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.Presupuesto,
            [new InputParameter('un_Proyecto', this.model.Proyecto.value),
            new InputParameter('una_Lista', this.model.ListaUsar.value),
            new InputParameter('tipo_Calculo', this.model.TipoCalculo)
            ]
          )
        )
        .subscribe(json => {
          this.stopProgress();
          this.postExecuteEstimatedValues(json);
        });
    } catch (err) {
      this.stopProgress();
      console.error(err);
      alert('Se presentó un error al calcular presupuesto.');
    }
  }

  private postExecuteEstimatedValues(json: any): void {
    if (json && json[3] != null) {
      this.fillGrid(JSON.parse(json[3]));
    }
  }

  fillGrid(jsonTable: any) {
    try {
      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        this.resultExpand = true;
        this.prepareDataTableColumns(jsonTable['Table1'][0]);
        this.prepareDataTableSource(jsonTable['Table1']);
      } else {
        alert('No se tienen datos.');
        this.cleanGrid();
      }
    } catch (error) {
      console.error(error);
      alert('Se presentó un error al calcular presupuesto.');
    } finally {
      this.stopProgress();
    }
  }

  private prepareDataTableColumns(firstRow: any): void {
    this.dataTableColumns.splice(0, this.dataTableColumns.length);
    const keys = Object.keys(firstRow);
    for (let index = 0; index < keys.length; index ++) {
      this.dataTableColumns.push({ text: keys[index], dataField: keys[index], minWidth: 100 });
    }
  }

  prepareDataTableSource(data: any): void {
    const keys = Object.keys(data[0]);
    const dataFields = [];
    for (let index = 0; index < keys.length; index ++) {
      dataFields.push({ name: keys[index], type: 'string' });
    }
    const source: any = {
      localData: data,
      dataType: 'array',
      dataFields: dataFields
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  onResultadosCollapsed(): void {
    this.resultExpand = false;
  }

  private cleanGrid(): void {
    this.jqxDataTableResults.clear();
  }

  private startProgress(): void {
    this.startProgressWithMessage('Cargando...');
  }

  private startProgressWithMessage(message: string): void {
    this.progressMessage = message;
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
