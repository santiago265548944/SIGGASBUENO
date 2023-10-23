import { loadModules } from 'esri-loader';

export class DrawGenericSymbols {
  public getRectangleSymbol(): any {
    loadModules(
      [
        'esri/symbols/SimpleFillSymbol',
        'esri/Color',
        'esri/symbols/SimpleLineSymbol'
      ],
      { url: 'https://js.arcgis.com/3.23/' }
    ).then(([SimpleFillSymbol, Color, SimpleLineSymbol]) => {
      return new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID,
          Color.fromRgb('rgb(0, 0, 255)'),
          2
        ),
        Color.fromRgb('rgba(0, 0, 255, 0.5)')
      );
    });
  }

  // public getPointSymbol(): any {
  //   loadModules(['esri/symbols/SimpleMarkerSymbol', 'esri/Color'], {
  //     url: 'https://js.arcgis.com/3.23/'
  //   }).then(([SimpleMarkerSymbol, Color]) => {
  //     const markerSymbol = new SimpleMarkerSymbol();
  //     markerSymbol.setColor(new Color('#FF0000'));
  //     markerSymbol.setSize(12);
  //     return markerSymbol;
  //   });
  // }
}
