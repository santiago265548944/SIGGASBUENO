import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import { MapService } from '../map-service/map.service';
import {
  GeoZoomAction,
  GeoZoomActionType
} from '../map-service/map-actions/geozoom-action';
import { EmapActions } from '../map-service/emap-actions.enum';
import { MemoryService } from '../cache/memory.service';
import { loadModules } from 'esri-loader';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';

@Component({
  selector: 'app-geo-zoom',
  templateUrl: './geo-zoom.component.html',
  styleUrls: ['./geo-zoom.component.css']
})
export class GeoZoomComponent implements OnInit {
  private subscription: Subscription;
  map: any;
  @ViewChild('selectDepartment') selectDepartment: ElementRef;
  @ViewChild('selectLocation') selectLocation: ElementRef;
  @ViewChild('selectSector') selectSector: ElementRef;
  @ViewChild('selectBlock') selectBlock: ElementRef;
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;

  selectDepartmentOption: any;
  selectLocationOption: any;
  selectSectorOption: any;
  selectBlockOption: any;

  genericUrl: string;

  constructor(
    private mapService: MapService,
    private memoryService: MemoryService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeGeoZoomAction(mapAction));
  }

  ngOnInit() {
    this.mapService.executeMapAction(<GeoZoomAction>{
      EMapAction: EmapActions.GeoZoom,
      geoZoomActionType: GeoZoomActionType.FillServicesRequest
    });
  }

  startProgress(): void {
    this.jqxLoader.open();
  }

  stopProgress(): void {
    this.jqxLoader.close();
  }

  private executeGeoZoomAction(geoZoomAction: GeoZoomAction) {
    switch (geoZoomAction.geoZoomActionType) {
      case GeoZoomActionType.FillServicesResponse:
        this.map = geoZoomAction.map;
        this.executeDepartamentQuery();
        break;
    }
  }

  private executeDepartamentQuery(): void {
    // TODO: this generic url should be a generic function
    const argisServerName = this.memoryService.getItem('ArcGISServerName');
    const argisServerPort = this.memoryService.getItem('ArcGISServerPort');
    this.genericUrl = this.memoryService
      .getItem('ArcGISServerURL')
      .replace('{0}', argisServerName)
      .replace('{1}', argisServerPort);

    this.executeQuery(1);
  }

  executeQuery(type: number): void {
    loadModules(['esri/tasks/QueryTask', 'esri/tasks/query'])
      .then(([QueryTask, Query]) => {
        let servicio = '';
        let layer = '';
        let url = '';
        let where = '';
        let fields = ['CODIGO', 'NOMBRE'];
        let order = ['CODIGO'];

        switch (type) {
          case 1: // Depto
            servicio = this.memoryService.getItem('DepartamentoServiceName');
            layer = this.memoryService.getItem('DepartamentoLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = '1=1';
            break;
          case 2: // Local
            servicio = this.memoryService.getItem('LocalidadServiceName');
            layer = this.memoryService.getItem('LocalidadLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = 'DEPARTAMENTO = ' + this.selectDepartmentOption;
            this.clearSelect(this.selectLocation);
            break;
          case 3: // Sector
            servicio = this.memoryService.getItem('SectorServiceName');
            layer = this.memoryService.getItem('SectorLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = 'DEPARTAMENTO = ' + this.selectDepartmentOption;
            where += ' AND LOCALIDAD = ' + this.selectLocationOption;
            this.clearSelect(this.selectSector);
            break;
          case 4: // b
            servicio = this.memoryService.getItem('ManzanaServiceName');
            layer = this.memoryService.getItem('ManzanaLayerIndex');
            url = this.genericUrl + servicio + '/MapServer/' + layer;
            where = 'DEPARTAMENTO = ' + this.selectDepartmentOption;
            where += ' AND LOCALIDAD = ' + this.selectLocationOption;
            where += ' AND SECTOROPERATIVO = ' + this.selectSectorOption;
            fields = ['MANZANACATASTRAL'];
            order = ['MANZANACATASTRAL'];
            this.clearSelect(this.selectBlock);
            break;
        }

        let defaultItem = <HTMLOptionElement>document.createElement('option');
        defaultItem.value = '';
        defaultItem.text = '';
        this.selectLocation.nativeElement.appendChild(defaultItem);

        defaultItem = <HTMLOptionElement>document.createElement('option');
        defaultItem.value = '';
        defaultItem.text = '';
        this.selectSector.nativeElement.appendChild(defaultItem);

        defaultItem = <HTMLOptionElement>document.createElement('option');
        defaultItem.value = '';
        defaultItem.text = '';
        this.selectBlock.nativeElement.appendChild(defaultItem);

        if (
          this.selectDepartmentOption !== '' ||
          this.selectLocationOption !== '' ||
          this.selectSectorOption !== '' ||
          this.selectBlockOption !== ''
        ) {
          const queryTask = new QueryTask(url);
          const query = new Query();
          query.outSpatialReference = this.map.spatialReference;
          query.returnGeometry = false;
          query.outFields = fields;
          query.orderByFields = order;
          query.where = where;
          this.startProgress();
          queryTask.execute(
            query,
            callback => {
              if (callback.features.length !== 0) {
                for (const item of callback.features) {
                  const optionItem = <HTMLOptionElement>document.createElement(
                    'option'
                  );
                  if (type !== 4) {
                    optionItem.value = item.attributes.CODIGO;
                    optionItem.text = item.attributes.NOMBRE;
                  } else {
                    optionItem.value = item.attributes.MANZANACATASTRAL;
                    optionItem.text = item.attributes.MANZANACATASTRAL;
                  }
                  switch (type) {
                    case 1: // Depto
                      this.selectDepartment.nativeElement.appendChild(
                        optionItem
                      );
                      break;
                    case 2: // Local
                      this.selectLocation.nativeElement.appendChild(optionItem);
                      break;
                    case 3: // Sector
                      this.selectSector.nativeElement.appendChild(optionItem);
                      break;
                    case 4: // block
                      this.selectBlock.nativeElement.appendChild(optionItem);
                      break;
                  }
                }
              }
              this.stopProgress();
            },
            errback => {
              this.stopProgress();
              console.error(errback);
            }
          );
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  private clearSelect(select: ElementRef) {
    let firstChild = select.nativeElement.firstChild;

    while (firstChild) {
      select.nativeElement.removeChild(firstChild);
      firstChild = select.nativeElement.firstChild;
    }
  }

  executeZoom(type: number): void {
    if (
      this.selectDepartmentOption !== '' ||
      this.selectLocationOption !== '' ||
      this.selectSectorOption !== '' ||
      this.selectBlockOption !== ''
    ) {
      loadModules([
        'esri/tasks/QueryTask',
        'esri/tasks/query',
        'esri/graphic',
        'esri/symbols/SimpleFillSymbol',
        'esri/Color',
        'esri/symbols/SimpleLineSymbol',
        'esri/geometry/Extent'
      ])
        .then(
          ([
            QueryTask,
            Query,
            Graphic,
            SimpleFillSymbol,
            Color,
            SimpleLineSymbol,
            Extent
          ]) => {
            let servicio = '';
            let layer = '';
            let url = '';
            let where = '';
            const factor = 1;

            switch (type) {
              case 1: // Depto
                servicio = this.memoryService.getItem(
                  'DepartamentoServiceName'
                );
                layer = this.memoryService.getItem('DepartamentoLayerIndex');
                url = this.genericUrl + servicio + '/MapServer/' + layer;
                where = 'CODIGO = ' + this.selectDepartmentOption;
                break;
              case 2: // Local
                servicio = this.memoryService.getItem('LocalidadServiceName');
                layer = this.memoryService.getItem('LocalidadLayerIndex');
                url = this.genericUrl + servicio + '/MapServer/' + layer;
                where = 'DEPARTAMENTO = ' + this.selectDepartmentOption;
                where += ' AND CODIGO = ' + this.selectLocationOption;
                break;
              case 3: // Sector
                servicio = this.memoryService.getItem('SectorServiceName');
                layer = this.memoryService.getItem('SectorLayerIndex');
                url = this.genericUrl + servicio + '/MapServer/' + layer;
                where = 'DEPARTAMENTO = ' + this.selectDepartmentOption;
                where += ' AND LOCALIDAD = ' + this.selectLocationOption;
                where += ' AND CODIGO = ' + this.selectSectorOption;
                break;
              case 4: // b
                servicio = this.memoryService.getItem('ManzanaServiceName');
                layer = this.memoryService.getItem('ManzanaLayerIndex');
                url = this.genericUrl + servicio + '/MapServer/' + layer;
                where = 'DEPARTAMENTO = ' + this.selectDepartmentOption;
                where += ' AND LOCALIDAD = ' + this.selectLocationOption;
                where += ' AND SECTOROPERATIVO = ' + this.selectSectorOption;
                where += ' AND MANZANACATASTRAL = ' + this.selectBlockOption;
                break;
            }

            const queryTask = new QueryTask(url);
            const query = new Query();
            query.outSpatialReference = this.map.spatialReference;
            query.returnGeometry = true;
            query.outFields = ['TAG'];
            query.where = where;
            this.startProgress();
            queryTask.execute(
              query,
              callback => {
                if (callback.features.length !== 0) {
                  const fillSymbol = new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(
                      SimpleLineSymbol.STYLE_SOLID,
                      Color.fromRgb('rgb(0, 0, 255)'),
                      2
                    ),
                    Color.fromRgb('rgba(0, 0, 255, 0.5)')
                  );

                  callback.features.forEach(item => {
                    this.map.graphics.add(
                      new Graphic(item.geometry, fillSymbol)
                    );
                  });

                  let widthExpand = 0,
                    heightExpand = 0,
                    xMax = Number.MIN_VALUE,
                    yMax = Number.MIN_VALUE,
                    xMin = Number.MAX_VALUE,
                    yMin = Number.MAX_VALUE;

                  callback.features.forEach(feature => {
                    const geometry = feature.geometry;
                    const extent = geometry.getExtent();
                    if (extent.xmax > xMax) {
                      xMax = extent.xmax;
                    }
                    if (extent.ymax > yMax) {
                      yMax = extent.ymax;
                    }
                    if (extent.xmin < xMin) {
                      xMin = extent.xmin;
                    }
                    if (extent.ymin < yMin) {
                      yMin = extent.ymin;
                    }
                  });

                  const selectedGraphicsExtent = new Extent(
                    xMin,
                    yMin,
                    xMax,
                    yMax,
                    this.map.spatialReference
                  );

                  widthExpand = selectedGraphicsExtent.getWidth() * factor / 2;
                  heightExpand =
                    selectedGraphicsExtent.getHeight() * factor / 2;

                  const displayExtent = new Extent(
                    selectedGraphicsExtent.xmin - widthExpand,
                    selectedGraphicsExtent.ymin - heightExpand,
                    selectedGraphicsExtent.xmax + widthExpand,
                    selectedGraphicsExtent.ymax + heightExpand,
                    selectedGraphicsExtent.spatialReference
                  );

                  this.map.setExtent(displayExtent);
                }
                this.stopProgress();
              },
              errback => {
                this.stopProgress();
                console.error(errback);
              }
            );
          }
        )
        .catch(err => {
          console.error(err);
        });
    }
  }
}
