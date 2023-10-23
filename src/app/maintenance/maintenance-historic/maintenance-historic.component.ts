import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { MapService } from '../../map-service/map.service';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { CallModal } from '../../map-service/map-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';

@Component({
   selector: 'app-maintenance-historic',
   templateUrl: './maintenance-historic.component.html',
   styleUrls: ['./maintenance-historic.component.css']
})
export class MaintenanceHistoricComponent implements OnInit {
   @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

   initialYear: Array<any> = [];
   finalYear: Array<any> = [];
   activity: Array<any> = [];
   initialYearSelected: any;
   finalYearSelected: any;
   activitySelected: any;
   maintenanceHistoricResult: any;

   constructor(private apiService: ApiService, private mapService: MapService) {}

   ngOnInit() {
      this.loadYears();
      this.loadDropDownMaintenanceHistoric();
   }

   loadYears(): void {
      const ano = new Date().getFullYear();

      for (let i = ano; i >= 1990; i--) {
         this.initialYear.push(i).toString();
         this.finalYear.push(i).toString();
      }
   }

   private loadDropDownMaintenanceHistoric() {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerActividades, [])
         )
         .subscribe((json) => {
            if (json[0] != null) {
               this.loadDropDownMaintenanceHistoricCompleted(JSON.parse(json[0]));
            }
         });
   }

   private loadDropDownMaintenanceHistoricCompleted(json: any) {
      if (json['Table1'] != null) {
         this.activity = json['Table1'];
      }
   }

   onBuscarClick(): void {
      if (!this.validate()) {
         return;
      }

      this.startProgress();

      const spParams = this.getParams();
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
               `MANTENIMIENTO.ReporteHistoricoMantenimiento`,
               spParams
            )
         )
         .subscribe((json) => {
            this.stopProgress();
            if (json != null) {
               this.processMaintenanceHistoricResponse(json);
            }
         });
   }

   private validate(): boolean {
      const messages = new Array<string>();

      if (this.initialYearSelected == null) {
         messages.push('Debe seleccionar un Año Inicial.');
      }

      if (this.finalYearSelected == null) {
         messages.push('Debe seleccionar un Año Final.');
      }

      if (this.activitySelected == null) {
         messages.push('Debe seleccionar una Actividad.');
      }

      if (messages.length > 0) {
         alert(messages.join('\n'));
      }

      return messages.length === 0;
   }

   private getParams(): Array<InputParameter> {
      const params = new Array();

      params.push(new InputParameter('un_anho', this.initialYearSelected));

      params.push(new InputParameter('un_anho2', this.finalYearSelected));

      let activityParamValue = '';
      if (this.activitySelected != null) {
         activityParamValue = this.activitySelected.CODIGO;
      }
      params.push(new InputParameter('una_actividad', activityParamValue));

      return params;
   }

   private processMaintenanceHistoricResponse(json: any): void {
      const values = Object.values(json);

      if (values.length > 0) {
         const responseContent = JSON.parse(values[0].toString());

         if (responseContent.ErrorMessage != null) {
            alert(responseContent.ErrorMessage);
         } else {
            this.maintenanceHistoricReports(JSON.parse(values[0] as string)); // Usar type assertion
         }
      }
   }

   private maintenanceHistoricReports(json): void {
      if (json['Table1'] != null && json['Table1'].length >= 0) {
         const responseValues = Object.values(json);

         ResultToGraphicCollection.convert(<Array<any>>responseValues[0], (results) => {
            this.maintenanceHistoricResult = results;
            this.mapService.executeMapAction(<CallModal>{
               EMapAction: EmapActions.CallModal,
               EModal: Emodal.ViewSelection,
               parameters: this.maintenanceHistoricResult
            });
         });
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

   start(): void {
      this.initialYearSelected = null;
      this.finalYearSelected = null;
      this.activitySelected = null;
   }
}
