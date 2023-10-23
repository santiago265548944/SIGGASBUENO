import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { EsriTocComponent } from './esri-toc/esri-toc.component';
import { RibbonComponent } from './ribbon/ribbon.component';
import { MapService } from './map-service/map.service';
import { DrawService } from './map-service/draw.service';
import { ModalModule } from './modal.module';
import { GenericModalComponent } from './generic-modal/generic-modal.component';
import { BaseModalComponent } from './base-modal/base-modal.component';
import { jqxWindowComponent } from '../../node_modules/jqwidgets-scripts/jqwidgets-ts/angular_jqxwindow';
import { jqxRibbonComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxribbon';
import { jqxButtonComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxbuttons';
import { jqxTooltipComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtooltip';
import { jqxDropDownButtonComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdropdownbutton';
import { jqxColorPickerComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxcolorpicker';
import { jqxDropDownListComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdropdownlist';
import { jqxToggleButtonComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtogglebutton';
import { jqxSplitterComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxsplitter';
import { jqxNavigationBarComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxnavigationbar';
import { jqxNumberInputComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxnumberinput';
import { jqxExpanderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxexpander';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { jqxTabsComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtabs';
import { jqxGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid';
import { jqxListBoxComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxlistbox';
import { XycoordinateComponent } from './xycoordinate/xycoordinate.component';
import { ApiService } from './api/api.service';
import { MemoryService } from './cache/memory.service';
import { IdentifyComponent } from './identify/identify.component';
import { IdentifyResultItemComponent } from './identify/identify-result-item/identify-result-item.component';
import { IdentifyResultDataComponent } from './identify/identify-result-data/identify-result-data.component';
import { DrawColorComponent } from './draw-color/draw-color.component';
import { SelectionComponent } from './selection/selection.component';
import { PrintMapComponent } from './print-map/print-map.component';
import { MeasureComponent } from './measure/measure.component';
import { ViewSelectionComponent } from './selection/view-selection/view-selection.component';
import { GeoZoomComponent } from './geo-zoom/geo-zoom.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { EmbeddedSelectionComponent } from './selection/embedded-selection/embedded-selection.component';
import { AttachmentComponent } from './searches/attachment/attachment.component';
import { SeekPredioComponent } from './Applications/seek-predio/seek-predio.component';
import { RadiograficalTestComponent } from './stations/radiografical-test/radiografical-test.component';
import { PneumaticTestComponent } from './stations/pneumatic-test/pneumatic-test.component';
import { NetworkCoverageComponent } from './Applications/network-coverage/network-coverage.component';
import { ModificationComponent } from './stations/modification/modification.component';
import { StationComponentComponent } from './stations/station-component/station-component.component';
import { GlobalService } from './Globals/global.service';
import { RisksManagementComponent } from './searches/risks-management/risks-management.component';
import { AddressSearchComponent } from './Applications/address-search/address-search.component';
import { PolyvalvulasByLocationComponent } from './Applications/polyvalvulas-by-location/polyvalvulas-by-location.component';
import { SquareSchemeComponent } from './searches/square-scheme/square-scheme.component';
import { SpatialCrossingComponent } from './Applications/spatial-crossing/spatial-crossing.component';
import { PlottingComponent } from './searches/plotting/plotting.component';
import { ProjectBudgetComponent } from './Applications/project-budget/project-budget.component';
import { ProjectInformationComponent } from './Applications/project-information/project-information.component';
import { ChangeStratumComponent } from './Applications/change-stratum/change-stratum.component';
import { SearchesComponent } from './Applications/searches/searches.component';
import { DynamicFormComponent } from './Applications/dynamic-input/dynamic-form/dynamic-form.component';
import { ConsultComponent } from './Applications/consult/consult.component';
import { ThematicMapComponent } from './Applications/thematic-map/thematic-map.component';
import { QueryBuilderComponent } from './searches/query-builder/query-builder.component';
import { LegendThematicComponent } from './Applications/thematic-map/legend-thematic/legend-thematic.component';
import { AffectedUsersComponent } from './network/affected-users/affected-users.component';
import { RecalculateAffectedUsersComponent } from './network/recalculate-affected-users/recalculate-affected-users.component';
import { EmergencyComponent } from './network/emergency/emergency.component';
import { ManejoPrensasComponent } from './network/manejo-prensas/manejo-prensas.component';
import { AislarTuberiaComponent } from './network/aislar-tuberia/aislar-tuberia.component';
import { CrearPrensasComponent } from './network/manejo-prensas/crear-prensas/crear-prensas.component';
import { GenericTasksService } from './generic-class/generic-tasks.service';
import { ReporteSuspensionServicioComponent } from './network/reporte-suspension-servicio/reporte-suspension-servicio.component';
import { MaintenanceHistoricComponent } from './maintenance/maintenance-historic/maintenance-historic.component';
import { StatisticReportsComponent } from './maintenance/statistic-reports/statistic-reports.component';
import { MaintenanceScheduleComponent } from './maintenance/maintenance-schedule/maintenance-schedule.component';
import { QualityIndexComponent } from './maintenance/quality-index/quality-index.component';
import { RestablecerServicioComponent } from './network/restablecer-servicio/restablecer-servicio.component';
import { InterrupcionServicioComponent } from './network/interrupcion-servicio/interrupcion-servicio.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './login/auth-guard';
import { routing } from './app-routes';
import { MainAdminComponent } from './admin/main-admin/main-admin.component';
import { AdminContainerComponent } from './admin/admin-container/admin-container.component';
import { AdminHostDirective } from './admin/admin-container/admin-host.directive';
import { AdminEditableGridComponent } from './admin/admin-editable-grid/admin-editable-grid.component';
import { GenericWithOneGridComponent } from './admin/generic-with-one-grid/generic-with-one-grid.component';
import { GenericWithTwoGridsComponent } from './admin/generic-with-two-grids/generic-with-two-grids.component';
import { SpatialRelationComponent } from './admin/spatial-relation/spatial-relation.component';
import { ChangePasswordComponent } from './login/change-password/change-password.component';
import { EtaEditorComponent } from './admin/spatial-relation/eta-editor/eta-editor.component';
import { ThetaEditorComponent } from './admin/spatial-relation/theta-editor/theta-editor.component';
import { DynamicValuesComponent } from './admin/dynamic-values/dynamic-values.component';
import { BetaEditorComponent } from './admin/dynamic-values/beta-editor/beta-editor.component';
import { GammaEditorComponent } from './admin/dynamic-values/gamma-editor/gamma-editor.component';
import { DeltaEditorComponent } from './admin/dynamic-values/delta-editor/delta-editor.component';
import { DsetaEditorComponent } from './admin/dynamic-values/dseta-editor/dseta-editor.component';
import { EpsilonEditorComponent } from './admin/dynamic-values/epsilon-editor/epsilon-editor.component';
import { AlphaEditorComponent } from './admin/dynamic-values/alpha-editor/alpha-editor.component';
import { HistoricComponent } from './admin/historic/historic.component';
import { PermissionService } from './security/permission.service';
import { ViewInformationComponent } from './Applications/project-information/view-information/view-information.component';
// tslint:disable-next-line:max-line-length
import { ProjectRegistrationComponent } from './Applications/project-information/view-information/project-registration/project-registration.component';
import { FatherOrderComponent } from './patrol/father-order/father-order.component';
import { AssignContractorComponent } from './patrol/assign-contractor/assign-contractor.component';
import { PatrolComponent } from './patrol/patrol/patrol.component';
import { MailingListComponent } from './patrol/mailing-list/mailing-list.component';
import { SecurityRiskComponent } from './patrol/security-risk/security-risk.component';
import { TablesTypeComponent } from './patrol/tables-type/tables-type.component';
import { TeamComponent } from './patrol/team/team.component';
import { OrderManagementComponent } from './patrol/order-management/order-management.component';
import { ContractorComponent } from './patrol/contractor/contractor.component';
import { ConsultPatrolComponent } from './patrol/consult-patrol/consult-patrol.component';
import { OrdersComponent } from './patrol/orders/orders.component';
import { ReportsStatisticsComponent } from './patrol/reports-statistics/reports-statistics.component';
import { SidebarLeftComponent } from './dashboard/sidebar-left/sidebar-left.component';
import { SidebarBottomComponent } from './dashboard/sidebar-bottom/sidebar-bottom.component';
import { SidebarRightComponent } from './dashboard/sidebar-right/sidebar-right.component';
import { jqxChartComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxchart';
import { jqxBarGaugeComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxbargauge';
import { LegalizationOrderComponent } from './maintenance/legalization-order/legalization-order.component';
import { LegalizationDirectComponent } from './maintenance/legalization-direct/legalization-direct.component';
import { ExecuteOrderComponent } from './maintenance/execute-order/execute-order.component';
import { GenerarCorrectComponent } from './maintenance/generar-correct/generar-correct.component';
import { AdicionarElementComponent } from './maintenance/adicionar-element/adicionar-element.component';
import { ConsultarOrdenesComponent } from './maintenance/consultar-ordenes/consultar-ordenes.component';
import { DataSharingService } from './service/data-sharing.service';

@NgModule({
   declarations: [
      AppComponent,
      EsriMapComponent,
      EsriTocComponent,
      RibbonComponent,
      GenericModalComponent,
      BaseModalComponent,
      jqxWindowComponent,
      jqxRibbonComponent,
      jqxButtonComponent,
      jqxTooltipComponent,
      jqxDropDownButtonComponent,
      jqxColorPickerComponent,
      jqxDropDownListComponent,
      jqxToggleButtonComponent,
      jqxSplitterComponent,
      jqxNavigationBarComponent,
      jqxNumberInputComponent,
      jqxExpanderComponent,
      jqxDataTableComponent,
      jqxLoaderComponent,
      jqxTabsComponent,
      jqxGridComponent,
      jqxListBoxComponent,
      XycoordinateComponent,
      IdentifyComponent,
      IdentifyResultItemComponent,
      IdentifyResultDataComponent,
      DrawColorComponent,
      SelectionComponent,
      PrintMapComponent,
      MeasureComponent,
      ViewSelectionComponent,
      GeoZoomComponent,
      BookmarkComponent,
      EmbeddedSelectionComponent,
      AttachmentComponent,
      SeekPredioComponent,
      RadiograficalTestComponent,
      PneumaticTestComponent,
      NetworkCoverageComponent,
      ModificationComponent,
      StationComponentComponent,
      RisksManagementComponent,
      AddressSearchComponent,
      PolyvalvulasByLocationComponent,
      SquareSchemeComponent,
      SpatialCrossingComponent,
      PlottingComponent,
      ProjectBudgetComponent,
      ProjectInformationComponent,
      ChangeStratumComponent,
      SearchesComponent,
      ConsultComponent,
      DynamicFormComponent,
      ThematicMapComponent,
      QueryBuilderComponent,
      LegendThematicComponent,
      AffectedUsersComponent,
      RecalculateAffectedUsersComponent,
      EmergencyComponent,
      ManejoPrensasComponent,
      AislarTuberiaComponent,
      CrearPrensasComponent,
      ReporteSuspensionServicioComponent,
      MaintenanceHistoricComponent,
      StatisticReportsComponent,
      MaintenanceScheduleComponent,
      QualityIndexComponent,
      RestablecerServicioComponent,
      InterrupcionServicioComponent,
      LoginComponent,
      HomeComponent,
      MainAdminComponent,
      AdminContainerComponent,
      AdminHostDirective,
      AdminEditableGridComponent,
      GenericWithOneGridComponent,
      GenericWithTwoGridsComponent,
      SpatialRelationComponent,
      ChangePasswordComponent,
      EtaEditorComponent,
      ThetaEditorComponent,
      DynamicValuesComponent,
      BetaEditorComponent,
      GammaEditorComponent,
      DeltaEditorComponent,
      DsetaEditorComponent,
      EpsilonEditorComponent,
      AlphaEditorComponent,
      HistoricComponent,
      ViewInformationComponent,
      ProjectRegistrationComponent,
      FatherOrderComponent,
      AssignContractorComponent,
      PatrolComponent,
      MailingListComponent,
      SecurityRiskComponent,
      TablesTypeComponent,
      TeamComponent,
      OrderManagementComponent,
      ContractorComponent,
      ConsultPatrolComponent,
      OrdersComponent,
      ReportsStatisticsComponent,
      SidebarLeftComponent,
      SidebarBottomComponent,
      SidebarRightComponent,
      jqxChartComponent,
      jqxBarGaugeComponent,
      LegalizationOrderComponent,
      LegalizationDirectComponent,
      GenerarCorrectComponent,
      AdicionarElementComponent,
      ConsultarOrdenesComponent,
      ExecuteOrderComponent
   ],
   entryComponents: [
      GenericModalComponent,
      XycoordinateComponent,
      IdentifyComponent,
      DrawColorComponent,
      SelectionComponent,
      PrintMapComponent,
      MeasureComponent,
      ViewSelectionComponent,
      GeoZoomComponent,
      BookmarkComponent,
      AttachmentComponent,
      SeekPredioComponent,
      RadiograficalTestComponent,
      NetworkCoverageComponent,
      PneumaticTestComponent,
      ModificationComponent,
      StationComponentComponent,
      RisksManagementComponent,
      AddressSearchComponent,
      PolyvalvulasByLocationComponent,
      SquareSchemeComponent,
      SpatialCrossingComponent,
      PlottingComponent,
      ProjectBudgetComponent,
      ProjectInformationComponent,
      ChangeStratumComponent,
      SearchesComponent,
      ConsultComponent,
      ThematicMapComponent,
      QueryBuilderComponent,
      LegendThematicComponent,
      AffectedUsersComponent,
      RecalculateAffectedUsersComponent,
      EmergencyComponent,
      ManejoPrensasComponent,
      AislarTuberiaComponent,
      CrearPrensasComponent,
      ReporteSuspensionServicioComponent,
      MaintenanceHistoricComponent,
      StatisticReportsComponent,
      MaintenanceScheduleComponent,
      QualityIndexComponent,
      RestablecerServicioComponent,
      InterrupcionServicioComponent,
      MainAdminComponent,
      GenericWithOneGridComponent,
      GenericWithTwoGridsComponent,
      SpatialRelationComponent,
      ChangePasswordComponent,
      EtaEditorComponent,
      ThetaEditorComponent,
      DynamicValuesComponent,
      BetaEditorComponent,
      GammaEditorComponent,
      DeltaEditorComponent,
      DsetaEditorComponent,
      EpsilonEditorComponent,
      AlphaEditorComponent,
      HistoricComponent,
      ViewInformationComponent,
      ProjectRegistrationComponent,
      FatherOrderComponent,
      AssignContractorComponent,
      PatrolComponent,
      MailingListComponent,
      SecurityRiskComponent,
      TablesTypeComponent,
      TeamComponent,
      OrderManagementComponent,
      ContractorComponent,
      ConsultPatrolComponent,
      OrdersComponent,
      ReportsStatisticsComponent,
      SidebarLeftComponent,
      SidebarBottomComponent,
      SidebarRightComponent,
      LegalizationOrderComponent,
      LegalizationDirectComponent,
      GenerarCorrectComponent,
      AdicionarElementComponent,
      ConsultarOrdenesComponent,
      ExecuteOrderComponent
   ],
   imports: [BrowserModule, ModalModule, FormsModule, HttpModule, routing],
   providers: [
      MapService,
      DrawService,
      ApiService,
      MemoryService,
      GlobalService,
      GenericTasksService,
      AuthGuard,
      DataSharingService,
      PermissionService
   ],
   bootstrap: [AppComponent]
})
export class AppModule {}
