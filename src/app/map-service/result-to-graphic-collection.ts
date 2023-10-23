import { loadModules } from 'esri-loader';

export class ResultToGraphicCollection {
  static convert(results: Array<any>, convertCallback: Function): void {
    loadModules(['esri/graphic'], {
      url: 'https://js.arcgis.com/3.23/'
    }).then(([Graphic]) => {
      const mapResult = results.map(element => {
        const keys = Object.keys(element);
        const values = Object.values(element);
        const attributes = new Object();
        let geometry = {};
        for (let i = 0; i < keys.length; i++) {
          if (keys[i].toUpperCase().indexOf('SHAPE') >= 0) {
            geometry = this.createGeometry(values[i]);
          } else {
            attributes[keys[i]] = values[i];
          }
        }

        const graphicJson = {
          // geometry: { rings: [geometry], spatialReference: { wkid: 3116 } },
          geometry: geometry,
          attributes: attributes
        };
        return new Graphic(graphicJson);
      });
      convertCallback(mapResult);
    });
  }

  private static createGeometry(representation: any): any {
    let geometry = null;
    if (representation != null) {
      if (representation.toUpperCase().indexOf('POLYGON') >= 0) {
        geometry = this.createPolygon(representation);
      } else if (representation.toUpperCase().indexOf('LINESTRING') >= 0) {
        geometry = this.createLine(representation);
      } else if (representation.toUpperCase().indexOf('POINT') >= 0) {
        geometry = this.createPoint(representation);
      }
    }
    return geometry;
  }

  private static createPolygon(representation: any): any {
    const pointSet = this.getPointSet(representation);
    return { rings: [pointSet], spatialReference: { wkid: 3116 } };
  }

  private static createLine(representation: any): any {
    const pointSet = this.getPointSet(representation);
    return { paths: [pointSet], spatialReference: { wkid: 3116 } };
  }

  private static createPoint(representation: any): any {
    const point = this.getPointSet(representation);
    return { x: point[0][0], y: point[0][1], spatialReference: { wkid: 3116 } };
  }

  private static getPointSet(representation: any): any {
    const pattern = /\d+.?\d+/g;
    const pointSet = [];
    let value;
    let cont = 0;
    let point = [];
    do {
      value = pattern.exec(representation);
      if (value) {
        if (cont % 2 === 0) {
          point = [Number(value[0])];
        } else {
          point.push(Number(value[0]));
          pointSet.push(point);
        }
        cont++;
      }
    } while (value);

    return pointSet;
  }
}
