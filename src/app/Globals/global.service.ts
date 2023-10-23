import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class GlobalService {
  globalStationSelect: any;
  featureSelectedTool: any;
  currentGraphicSelected: any;
  lastKeyPress: number;
  aislarPuntos: any;
  aislarLineas: any;
  consecutivePressCode: any;
  pressID: any;
  pipeLayer: any;
  clickCount: number;
  pressNumber: number;
  isPressActive: boolean;
  bufferGeometry: any;
  mapPoint: any;
  private databaseOwner: string;
  // Dashboard.
  private datosDashboard = new Subject<number>();
  public datosDashboard$ = this.datosDashboard.asObservable();
  private optionDashboard = new Subject<string>();
  public optionDashboard$ = this.optionDashboard.asObservable();
  private sidebarHeight = new Subject<string>();
  public sidebarHeight$ = this.sidebarHeight.asObservable();
  private sidebarBottomHeight = new Subject<string>();
  public sidebarBottomHeight$ = this.sidebarBottomHeight.asObservable();
  private nombreSeleccionado = new Subject<string>();
  public nombreSeleccionado$ = this.nombreSeleccionado.asObservable();
  private flag = new Subject<boolean>();
  public flag$ = this.flag.asObservable();
  // legalizar orden
  private fechaInitExecute = new Subject<string>();
  public fechaInitExecute$ = this.fechaInitExecute.asObservable();
  private fechaFinExecute = new Subject<string>();
  public fechaFinExecute$ = this.fechaFinExecute.asObservable();
  private causalExecute = new Subject<string>();
  public causalExecute$ = this.causalExecute.asObservable();

  get DatabaseOwner() {
    return this.databaseOwner;
  }

  constructor() {
    this.databaseOwner = 'GISCARIBE';
  }

  setStationSelect(station: any) {
    this.globalStationSelect = station;
  }

  getStationSelect(): any {
    return this.globalStationSelect;
  }

  setFeatureMapAdded(feature: any) {
    this.featureSelectedTool = feature;
  }

  getFeatureMapAdded(): any {
    return this.featureSelectedTool;
  }

  setCurrentGraphicSelected(evt: any) {
    this.currentGraphicSelected = evt;
  }

  getCurrentGraphicSelected(): any {
    return this.currentGraphicSelected;
  }

  setLastKeyPress(evt: number) {
    this.lastKeyPress = evt;
  }

  getLastKeyPress(): number {
    return this.lastKeyPress;
  }

  setAislarPuntos(evt: number) {
    this.aislarPuntos = evt;
  }

  getAislarPuntos(): number {
    return this.aislarPuntos;
  }

  setAislarLineas(evt: number) {
    this.aislarLineas = evt;
  }

  getAislarLineas(): number {
    return this.aislarLineas;
  }

  setManejoPrensas(_consecutivePressCode: any,
    _pressID: any,
    _pipeLayer: any,
    _clickCount: number,
    _pressNumber: number,
    _isPressActive: boolean) {

    this.consecutivePressCode = _consecutivePressCode;
    this.pressID = _pressID;
    this.pipeLayer = _pipeLayer;
    this.clickCount = _clickCount;
    this.pressNumber = _pressNumber;
    this.isPressActive = _isPressActive;
  }

  // Dashboard.
  setDatosDashboard(event: number) {
    this.datosDashboard.next(event);
  }

  setOptionDashboard(option: string) {
    this.optionDashboard.next(option);
  }

  setSidebarHeight(height: string) {
    this.sidebarHeight.next(height);
  }

  setSidebarBottomHeight(height: string) {
    this.sidebarBottomHeight.next(height);
  }

  setNombreSeleccionado(nombre: string) {
    this.nombreSeleccionado.next(nombre);
  }

  setDeleteData(flag: boolean) {
    this.flag.next(flag);
  }
  // legalizar orden
  setFechaInitExecute(event: string) {
    this.fechaInitExecute.next(event);
  }

  setFechaFinExecute(event:string){
    this.fechaFinExecute.next(event);

  }

  setCausalExecute(event:string){
    this.causalExecute.next(event);

  }
}
