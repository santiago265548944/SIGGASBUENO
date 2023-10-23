import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { GlobalService } from '../../Globals/global.service';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { AddGeometry } from '../../map-service/map-action';
import { EmapActions } from '../../map-service/emap-actions.enum';

@Component({
  selector: 'app-recalculate-affected-users',
  templateUrl: './recalculate-affected-users.component.html',
  styleUrls: ['./recalculate-affected-users.component.css']
})
export class RecalculateAffectedUsersComponent implements OnInit {
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;

  dataAdapter: any;
  dataTableColumns: Array<any>;
  progressMessage: string;

  constructor(private apiService: ApiService, private globals: GlobalService, private mapService: MapService) { }

  ngOnInit() { }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    this.start();
  }

  start(): void {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.progressMessage = 'Recalculando usuarios afectados...';
    this.loadDropDownRecalculateUsers();
  }

  private loadDropDownRecalculateUsers() {
    try {
      this.startProgress();
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerRecalcularUsuariosAfectados,
            []
          )
        )
        .subscribe(json => {
          this.stopProgress();
          if (json != null) {
            this.getTraceResult(json);
            this.processRecalculateUsersResponse(json);
          }
        });
    } catch (error) {
      this.stopProgress();
      console.error(error);
    }
  }


  getTraceResult(result: any) {
    const posResult = Object.getOwnPropertyNames(result);
    if (posResult.length === 3) {

      ResultToGraphicCollection.convert(
        JSON.parse(result[posResult[0]])['Table1'], results =>
          this.convertCallbackLine(results)
      );

      ResultToGraphicCollection.convert(JSON.parse(result[posResult[1]])['Table1'], results =>
        this.convertCallbackPOLYGON(results)
      );
    }
  }

  private convertCallbackPOLYGON(results: any) {
    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: results,
    });
    this.convertLine(this.globals.getAislarLineas());
  }

  private convertLine(results: any) {
    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: results
    });
    this.convertPoint(this.globals.getAislarPuntos());
  }

  private convertPoint(results: any) {
    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: results,
      color: '0000FF'
    });
  }

  private convertCallbackLine(results: any) {
    this.prepareDataTableSource(results);
  }

  private processRecalculateUsersResponse(json: any) {
    const values = Object.values(json);

    if (values.length > 0) {
      const responseContent = JSON.parse(values[0].toString());

      if (responseContent.ErrorMessage != null) {
        alert(responseContent.ErrorMessage);
      } else {
        const responseValues = Object.values(responseContent);

        if (responseValues == null || responseValues.length === 0) {
          alert('No hay resultados en la consulta.');
        } else {
          this.loadGrid(responseContent);
        }
      }
    }
  }

  private loadGrid(json: any) {
    if (json['Table1'] && json['Table1'].length > 0) {
      this.clearGrid();
      if (json['Table1'] != null && json['Table1'].length > 0) {
        this.prepareDataTableColumns(json['Table1']);
        this.prepareDataTableSource(json['Table1']);
      }
    }
  }

  private prepareDataTableColumns(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    if (firstGraphic.length > 0) {
      const responseContent = JSON.parse(firstGraphic[0].toString());

      if (responseContent.ErrorMessage != null) {
        alert(responseContent.ErrorMessage);
      }
    }

    // tslint:disable-next-line:forin
    for (const index in firstGraphic) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSource(selectedGraphics: any): void {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();

    const localData = new Array<any>();
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }

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
