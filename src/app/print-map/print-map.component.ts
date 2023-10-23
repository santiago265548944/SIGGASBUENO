import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { EmapActions } from '../map-service/emap-actions.enum';
import { MapService } from '../map-service/map.service';
import { PrintAction } from '../map-service/map-action';

@Component({
  selector: 'app-print-map',
  templateUrl: './print-map.component.html',
  styleUrls: ['./print-map.component.css']
})
export class PrintMapComponent implements OnInit {
  selectImageOption: any;
  selectPrintFormatOption: any;

  constructor(private mapService: MapService) {}

  ngOnInit() {}

  executePrint(): void {
    if (!!this.selectImageOption && !!this.selectPrintFormatOption) {
      const printAction = <PrintAction>{
        EMapAction: EmapActions.ExportMap,
        imageExtension: this.selectImageOption,
        printFormat: this.selectPrintFormatOption
      };
      this.mapService.executeMapAction(printAction);
    } else {
      alert('Debe seleccionar los valores');
    }
  }
}
