export class ProjectBudgetBaseModel {
  ConcretoMetrosArena: number;
  ConcretoMetrosCaliche: number;
  ConcretoMetrosPiedra: number;
  ConcretoSimple: number;
  ConcretoEspecial: number;
  NaturalMetrosArena: number;
  NaturalMetrosCaliche: number;
  NaturalMetrosPiedra: number;

  constructor() {
    this.ConcretoMetrosArena = 0;
    this.ConcretoMetrosCaliche = 0;
    this.ConcretoMetrosPiedra = 0;
    this.ConcretoSimple = 0;
    this.ConcretoEspecial = 0;
    this.NaturalMetrosArena = 0;
    this.NaturalMetrosCaliche = 0;
    this.NaturalMetrosPiedra = 0;
  }

  getAnilloTroncalMeters(): number {
    const value = this.ConcretoMetrosArena +
                  this.ConcretoMetrosCaliche +
                  this.ConcretoMetrosPiedra +
                  this.ConcretoSimple +
                  this.ConcretoEspecial +
                  this.NaturalMetrosArena +
                  this.NaturalMetrosCaliche +
                  this.NaturalMetrosPiedra;
    return value;
  }
}

export class ProjectBudgetModel extends ProjectBudgetBaseModel {
  Proyecto: any;
  DescripcionProyecto: string;
  TuberiaAnillo: number;
  TuberiaTroncal: number;
  TipoCalculo: any;
  ListaUsar: any;
  TipoTuberia: any;
  ConcretoEnConcreto: number;
  ConcretoEnAsfalto: number;
  ConcretoEnAndenTableta: number;
  ConcretoEnZonaVerde: number;
  ConcretoEnDestapado: number;

  constructor() {
    super();
    this.Proyecto = null;
    this.DescripcionProyecto = '';
    this.TuberiaAnillo = 0;
    this.TuberiaTroncal = 0;
    this.TipoCalculo = null;
    this.ListaUsar = null;
    this.TipoTuberia = null;
    this.ConcretoEnConcreto = 0;
    this.ConcretoEnAsfalto = 0;
    this.ConcretoEnAndenTableta = 0;
    this.ConcretoEnZonaVerde = 0;
    this.ConcretoEnDestapado = 0;
  }

  getUnidadConstructivaMeters(): number {
    const value = this.ConcretoEnConcreto +
                  this.ConcretoEnAsfalto +
                  this.ConcretoEnAndenTableta +
                  this.ConcretoEnZonaVerde +
                  this.ConcretoEnDestapado;
    return value;
  }
}
