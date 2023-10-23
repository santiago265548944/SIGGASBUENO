import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';
import { AddGeometry, CallModal } from '../../map-service/map-action';

@Component({
  selector: 'app-emergency',
  templateUrl: './emergency.component.html',
  styleUrls: ['./emergency.component.css']
})
export class EmergencyComponent implements OnInit {
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;

  emergencyList: Array<any>;
  emergencyItemSelected: any;
  emergencyResults: Array<any>;

  constructor(private apiService: ApiService, private mapService: MapService) { }

  ngOnInit() {
    this.loadDropDownEmergency();
  }

  private loadDropDownEmergency() {
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerListado,
          []
        )
      )
      .subscribe(json => {
        if (json[0] != null) {
          this.loadDropDownEmergencyCompleted(JSON.parse(json[0]));
        }
      });
  }

  private loadDropDownEmergencyCompleted(json: any) {
    if (json['Table1'] != null) {
      this.emergencyList = json['Table1'];
    }
  }

  emergencyItemChanged(itemSelected: any): void {
    if (itemSelected != null) {
      this.emergencyResults = itemSelected.IDENTIFICADORFALLA;
    }
  }

  onVerClick(): void {
    this.startProgress();
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerResultado,
          [new InputParameter('un_codigo', this.emergencyResults)]
        )
      )
      .subscribe(json => {
        this.stopProgress();
        if (json != null) {
          this.loadEmergencyResponse(json);
        }
      });
  }

  private loadEmergencyResponse(json: any): void {
    const values = Object.values(json);

    if (values.length > 0) {
      const responseContent = JSON.parse(values[0].toString());

      if (responseContent.ErrorMessage != null) {
        alert(responseContent.ErrorMessage);
      } else {
        this.drawEmergency(json);
      }
    }
  }

  private drawEmergency(json: any): void {
    const posResult = Object.getOwnPropertyNames(json);

    if (posResult.length === 2) {
      const jsonData = JSON.parse(json[posResult[0]]);
      const jsonExtent = [{ SHAPE: json[posResult[1]] }];

      if (jsonData['Table1']) {
        ResultToGraphicCollection.convert(
          <Array<any>>jsonExtent,
          results => {
            this.mapService.executeMapAction(<AddGeometry>{
              EMapAction: EmapActions.AddGeometry,
              geometries: results,
              color: 'rgba(255,255,0,0.5)'
            });
          }
        );

        const responseValues = Object.values(jsonData);
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
          this.prepareDataTableSource(results)
        );
      }

    }
  }

  prepareDataTableSource(results: any): void {
    this.mapService.executeMapAction(<CallModal>{
      EMapAction: EmapActions.CallModal,
      EModal: Emodal.ViewSelection,
      parameters: results
    });
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

  start(): void {
    this.emergencyItemSelected = null;
  }
}
