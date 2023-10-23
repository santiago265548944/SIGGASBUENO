import { AdminGridConfig, UIControlNames } from '../admin-editable-grid/admin-editable-grid-config';

export class SecurityItems {
  static Usuarios = {Name: 'Usuarios'};
  static Perfiles = {Name: 'Perfiles'};
  static AsignarPerfil = {Name: 'Asignar Perfil'};
  static Funcionalidades = {Name: 'Funcionalidades'};
  static OpcionesPorPerfil = {Name: 'Opciones por perfil', Alias: 'Funcionalidades Apagadas por Perfil'};
  static OpcionesPorGasera = {Name: 'Opciones por gasera', Alias: 'Funcionalidades Apagadas'};
}

export class SecurityItemProcedures {
  static usuarios() {
    return {
      Create: 'OPCIONESGIS.InsertarUsuario',
      Read: 'OPCIONESGIS.ObtenerUsuarios',
      Update: 'OPCIONESGIS.ActualizarUsuario',
      Delete: 'OPCIONESGIS.EliminarUsuario'
    };
  }

  static perfiles() {
    return {
      Create: 'OPCIONESGIS.InsertarPerfil',
      Read: 'OPCIONESGIS.ObtenerPerfiles',
      Update: 'OPCIONESGIS.ActualizarPerfil',
      Delete: 'OPCIONESGIS.EliminarPerfil'
    };
  }

  static funcionalidades() {
    return {
      Create: 'OPCIONESGIS.InsertarFuncionalidad',
      Read: 'OPCIONESGIS.ObtenerFuncionalidad',
      Update: 'OPCIONESGIS.ActualizarFuncionalidad',
      Delete: 'OPCIONESGIS.EliminarFuncionalidad'
    };
  }

  static opcionesXPerfil() {
    return {
      Create: 'OPCIONESGIS.InsertarFuncionalidadPerfil',
      Read: 'OPCIONESGIS.ObtenerFuncionalidadPerfil',
      Update: 'OPCIONESGIS.ActualizarFuncionalidadPerfil',
      Delete: 'OPCIONESGIS.EliminarFuncionalidadPerfil'
    };
  }

  static opcionesXGasera() {
    return {
      Create: 'OPCIONESGIS.InsertarFuncionalidadGasera',
      Read: 'OPCIONESGIS.ObtenerFuncionalidadGasera',
      Update: 'OPCIONESGIS.ActualizarFuncionalidadGasera',
      Delete: 'OPCIONESGIS.EliminarFuncionalidadGasera'
    };
  }
}

export class SecurityItemConfiguration {
  static usuarios(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'IDUSUARIO';
    config.hideDelete = true;
    config.showUserButtons = true;
    config.addConfigColumn({
      columnName: 'IDUSUARIO',
      visible: false
    });
    config.addConfigColumn({
      columnName: 'IDPERFIL',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboPerfiles',
      uiControl: UIControlNames.DropDownList
    });
    config.addConfigColumn({
      columnName: 'IDPERFILMTTO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboPerfMantenimiento',
      uiControl: UIControlNames.DropDownList
    });
    config.addConfigColumn({
      columnName: 'ESTADO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboEstadoUsuario',
      uiControl: UIControlNames.DropDownList
    });
    return config;
  }

  static perfiles(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'IDPERFIL';
    config.addConfigColumn({
      columnName: 'IDPERFIL',
      visible: false
    });
    return config;
  }

  static funcionalidades(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'CODIGO';
    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });
    config.addConfigColumn({
      columnName: 'TIPODEAPLICACION',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboTipoAplicacion',
      uiControl: UIControlNames.DropDownList
    });
    return config;
  }

  static opcionesXPerfil(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'CODIGOCONFIG';
    config.addConfigColumn({
      columnName: 'CODIGOCONFIG',
      visible: false
    });
    config.addConfigColumn({
      columnName: 'CODIGOPERFIL',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboPerfiles',
      uiControl: UIControlNames.DropDownList
    });
    config.addConfigColumn({
      columnName: 'TIPOAPAGADO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboTipoApagado',
      uiControl: UIControlNames.DropDownList
    });
    config.addConfigColumn({
      columnName: 'TIPOAPLICACION',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboTipoAplicacion',
      uiControl: UIControlNames.DropDownList
    });
    config.addConfigColumn({
      columnName: 'CODIGOOBJETOGRAFICO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboObjetoGrafico',
      uiControl: UIControlNames.DropDownList
    });
    return config;
  }

  static opcionesXGasera(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'CODIGOCONFIG';
    config.addConfigColumn({
      columnName: 'CODIGOCONFIG',
      visible: false
    });
    config.addConfigColumn({
      columnName: 'TIPOAPAGADO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboTipoApagado',
      uiControl: UIControlNames.DropDownList
    });
    config.addConfigColumn({
      columnName: 'TIPOAPLICACION',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboTipoAplicacion',
      uiControl: UIControlNames.DropDownList
    });
    config.addConfigColumn({
      columnName: 'CODIGOOBJETOGRAFICO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboObjetoGrafico',
      uiControl: UIControlNames.DropDownList
    });
    return config;
  }
}
