import * as moment from 'moment';

export class ReporteSuspensionServicioModel {
  Programada: string;
  _fechaInicial: string;
  _fechaFinal: string;
  HoraInicial: string;
  HoraFinal: string;

  set FechaInicial(value) {
    this._fechaInicial = value;
    if (value == null || value === '') {
      this.HoraInicial = null;
    } else if (this.HoraInicial == null) {
      this.HoraInicial = '00:00';
    }
  }

  get FechaInicial() {
    return this._fechaInicial;
  }

  set FechaFinal(value) {
    this._fechaFinal = value;
    if (value == null || value === '') {
      this.HoraFinal = null;
    } else if (this.HoraFinal == null) {
      this.HoraFinal = '00:00';
    }
  }

  get FechaFinal() {
    return this._fechaFinal;
  }

  get FechaHoraInicial() {
    if (this._fechaInicial == null || this._fechaInicial === '') {
      return '';
    }
    return moment(this._fechaInicial).format('DD/MM/YYYY') + ' ' + this.transformHora(this.HoraInicial);
  }

  get FechaHoraFinal() {
    if (this._fechaFinal == null || this._fechaFinal === '') {
      return '';
    }
    return moment(this._fechaFinal).format('DD/MM/YYYY') + ' ' + this.transformHora(this.HoraFinal);
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
