import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-identify-result-data',
  templateUrl: './identify-result-data.component.html',
  styleUrls: ['./identify-result-data.component.css']
})
export class IdentifyResultDataComponent implements OnInit {
  @Input() identityData: any;
  @Output() itemSelectedEvent = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  itemSelectedHandler(): void {
    this.itemSelectedEvent.emit(this.identityData);
  }
}
