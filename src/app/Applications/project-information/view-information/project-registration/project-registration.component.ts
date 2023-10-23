import { Component, OnInit } from '@angular/core';
import { ResultToGraphicCollection } from '../../../../map-service/result-to-graphic-collection';

@Component({
  selector: 'app-project-registration',
  templateUrl: './project-registration.component.html',
  styleUrls: ['./project-registration.component.css']
})
export class ProjectRegistrationComponent implements OnInit {

  dataAdapter: any;
  dataTableColumns: Array<any>;

  constructor() {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
  }

  ngOnInit() {
  }

  start(jsonResult: any): void {
    if (jsonResult['Table1'] && jsonResult['Table1'].length > 0) {
      ResultToGraphicCollection.convert(jsonResult['Table1'], results => {
        this.loadGrid(results);
      });
    }
  }

  private loadGrid(selectedGraphics: any): void {
    if (selectedGraphics && selectedGraphics.length > 0) {
      this.clearGrid();

      if (selectedGraphics != null && selectedGraphics.length > 0) {
        this.prepareDataTableColumns(selectedGraphics);
        this.prepareDataTableSource(selectedGraphics);
      }
    }
  }

  private prepareDataTableColumns(selectedGraphics: any): void {
    const firstGraphic = selectedGraphics[0];

    // tslint:disable-next-line:forin
    for (const index in firstGraphic.attributes) {
      this.dataTableColumns.push({ text: index, dataField: index });
    }
  }

  prepareDataTableSource(selectedGraphics: any): void {
    const localData = new Array<any>();

    for (const element of selectedGraphics) {
      localData.push(element.attributes);
    }

    const source: any = {
      localData: localData,
      dataType: 'array'
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  private clearGrid(): void {
    if (this.dataAdapter != null) {
      this.dataAdapter = new jqx.dataAdapter({});
    }

    if (this.dataTableColumns != null) {
      this.dataTableColumns = new Array<any>();
    }
  }

}
