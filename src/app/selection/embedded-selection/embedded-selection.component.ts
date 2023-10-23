import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SelectionComponent } from '../selection.component';
import { MapService } from '../../map-service/map.service';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from '../../map-service/map-actions/select-action';
import { EmapActions } from '../../map-service/emap-actions.enum';

@Component({
  selector: 'app-embedded-selection',
  templateUrl: './embedded-selection.component.html',
  styleUrls: ['./embedded-selection.component.css']
})
export class EmbeddedSelectionComponent implements OnInit, OnDestroy {
  @Input() ownerTool: OwnerSelection;

  constructor(private mapService: MapService) {}

  ngOnInit() {}
  ngOnDestroy(): void {}

  selectWithRectangleClickHandler(): void {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.SelectWithRectangle,
      owner: this.ownerTool
    });
  }

  selectWithLineClickHandler(): void {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.SelectWithLine,
      owner: this.ownerTool
    });
  }

  selectWithCircleClickHandler(): void {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.SelectWithCircle,
      owner: this.ownerTool
    });
  }

  selectWithPolygonClickHandler(): void {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.SelectWithPolygon,
      owner: this.ownerTool
    });
  }
}
