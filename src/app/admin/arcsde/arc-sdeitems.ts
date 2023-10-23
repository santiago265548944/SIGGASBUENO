import { AdminGridConfig, UIControlNames } from '../admin-editable-grid/admin-editable-grid-config';

export class ArcSdeitems {
    static Estado = {Name: 'Estado', Alias: 'Estado'};
    static Version = {Name: 'Version', Alias: 'Versión'};
    static Configuracion = {Name: 'Configuracion', Alias: 'Configuración'};
    static Estadisticas = {Name: 'Estadisticas', Alias: 'Estadísticas'};
    static Monitor = {Name: 'Monitor', Alias: 'Monitor'};
}

export class ArcSDEItemProcedures {
  static estado() {
    return {
      Read: 'Administracion.ObtenerEstadoSDE'
    };
  }

  static version() {
    return {
      Read: 'Administracion.ObtenerVersionSDE'
    };
  }

  static configuracion() {
    return {
      Read: 'Administracion.ObtenerConfiguracionSDE'
    };
  }

  static estadisticas() {
    return {
      Read: 'Administracion.ServerStats'
    };
  }

  static monitor() {
    return {
      Read: 'Administracion.ObtenerMonitor'
    };
  }
}

export class ArcSDEItemConfiguration {
  static estado(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    return config;
  }

  static version(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    return config;
  }

  static configuracion(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    return config;
  }

  static estadisticas(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    return config;
  }

  static monitor(): AdminGridConfig {
    const config = new AdminGridConfig();
    config.height = 350;
    config.editable = false;
    return config;
  }
}
