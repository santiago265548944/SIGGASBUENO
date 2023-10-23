import * as moment from 'moment';

export class RestablecerServicioModel {
  IdFalla: string;
  TipoFalla: any;
  IdCausa: any;
  FechaFin: string;
  Justificacion: string;

  get FechaFinFormat() {
    if (this.FechaFin == null || this.FechaFin === '') {
      return this.FechaFin;
    }
    return moment(this.FechaFin).format('DD/MM/YYYY');
  }

  clear() {
    this.IdFalla = null;
    this.TipoFalla = null;
    this.IdCausa = null;
    this.FechaFin = null;
    this.Justificacion = null;
  }
}
