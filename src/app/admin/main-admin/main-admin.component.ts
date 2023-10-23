import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { GlobalService } from '../../Globals/global.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { AdminContent } from '../admin-container/admin-content';
import { SecurityItems } from '../security/security-items';
import { GenericWithOneGridComponent } from '../generic-with-one-grid/generic-with-one-grid.component';
import { ArcSdeitems } from '../arcsde/arc-sdeitems';
import { AplicacionesItems } from '../aplicaciones/aplicaciones-items';
import { GenericWithTwoGridsComponent } from '../generic-with-two-grids/generic-with-two-grids.component';
import { PermissionService } from '../../security/permission.service';

@Component({
  selector: 'app-main-admin',
  templateUrl: './main-admin.component.html',
  styleUrls: ['./main-admin.component.css']
})
export class MainAdminComponent implements OnInit {

  elementsData: any;
  itemToLoad: AdminContent;
  securityItems = SecurityItems;
  arcSDEItems = ArcSdeitems;
  aplicacionesItems = AplicacionesItems;

  constructor(private apiService: ApiService, private globalService: GlobalService, private permissionService: PermissionService) {

  }

  ngOnInit() {
    this.getDataSets();
  }

  isOptionDisabled(name: string) {
    return this.permissionService.isOptionDisabled(name);
  }

  isOptionHidden(name: string) {
    return this.permissionService.isOptionHidden(name);
  }

  getDataSets(): void {
    // TODO: envolver este bloque de código con if (!App.optionsToDisable.ContainsKey("navBarGroupElements"))
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.ObtenerDatasets,
          [new InputParameter('un_Dueno', this.globalService.DatabaseOwner)]
        )
      )
      .subscribe(json => {
        this.getDataSetsResult(json);
      });
  }

  getDataSetsResult(result: any): void {
    const resultObject = this.handleErrorResponse(result);
    if (resultObject != null) {
      if (resultObject.Table1 != null) {
        this.elementsData = resultObject.Table1.map(item => item.NAME.split('.')[1]);
        this.elementsData.push('Otros');
      }
    }
  }

  onElementItemClickHandler(name: string) {
    if (name != null && name !== '') {
      this.itemToLoad = new AdminContent(GenericWithTwoGridsComponent, {title: `Elemento ${name}`
      , elementName: name});
    }
  }

  onSecurityItemClickHandler(name: string, alias?: string) {
    if (name != null && name !== '') {
      this.onOnGridViewClickHandler(name, alias);
    }
  }

  onArcSDEItemClickHandler(name: string, alias: string) {
    this.onOnGridViewClickHandler(name, alias);
  }

  onOnGridViewClickHandler(name: string, alias?: string) {
    this.itemToLoad = new AdminContent(GenericWithOneGridComponent, {title: `${alias || name}`, elementName: name});
  }

  onOnGrid2ViewClickHandler(name: string, alias?: string) {
    this.itemToLoad = new AdminContent(GenericWithTwoGridsComponent, {title: `${alias || name}`, elementName: name});
  }

  private handleErrorResponse(json): any {
    const values = Object.values(json);
    if (values != null && values.length > 0) {
      const result = typeof(values[0]) === 'string' ? JSON.parse(values[0].toString()) : values[0];
      if (!result['ErrorMessage']) {
        return result;
      } else {
        alert(result['ErrorMessage']);
      }
    }
    return null;
  }
}
