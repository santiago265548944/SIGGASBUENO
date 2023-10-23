import {
  AdminGridConfig,
  UIControlNames
} from '../admin-editable-grid/admin-editable-grid-config';
import { GlobalService } from '../../Globals/global.service';
import { InputParameter } from '../../api/request/input-parameter';

export class AplicacionesItems {
  static General = { Name: 'General', Alias: 'Parámetros GIS' };
  static CambioDireccion = { Name: 'Cambio de Dirección' };
  static Ploteo = { Name: 'Ploteo', Alias: 'Ploteo y parámetros' };
  static MapaBase = { Name: 'Mapa Base' };
  static Edicion = { Name: 'Edicion', Alias: 'Edición' };
  static ConfiguracionEdicion = {
    Name: 'Configuracion de Edicion',
    Alias: 'Configuración de Edición'
  };
  static AuditoriaGeografica = {
    Name: 'Auditoria Geografica',
    Alias: 'Auditoría Geográfica'
  };
  static AuditoriaAlfanumerica = {
    Name: 'Auditoria Alfanumerica',
    Alias: 'Auditoría'
  };
  static RelacionesEspaciales = { Name: 'Relaciones Espaciales' };
  static AtributosDinamicos = {
    Name: 'Atributos Dinamicos',
    Alias: 'Atributos Dinámicos'
  };
  static Historico = { Name: 'Historico', Alias: 'Histórico' };
  static Secuencia = { Name: 'Secuencia' };
  static Busquedas = { Name: 'Búsquedas', Alias: 'Busquedas y parámetros' };
  static Consultas = { Name: 'Consultas', Alias: 'Consultas y parámetros' };
  static Tematicos = {
    Name: 'Temáticos',
    Alias: 'Mapas temáticos y parámetros'
  };
}

export class AplicacionesItemProcedures {
  static general() {
    return {
      Create: 'OPCIONESGIS.InsertarConfiguracionGIS',
      Read: 'OPCIONESGIS.ObtenerConfiguracionGIS',
      Update: 'OPCIONESGIS.ActualizarConfiguracionGIS',
      Delete: 'OPCIONESGIS.EliminarConfiguracionGIS'
    };
  }
  static cambioDireccion() {
    return {
      Create: 'OPCIONESGIS.InsertarConfigCambioDireccion',
      Read: 'OPCIONESGIS.ObtenerConfigCambioDireccion',
      Update: 'OPCIONESGIS.ActualizarConfCambioDireccion',
      Delete: 'OPCIONESGIS.EliminarConfigCambioDireccion'
    };
  }

