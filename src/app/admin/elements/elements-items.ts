import {
  AdminGridConfig,
  UIControlNames
} from '../admin-editable-grid/admin-editable-grid-config';
import { InputParameter } from '../../api/request/input-parameter';

export class ElementsItems {
  static Elementos = { Name: 'Elementos' };
}

export class ElementsItemConfig {
  static elementos1stGrid(): AdminGridConfig {
    return <AdminGridConfig>{
      height: 150
    };
  }

  static elementos2ndGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;

    config.addConfigColumn({
      columnName: 'EDITABLE',
      uiControl: UIControlNames.Checkbox
    });
    config.addConfigColumn({
      columnName: 'VISIBLE',
      uiControl: UIControlNames.Checkbox
    });
    config.addConfigColumn({
      columnName: 'REQUERIDO',
      uiControl: UIControlNames.Checkbox
    });
    return config;
  }
}

export class ElementsProcedures {
  static elements1stGrid(dbOwner: string, elementName: string) {
    return {
      Read: 'Administracion.ObtenerElementosDataSets',
      ReadParameters: [
        new InputParameter('un_Dueno', dbOwner),
        new InputParameter('un_Dataset', elementName !== 'Otros' ? `${dbOwner}.${elementName}` : '')
      ]
    };
  }

  static elements2ndGrid() {
    return {
      Create: 'Administracion.InsertarCampoElemento',
      Read: 'Administracion.ObtenerCamposElementos',
      Update: 'Administracion.ActualizarCampoElemento',
      Delete: 'Administracion.EliminarCampoElemento'
    };
  }
}
