import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';

@Component({
  selector: 'app-spatial-crossing',
  templateUrl: './spatial-crossing.component.html',
  styleUrls: ['./spatial-crossing.component.css']
})
export class SpatialCrossingComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  @ViewChild('jqxDataTable') jqxDataTableResults: jqxDataTableComponent;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  progressMessage: string;

  constructor(private apiService: ApiService) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.progressMessage = 'Obteniendo cruces especiales...';
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.startSpatialCrossing();
  }

  private startSpatialCrossing(): void {
    try {
      this.startProgress();
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ReporteCrucesEspaciales,
            []
          )
        )
        .subscribe(json => {
          this.stopProgress();
          this.processSpatialCrossingResult(json);
        });
    } catch (error) {
      console.error(error);
      this.stopProgress();
    }
  }

  processSpatialCrossingResult(jsonResult: any) {
    if (jsonResult != null) {
      if (jsonResult[0] != null) {
        const result = JSON.parse(jsonResult[0]);
        this.fillGrid(result);
      } else {
        alert('El resultado de cruces especiales no pudo ser procesado');
        this.cleanGrid();
      }
    }
  }

  fillGrid(jsonTable: any) {
    try {
      if (jsonTable['Table1'] && jsonTable['Table1'].length > 0) {
        this.prepareDataTableColumns(jsonTable['Table1'][0]);
        this.prepareDataTableSource(jsonTable['Table1']);
      } else {
        this.cleanGrid();
      }
    } catch (error) {
      console.error(error);
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

  exportExcel(): void {
    this.jqxDataTableResults.exportData('xls');
  }

}
