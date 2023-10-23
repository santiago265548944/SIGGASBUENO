import * as moment from 'moment';

export class InterrupcionServicioModel {
  TipoFalla: any;
  NumeroOrden: number;
  Programada: string;
  OrigenSuspension: any;
  MedioComunicacion: any;
  _fechaProgramadaSuspension: string;
  HoraProgramadaSuspension: string;
  DuracionProgramadaSuspension: number;
  TiempoEstimadoSuspension: number;
  Observacion: string;

  get FechaProgramadaSuspension() {
    return this._fechaProgramadaSuspension;
  }

  set FechaProgramadaSuspension(value) {
    this._fechaProgramadaSuspension = value;
    if (value == null || value === '') {
      this.HoraProgramadaSuspension = null;
    } else if (this.HoraProgramadaSuspension == null) {
      this.HoraProgramadaSuspension = '00:00';
    }
  }

  get FechaHoraProgramadaSuspension() {
    if (this._fechaProgramadaSuspension == null || this._fechaProgramadaSuspension === '') {
      return '';
    }
    return moment(this._fechaProgramadaSuspension).format('DD/MM/YYYY') + ' ' + this.transformHora(this.HoraProgramadaSuspension);
  }

  private transformHora(hora: string) {
    if (hora != null && hora !== '') {
      return hora;
      // const partesHora = hora.split(':');
      // if (partesHora.length > 0 ) {
      //   const horaNumber = Number(partesHora[0]);
      //   const doceHorasSymbol = horaNumber >= 12 ? 'p.m' : 'a.m';
      //   const horaEnDoceModulo = horaNumber % 12;
      //   const horaEnDoce = horaEnDoceModulo > 0 ? horaEnDoceModulo.toString() : '12';
      //   return horaEnDoce + ':' + partesHora[1] + ' ' + doceHorasSymbol;
      // }
    }
    return '00:00';
  }
}
