import {
  Component,
  OnInit,
  ViewChild,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { MapService } from '../../map-service/map.service';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from '../../map-service/map-actions/select-action';
import { EmapActions } from '../../map-service/emap-actions.enum';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { FlashToGeometry, AddGeometry } from '../../map-service/map-action';

@Component({
  selector: 'app-view-selection',
  templateUrl: './view-selection.component.html',
  styleUrls: ['./view-selection.component.css']
})
export class ViewSelectionComponent implements OnInit {
  @ViewChild('dataTable')
  dataTable: jqxDataTableComponent;
  dataAdapter: any;
  dataTableColumns: Array<any>;
  subscription: Subscription;
  listElements: any;
  selectedElement: any;
  @Output()
  RowSelected = new EventEmitter();
  @Input()
  ownerTool: OwnerSelection;
  hideGeoButtons = false;
  tableContainerHeight = 'calc(95% - 30px)';

  @Input()
  public set listElementsProp(v: any) {
    if (v != null) {
      this.loadGrid(v);
    }
  }

  constructor(private mapService: MapService) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();

    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.handleSelectAction(mapAction));
  }

  ngOnInit() { }

  start(evt: any) {
    this.reset();
    if (evt) {
      if (evt.results) {
        this.loadGrid(evt.results);
        if (evt.additionalParameters) {
          this.hideGeoButtons = evt.additionalParameters.hideGeoButtons ? true : false;
          if (this.hideGeoButtons) {
            this.tableContainerHeight = '95%';
          }
        }
      } else {
        this.loadDataMapService();
      }
    } else {
      this.loadDataMapService();
    }
  }

  private loadDataMapService(): void {
    if (!this.listElements) {
      this.mapService.executeMapAction(<SelectAction>{
        EMapAction: EmapActions.Select,
        selectActionType: SelectActionType.ViewSelectionRequest,
        owner: OwnerSelection.genericAction
      });
    }
  }

  private handleSelectAction(selectionAction: SelectAction): void {
    if (selectionAction.EMapAction === EmapActions.Select) {
      if (this.ownerTool === undefined || this.ownerTool === null
        || this.ownerTool === selectionAction.owner) {
        switch (selectionAction.selectActionType) {
          case SelectActionType.ViewSelectionResponse:
            this.loadGrid(selectionAction.selectedFeatures);
            break;
        }
      }
    }
  }

  private loadGrid(selectedGraphics: any) {
    if (selectedGraphics && selectedGraphics.length >= 0) {
      this.listElements = selectedGraphics;
      this.clearGrid();
      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumns(selectedGraphics);
        this.prepareDataTableSource(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumns(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];
    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSource(selectedGraphics: any): void {
    const localData = new Array<any>();

    // tslint:disable-next-line:forin
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

  tableOnRowSelect(event: any): void {
    this.selectedElement = this.listElements[event.args.index];
    this.RowSelected.emit(this.selectedElement);
  }

  genericActionGeometry(task: number): void {
    switch (task) {
      case 5:
        const arryGeometry = new Array<any>();
        this.listElements.forEach(element => {
          arryGeometry.push(element.geometry);
        });
        this.mapService.executeMapAction(<AddGeometry>{
          EMapAction: EmapActions.AddGeometry,
          geometries: arryGeometry
        });
        break;
      case 6:
        this.mapService.executeMapAction(<SelectAction>{
          EMapAction: EmapActions.Select,
          selectActionType: SelectActionType.ZoomToSelection,
          featureSelected: this.listElements,
          owner: OwnerSelection.genericAction
        });
        break;
    }

    if (this.selectedElement) {
      switch (task) {
        case 1:
          if (this.validateGeometry(this.selectedElement.geometry)) {
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.FlashToGeometry,
              geometry: this.selectedElement.geometry
            });
          }
          break;
        case 2:
          if (this.validateGeometry(this.selectedElement.geometry)) {
            this.mapService.executeMapAction(<FlashToGeometry>{
              EMapAction: EmapActions.ZoomToGeometry,
              geometry: this.selectedElement.geometry
            });
          }
          break;
        case 4:
          if (this.validateGeometry(this.selectedElement.geometry)) {
            this.mapService.executeMapAction(<AddGeometry>{
              EMapAction: EmapActions.AddGeometry,
              geometries: [this.selectedElement.geometry]
            });
          }
          break;
      }
    }
  }

  private validateGeometry(geometry: any) {
    if (geometry === null) {
      alert('El elemento seleccionado no tiene geometria.');
      return false;
    }
    return true;
  }

  exportExcel(): void {
    this.dataTable.exportData('xls');
  }

  private reset() {
    this.hideGeoButtons = false;
    this.tableContainerHeight = 'calc(95% - 30px)';
  }
}
