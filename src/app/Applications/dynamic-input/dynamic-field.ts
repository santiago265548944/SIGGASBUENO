export class DynamicField {
  IdBusqueda: number;
  IdTematico: number;
  Parametro: string;
  Orden: number;
  TipoParametro: string;
  Procedimiento: string;
  TipoDato: string;
  ClaseParametro: string;
  Etiqueta: string;
  ComboPadre: string;
  ComboHijo: string;
  Codigo: number;
  Value: any;

  constructor(source: any) {
    this.IdBusqueda = source.IDBUSQUEDA;
    this.IdTematico = source.IDTEMATICO;
    this.Parametro = source.PARAMETRO;
    this.Orden = source.ORDEN;
    this.TipoParametro = source.TIPOPARAMETRO;
    this.Procedimiento = source.PROCEDIMIENTO;
    this.TipoDato = source.TIPODATO;
    this.ClaseParametro = source.CLASEPARAMETRO;
    this.Etiqueta = source.ETIQUETA;
    this.ComboPadre = source.COMBOPADRE;
    this.ComboHijo = source.COMBOHIJO;
    this.Codigo = source.CODIGO;
    this.Value = null;
  }
}

export class DynamicFieldCombo extends DynamicField {
  DataList: Array<any>;
  ItemSelected: any;
  OnModelChanged: Function;
}
