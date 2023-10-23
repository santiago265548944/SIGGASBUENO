export class ChangeStratumModel {
  TipoRecepcion: any;
  Resolucion: string;
  NuevoEstrato: number;
  FechaResolucion: Date;
  Comentario: string;

  constructor() {
    this.TipoRecepcion = null;
    this.Resolucion = '';
    this.NuevoEstrato = null;
    this.FechaResolucion = null;
    this.Comentario = '';
  }
}