  static ploteo1stGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarPlantillaPloteo',
      Read: 'OPCIONESGIS.ObtenerPlantillasDePloteo',
      Update: 'OPCIONESGIS.ActualizarPlantillaPloteo',
      Delete: 'OPCIONESGIS.EliminarPlantillaPloteo'
    };
  }

  static ploteo2ndGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarParametroPlantilla',
      Read: 'OPCIONESGIS.ObtenerParametroDePlantilla',
      Update: 'OPCIONESGIS.ActualizarParametroPlantilla',
      Delete: 'OPCIONESGIS.EliminarParametroPlantilla'
    };
  }

  static mapasBase() {
    return {
      Create: 'OPCIONESGIS.InsertarParametroMapaBase',
      Read: 'OPCIONESGIS.ObtenerParametrosMapaBase',
      Update: 'OPCIONESGIS.ActualizarParametroMapaBase',
      Delete: 'OPCIONESGIS.EliminarParametroMapaBase'
    };
  }

  static edicion() {
    return {
      Read: 'OPCIONESGIS.ObtenerParametrosEdicion',
      Update: 'OPCIONESGIS.ActualizarEdicion'
    };
  }

  static configuracionEdicion() {
    return {
      Create: 'OPCIONESGIS.InsertarConfigEdicion',
      Read: 'OPCIONESGIS.ObtenerConfigEdicion',
      Update: 'OPCIONESGIS.ActualizarEdicion',
      Delete: 'OPCIONESGIS.EliminarConfigEdicion'
    };
  }

  static auditoriaGeografica(): any {
    return {
      Create: 'OPCIONESGIS.InsertarAuditoria',
      Read: 'OPCIONESGIS.ObtenerAuditorias',
      Update: 'OPCIONESGIS.ActualizarAuditoria',
      Delete: 'OPCIONESGIS.EliminarAuditoria'
    };
  }

  static auditoriaAlfanumerica(): any {
    return {
      Create: 'AUDITORIAS.AUDIT_TABLES',
      Read: 'OPCIONESGIS.ObtenerAuditoriasNoGraficas',
      Update: '',
      Delete: 'AUDITORIAS.AUDIT_DROP'
    };
  }

  static relacionesEspaciales(): any {
    return {
      Create: 'OPCIONESGIS.InsertarRelacionEspacial',
      Read: 'OPCIONESGIS.ObtenerRelacionesEspaciales',
      Update: 'OPCIONESGIS.ActualizarRelacionEspacial',
      Delete: 'OPCIONESGIS.EliminarRelacionEspacial'
    };
  }

  static atributosDinamicos(): any {
    return {
      Create: 'OPCIONESGIS.InsertarAtributoDinamico',
      Read: 'OPCIONESGIS.ObtenerAtributosDinamicos',
      Update: 'OPCIONESGIS.ActualizarAtributoDinamico',
      Delete: 'OPCIONESGIS.EliminarAtributoDinamico'
    };
  }

  static historicos(): any {
    return {
      Create: 'OPCIONESGIS.InsertarHistorico',
      Read: 'OPCIONESGIS.ObtenerHistoricos',
      Update: 'OPCIONESGIS.ActualizarHistorico',
      Delete: 'OPCIONESGIS.EliminarHistorico'
    };
  }

  static secuencia(): any {
    return {
      Create: 'OPCIONESGIS.InsertarSecuencia',
      Read: 'OPCIONESGIS.ObtenerSecuencias',
      Update: 'OPCIONESGIS.ActualizarSecuencia',
      Delete: 'OPCIONESGIS.EliminarSecuencia'
    };
  }

  static busquedas1stGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarBusqueda',
      Read: 'OPCIONESGIS.ObtenerBusquedas',
      Update: 'OPCIONESGIS.ActualizarBusqueda',
      Delete: 'OPCIONESGIS.EliminarBusqueda'
    };
  }

  static busquedas2ndGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarParametroBusqueda',
      Read: 'OPCIONESGIS.ObtenerParametrosBusqueda',
      Update: 'OPCIONESGIS.ActualizarParametroBusqueda',
      Delete: 'OPCIONESGIS.EliminarParametroBusqueda'
    };
  }

  static consultas1stGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarConsulta',
      Read: 'OPCIONESGIS.ObtenerConsultas',
      Update: 'OPCIONESGIS.ActualizarConsulta',
      Delete: 'OPCIONESGIS.EliminarConsulta'
    };
  }

  static consultas2ndGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarParametroConsulta',
      Read: 'OPCIONESGIS.ObtenerParametrosConsulta',
      Update: 'OPCIONESGIS.ActualizarParametroConsulta',
      Delete: 'OPCIONESGIS.EliminarParametroConsulta'
    };
  }

  static tematicos1stGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarTematico',
      Read: 'OPCIONESGIS.ObtenerTematicos',
      Update: 'OPCIONESGIS.ActualizarTematico',
      Delete: 'OPCIONESGIS.EliminarTematico'
    };
  }

  static tematicos2ndGrid() {
    return {
      Create: 'OPCIONESGIS.InsertarParametroTematico',
      Read: 'OPCIONESGIS.ObtenerParametrosTematico',
      Update: 'OPCIONESGIS.ActualizarParametroTematico',
      Delete: 'OPCIONESGIS.EliminarParametroTematico'
    };
  }
}

export class AplicacionesItemConfiguration {
  static general(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'CODIGO';

    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'IDPERFIL',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboPerfiles',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static cambioDireccion(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;

    return config;
  }

