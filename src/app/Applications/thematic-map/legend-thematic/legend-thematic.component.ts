import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-legend-thematic',
  templateUrl: './legend-thematic.component.html',
  styleUrls: ['./legend-thematic.component.css']
})
export class LegendThematicComponent implements OnInit {
  legendList: any;
  constructor() {}

  ngOnInit() {}

  start(evt: any) {
    evt.map(elem => {
      const red = Math.round(elem.COLOR % 256);
      const green = Math.round((elem.COLOR / 256) % 256);
      const blue = Math.round((elem.COLOR / 256 / 256) % 256);
      elem.COLOR = 'rgba(' + red + ',' + green + ',' + blue + ', 0.5)';
    });
    this.legendList = evt;
  }
}
