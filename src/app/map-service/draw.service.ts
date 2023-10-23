import { Injectable } from '@angular/core';
import { loadModules } from 'esri-loader';
import { MapAction, ReturnElementAction } from './map-action';
import { EmapActions } from './emap-actions.enum';
import { MapService } from './map.service';
import {
  IdentifyAction,
  IdentifyActionType
} from './map-actions/identify-action';
import { MemoryService } from '../cache/memory.service';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from './map-actions/select-action';
import { GlobalService } from '../Globals/global.service';

@Injectable()
export class DrawService {
  map: any;
  draw: any;
  edit: any;
  // toolMode: EmapActions;
  toolMode: MapAction;

  constructor(
    private mapService: MapService,
    private memoryService: MemoryService,
    private globals: GlobalService
  ) { }

  setMap(map: any) {
    if (this.map == null) {
      this.map = map;
    }
  }

  prepareDraw(mapAction: MapAction, element?: any) {
    loadModules(
      [
        'esri/toolbars/draw',
        'esri/toolbars/edit',
        'esri/symbols/SimpleFillSymbol',
        'esri/Color',
        'esri/symbols/SimpleLineSymbol'
      ],
      { url: 'https://js.arcgis.com/3.23/' }
    ).then(([Draw, Edit, SimpleFillSymbol, Color, SimpleLineSymbol]) => {
      if (this.draw == null) {
        this.draw = new Draw(this.map, { showTooltips: false });
        this.draw.on('draw-complete', eventArg => {
          this.onDrawComplete(eventArg);
        });
      }
      this.toolMode = mapAction;

      const tmpfillSymbol = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID,
          new Color(
            '#' + this.memoryService.getItem('TempLineColor').slice(-6)
          ),
          this.memoryService.getItem('TempBorderThickness')
        ),
        new Color('#' + this.memoryService.getItem('TempFillColor').slice(-6))
      );

      const tmpSimpleSymbol = new SimpleLineSymbol();
      tmpSimpleSymbol.setColor(
        new Color('#' + this.memoryService.getItem('TempLineColor').slice(-6))
      );
      tmpSimpleSymbol.setWidth(this.memoryService.getItem('TempLineWidth'));

      switch (this.toolMode.EMapAction) {
        case EmapActions.ZoomInWithRectangle:
        case EmapActions.ZoomOutWithRectangle:
        case EmapActions.Identify:
          this.draw.setFillSymbol(
            this.getFillSymbolSelect(SimpleFillSymbol, SimpleLineSymbol, Color)
          );
          this.draw.activate(Draw.RECTANGLE);
          break;
        case EmapActions.DrawPoint:
        case EmapActions.DrawText:
        case EmapActions.SeekPredio:
        case EmapActions.AvailableOperator:
        case EmapActions.ManejoPrensas:
        case EmapActions.ModifyAffectedUsers:
          this.draw.activate(Draw.POINT);
          break;
        case EmapActions.OrderManagement:
        case EmapActions.SecurityRisk:
          this.draw.activate(Draw.POLYLINE);
          break;
        case EmapActions.DrawLine:
          this.draw.setLineSymbol(tmpSimpleSymbol);
          this.draw.activate(Draw.POLYLINE);
          break;
        case EmapActions.DrawPolygon:
          this.draw.setFillSymbol(tmpfillSymbol);
          this.draw.activate(Draw.POLYGON);
          break;
        case EmapActions.DrawRectangle:
        case EmapActions.RiskZone:
        case EmapActions.ObviateValves:
          this.draw.setFillSymbol(tmpfillSymbol);
          this.draw.activate(Draw.RECTANGLE);
          break;
        case EmapActions.DrawArrow:
          this.draw.setFillSymbol(tmpfillSymbol);
          this.draw.activate(Draw.ARROW);
          break;
        case EmapActions.DrawEllipse:
          this.draw.setFillSymbol(tmpfillSymbol);
          this.draw.activate(Draw.ELLIPSE);
          break;
        case EmapActions.DrawCircle:
          this.draw.setFillSymbol(tmpfillSymbol);
          this.draw.activate(Draw.CIRCLE);
          break;
        case EmapActions.DrawFreehandPolyLine:
          this.draw.setLineSymbol(tmpSimpleSymbol);
          this.draw.activate(Draw.FREEHAND_POLYLINE);
          break;
        case EmapActions.EditElement:
          if (this.edit == null) {
            this.edit = new Edit(this.map);
          }
          if (element.symbol.type === 'textsymbol') {
            this.edit.activate(
              // tslint:disable-next-line:no-bitwise
              Edit.MOVE,
              element
            );
          } else {
            this.edit.activate(
              // tslint:disable-next-line:no-bitwise
              Edit.ROTATE | Edit.SCALE | Edit.MOVE | Edit.EDIT_VERTICES,
              element
            );
          }
          break;
        case EmapActions.Select:
        case EmapActions.ModifyAffectedUsers:
          this.executeSelectDraw(
            Draw,
            this.getFillSymbolSelect(SimpleFillSymbol, SimpleLineSymbol, Color),
            this.getLineSymbolSelect(SimpleLineSymbol, Color)
          );
          break;
      }
    });
  }

  private getFillSymbolSelect(
    SimpleFillSymbol: any,
    SimpleLineSymbol: any,
    Color: any
  ): any {
    const fillSymbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        Color.fromRgb('rgb(0, 0, 255)'),
        2
      ),
      Color.fromRgb('rgba(0, 0, 255, 0.5)')
    );
    return fillSymbol;
  }

  private getLineSymbolSelect(SimpleLineSymbol: any, Color: any): any {
    const lineSymbol = new SimpleLineSymbol();
    lineSymbol.setColor(Color.fromRgb('rgb(0, 0, 255)'));
    lineSymbol.setWidth(this.memoryService.getItem('TempLineWidth'));

    return lineSymbol;
  }

  private onDrawComplete(evt: any) {
    switch (this.toolMode.EMapAction) {
      case EmapActions.ZoomInWithRectangle:
        this.map.setExtent(evt.geometry.getExtent());
        this.deactivate();
        break;
      case EmapActions.ZoomOutWithRectangle:
        this.zoomOutWithRectangle(evt);
        this.deactivate();
        break;
      case EmapActions.DrawPoint:
      case EmapActions.DrawLine:
      case EmapActions.DrawPolygon:
      case EmapActions.DrawRectangle:
      case EmapActions.DrawArrow:
      case EmapActions.DrawEllipse:
      case EmapActions.DrawCircle:
      case EmapActions.DrawFreehandPolyLine:
      case EmapActions.DrawText:
        this.drawTool(evt);
        break;
      case EmapActions.Identify:
        this.sendGeometryToPerformIdentify(evt);
        break;
      case EmapActions.Select:
        this.sendGeometryToPerformSelect(evt);
        break;
      case EmapActions.SeekPredio:
        this.sendGeometryToPerformAction(evt, EmapActions.SeekPredioGeometry);
        break;
      case EmapActions.OrderManagement:
        this.sendGeometryToPerformAction(evt, EmapActions.OrderManzanaGeometry);
        this.deactivate();
        break;
      case EmapActions.SecurityRisk:
        this.sendGeometryToPerformAction(evt, EmapActions.SecurityManzanaGeometry);
        this.deactivate();
        break;
      case EmapActions.ManejoPrensas:
        if (this.globals.clickCount >= this.globals.pressNumber - 1) {
          this.deactivate();
        }
        this.sendGeometryToPerformAction(evt, EmapActions.ManejoPrensasGeometry);
        break;
      case EmapActions.RiskZone:
        this.sendGeometryToPerformAction(evt, EmapActions.RiskZoneGeometry);
        this.deactivate();
        break;
      case EmapActions.AvailableOperator:
        this.sendGeometryToPerformAction(
          evt,
          EmapActions.AvailableOperatorGeometry
        );
        this.deactivate();
        break;
      case EmapActions.ObviateValves:
        this.sendGeometryToPerformAction(evt, EmapActions.ObviateValvesGeometry);
        this.deactivate();
        break;
      case EmapActions.ModifyAffectedUsers:
        this.sendGeometryToPerformAction(evt, EmapActions.ModifyAffectedUsersGeometry);
        break;
    }
  }

  private drawTool(evt: any) {
    loadModules(
      [
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Color',
        'esri/graphic',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/TextSymbol',
        'esri/symbols/Font'
      ],
      { url: 'https://js.arcgis.com/3.23/' }
    ).then(
      ([
        SimpleMarkerSymbol,
        Color,
        Graphic,
        SimpleLineSymbol,
        SimpleFillSymbol,
        TextSymbol,
        Font
      ]) => {
        switch (this.toolMode.EMapAction) {
          case EmapActions.DrawPoint:
            const markerSymbol = new SimpleMarkerSymbol();
            markerSymbol.setColor(
              new Color(
                '#' + this.memoryService.getItem('PointColor').slice(-6)
              )
            );
            markerSymbol.setSize(this.memoryService.getItem('PointSize'));
            switch (this.memoryService.getItem('PointStyle')) {
              case '0':
                markerSymbol.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);
                break;
              case '1':
                markerSymbol.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);
                break;
              case '2':
                markerSymbol.setStyle(SimpleMarkerSymbol.STYLE_CROSS);
                break;
              case '3':
                markerSymbol.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
                break;
              case '4':
                markerSymbol.setStyle(SimpleMarkerSymbol.STYLE_X);
                break;
            }
            this.map.graphics.add(new Graphic(evt.geometry, markerSymbol));
            break;
          case EmapActions.DrawLine:
          case EmapActions.DrawFreehandPolyLine:
            const simpleSymbol = new SimpleLineSymbol();
            simpleSymbol.setColor(
              new Color('#' + this.memoryService.getItem('LineColor').slice(-6))
            );
            simpleSymbol.setWidth(this.memoryService.getItem('LineWidth'));
            this.map.graphics.add(new Graphic(evt.geometry, simpleSymbol));
            break;
          case EmapActions.DrawPolygon:
          case EmapActions.DrawRectangle:
          case EmapActions.DrawArrow:
          case EmapActions.DrawEllipse:
          case EmapActions.DrawCircle:
            const fillSymbol = new SimpleFillSymbol(
              SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color(
                  '#' + this.memoryService.getItem('LineColor').slice(-6)
                ),
                this.memoryService.getItem('BorderThickness')
              ),
              new Color('#' + this.memoryService.getItem('FillColor').slice(-6))
            );
            this.map.graphics.add(new Graphic(evt.geometry, fillSymbol));
            break;
          case EmapActions.DrawText:
            const textSymbol = new TextSymbol(
              this.memoryService.getItem('TextMapDraw')
            )
              .setColor(
                new Color(
                  '#' + this.memoryService.getItem('FontColor').slice(-6)
                )
              )
              .setAlign(Font.ALIGN_MIDDLE)
              .setAngle(0)
              .setFont(
                new Font(
                  this.memoryService.getItem('FontSize').slice(-6) + 'pt'
                )
                  .setWeight(Font.WEIGHT_BOLD)
                  .setFamily(this.memoryService.getItem('FontFamily'))
              );

            this.map.graphics.add(new Graphic(evt.geometry, textSymbol));
            break;
        }
      }
    );
  }

  private zoomOutWithRectangle(evt: any) {
    const mapExtent = this.map.extent;
    const zoomBoxExtent = evt.geometry.getExtent();
    const zoomBoxCenter = zoomBoxExtent.getCenter();

    const ratioMapExtent = mapExtent.getWidth() / mapExtent.getHeight();
    const ratioZoomBoxExtent =
      zoomBoxExtent.getWidth() / zoomBoxExtent.getHeight();

    loadModules(['esri/geometry/Extent'], {
      url: 'https://js.arcgis.com/3.23/'
    }).then(([Extent]) => {
      let newExtent: any;
      if (ratioZoomBoxExtent > ratioMapExtent) {
        const mapWidth = this.map.width;
        const factor = mapExtent.getWidth() / zoomBoxExtent.getWidth();
        const newWidthMapUnits = mapExtent.getWidth() * factor;

        newExtent = new Extent(
          zoomBoxCenter.x - newWidthMapUnits / 2,
          zoomBoxCenter.y,
          zoomBoxCenter.x + newWidthMapUnits / 2,
          zoomBoxCenter.y,
          this.map.spatialReference
        );
      } else {
        const mapHeight = this.map.height;
        const factor = mapExtent.getHeight() / zoomBoxExtent.getHeight();
        const newHeightMapUnits = mapExtent.getHeight() * factor;

        newExtent = new Extent(
          zoomBoxCenter.x,
          zoomBoxCenter.y - newHeightMapUnits / 2,
          zoomBoxCenter.x,
          zoomBoxCenter.y + newHeightMapUnits / 2,
          this.map.spatialReference
        );
      }

      if (newExtent != null) {
        this.map.setExtent(newExtent);
      }
    });
  }

  sendGeometryToPerformIdentify(evt: any): void {
    const extent = evt.geometry.getExtent();
    loadModules(['esri/geometry/Point'], {
      url: 'https://js.arcgis.com/3.23/'
    }).then(([Point]) => {
      let identifyGeometry: any;
      if (extent.xmax === extent.xmin && extent.ymax === extent.ymin) {
        identifyGeometry = new Point(
          extent.xmax,
          extent.ymax,
          evt.geometry.spatialReference
        );
      } else {
        identifyGeometry = evt.geometry;
      }

      const identifyAction = <IdentifyAction>{
        EMapAction: EmapActions.Identify,
        identifyActionType: IdentifyActionType.ReturnGeometry,
        geometry: identifyGeometry,
        map: this.map
      };
      this.mapService.executeMapAction(identifyAction);
    });
  }

  prepareFlashToGeometry(geometry: any): void {
    loadModules(
      [
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Color',
        'esri/graphic',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleFillSymbol'
      ],
      { url: 'https://js.arcgis.com/3.23/' }
    ).then(
      ([
        SimpleMarkerSymbol,
        Color,
        Graphic,
        SimpleLineSymbol,
        SimpleFillSymbol
      ]) => {
        let graphic: any;
        switch (geometry.type) {
          case 'point':
            graphic = new Graphic(
              geometry,
              this.createSimpleMarkerSymbol(SimpleMarkerSymbol, Color)
            );
            break;
          case 'polyline':
            graphic = new Graphic(
              geometry,
              this.createSimpleLineSymbol(SimpleLineSymbol, Color)
            );
            break;
          case 'polygon':
            graphic = new Graphic(
              geometry,
              this.createSimpleFillSymbol(
                SimpleFillSymbol,
                SimpleLineSymbol,
                Color,
                null
              )
            );
            break;
        }

        setTimeout(() => this.executeFlashToGeometry(graphic), 1000);
      }
    );
  }

  executeFlashToGeometry(graphic: any) {
    if (graphic != null) {
      let isGraphicAdded = false;
      let cont = 0;
      const intervalId = setInterval(() => {
        if (isGraphicAdded) {
          this.map.graphics.remove(graphic);
          isGraphicAdded = false;
        } else {
          this.map.graphics.add(graphic);
          isGraphicAdded = true;
        }

        if (cont === 6) {
          clearInterval(intervalId);
          if (isGraphicAdded) {
            this.map.graphics.remove(graphic);
          }
        }
        cont++;
      }, 150);
    }
  }

  executeSelectDraw(Draw: any, fillSymbol: any, simpleSymbol: any): void {
    const selectAction = <SelectAction>this.toolMode;
    switch (selectAction.selectActionType) {
      case SelectActionType.SelectWithCircle:
        this.activateDrawCircle(Draw, fillSymbol);
        break;
      case SelectActionType.SelectWithLine:
        this.activateDrawLine(Draw, simpleSymbol);
        break;
      case SelectActionType.SelectWithPolygon:
        this.activateDrawPolygon(Draw, fillSymbol);
        break;
      case SelectActionType.SelectWithRectangle:
        this.activateDrawRectangle(Draw, fillSymbol);
        break;
    }
  }

  activateDrawLine(Draw: any, simpleSymbol: any): void {
    this.draw.setLineSymbol(simpleSymbol);
    this.draw.activate(Draw.POLYLINE);
  }

  activateDrawPolygon(Draw: any, fillSymbol: any): void {
    this.draw.setFillSymbol(fillSymbol);
    this.draw.activate(Draw.POLYGON);
  }

  activateDrawRectangle(Draw: any, fillSymbol: any): void {
    this.draw.setFillSymbol(fillSymbol);
    this.draw.activate(Draw.RECTANGLE);
  }

  activateDrawCircle(Draw: any, fillSymbol: any): void {
    this.draw.setFillSymbol(fillSymbol);
    this.draw.activate(Draw.CIRCLE);
  }

  createSimpleMarkerSymbol(
    SimpleMarkerSymbol: any,
    Color: any,
    customColor: string = ''
  ): any {
    let colorStyle: any;
    if (customColor) {
      colorStyle = new Color(customColor);
    } else {
      colorStyle = new Color('rgb(0,255,0)');
    }
    const markerSymbol = new SimpleMarkerSymbol();

    markerSymbol.setColor(colorStyle);
    markerSymbol.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);

    return markerSymbol;
  }

  createSimpleFillSymbol(
    SimpleFillSymbol: any,
    SimpleLineSymbol: any,
    Color: any,
    dynamicColor: any,
    customColor: string = ''
  ): any {
    let rgbColor1 = 'rgba(0,0,255,255)';
    let rgbColor2 = 'rgba(210,210,210,255)';
    let border = 4;
    if (dynamicColor) {
      const red = Math.round(dynamicColor % 256);
      const green = Math.round((dynamicColor / 256) % 256);
      const blue = Math.round((dynamicColor / 256 / 256) % 256);
      rgbColor2 = 'rgba(' + red + ',' + green + ',' + blue + ',0.5)';
      rgbColor1 = rgbColor2;
      border = 1;
    }

    if (customColor) {
      rgbColor1 = rgbColor2 = customColor;
    }

    return new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        new Color(rgbColor1),
        border
      ),
      new Color(rgbColor2)
    );
  }

  createSimpleLineSymbol(
    SimpleLineSymbol: any,
    Color: any,
    customColor: string = ''
  ): any {
    let colorStyle: any;

    if (customColor) {
      colorStyle = new Color(customColor);
    } else {
      colorStyle = new Color('rgb(0,0,255)');
    }

    const simpleSymbol = new SimpleLineSymbol();
    simpleSymbol.setColor(colorStyle);
    simpleSymbol.setWidth(4);
    return simpleSymbol;
  }

  private sendGeometryToPerformSelect(evt: any): any {
    const selectAction = <SelectAction>this.toolMode;
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.PerformSelect,
      selectGeometry: evt.geometry,
      owner: selectAction.owner,
      map: this.map
    }); // this is sent to select.component
  }

  private sendGeometryToPerformAction(evt: any, action: EmapActions): any {
    this.mapService.executeMapAction(<ReturnElementAction>{
      EMapAction: action,
      geometry: evt.geometry,
      map: this.map
    });
  }

  deactivate() {
    if (this.draw != null) {
      this.draw.deactivate();
    }
    if (this.edit != null) {
      this.edit.deactivate();
    }
  }

  executeAddGeometries(elements: Array<any>, customColor: string = ''): void {
    loadModules(
      [
        'esri/symbols/SimpleMarkerSymbol',
        'esri/Color',
        'esri/graphic',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleFillSymbol'
      ],
      { url: 'https://js.arcgis.com/3.23/' }
    ).then(
      ([
        SimpleMarkerSymbol,
        Color,
        Graphic,
        SimpleLineSymbol,
        SimpleFillSymbol
      ]) => {
        elements.forEach(geo => {
          if (geo === null) {
            return;
          }

          let graphic: any;
          let geometry: any;
          let dynamicColor: any;
          let attributes: any;
          if (geo.attributes) {
            geometry = geo.geometry;
            dynamicColor = geo.attributes.COLOR;
            attributes = geo.attributes;
          } else {
            geometry = geo;
          }
          switch (geometry.type) {
            case 'point':
              graphic = new Graphic(
                geometry,
                this.createSimpleMarkerSymbol(
                  SimpleMarkerSymbol,
                  Color,
                  customColor
                ),
                attributes
              );
              break;
            case 'polyline':
              graphic = new Graphic(
                geometry,
                this.createSimpleLineSymbol(
                  SimpleLineSymbol,
                  Color,
                  customColor
                ),
                attributes
              );
              break;
            case 'polygon':
              graphic = new Graphic(
                geometry,
                this.createSimpleFillSymbol(
                  SimpleFillSymbol,
                  SimpleLineSymbol,
                  Color,
                  dynamicColor,
                  customColor
                ),
                attributes
              );
              break;
          }
          this.map.graphics.add(graphic);
        });
      }
    );
  }
}
