import { InputParameter } from '../../api/request/input-parameter';

export class AdminGridConfig {
  height: number;
  editable?: boolean;
  columns?: any;
  idField?: string;
  hideDelete?: boolean;
  hideAdd?: boolean;
  hideUpdate?: boolean;
  foreignIdField?: string;
  showAddDelete?: boolean;
  showUserButtons?: boolean;

  constructor() {
    this.columns = {};
  }

  addConfigColumn(confCol: AdminGridColumnConfig) {
    this.columns[confCol.columnName] = confCol;
  }
}

export class AdminGridColumnConfig {
  columnName: string;
  uiControl?: UIControlNames;
  dataSource?: string; // use for DropDownList
  textField?: string;  // use for DropDownList
  valueField?: string; // use for DropDownList
  dataSourceParameters?: Array<InputParameter>; // use for DropDownList
  visible?: boolean;
  data?: any;
  readOnly?: boolean;
}

export class UIControlNames {
  static Checkbox = 'Checkbox';
  static DropDownList = 'DropDownList';
}
