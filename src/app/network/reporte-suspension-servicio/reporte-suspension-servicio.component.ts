import { Component, OnInit, ViewChild } from '@angular/core';
import { ReporteSuspensionServicioModel } from './reporte-suspension-servicio-model';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ResultToGraphicCollection } from '../../map-service/result-to-graphic-collection';
import { MapService } from '../../map-service/map.service';
import { CallModal } from '../../map-service/map-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';

@Component({
  selector: 'app-reporte-suspension-servicio',
  templateUrl: './reporte-suspension-servicio.component.html',
  styleUrls: ['./reporte-suspension-servicio.component.css']
})
export class ReporteSuspensionServicioComponent implements OnInit {

  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;
  model: ReporteSuspensionServicioModel;
  closeFunction: Function;

  constructor(private apiService: ApiService, private mapService: MapService) {
    this.model = new ReporteSuspensionServicioModel();
  }

  ngOnInit() {
  }

  start() {
    this.clearFields();
  }

  onAceptarClickHandler(): void {
    if (this.model.FechaInicial != null && this.model.FechaInicial !== ''
      && this.model.FechaFinal != null && this.model.FechaFinal !== '') {
        this.startProgress();
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ReporteDeInterrupciones,
            [ new InputParameter('isbprogramada', this.model.Programada)
            , new InputParameter('idtfechainicioprogramada', this.model.FechaHoraInicial)
            , new InputParameter('idtfechafinprogramada', this.model.FechaHoraFinal)]
          )
        )
        .subscribe(json => {
          this.stopProgress();
          this.onReporteDeInterrupcionesDataRecieved(json);
        });
    } else {
      alert('Debe completar el rango de fecha.');
    }
  }

  private onReporteDeInterrupcionesDataRecieved(json: any) {
    try {
    const values = Object.values(json);
      if (values &&  values.length > 0) {
        const result = JSON.parse(values[0].toString());
        if (result['Table1'] != null) {
          ResultToGraphicCollection.convert(result['Table1'], results => {
            this.mapService.executeMapAction(<CallModal>{
              EMapAction: EmapActions.CallModal,
              EModal: Emodal.ViewSelection,
              parameters: results,
              additionalParameters: {hideGeoButtons: true}
            });
          });
          if (result['Table1'].length === 0) {
            alert('La consulta no arrojó resultados.');
          }
        } else if (result['ErrorMessage']) {
          alert (result['ErrorMessage']);
        }
      } else {
        alert('La consulta no arrojó resultados.');
      }
    } catch (ex) {
      alert('Se generó un error en la consulta.');
    }
  }

  private clearFields(): void {
    this.model.Programada = null;
    this.model.FechaInicial = null;
    this.model.FechaFinal = null;
    this.model.HoraInicial = null;
    this.model.HoraFinal = null;
  }

  onCancelarClickHandler(): void {
    this.closeFunction();
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
}