  static ploteo1stGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'CODIGO';

    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'IDPERFIL',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboPerfiles',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static ploteo2ndGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'CODIGO';
    config.foreignIdField = 'CODIGOPLANTILLA';

    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'CODIGOPLANTILLA',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'TIPOPARAMETRO',
      visible: false
    });

    // config.addConfigColumn({
    //   columnName: 'TIPOPARAMETRO',
    //   textField: 'Value',
    //   valueField: 'Key',
    //   dataSource: 'OPCIONESGIS.ObtenerTipoParametrosPloteo',
    //   uiControl: UIControlNames.DropDownList
    // });

    return config;
  }

  static mapasBase(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'CODIGO';

    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'TIPOAPLICACION',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboTipoAplicacionAll',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static edicion(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'IDEDICION';
    config.hideAdd = true;
    config.hideDelete = true;

    config.addConfigColumn({
      columnName: 'IDEDICION',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'IDEDICION',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'NOMBRE',
      readOnly: true
    });

    config.addConfigColumn({
      columnName: 'ESTADO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerEstadosEdicion',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static configuracionEdicion(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'IDCONFIGEDICION';

    config.addConfigColumn({
      columnName: 'IDCONFIGEDICION',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'NOMBREEDICION',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboNombreEdicion',
      uiControl: UIControlNames.DropDownList
    });

    config.addConfigColumn({
      columnName: 'PERFIL',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboPerfiles',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static auditoriaGeografica(globalService: GlobalService): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'OBJECTID';

    config.addConfigColumn({
      columnName: 'OBJECTID',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'ON_CREATE',
      uiControl: UIControlNames.Checkbox
    });

    config.addConfigColumn({
      columnName: 'ON_DELETE',
      uiControl: UIControlNames.Checkbox
    });

    config.addConfigColumn({
      columnName: 'ON_CHANGE',
      uiControl: UIControlNames.Checkbox
    });

    config.addConfigColumn({
      columnName: 'TABLENAME',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'GDB.ObtenerTablasGraficas',
      dataSourceParameters: [
        new InputParameter('un_Dueno', globalService.DatabaseOwner)
      ],
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static auditoriaAlfanumerica(globalService: GlobalService): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.hideUpdate = true;
    config.idField = 'TABLA';

    config.addConfigColumn({
      columnName: 'TABLA',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'GDB.ObtenerTablasAuditoria',
      dataSourceParameters: [
        new InputParameter('un_Dueno', globalService.DatabaseOwner)
      ],
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static relacionesEspaciales(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    config.idField = 'OBJECTID';
    config.showAddDelete = true;

    config.addConfigColumn({
      columnName: 'OBJECTID',
      visible: false
    });

    return config;
  }

  static atributosDinamicos(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    config.idField = 'OBJECTID';
    config.showAddDelete = true;

    config.addConfigColumn({
      columnName: 'OBJECTID',
      visible: false
    });

    return config;
  }

  static historicos(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    config.idField = 'OBJECTID';
    config.showAddDelete = true;

    config.addConfigColumn({
      columnName: 'OBJECTID',
      visible: false
    });

    return config;
  }

  static secuencia(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = true;
    config.idField = 'OBJECTID';

    config.addConfigColumn({
      columnName: 'OBJECTID',
      visible: false
    });

    return config;
  }

  static busquedas1stGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'IDBUSQUEDA';

    config.addConfigColumn({
      columnName: 'IDBUSQUEDA',
      visible: false
    });

    return config;
  }

  static busquedas2ndGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'CODIGO';
    config.foreignIdField = 'IDBUSQUEDA';

    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'IDBUSQUEDA',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'TIPOPARAMETRO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerTipoParametro',
      uiControl: UIControlNames.DropDownList
    });

    config.addConfigColumn({
      columnName: 'CLASEPARAMETRO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerClaseParametro',
      uiControl: UIControlNames.DropDownList
    });

    config.addConfigColumn({
      columnName: 'TIPODATO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerTipoDato',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static consultas1stGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'IDCONSULTA';

    config.addConfigColumn({
      columnName: 'IDCONSULTA',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'PERFILES',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerComboPerfiles',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static consultas2ndGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'CODIGO';
    config.foreignIdField = 'IDBUSQUEDA';

    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'IDCONSULTA',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'TIPOPARAMETRO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerTipoParametro',
      uiControl: UIControlNames.DropDownList
    });

    config.addConfigColumn({
      columnName: 'CLASEPARAMETRO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerClaseParametro',
      uiControl: UIControlNames.DropDownList
    });

    config.addConfigColumn({
      columnName: 'TIPODATO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerTipoDato',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }

  static tematicos1stGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'IDTEMATICO';

    config.addConfigColumn({
      columnName: 'IDTEMATICO',
      visible: false
    });

    return config;
  }

  static tematicos2ndGrid(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 150;
    config.editable = true;
    config.idField = 'CODIGO';
    config.foreignIdField = 'IDTEMATICO';

    config.addConfigColumn({
      columnName: 'CODIGO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'IDTEMATICO',
      visible: false
    });

    config.addConfigColumn({
      columnName: 'TIPOPARAMETRO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerTipoParametro',
      uiControl: UIControlNames.DropDownList
    });

    config.addConfigColumn({
      columnName: 'CLASEPARAMETRO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerClaseParametro',
      uiControl: UIControlNames.DropDownList
    });

    config.addConfigColumn({
      columnName: 'TIPODATO',
      textField: 'Value',
      valueField: 'Key',
      dataSource: 'OPCIONESGIS.ObtenerTipoDato',
      uiControl: UIControlNames.DropDownList
    });

    return config;
  }
}
