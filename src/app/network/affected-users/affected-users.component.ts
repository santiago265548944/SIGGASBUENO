import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { RequestHelper } from '../../api/request/request-helper';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { InputParameter } from '../../api/request/input-parameter';
import { AddGeometry } from '../../map-service/map-action';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { MapService } from '../../map-service/map.service';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';

@Component({
  selector: 'app-affected-users',
  templateUrl: './affected-users.component.html',
  styleUrls: ['./affected-users.component.css']
})
export class AffectedUsersComponent implements OnInit {
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;

  dataAdapter: any;
  dataTableColumns: Array<any>;
  progressMessage: string;

  constructor(private apiService: ApiService, private mapService: MapService) { }

  ngOnInit() { }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    this.start();
  }

  start(): void {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.progressMessage = 'Obteniendo usuarios afectados...';
    this.loadDropDownAffectedUsers();
  }

  private loadDropDownAffectedUsers() {
    try {
      this.startProgress();
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerUsuariosAfectados,
            [(new InputParameter('usar_Manzanas', 0))]
          )
        )
        .subscribe(json => {
          this.stopProgress();
          if (json != null) {
            this.processAffectedUsersResponse(json);
          }
        });
    } catch (error) {
      this.stopProgress();
      console.error(error);
    }
  }

  private processAffectedUsersResponse(json: any) {
    const values = Object.values(json);

    if (values.length > 0) {
      const responseContent = JSON.parse(values[0].toString());

      if (responseContent.ErrorMessage != null) {
        alert(responseContent.ErrorMessage);
      } else {
        this.drawAffectedUsers(json);
      }
    }
  }

  private drawAffectedUsers(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);

    if (posResult.length === 3) {
      const jsonData = JSON.parse(json[posResult[0]]);
      const jsonExtent = JSON.parse(json[posResult[1]]);

      if (jsonData['Table1']) {
        const responseValues = Object.values(jsonExtent);

        ResultToGraphicCollection.convert(
          <Array<any>>responseValues[0],
          results => {
            this.mapService.executeMapAction(<AddGeometry>{
              EMapAction: EmapActions.AddGeometry,
              geometries: results
            });
          }
        );

        ResultToGraphicCollection.convert(jsonData['Table1'], results =>
          this.prepareDataTableSource(results));
      }
    }
  }

  prepareDataTableSource(results: any): void {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();

    const localData = new Array<any>();
    const firstGraphic = results[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }

    // tslint:disable-next-line:forin
    for (const element of results) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapter = new jqx.dataAdapter(source);
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
