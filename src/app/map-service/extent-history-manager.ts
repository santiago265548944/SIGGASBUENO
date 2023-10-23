import { loadModules } from 'esri-loader';

export class ExtentHistoryManager {
  private isNewExtent: boolean;
  private index: number;
  private extents = new Array<any>();

  constructor(private map: any) {
    this.isNewExtent = true;
    this.index = 0;
    // this.map.on('extent-change', (eventArg) => this.onExtentChange(eventArg));
  }

  onExtentChange(eventArg: any): void {
    if (this.isNewExtent) {
      this.index = this.index + 1;

      if (this.extents.length - this.index > 0) {
        this.extents.splice(this.index, (this.extents.length - this.index));
      }

      this.extents.push(eventArg.extent);
    } else {
      this.isNewExtent = true;
    }
  }

  previousExtent(): void {
    if (this.index > 0) {
      this.index = this.index - 1;
      this.setExtent();
    }
  }

  newExtent(): void {
    if (this.index < this.extents.length - 1) {
      this.index++;
      this.setExtent();
    }
  }

  private setExtent(): void {
    this.isNewExtent = false;
    this.map.setExtent(this.extents[this.index]);
  }

  executeFullExtent(): void {
    loadModules(['esri/geometry/Extent', 'esri/layers/DynamicMapServiceLayer'],
      {url: 'https://js.arcgis.com/3.23/'}
    )
    .then(([Extent, DynamicMapServiceLayer]) => {
        let newExtent: any;

        this.map.layerIds.forEach(layerId => {
          const layer = this.map.getLayer(layerId);
          if (layer instanceof DynamicMapServiceLayer) {
            if (layer.spatialReference.wkid === this.map.spatialReference.wkid) {
              if (newExtent == null) {
                newExtent = layer.fullExtent;
              } else {
                newExtent = newExtent.union(layer.fullExtent);
              }
            }
          }
        });
        if (newExtent != null) {
          this.map.setExtent(newExtent);
        }
      }
    );
  }
}
