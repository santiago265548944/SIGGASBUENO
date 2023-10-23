import {
   Component,
   OnInit,
   Output,
   EventEmitter,
   ComponentRef,
   AfterViewInit,
   ViewChild,
   ViewEncapsulation
} from '@angular/core';
import { MapService } from '../map-service/map.service';
import { ModalService } from '../modal.module';
import { ConfigModal } from '../generic-modal/config-modal';
import { jqxRibbonComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxribbon';
import { jqxDropDownButtonComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdropdownbutton';
import { ZoomAction } from '../map-service/zoom-action';
import { EmapActions, Emodal } from '../map-service/emap-actions.enum';
import { CallModal } from '../map-service/map-action';
import { XycoordinateComponent } from '../xycoordinate/xycoordinate.component';
import { IdentifyComponent } from '../identify/identify.component';
import { DrawColorComponent } from '../draw-color/draw-color.component';
import { IdentifyAction, IdentifyActionType } from '../map-service/map-actions/identify-action';
import { SelectionComponent } from '../selection/selection.component';
import {
   SelectAction,
   SelectActionType,
   OwnerSelection
} from '../map-service/map-actions/select-action';
import { PrintMapComponent } from '../print-map/print-map.component';
import { MeasureComponent } from '../measure/measure.component';
import { ViewSelectionComponent } from '../selection/view-selection/view-selection.component';
import { GeoZoomComponent } from '../geo-zoom/geo-zoom.component';
import { BookmarkComponent } from '../bookmark/bookmark.component';
import { AttachmentComponent } from '../searches/attachment/attachment.component';
import { SeekPredioComponent } from '../Applications/seek-predio/seek-predio.component';
import { RadiograficalTestComponent } from '../stations/radiografical-test/radiografical-test.component';
import { NetworkCoverageComponent } from '../Applications/network-coverage/network-coverage.component';
import { PneumaticTestComponent } from '../stations/pneumatic-test/pneumatic-test.component';
import { StationComponentComponent } from '../stations/station-component/station-component.component';
import { ModificationComponent } from '../stations/modification/modification.component';
import { RisksManagementComponent } from '../searches/risks-management/risks-management.component';
import { AddressSearchComponent } from '../Applications/address-search/address-search.component';
import { PolyvalvulasByLocationComponent } from '../Applications/polyvalvulas-by-location/polyvalvulas-by-location.component';
import { SquareSchemeComponent } from '../searches/square-scheme/square-scheme.component';
import { SpatialCrossingComponent } from '../Applications/spatial-crossing/spatial-crossing.component';
import { PlottingComponent } from '../searches/plotting/plotting.component';
import { ProjectBudgetComponent } from '../Applications/project-budget/project-budget.component';
import { ProjectInformationComponent } from '../Applications/project-information/project-information.component';
import { ChangeStratumComponent } from '../Applications/change-stratum/change-stratum.component';
// tslint:disable-next-line:import-blacklist
import { Subscription, Observable } from 'rxjs';
import { SearchesComponent } from '../Applications/searches/searches.component';
import { ConsultComponent } from '../Applications/consult/consult.component';
import { ThematicMapComponent } from '../Applications/thematic-map/thematic-map.component';
import { QueryBuilderComponent } from '../searches/query-builder/query-builder.component';
import { AffectedUsersComponent } from '../network/affected-users/affected-users.component';
import { RecalculateAffectedUsersComponent } from '../network/recalculate-affected-users/recalculate-affected-users.component';
import { EmergencyComponent } from '../network/emergency/emergency.component';
import { ManejoPrensasComponent } from '../network/manejo-prensas/manejo-prensas.component';
import { AislarTuberiaComponent } from '../network/aislar-tuberia/aislar-tuberia.component';
import { ReporteSuspensionServicioComponent } from '../network/reporte-suspension-servicio/reporte-suspension-servicio.component';
import { MaintenanceHistoricComponent } from '../maintenance/maintenance-historic/maintenance-historic.component';
import { StatisticReportsComponent } from '../maintenance/statistic-reports/statistic-reports.component';
import { MaintenanceScheduleComponent } from '../maintenance/maintenance-schedule/maintenance-schedule.component';
import { QualityIndexComponent } from '../maintenance/quality-index/quality-index.component';
import { RestablecerServicioComponent } from '../network/restablecer-servicio/restablecer-servicio.component';
import { InterrupcionServicioComponent } from '../network/interrupcion-servicio/interrupcion-servicio.component';
import { MemoryService } from '../cache/memory.service';
import { Router } from '@angular/router';
import { MainAdminComponent } from '../admin/main-admin/main-admin.component';
import { XYCoordinateAction } from '../map-service/XYCoordinate-action';
import { ApiService } from '../api/api.service';
import { RequestHelper } from '../api/request/request-helper';
import { StoreProcedures } from '../api/request/store-procedures.enum';
import { InputParameter } from '../api/request/input-parameter';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ChangePasswordComponent } from '../login/change-password/change-password.component';
import { PermissionService } from '../security/permission.service';
import { ViewInformationComponent } from '../Applications/project-information/view-information/view-information.component';
import { FatherOrderComponent } from '../patrol/father-order/father-order.component';
import { AssignContractorComponent } from '../patrol/assign-contractor/assign-contractor.component';
import { PatrolComponent } from '../patrol/patrol/patrol.component';
import { MailingListComponent } from '../patrol/mailing-list/mailing-list.component';
import { SecurityRiskComponent } from '../patrol/security-risk/security-risk.component';
import { TablesTypeComponent } from '../patrol/tables-type/tables-type.component';
import { TeamComponent } from '../patrol/team/team.component';
import { OrderManagementComponent } from '../patrol/order-management/order-management.component';
import { ContractorComponent } from '../patrol/contractor/contractor.component';
import { ConsultPatrolComponent } from '../patrol/consult-patrol/consult-patrol.component';
import { OrdersComponent } from '../patrol/orders/orders.component';
import { ReportsStatisticsComponent } from '../patrol/reports-statistics/reports-statistics.component';
import { LegalizationOrderComponent } from '../maintenance/legalization-order/legalization-order.component';
import { LegalizationDirectComponent } from '../maintenance/legalization-direct/legalization-direct.component';
import { GenerarCorrectComponent } from '../maintenance/generar-correct/generar-correct.component';
import { ConsultarOrdenesComponent } from '../maintenance/consultar-ordenes/consultar-ordenes.component';
import { AdicionarElementComponent } from '../maintenance/adicionar-element/adicionar-element.component';

declare var $: any;

@Component({
   selector: 'app-ribbon',
   templateUrl: './ribbon.component.html',
   styleUrls: ['./ribbon.component.css'],
   encapsulation: ViewEncapsulation.None
})
export class RibbonComponent implements OnInit, AfterViewInit {
   @Output() toggleToc = new EventEmitter<string>();
   // Dashboard.
   @Output() mostrarDashboard = new EventEmitter<string>();
   @Output() ocultarDashboard = new EventEmitter<string>();

   subscription: Subscription;
   height = 200;
   fullScreen = false;

   public _urlAI = '';
   private _urlAIEnable = 'assets/images/fijar_area_de_interes.png';
   private _urlAIDisable = 'assets/images/fijar_area_de_interes-borrar.png';
   private _modalXY: ComponentRef<any> = null;
   private modalSelect: ComponentRef<any> = null;
   private modalIdentify: ComponentRef<any> = null;
   private modalDrawColor: ComponentRef<any> = null;
   private modalPrintMap: ComponentRef<any> = null;
   private modalMeasure: ComponentRef<any> = null;
   private modalViewSelection: ComponentRef<any> = null;
   private modalViewInformation: ComponentRef<any> = null;
   private modalGeoZoom: ComponentRef<any> = null;
   private modalAddBookmark: ComponentRef<any> = null;
   private modalAttachment: ComponentRef<any> = null;
   private modalSeekPredio: ComponentRef<any> = null;
   private modalRadiograficalTest: ComponentRef<any> = null;
   private modalNetworkCoverage: ComponentRef<any> = null;
   private modalPNeumaticTest: ComponentRef<any> = null;
   private modalStationComponent: ComponentRef<any> = null;
   private modalStationModification: ComponentRef<any> = null;
   private modalRisksManagement: ComponentRef<any> = null;
   private modalAddressSearch: ComponentRef<any> = null;
   private modalPolyValvulasByLocation: ComponentRef<any> = null;
   private modalSquareScheme: ComponentRef<any> = null;
   private modalSpatialCrossing: ComponentRef<any> = null;
   private modalThematicMap: ComponentRef<any> = null;
   private modalPlotting: ComponentRef<any> = null;
   private modalProjectBudget: ComponentRef<any> = null;
   private modalProjectInformation: ComponentRef<any> = null;
   private modalChangeStratum: ComponentRef<any> = null;
   private modalSearchesStratum: ComponentRef<any> = null;
   private modalConsultStratum: ComponentRef<any> = null;
   private modalQueryBuilder: ComponentRef<any> = null;
   private modalAffectedUser: ComponentRef<any> = null;
   private modalRecalculateAffectedUser: ComponentRef<any> = null;
   private modalEmergency: ComponentRef<any> = null;
   private modalManejoPrensas: ComponentRef<any> = null;
   private modalAislarTuberia: ComponentRef<any> = null;
   private modalReporteSuspensionServicio: ComponentRef<any> = null;
   private modalMaintenanceHistoric: ComponentRef<any> = null;
   private modalStatisticReports: ComponentRef<any> = null;
   private modalMaintenanceSchedule: ComponentRef<any> = null;
   private modalQualityIndex: ComponentRef<any> = null;
   private modalLegalizationOrder: ComponentRef<any> = null;
   private modalLegalizationDirect: ComponentRef<any> = null;
   private modalGenerarCorrectivo: ComponentRef<any> = null;
   private modalAdicionarElemento: ComponentRef<any> = null;
   private modalConsultarOrdenes: ComponentRef<any> = null;
   private modalRestablecerServicio: ComponentRef<any> = null;
   private modalInterrupcionServicio: ComponentRef<any> = null;
   private modalMainAdmin: ComponentRef<any> = null;
   private modalChangesPassword: ComponentRef<any> = null;
   private watchId: any;
   private fatherOrder: ComponentRef<any> = null;
   private assignContractor: ComponentRef<any> = null;
   private modalPatrol: ComponentRef<any> = null;
   private modalMailingList: ComponentRef<any> = null;
   private modalSecurityRisk: ComponentRef<any> = null;
   private modalTablesType: ComponentRef<any> = null;
   private modalTeam: ComponentRef<any> = null;
   private modalOrderManagement: ComponentRef<any> = null;
   private modalContractor: ComponentRef<any> = null;
   private modalConsultPatrol: ComponentRef<any> = null;
   private modalOrders: ComponentRef<any> = null;
   private modalReportsStatistics: ComponentRef<any> = null;
   // Dashboard.
   public iconDashboard = '';
   private openDashboard = 'assets/images/open_dashboard.png';
   private closeDashboard = 'assets/images/close_dashboard.png';

   @ViewChild('ribbonReference')
   ribbon: jqxRibbonComponent;
   @ViewChild('fileItemButton')
   fileItemButton: jqxDropDownButtonComponent;

   ribbonSettings: jqwidgets.RibbonOptions = {
      position: 'top',
      selectionMode: 'click'
   };

   constructor(
      private mapService: MapService,
      private modalService: ModalService,
      private apiService: ApiService,
      private memoryService: MemoryService,
      private permissionService: PermissionService
   ) {
      this.subscription = this.mapService
         .getMapAction()
         .subscribe((mapAction) => this.handleSelectAction(mapAction));
   }

   ngOnInit() {
      this._urlAI = this._urlAIEnable;
      // Dashboard.
      this.iconDashboard = this.openDashboard;
      this.getRolePermissionData();
   }

   private getRolePermissionData() {
      const observables = [this.getOpcionesLDC(), this.getOpcionesPerfil()];
      const forkJoinSubscription = forkJoin(...observables);
      forkJoinSubscription.subscribe((result) => this.getRolePermissionsDataCompleted(result));
   }

   private getOpcionesLDC(): Observable<any> {
      return this.apiService.callStoreProcedureV2(
         RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerOpcionesApagadasLDC, [
            new InputParameter('un_tipoaplicacion', 1)
         ])
      );
   }

   private getOpcionesPerfil(): Observable<any> {
      return this.apiService.callStoreProcedureV2(
         RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerOpcionesApagadasPerfil,
            [
               new InputParameter('un_usuario', this.memoryService.getItem('currentUser')),
               new InputParameter('un_tipoaplicacion', 1)
            ]
         )
      );
   }

   private getRolePermissionsDataCompleted(result: Array<any>): void {
      // handle LDC permissions response
      this.permissionService.parsePermissionData(this.handleErrorResponse(result[0]), 1, 2);
      // handle User permissions response
      this.permissionService.parsePermissionData(this.handleErrorResponse(result[1]), 3, 4);

      this.disableRibbonTabs();
      this.hideRibbonTabs();
   }

   private handleErrorResponse(json): any {
      const values = Object.keys(json).map((key) => json[key]);
      if (values != null && values.length > 0) {
         const result =
            typeof values[0] === 'string' ? JSON.parse(values[0].toString()) : values[0];
         if (!result['ErrorMessage']) {
            return result;
         } else {
            alert(result['ErrorMessage']);
         }
      }
      return null;
   }

   isOptionDisabled(name: string): boolean {
      return this.permissionService.isOptionDisabled(name);
   }

   isOptionDisabledByNames(names: string[]): boolean {
      return this.permissionService.isOptionDisabledByNames(names);
   }

   isOptionHidden(name: string): boolean {
      return this.permissionService.isOptionHidden(name);
   }

   isOptionHiddenByNames(names: string[]): boolean {
      return this.permissionService.isOptionHiddenByNames(names);
   }

   private hideRibbonTabs(): void {
      const tabNames = this.getRibbonTabNames();
      for (let index = 0; index < tabNames.length; index++) {
         if (this.isOptionHidden(tabNames[index])) {
            this.ribbon.hideAt(index + 1);
         }
      }
   }

   private disableRibbonTabs(): void {
      const tabNames = this.getRibbonTabNames();
      for (let index = 0; index < tabNames.length; index++) {
         if (this.isOptionDisabled(tabNames[index])) {
            this.ribbon.disableAt(index + 1);
         }
      }
   }

   private getRibbonTabNames(): string[] {
      return [
         'ribbonPageMain',
         'ribbonPageQueries',
         'ribbonPageDraw',
         'ribbonPageApplication',
         'ribbonPageNetwork',
         'ribbonPageStation',
         'ribbonPageMaintenance'
      ];
   }

   private handleSelectAction(callModalAction: CallModal): void {
      if (callModalAction.EMapAction === EmapActions.CallModal) {
         switch (callModalAction.EModal) {
            case Emodal.ViewSelection:
               this.openViewSelection(
                  callModalAction.parameters,
                  callModalAction.additionalParameters
               );
               break;
            case Emodal.ViewInformation:
               this.openViewInformation(
                  callModalAction.parameters,
                  callModalAction.additionalParameters
               );
               break;
         }
      }
   }

   ngAfterViewInit(): void {
      this.buttonsStyling();
      this.ribbon.disableAt(0);
      this.ribbon.selectedIndex(1);
      this.fileItemButton.setContent('<img class="img"  src="assets/images/help-26.png"  />');
      this.ribbon.elementRef.nativeElement.firstElementChild.children[1].style.padding =
         '35px 0px 0px';
   }

   showTOC(): void {
      if (this.iconDashboard === this.closeDashboard) {
         this.iconDashboard = this.openDashboard;
         this.ocultarDashboard.emit();
         this.toggleToc.emit();
      } else {
         this.toggleToc.emit();
      }
   }

   showOverViewMap(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.OverViewMap
      });
   }

   zoomIn(): void {
      const zoomAction = <ZoomAction>{ EMapAction: EmapActions.Zoom, factor: 0 };
      this.mapService.executeMapAction(zoomAction);
   }

   zoomOut(): void {
      const zoomAction = <ZoomAction>{
         EMapAction: EmapActions.Zoom,
         factor: 0.5
      };
      this.mapService.executeMapAction(zoomAction);
   }

   zoomInWithRectangle(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.ZoomInWithRectangle
      });
   }

   zoomOutWithRectangle(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.ZoomOutWithRectangle
      });
   }

   pan(): void {
      this.mapService.executeMapAction({ EMapAction: EmapActions.Pan });
   }

   executeFullExtent(): void {
      if (this._urlAI === this._urlAIEnable) {
         this.mapService.executeMapAction({ EMapAction: EmapActions.FullExtent });
      }
   }

   executeRefresh(): void {
      this.mapService.executeMapAction({ EMapAction: EmapActions.RefreshMap });
   }

   executePreviousExtent(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.PreviousExtent
      });
   }

   executeNextExtent(): void {
      this.mapService.executeMapAction({ EMapAction: EmapActions.NextExtent });
   }

   openXYCoordinate(): void {
      if (this._modalXY == null) {
         const conf = new ConfigModal();
         conf.modalTitle = 'Acercar Coordenadas';
         conf.height = 100;
         conf.width = 330;
         this._modalXY = this.modalService.create(XycoordinateComponent, conf);
      } else {
         this._modalXY.instance.open();
      }
   }

   openIdentify(): void {
      if (this.modalIdentify == null) {
         this.modalIdentify = this.modalService.create(IdentifyComponent, {
            modalTitle: 'Identificar',
            height: 300,
            width: 500,
            resizable: true
         });
      } else {
         this.modalIdentify.instance.open();
      }
      this.mapService.executeMapAction(<IdentifyAction>{
         EMapAction: EmapActions.Identify,
         identifyActionType: IdentifyActionType.ActivateIdentifyDraw
      });
   }

   openSeekPredio(): void {
      if (this.modalSeekPredio == null) {
         this.modalSeekPredio = this.modalService.create(SeekPredioComponent, {
            modalTitle: 'Consulta Predio',
            height: 270,
            width: 500,
            resizable: true
         });
      } else {
         this.modalSeekPredio.instance.open();
      }

      this.mapService.executeMapAction({
         EMapAction: EmapActions.SeekPredio
      });
   }

   openObviateValves(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.ObviateValves
      });
   }

   openRadiograficalTest(): void {
      if (this.modalRadiograficalTest == null) {
         this.modalRadiograficalTest = this.modalService.create(RadiograficalTestComponent, {
            modalTitle: 'Pruebas Radiologicas',
            height: 400,
            width: 350,
            resizable: true
         });
      } else {
         this.modalRadiograficalTest.instance.open();
      }
   }

   openStationComponent(): void {
      if (this.modalStationComponent == null) {
         this.modalStationComponent = this.modalService.create(StationComponentComponent, {
            modalTitle: 'Componentes',
            height: 400,
            width: 350,
            resizable: true
         });
      } else {
         this.modalStationComponent.instance.open();
      }
   }

   openStationModification(): void {
      if (this.modalStationModification == null) {
         this.modalStationModification = this.modalService.create(ModificationComponent, {
            modalTitle: 'Modificaciones',
            height: 400,
            width: 350,
            resizable: true
         });
      } else {
         this.modalStationModification.instance.open();
      }
      this.modalStationModification.instance.start();
   }

   openPNeumaticTest(): void {
      if (this.modalPNeumaticTest == null) {
         this.modalPNeumaticTest = this.modalService.create(PneumaticTestComponent, {
            modalTitle: 'Pruebas Neumaticas',
            height: 400,
            width: 350,
            resizable: true
         });
      } else {
         this.modalPNeumaticTest.instance.open();
      }
   }

   openPolyValvulasByLocation(): void {
      if (this.modalPolyValvulasByLocation == null) {
         this.modalPolyValvulasByLocation = this.modalService.create(
            PolyvalvulasByLocationComponent,
            {
               modalTitle: 'Polivalvulas por Localidad',
               height: 120,
               width: 350,
               resizable: true
            }
         );
      } else {
         this.modalPolyValvulasByLocation.instance.open();
      }
   }

   openSquareScheme(): void {
      if (this.modalSquareScheme == null) {
         this.modalSquareScheme = this.modalService.create(SquareSchemeComponent, {
            modalTitle: 'Esquema de manzanas',
            height: 210,
            width: 350,
            resizable: true
         });
      } else {
         this.modalSquareScheme.instance.open();
      }
      this.modalSquareScheme.instance.start();
   }

   openPlotting(): void {
      if (this.modalPlotting == null) {
         this.modalPlotting = this.modalService.create(PlottingComponent, {
            modalTitle: 'Ploteo',
            height: 400,
            width: 350
         });
      } else {
         this.modalPlotting.instance.open();
      }
   }

   searchLocation(): void {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition((location) => {
            const xyAction = <XYCoordinateAction>{
               EMapAction: EmapActions.XYCoordinate,
               x: location.coords.longitude,
               y: location.coords.latitude,
               typeAction: 3
            };
            this.mapService.executeMapAction(xyAction);
         }, this.locationError);
      } else {
         alert('El explorador no soporta esta funcionalidad');
      }
   }

   locationError(error): void {
      console.error(error);
      switch (error.code) {
         case error.PERMISSION_DENIED:
            alert('Location not provided');
            break;
         case error.POSITION_UNAVAILABLE:
            alert('Current location not available');
            break;
         case error.TIMEOUT:
            alert('Timeout');
            break;
         default:
            alert('unknown error');
            break;
      }
   }

   zoomToLocation(location) {
      let xyAction = <XYCoordinateAction>{
         EMapAction: EmapActions.XYCoordinate,
         x: location.coords.longitude,
         y: location.coords.latitude,
         typeAction: 0
      };
      this.mapService.executeMapAction(xyAction);

      xyAction = <XYCoordinateAction>{
         EMapAction: EmapActions.XYCoordinate,
         x: location.coords.longitude,
         y: location.coords.latitude,
         typeAction: 1
      };
      this.mapService.executeMapAction(xyAction);
   }

   openMeasure(): void {
      if (this.modalMeasure == null) {
         this.modalMeasure = this.modalService.create(MeasureComponent, {
            modalTitle: 'Medir',
            height: 140,
            width: 350
         });
      } else {
         this.modalMeasure.instance.open();
      }
   }

   openDrawColor(): void {
      if (this.modalDrawColor == null) {
         this.modalDrawColor = this.modalService.create(DrawColorComponent, {
            modalTitle: 'Propiedades de Dibujo',
            height: 320,
            width: 280,
            resizable: true
         });
      } else {
         this.modalDrawColor.instance.open();
      }
   }

   openSelect(): void {
      if (this.modalSelect == null) {
         this.modalSelect = this.modalService.create(SelectionComponent, {
            modalTitle: 'Seleccionar',
            height: 105,
            width: 450
         });
      } else {
         this.modalSelect.instance.open();
      }
   }

   openPrintMap(): void {
      if (this.modalPrintMap == null) {
         this.modalPrintMap = this.modalService.create(PrintMapComponent, {
            modalTitle: 'Exportar mapa',
            height: 130,
            width: 350
         });
      } else {
         this.modalPrintMap.instance.open();
      }
   }

   openGeoZoom(): void {
      if (this.modalGeoZoom == null) {
         this.modalGeoZoom = this.modalService.create(GeoZoomComponent, {
            modalTitle: 'Acercamiento Geográfico',
            height: 150,
            width: 350
         });
      } else {
         this.modalGeoZoom.instance.open();
      }
   }

   executeSetAI(): void {
      if (this._urlAI === this._urlAIEnable) {
         this._urlAI = this._urlAIDisable;
      } else {
         this._urlAI = this._urlAIEnable;
      }

      this.mapService.executeMapAction({
         EMapAction: EmapActions.SetAI
      });
   }

   buttonsStyling(): void {
      for (let i = 0; i < document.getElementsByTagName('jqxbutton').length; i++) {
         (<HTMLElement>(
            document.getElementsByTagName('jqxbutton')[i].firstElementChild
         )).style.display = 'inline-block';
         (<HTMLElement>(
            document.getElementsByTagName('jqxbutton')[i].firstElementChild
         )).setAttribute('checked', 'false');
      }

      this.fileItemButton.elementRef.nativeElement.firstElementChild.style.color = 'white';
      this.fileItemButton.elementRef.nativeElement.firstElementChild.style.background =
         'transparent';
   }

   executeDrawPoint(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawPoint
      });
   }

   executeDrawLine(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawLine
      });
   }

   executeDrawPolygon(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawPolygon
      });
   }

   executeDrawRectangle(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawRectangle
      });
   }

   executeDrawArrow(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawArrow
      });
   }

   executeDrawEllipse(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawEllipse
      });
   }

   executeDrawCircle(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawCircle
      });
   }

   executeDrawFreehandPolyLine(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawFreehandPolyLine
      });
   }

   executeDrawText(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DrawText
      });
   }

   executeClearGraphic(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.ClearGraphic
      });
   }

   executeDeleteGraphic(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.DeleteDraw
      });
   }

   executeEditGraphic(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.EditElement
      });
   }

   executeFullScreen(): void {
      const docElm = <any>document.documentElement;
      if (!this.fullScreen) {
         this.fullScreen = !this.fullScreen;
         if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
         } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
         } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
         } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
         }
      } else {
         this.fullScreen = !this.fullScreen;
         const doc = <any>document;
         if (doc.exitFullscreen) {
            doc.exitFullscreen();
         } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
         } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
         } else if (doc.webkitCancelFullScreen) {
            doc.webkitCancelFullScreen();
         }
      }
   }

   executeSelectWithRectangle(): void {
      this.mapService.executeMapAction(<SelectAction>{
         EMapAction: EmapActions.Select,
         selectActionType: SelectActionType.SelectWithRectangle,
         owner: OwnerSelection.SelectionTool
      });
   }

   executeSelectWithLine(): void {
      this.mapService.executeMapAction(<SelectAction>{
         EMapAction: EmapActions.Select,
         selectActionType: SelectActionType.SelectWithLine,
         owner: OwnerSelection.SelectionTool
      });
   }

   executeSelectWithCircle(): void {
      this.mapService.executeMapAction(<SelectAction>{
         EMapAction: EmapActions.Select,
         selectActionType: SelectActionType.SelectWithCircle,
         owner: OwnerSelection.SelectionTool
      });
   }

   executeSelectWithPolygon(): void {
      this.mapService.executeMapAction(<SelectAction>{
         EMapAction: EmapActions.Select,
         selectActionType: SelectActionType.SelectWithPolygon,
         owner: OwnerSelection.SelectionTool
      });
   }

   executeRemoveSelectedFeatures(): void {
      this.mapService.executeMapAction(<SelectAction>{
         EMapAction: EmapActions.Select,
         selectActionType: SelectActionType.DeleteSelection,
         owner: OwnerSelection.genericAction
      });
   }

   executeZoomToSelection(): void {
      this.mapService.executeMapAction(<SelectAction>{
         EMapAction: EmapActions.Select,
         selectActionType: SelectActionType.ZoomToSelection,
         owner: OwnerSelection.SelectionTool
      });
   }

   openViewSelection(evt: any, additionalParameters: any): void {
      if (this.modalViewSelection == null) {
         this.modalViewSelection = this.modalService.create(ViewSelectionComponent, {
            modalTitle: 'Elementos Seleccionados',
            height: 250,
            width: 700
         });
      } else {
         this.modalViewSelection.instance.open();
      }
      this.modalViewSelection.instance.start({
         results: evt,
         additionalParameters: additionalParameters
      });
   }

   // View Project Information.
   openViewInformation(evt: any, additionalParameters: any): void {
      if (this.modalViewInformation == null) {
         this.modalViewInformation = this.modalService.create(ViewInformationComponent, {
            modalTitle: 'Información de Proyecto',
            height: 250,
            width: 700
         });
      } else {
         this.modalViewInformation.instance.open();
      }
      this.modalViewInformation.instance.start({
         results: evt,
         additionalParameters: additionalParameters
      });
   }

   openAddBookmark(): void {
      if (this.modalAddBookmark == null) {
         this.modalAddBookmark = this.modalService.create(BookmarkComponent, {
            modalTitle: 'Marcadores',
            height: 170,
            width: 400,
            resizable: false
         });
      } else {
         this.modalAddBookmark.instance.open();
      }
   }

   openAttachment(): void {
      if (this.modalAttachment == null) {
         this.modalAttachment = this.modalService.create(AttachmentComponent, {
            modalTitle: 'Adjuntos',
            height: 475,
            width: 400,
            resizable: true
         });
      } else {
         this.modalAttachment.instance.open();
      }
      this.modalAttachment.instance.start();
   }

   openNetworkCoverage(): void {
      if (this.modalNetworkCoverage == null) {
         this.modalNetworkCoverage = this.modalService.create(NetworkCoverageComponent, {
            modalTitle: 'Cobertura de Red',
            height: 400,
            width: 400,
            resizable: true
         });
      } else {
         this.modalNetworkCoverage.instance.open();
      }
   }

   openRisksManagement(): void {
      if (this.modalRisksManagement == null) {
         this.modalRisksManagement = this.modalService.create(RisksManagementComponent, {
            modalTitle: 'Administración de Riesgos',
            height: 400,
            width: 400,
            resizable: true
         });
      } else {
         this.modalRisksManagement.instance.open();
      }
   }

   openAddressSearch(): void {
      if (this.modalAddressSearch == null) {
         this.modalAddressSearch = this.modalService.create(AddressSearchComponent, {
            modalTitle: 'Búsqueda Dirección',
            height: 435,
            width: 420,
            resizable: true
         });
      } else {
         this.modalAddressSearch.instance.open();
      }
   }

   openSpatialCrossing(): void {
      if (this.modalSpatialCrossing == null) {
         this.modalSpatialCrossing = this.modalService.create(SpatialCrossingComponent, {
            modalTitle: 'Cruces Especiales',
            height: 250,
            width: 500,
            resizable: true
         });
      } else {
         this.modalSpatialCrossing.instance.open();
      }
   }

   openThematicMap(): void {
      if (this.modalThematicMap == null) {
         this.modalThematicMap = this.modalService.create(ThematicMapComponent, {
            modalTitle: 'Mapas Temáticos',
            height: 435,
            width: 500,
            resizable: false
         });
      } else {
         this.modalThematicMap.instance.open();
      }
      this.modalThematicMap.instance.start();
   }

   openProjectBudget(): void {
      if (this.modalProjectBudget == null) {
         this.modalProjectBudget = this.modalService.create(ProjectBudgetComponent, {
            modalTitle: 'Presupuesto de Proyecto',
            height: 370,
            width: 470,
            resizable: true
         });
      } else {
         this.modalProjectBudget.instance.open();
      }
   }

   openProjectInformation(): void {
      if (this.modalProjectInformation == null) {
         this.modalProjectInformation = this.modalService.create(ProjectInformationComponent, {
            modalTitle: 'Información de Proyecto',
            height: 340,
            width: 470
         });
      } else {
         this.modalProjectInformation.instance.open();
      }
   }

   openChangeStratum(): void {
      if (this.modalChangeStratum == null) {
         this.modalChangeStratum = this.modalService.create(ChangeStratumComponent, {
            modalTitle: 'Cambiar Estrato',
            height: 430,
            width: 430,
            resizable: true
         });
      } else {
         this.modalChangeStratum.instance.open();
      }
   }

   openSearches(): void {
      if (this.modalSearchesStratum == null) {
         this.modalSearchesStratum = this.modalService.create(SearchesComponent, {
            modalTitle: 'Búsquedas',
            height: 430,
            width: 430,
            resizable: true
         });
      } else {
         this.modalSearchesStratum.instance.open();
      }
      this.modalSearchesStratum.instance.start();
   }

   openQueryBuilder(): void {
      if (this.modalQueryBuilder == null) {
         this.modalQueryBuilder = this.modalService.create(QueryBuilderComponent, {
            modalTitle: 'Generador de consulta',
            height: 430,
            width: 430,
            resizable: true
         });
      } else {
         this.modalQueryBuilder.instance.open();
      }
   }

   openConsult(): void {
      if (this.modalConsultStratum == null) {
         this.modalConsultStratum = this.modalService.create(ConsultComponent, {
            modalTitle: 'Consultas',
            height: 430,
            width: 430,
            resizable: true
         });
      } else {
         this.modalConsultStratum.instance.open();
      }
      this.modalConsultStratum.instance.start();
   }

   openUser(): void {
      if (this.modalAffectedUser == null) {
         this.modalAffectedUser = this.modalService.create(AffectedUsersComponent, {
            modalTitle: 'Usuarios Afectados',
            height: 250,
            width: 700,
            resizable: true
         });
      } else {
         this.modalAffectedUser.instance.open();
      }
      this.modalAffectedUser.instance.start();
   }

   openRecalculateUser(): void {
      if (this.modalRecalculateAffectedUser == null) {
         this.modalRecalculateAffectedUser = this.modalService.create(
            RecalculateAffectedUsersComponent,
            {
               modalTitle: 'Recalcular Usuarios Afectados',
               height: 250,
               width: 700,
               resizable: true
            }
         );
      } else {
         this.modalRecalculateAffectedUser.instance.open();
      }
      this.modalRecalculateAffectedUser.instance.start();
   }

   openAvailableOperator(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.AvailableOperator
      });
   }

   openEmergency(): void {
      if (this.modalEmergency == null) {
         this.modalEmergency = this.modalService.create(EmergencyComponent, {
            modalTitle: 'Ver Emergencias',
            height: 135,
            width: 320,
            resizable: true
         });
      } else {
         this.modalEmergency.instance.open();
      }
      this.modalEmergency.instance.start();
   }

   openManejoPrensas(): void {
      if (this.modalManejoPrensas == null) {
         this.modalManejoPrensas = this.modalService.create(ManejoPrensasComponent, {
            modalTitle: 'Administrar Prensas',
            height: 300,
            width: 520,
            resizable: true
         });
      } else {
         this.modalManejoPrensas.instance.open();
      }
      this.modalManejoPrensas.instance.start();
   }

   openAislarTuberia(): void {
      if (this.modalAislarTuberia == null) {
         this.modalAislarTuberia = this.modalService.create(AislarTuberiaComponent, {
            modalTitle: 'Aislar Tuberia',
            height: 200,
            width: 430,
            resizable: true
         });
      } else {
         this.modalAislarTuberia.instance.open();
      }
      this.modalAislarTuberia.instance.start();
   }

   openReporteSuspensionServicio(): void {
      if (this.modalReporteSuspensionServicio == null) {
         this.modalReporteSuspensionServicio = this.modalService.create(
            ReporteSuspensionServicioComponent,
            {
               modalTitle: 'Reporte de Suspensión de Servicio',
               height: 150,
               width: 390,
               resizable: true
            }
         );
      } else {
         this.modalReporteSuspensionServicio.instance.open();
      }
      this.modalReporteSuspensionServicio.instance.start();
   }

   openStatisticReports(): void {
      if (this.modalStatisticReports == null) {
         this.modalStatisticReports = this.modalService.create(StatisticReportsComponent, {
            modalTitle: 'Reportes Estadísticos',
            height: 220,
            width: 430,
            resizable: true
         });
      } else {
         this.modalStatisticReports.instance.open();
      }
      this.modalStatisticReports.instance.start();
   }

   openMaintenanceHistoric(): void {
      if (this.modalMaintenanceHistoric == null) {
         this.modalMaintenanceHistoric = this.modalService.create(MaintenanceHistoricComponent, {
            modalTitle: 'Histórico Mantenimiento',
            height: 160,
            width: 290,
            resizable: true
         });
      } else {
         this.modalMaintenanceHistoric.instance.open();
      }
      this.modalMaintenanceHistoric.instance.start();
   }

   openMaintenanceSchedule(): void {
      if (this.modalMaintenanceSchedule == null) {
         this.modalMaintenanceSchedule = this.modalService.create(MaintenanceScheduleComponent, {
            modalTitle: 'Cronograma Mantenimiento',
            height: 185,
            width: 370,
            resizable: true
         });
      } else {
         this.modalMaintenanceSchedule.instance.open();
      }
      this.modalMaintenanceSchedule.instance.start();
   }

   openQualityIndex(): void {
      if (this.modalQualityIndex == null) {
         this.modalQualityIndex = this.modalService.create(QualityIndexComponent, {
            modalTitle: 'Indice de Calidad',
            height: 235,
            width: 330,
            resizable: true
         });
      } else {
         this.modalQualityIndex.instance.open();
      }
      this.modalQualityIndex.instance.start();
   }

   // Legalización Orden
   openLegalizationOrder(): void {
      if (this.modalLegalizationOrder == null) {
         this.modalLegalizationOrder = this.modalService.create(LegalizationOrderComponent, {
            modalTitle: 'Legalizar Ordenes',
            height: 575,
            width: 970,
            resizable: true
         });
      } else {
         this.modalLegalizationOrder.instance.open();
      }
      this.modalLegalizationOrder.instance.start();
   }

   // Legalización Directa
   openLegalizationDirect(): void {
      if (this.modalLegalizationDirect == null) {
         this.modalLegalizationDirect = this.modalService.create(LegalizationDirectComponent, {
            modalTitle: 'Legalización Directa',
            height: 600,
            width: 960,
            resizable: true
         });
      } else {
         this.modalLegalizationDirect.instance.open();
      }
      this.modalLegalizationDirect.instance.start();
   }

   // generar correctivo
   openGenerarCorrectivo(): void {
      if (this.modalGenerarCorrectivo == null) {
         this.modalGenerarCorrectivo = this.modalService.create(GenerarCorrectComponent, {
            modalTitle: 'Orden de Correctivo',
            height: 410,
            width: 660,
            resizable: true
         });
      } else {
         this.modalGenerarCorrectivo.instance.open();
      }
      this.modalGenerarCorrectivo.instance.start();
   }
   // Adicionar Elemento
   openAdicionarElemento(): void {
      if (this.modalAdicionarElemento == null) {
         this.modalAdicionarElemento = this.modalService.create(AdicionarElementComponent, {
            modalTitle: 'Agregar Elemento a Orden',
            height: 300,
            width: 560,
            resizable: true
         });
      } else {
         this.modalAdicionarElemento.instance.open();
      }
      this.modalAdicionarElemento.instance.start();
   }
   // consultar Ordenes
   openConsultarOrdenes(): void {
      if (this.modalConsultarOrdenes == null) {
         this.modalConsultarOrdenes = this.modalService.create(ConsultarOrdenesComponent, {
            modalTitle: 'Consulta de Elementos y Ordenes',
            height: 600,
            width: 860,
            resizable: true
         });
      } else {
         this.modalConsultarOrdenes.instance.open();
      }
      this.modalConsultarOrdenes.instance.start();
   }
   openRestablecerServicio(): void {
      if (this.modalRestablecerServicio == null) {
         this.modalRestablecerServicio = this.modalService.create(RestablecerServicioComponent, {
            modalTitle: 'Restablecer Servicio',
            height: 210,
            width: 330,
            resizable: true
         });
      } else {
         this.modalRestablecerServicio.instance.open();
      }
      this.modalRestablecerServicio.instance.start();
   }

   openInterrupcionServicio(): void {
      if (this.modalInterrupcionServicio == null) {
         this.modalInterrupcionServicio = this.modalService.create(InterrupcionServicioComponent, {
            modalTitle: 'Interrupción de Servicio',
            height: 250,
            width: 390,
            resizable: true
         });
      } else {
         this.modalInterrupcionServicio.instance.open();
      }
      this.modalInterrupcionServicio.instance.start();
   }

   initModifyAffectedUsers(): void {
      this.mapService.executeMapAction({
         EMapAction: EmapActions.ModifyAffectedUsers
      });
   }

   logOut(): void {
      window.location.reload();
   }

   openAdmin(): void {
      if (this.modalMainAdmin == null) {
         this.modalMainAdmin = this.modalService.create(MainAdminComponent, {
            modalTitle: 'Administración SIGGAS',
            height: 400,
            width: 600,
            resizable: true
         });
      } else {
         this.modalMainAdmin.instance.open();
      }
      this.modalMainAdmin.instance.start();
   }

   openChangePassword(): void {
      if (this.modalChangesPassword == null) {
         this.modalChangesPassword = this.modalService.create(ChangePasswordComponent, {
            modalTitle: `Cambiar Contraseña a ${this.memoryService.getItem('currentUser')}`,
            height: 150,
            width: 450,
            resizable: true
         });
      } else {
         this.modalChangesPassword.instance.open();
      }
      this.modalChangesPassword.instance.start({
         data: this.memoryService.getItem('currentUser'),
         isAdmin: false
      });
   }

   // Orden Padre.
   openFatherOrder(): void {
      if (this.fatherOrder == null) {
         this.fatherOrder = this.modalService.create(FatherOrderComponent, {
            modalTitle: 'Generar Orden Padre',
            height: 170,
            width: 370,
            resizable: true
         });
      } else {
         this.fatherOrder.instance.open();
      }
      this.fatherOrder.instance.start();
   }

   // Contratistas.
   openAssignContractor(): void {
      if (this.assignContractor == null) {
         this.assignContractor = this.modalService.create(AssignContractorComponent, {
            modalTitle: 'Asignar Orden Padre a un Contratista',
            height: 200,
            width: 400,
            resizable: true
         });
      } else {
         this.assignContractor.instance.open();
      }
      this.assignContractor.instance.start();
   }

   // Patrulleros.
   openPatrol(): void {
      if (this.modalPatrol == null) {
         this.modalPatrol = this.modalService.create(PatrolComponent, {
            modalTitle: 'Manejo de Datos de Patrulleros',
            height: 280,
            width: 620,
            resizable: true
         });
      } else {
         this.modalPatrol.instance.open();
      }
      this.modalPatrol.instance.start();
   }

   // Lista de Correos.
   openMailingList(): void {
      if (this.modalMailingList == null) {
         this.modalMailingList = this.modalService.create(MailingListComponent, {
            modalTitle: 'Lista de Correos para Alerta de Mantenimiento Correctivos',
            height: 275,
            width: 750,
            resizable: true
         });
      } else {
         this.modalMailingList.instance.open();
      }
      this.modalMailingList.instance.start();
   }

   // Riesgo de Seguridad.
   openSecurityRisk(): void {
      if (this.modalSecurityRisk == null) {
         this.modalSecurityRisk = this.modalService.create(SecurityRiskComponent, {
            modalTitle: 'Manzanas con Problemas de Seguridad',
            height: 230,
            width: 550,
            resizable: true
         });
      } else {
         this.modalSecurityRisk.instance.open();
      }
      this.modalSecurityRisk.instance.start();
   }

   // Tablas Tipo.
   openTablesType(): void {
      if (this.modalTablesType == null) {
         this.modalTablesType = this.modalService.create(TablesTypeComponent, {
            modalTitle: 'Manejo de Tablas de Soporte (Tipo)',
            height: 395,
            width: 530,
            resizable: true
         });
      } else {
         this.modalTablesType.instance.open();
      }
      this.modalTablesType.instance.start();
   }

   // Equipos de Detección.
   openTeam(): void {
      if (this.modalTeam == null) {
         this.modalTeam = this.modalService.create(TeamComponent, {
            modalTitle: 'Equipos de Detección',
            height: 360,
            width: 470,
            resizable: true
         });
      } else {
         this.modalTeam.instance.open();
      }
      this.modalTeam.instance.start();
   }

   // Gestión de Ordenes.
   openOrderManagement(): void {
      if (this.modalOrderManagement == null) {
         this.modalOrderManagement = this.modalService.create(OrderManagementComponent, {
            modalTitle: 'Gestión de ordenes de mantenimiento',
            height: 370,
            width: 780,
            resizable: true
         });
      } else {
         this.modalOrderManagement.instance.open();
      }
      this.modalOrderManagement.instance.start();
   }

   // Contratista.
   openContractor(): void {
      if (this.modalContractor == null) {
         this.modalContractor = this.modalService.create(ContractorComponent, {
            modalTitle: 'Consulta de información de contratistas',
            height: 420,
            width: 570,
            resizable: true
         });
      } else {
         this.modalContractor.instance.open();
      }
      this.modalContractor.instance.start();
   }

   // Consultar Patrullero.
   openConsultPatrol(): void {
      if (this.modalConsultPatrol == null) {
         this.modalConsultPatrol = this.modalService.create(ConsultPatrolComponent, {
            modalTitle: 'Consulta de información de patrulleros',
            height: 450,
            width: 790,
            resizable: true
         });
      } else {
         this.modalConsultPatrol.instance.open();
      }
      this.modalConsultPatrol.instance.start();
   }

   // Ordenes.
   openOrders(): void {
      if (this.modalOrders == null) {
         this.modalOrders = this.modalService.create(OrdersComponent, {
            modalTitle: 'Consulta de información de ordenes',
            height: 586,
            width: 850,
            resizable: true
         });
      } else {
         this.modalOrders.instance.open();
      }
      this.modalOrders.instance.start();
   }

   // Reportes y Estadísticas.
   openReportsStatistics(): void {
      if (this.modalReportsStatistics == null) {
         this.modalReportsStatistics = this.modalService.create(ReportsStatisticsComponent, {
            modalTitle: 'Reporte de órdenes de mantenimiento',
            height: 515,
            width: 700,
            resizable: true
         });
      } else {
         this.modalReportsStatistics.instance.open();
      }
      this.modalReportsStatistics.instance.start();
   }

   // Dashboard.
   dashboard() {
      if (this.iconDashboard === this.openDashboard) {
         this.iconDashboard = this.closeDashboard;
         this.mostrarDashboard.emit();
      } else if (this.iconDashboard === this.closeDashboard) {
         this.iconDashboard = this.openDashboard;
         this.ocultarDashboard.emit();
      }
   }

   scrollRight(div) {
      $('#' + div).animate(
         {
            scrollLeft: '+=100px'
         },
         'slow'
      );
   }

   scrollLeft(div) {
      $('#' + div).animate(
         {
            scrollLeft: '-=100px'
         },
         'slow'
      );
   }
}
