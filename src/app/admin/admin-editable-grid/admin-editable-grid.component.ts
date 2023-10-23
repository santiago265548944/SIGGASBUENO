import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AdminGridConfig, UIControlNames } from './admin-editable-grid-config';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';

enum EditableGridState {
  New = 'New',
  Edit = 'Edit'
}

@Component({
  selector: 'app-admin-editable-grid',
  templateUrl: './admin-editable-grid.component.html',
  styleUrls: ['./admin-editable-grid.component.css']
})
export class AdminEditableGridComponent {
  private _data: any[];
  private state: EditableGridState;
  allowEditControls: string = "admin-editable-grid-edit-container"
  restrictEditControls: string = "disabled admin-editable-grid-edit-container"
  curretStateEditControls: string = this.restrictEditControls;


  @Input()
  config: AdminGridConfig;

  @Input()
  set data(value: any[]) {
    if (value != null && value.length > 0) {
      this._data = value;
      this.setGrid(value);
    }
  }

  @Input()
  tranformDataFunction: Function;

  @Output()
  rowDoubleClickHandler: EventEmitter<any> = new EventEmitter();
  @Output()
  saveNewEvent: EventEmitter<any> = new EventEmitter();
  @Output()
  saveModifiedEvent: EventEmitter<any> = new EventEmitter();
  @Output()
  deleteEvent: EventEmitter<any> = new EventEmitter();
  @Output()
  rowClickHandler: EventEmitter<any> = new EventEmitter();

  get data(): any[] {
    return this._data;
  }

  dataAdapter: any;
  dataTableColumns: Array<any>;
  editFields: Array<string>;
  model: any;
  preModel: any;
  dropDownListsData: Array<any>;

  constructor(private apiService: ApiService) {
    this.dataAdapter = new jqx.dataAdapter({});
    this.dataTableColumns = new Array<any>();
    this.model = {};
    this.preModel = null;
    this.state = EditableGridState.New;
    this.editFields = [];
    this.dropDownListsData = [];
  }

  private setGrid(data: any[]) {
    this.preModel = null;
    this.model = {};
    this.state = EditableGridState.New;
    this.prepareDataTableColumns(data[0]);
    this.prepareDataTableSource(data);
  }

  prepareDataTableColumns(firstRow: any): void {
    this.dataTableColumns.splice(0, this.dataTableColumns.length);
    const keys = Object.keys(firstRow);
    this.prepareFields(keys);
    for (let index = 0; index < keys.length; index++) {
      this.dataTableColumns.push({
        text: keys[index],
        dataField: keys[index],
        width: '120',
        hidden: this.isGridColumnHidden(keys[index]),
        cellClassName: 'dynamic-table-cell'
      });
    }
  }

  isGridColumnHidden(columnName): boolean {
    if (this.config.columns) {
      const column = this.config.columns[columnName];
      if (column != null && column.visible != null) {
        return !column.visible;
      }
    }
    return false;
  }

  isDeleteHidden(): boolean {
    return this.config.hideDelete === true;
  }

  isAddHidden(): boolean {
    return this.config.hideAdd === true;
  }

  isUpdateHidden(): boolean {
    return this.config.hideUpdate === true;
  }

  private prepareFields(keys: Array<string>) {
    this.model = new Object();
    this.editFields = keys;
    keys.forEach(key => (this.model[key] = null));
  }

  prepareDataTableSource(data: any[]): void {
    const keys = Object.keys(data[0]);
    const dataFields = [];
    for (let index = 0; index < keys.length; index++) {
      dataFields.push({ name: keys[index], type: 'string' });
    }
    const source: any = {
      localData: data,
      dataFields: dataFields,
      dataType: 'json'
    };

    this.dataAdapter = new jqx.dataAdapter(source);
  }

  onRowDoubleClick(eventArg: any): void {
    this.rowDoubleClickHandler.emit(eventArg.args.row);
    if (this.config.editable && !this.isUpdateHidden()) {
      this.model = this.tranformModel(eventArg.args.row);
      this.state = EditableGridState.Edit;
    }
  }

  onRowClick(eventArg: any): void {
    this.rowClickHandler.emit(eventArg.args.row);
    if (this.config.editable) {
      this.preModel = this.tranformModel(eventArg.args.row);
    }
  }

  onNewButtonClickHandler(): void {
    this.model = {};
    if (this.config.idField != null) {
      this.model[this.config.idField] = '';
    }
    this.state = EditableGridState.New;
    this.curretStateEditControls = this.allowEditControls;
  }

  onEditButtonClickHandler(): void {
    if (this.preModel != null) {
      this.model = this.preModel;
      this.state = EditableGridState.Edit;
      this.curretStateEditControls = this.allowEditControls;
    } else {
      alert('Debe seleccionar una fila.');
    }
  }

  onSaveButtonClickHandler(): void {
    switch (this.state) {
      case EditableGridState.New:
        if (!this.isAddHidden()) {
          this.saveNewEvent.emit(this.model);
        }
        break;
      case EditableGridState.Edit:
        this.saveModifiedEvent.emit(this.model);
        break;
    }
    this.curretStateEditControls = this.restrictEditControls;
  }

  onDeleteButtonClickHandler(): void {
    if (this.preModel != null) {
      if (confirm('En realidad desea eliminar este registro?')) {
        this.deleteEvent.emit(this.preModel);
        this.model = {};
        this.state = EditableGridState.New;
      }
    } else {
      alert('Debe seleccionar una fila.');
    }
  }

  onCancelButtonClickHandler(): void {
    this.model = {};
    this.state = EditableGridState.New;
    this.curretStateEditControls = this.restrictEditControls;
  }

  private doesColumnConfigurationExist(fieldName: string): boolean {
    return (
      this.config != null &&
      this.config.columns != null &&
      this.config.columns[fieldName] != null
    );
  }

  isFieldCheckBox(fieldName: string): boolean {
    return this.isFieldSpecificControl(fieldName, UIControlNames.Checkbox);
  }

  isFieldDrowpDownList(fieldName: string): boolean {
    return this.isFieldSpecificControl(fieldName, UIControlNames.DropDownList);
  }

  isFieldDisabled(fieldName: string): boolean {
    if (this.doesColumnConfigurationExist(fieldName)) {
      return this.config.columns[fieldName].readOnly === true;
    }
    return false;
  }

  private isFieldSpecificControl(
    fieldName: string,
    uiControlName: string
  ): boolean {
    if (this.doesColumnConfigurationExist(fieldName)) {
      return this.config.columns[fieldName].uiControl === uiControlName;
    }
    return false;
  }

  private tranformModel(modelValue: any): any {
    return this.tranformDataFunction
      ? this.tranformDataFunction(modelValue)
      : modelValue;
  }

  private cleanGrid(): void {
    this.dataTableColumns = [];
    this.dataAdapter = new jqx.dataAdapter(null);
  }
}
