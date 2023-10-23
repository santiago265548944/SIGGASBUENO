import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { jqxExpanderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxExpander';
import * as _ from 'underscore';

@Component({
  selector: 'app-identify-result-item',
  templateUrl: './identify-result-item.component.html',
  styleUrls: ['./identify-result-item.component.css']
})
export class IdentifyResultItemComponent implements OnInit {
  @Input() identifyResult: any;
  @Output() itemSelectedEvent = new EventEmitter<any>();
  title: string;

  constructor() { }

  ngOnInit() {
    const keys = Object.keys(this.identifyResult);
    this.title = keys[0];
  }

  itemSelectedEventHandler(itemData: any): void {
    this.itemSelectedEvent.emit(itemData);
  }
}
