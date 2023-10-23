import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MapService } from '../../map-service/map.service';
import {
  SelectAction,
  SelectActionType,
  OwnerSelection
} from '../../map-service/map-actions/select-action';
import { EmapActions, Emodal } from '../../map-service/emap-actions.enum';
import { Subscription } from 'rxjs/Subscription';
import { loadModules } from 'esri-loader';
import * as _ from 'underscore';
import { MemoryService } from '../../cache/memory.service';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { AddGeometry, CallModal } from '../../map-service/map-action';

@Component({
  selector: 'app-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.css']
})
export class QueryBuilderComponent implements OnInit {
  @ViewChild('selectLayers') selectLayers: ElementRef;
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  private subscription: Subscription;
  private map: any;
  private selectionStart: number;
  private selectionEnd: number;
  mapServices: any[];
  selectedMapService: any;
  layerIdSelected: any;
  layerTextSelected: string;
  arcServerUrl: string;
  fields: any[];
  fieldSelected: any;
  uniqueValues: any[];
  uniqueValueSelected: any;
  whereClause: string;
  isQueryVerified = false;
  isQueryApplied = false;
  closeFunction: Function;
  featuresFound: any;

  constructor(
    private mapService: MapService,
    private memoryService: MemoryService
  ) {
    this.subscription = this.mapService
      .getMapAction()
      .subscribe(mapAction => this.executeSelectAction(mapAction));

    this.arcServerUrl = this.memoryService
      .getItem('ArcGISServerURL')
      .replace('{0}', this.memoryService.getItem('ArcGISServerName'))
      .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));

    this.whereClause = '';
    this.selectionStart = 0;
    this.selectionEnd = 0;
  }

  ngOnInit() {
    this.fillServices();
  }

  private fillServices(): void {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.FillServicesRequest,
      owner: OwnerSelection.QueryBuilder
    });
  }

  private executeSelectAction(selectAction: SelectAction) {
    if (selectAction.owner === OwnerSelection.QueryBuilder) {
      switch (selectAction.selectActionType) {
        case SelectActionType.FillServicesResponse:
          this.map = selectAction.map;
          this.executeFillServices();
          break;
      }
    }
  }

  private executeFillServices(): void {
    loadModules(['esri/layers/ArcGISDynamicMapServiceLayer'], {
      url: 'https://js.arcgis.com/3.23/'
    }).then(([ArcGISDynamicMapServiceLayer]) => {
      if (this.mapServices == null) {
        this.mapServices = new Array<any>();
      }
      this.map.layerIds.forEach(layerId => {
        const layer = this.map.getLayer(layerId);
        if (layer instanceof ArcGISDynamicMapServiceLayer) {
          this.mapServices.push(layer);
        }
      });

      if (this.mapServices.length > 0) {
        this.selectedMapService = this.mapServices[0];
        this.onMapServiceChange(this.selectedMapService);
      }
    });
  }

  onMapServiceChange(newMapService: any): void {
    if (newMapService != null) {
      this.clearSelectElements();
      this.fillSelectLayers(newMapService);
    }
  }

  private fillSelectLayers(mapService: any): void {
    this.layerIdSelected = null;
    const parentLayerInfos = _.filter(
      mapService.layerInfos,
      (layerInfo: any) => {
        return layerInfo.parentLayerId === -1;
      }
    );

    parentLayerInfos.forEach(parentLayerInfo => {
      this.createLayersGroup(parentLayerInfo, mapService.layerInfos, 0);
    });
  }

  private createLayersGroup(
    parentLayerInfo: any,
    layersInfo: any,
    depth: number
  ): void {
    let optionParent: any;
    if (parentLayerInfo.subLayerIds != null) {
      optionParent = <HTMLOptGroupElement>document.createElement('optgroup');
      optionParent.label = parentLayerInfo.name;
      if (depth > 0) {
        optionParent.setAttribute('style', 'font-style:italic');
      }
      this.selectLayers.nativeElement.appendChild(optionParent);
      const layerChilds = _.filter(layersInfo, (layerInfo: any) => {
        return layerInfo.parentLayerId === parentLayerInfo.id;
      });

      layerChilds.forEach(layerChild => {
        if (layerChild.subLayerIds != null) {
          this.createLayersGroup(layerChild, layersInfo, ++depth);
        } else {
          if (this.layerIdSelected == null) {
            this.layerIdSelected = layerChild.id;
            this.layerTextSelected = layerChild.name;
            this.fillFields();
          }
          const optionItem = <HTMLOptionElement>(
            document.createElement('option')
          );
          optionItem.value = layerChild.id;
          optionItem.text = layerChild.name;
          this.selectLayers.nativeElement.appendChild(optionItem);
        }
      });
    } else {
      if (this.layerIdSelected == null) {
        this.layerIdSelected = parentLayerInfo.id;
        this.layerTextSelected = parentLayerInfo.name;
        this.fillFields();
      }
      optionParent = <HTMLOptionElement>document.createElement('option');
      optionParent.value = parentLayerInfo.id;
      optionParent.text = parentLayerInfo.name;
      this.selectLayers.nativeElement.appendChild(optionParent);
    }
  }

  private clearSelectElements() {
    let firstChild = this.selectLayers.nativeElement.firstChild;

    while (firstChild) {
      this.selectLayers.nativeElement.removeChild(firstChild);
      firstChild = this.selectLayers.nativeElement.firstChild;
    }
  }

  private fillFields() {
    this.queryTask(
      this.selectedMapService.id,
      this.layerIdSelected,
      ['*'],
      null,
      '1=2',
      false,
      result => this.fillFieldsCompleted(result),
      error => this.queryTaskError(error)
    );
  }

  fillFieldsCompleted(result): void {
    if (result && result.fields && result.fields.length > 0) {
      this.fields = result.fields.map(field => ({
        value: field.name,
        text: field.alias || field.name
      }));
    }
  }

  onLayerIndexChange(newLayerId): void {
    this.layerTextSelected = this.getSelectLayerTextSelected();
    this.fillFields();
    this.cleanEntries();
  }

  onFieldDblClick(): void {
    this.addQueryCommand(this.fieldSelected.value);
  }

  getUniqueFieldValues() {
    if (this.fieldSelected != null) {
      this.queryTask(
        this.selectedMapService.id,
        this.layerIdSelected,
        [this.fieldSelected.value],
        [this.fieldSelected.value],
        '1=1',
        true,
        result => this.getUniqueFieldValuesCompleted(result),
        error => this.queryTaskError(error)
      );
    }
  }

  private getUniqueFieldValuesCompleted(result: any): void {
    this.uniqueValues = new Array<any>();
    if (
      result != null &&
      result.features != null &&
      result.features.length > 0
    ) {
      const fieldType = result.fields[0].type;
      result.features.forEach(feature => {
        const values = Object.values(feature.attributes);
        let value = values[0];
        if (value != null) {
          if (fieldType === 'esriFieldTypeString') {
            value = '\'' + value + '\'';
          }
        } else {
          value = 'NULL';
        }

        if (this.uniqueValues.indexOf(value) < 0) {
          this.uniqueValues.push(value);
        }
      });
    }
  }

  onWhereClauseBlur(eventArg: any): void {
    this.selectionStart = eventArg.target.selectionStart;
    this.selectionEnd = eventArg.target.selectionEnd;
  }

  onUniqueValueDblClick() {
    this.addQueryCommand(this.uniqueValueSelected);
  }

  onButtonOperationClick(eventArg: any) {
    this.addQueryCommand(eventArg.target.value);
  }

  private addQueryCommand(queryCommand: any) {
    queryCommand = queryCommand.toString();
    const selStart = this.selectionStart;
    const selEnd = selStart + (this.selectionEnd - this.selectionStart);

    const string1 = this.whereClause.substring(0, selStart);
    let string2 = queryCommand.trim();

    let string1Length = string1.length;
    if (string1Length === 0) {
      string1Length = 1;
    }

    if (string1.substring(string1Length - 1) !== ' ' && string1Length !== 1) {
      string2 = ' ' + string2;
    }

    const string3 = this.whereClause.substring(selEnd);

    this.whereClause = string1 + string2 + string3;
    this.selectionStart = selEnd + queryCommand.length + 1;
    this.selectionEnd = this.selectionStart;
  }

  private getSelectLayerTextSelected() {
    let layerText = 'Ninguna';
    const itemSelected = this.selectLayers.nativeElement.options[this.selectLayers.nativeElement.options.selectedIndex].text;
    if (itemSelected) {
      layerText = itemSelected;
    }
    return layerText;
  }

  private cleanWhereClause() {
    this.whereClause = '';
  }

  onCleanWhereClauseClick() {
    this.isQueryApplied = false;
    this.isQueryVerified = false;
    this.cleanWhereClause();
  }

  private cleanEntries() {
    this.uniqueValues = [];
    this.featuresFound = null;
    this.cleanWhereClause();
  }

  onVerifyButtonClick(): void {
    this.queryTask(
      this.selectedMapService.id,
      this.layerIdSelected,
      ['*'],
      null,
      this.whereClause,
      false,
      result => this.onVerifyWhereClauseCompleted(result),
      error => this.onVerifyWhereClauseError(error)
    );
  }

  private onVerifyWhereClauseCompleted(result: any) {
    if (result && result.features) {
      this.isQueryVerified = true;
      alert('Consulta Bien Construida \nContiene ' + result.features.length + ' Registro(s)');
    }
  }

  private onVerifyWhereClauseError(error: any) {
    this.isQueryApplied = false;
    this.isQueryVerified = false;
    alert('Consulta mal construida.');
  }

  onAcceptButtonClick(): void {
    this.queryTaskWithGeometry(
      this.selectedMapService.id,
      this.layerIdSelected,
      ['*'],
      null,
      this.whereClause,
      true,
      false,
      result => this.onAcceptCompleted(result),
      error => this.queryTaskError(error)
    );
  }

  private onAcceptCompleted(result: any): void {
    if (result && result.features) {
      this.zoomAddFeaturesFound(result.features);
      this.cleanEntries();
      this.closeFunction();
    }
  }

  private zoomAddFeaturesFound(features: any) {
    this.mapService.executeMapAction(<SelectAction>{
      EMapAction: EmapActions.Select,
      selectActionType: SelectActionType.ZoomToSelection,
      featureSelected: features,
      owner: OwnerSelection.QueryBuilder
    });

    this.mapService.executeMapAction(<AddGeometry>{
      EMapAction: EmapActions.AddGeometry,
      geometries: features
    });
  }

  onApplyButtonClick(): void {
    this.queryTaskWithGeometry(
      this.selectedMapService.id,
      this.layerIdSelected,
      ['*'],
      null,
      this.whereClause,
      true,
      false,
      result => this.onApplyCompleted(result),
      error => this.queryTaskError(error)
    );
  }

  private onApplyCompleted(result: any) {
    if (result && result.features) {
      this.zoomAddFeaturesFound(result.features);
      this.featuresFound = result.features;
      this.isQueryApplied = true;
    }
  }

  onViewTableButtonClick(): void {
    this.mapService.executeMapAction(<CallModal>{
      EMapAction: EmapActions.CallModal,
      EModal: Emodal.ViewSelection,
      parameters: this.featuresFound
    });
  }

  private queryTask(
    service: string,
    layerIndex: string,
    outputFields: Array<string>,
    orderByFields: Array<string>,
    whereClause: string,
    useGroupBy: boolean,
    resultCallback: Function,
    errorCallback: Function
  ) {
    this.queryTaskWithGeometry(service,
      layerIndex,
      outputFields,
      orderByFields,
      whereClause,
      false,
      useGroupBy,
      resultCallback,
      errorCallback);
  }

  private queryTaskWithGeometry(
    service: string,
    layerIndex: string,
    outputFields: Array<string>,
    orderByFields: Array<string>,
    whereClause: string,
    returnGeometry: boolean,
    useGroupBy: boolean,
    resultCallback: Function,
    errorCallback: Function
  ) {
    loadModules([
      'esri/tasks/QueryTask',
      'esri/tasks/query',
      'esri/tasks/StatisticDefinition'
    ]).then(([QueryTask, Query, StatisticDefinition]) => {
      this.startProgress();
      const url = this.arcServerUrl + service + '/MapServer/' + layerIndex;
      const queryTask = new QueryTask(url);
      const query = new Query();
      query.returnGeometry = returnGeometry;
      query.outFields = outputFields;
      query.orderByFields = orderByFields;
      if (useGroupBy) {
        const statisticGroup = new StatisticDefinition();
        statisticGroup.onStatisticField = orderByFields[0];
        statisticGroup.outStatisticFieldName = "FieldCount";
        statisticGroup.statisticType = "count";
        query.groupByFieldsForStatistics = orderByFields;
        query.outStatistics = [statisticGroup];
      }
      query.where = whereClause;
      queryTask.execute(query
        , (result) => {
          this.stopProgress();
          resultCallback(result);
        }
        , (error) => {
          this.stopProgress();
          errorCallback(error);
        });
    });
  }

  private queryTaskError(err) {
    alert('Query fallido: ' + err);
  }

  private startProgress(): void {
    if (this.jqxLoader) {
      this.jqxLoader.open();
    }
  }

  private stopProgress(): void {
    if (this.jqxLoader) {
      this.jqxLoader.close();
    }
  }
}
