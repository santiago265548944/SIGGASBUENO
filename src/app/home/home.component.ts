import { Component, ChangeDetectorRef, OnInit, OnDestroy, ComponentRef } from '@angular/core';
import { MemoryService } from '../cache/memory.service';
import { ModalService } from '../modal.module';
import { ChangePasswordComponent } from '../login/change-password/change-password.component';
import { GlobalService } from '../Globals/global.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public mapHeight = '0px';
  private _ribbonHeight = 121;
  public classToggle = 'toggled';
  // Set our map properties
  mapCenter = [-122.4194, 37.7749];
  basemapType = 'satellite';
  mapZoomLevel = 12;
  private modalChangesPassword: ComponentRef<any> = null;
  // Dashboard.
  appEsriToc: string;
  appDashboard: string;
  control: string = null;
  cerrarDashboard = false;
  alturaMapa = '0px';
  paddingRight = '0px';
  sidebarRight = '0px';
  marginLeft = '250px';
  sidebarBottomWidth = '0px';

  constructor(
    private cdr: ChangeDetectorRef, private memoryService: MemoryService, private modalService: ModalService,
    private globalService: GlobalService
  ) {
    this.mapHeight = window.innerHeight - this._ribbonHeight + 'px';
    this.sidebarRight = window.innerHeight - this._ribbonHeight + 'px';

    window.onresize = () => {
      this.mapHeight = window.innerHeight - this._ribbonHeight + 'px';
      this.cdr.detectChanges();
    };
  }

  // See app.component.html
  mapLoadedEvent(status: boolean) {
    // console.log('The map loaded: ' + status);
    this.managePasswordExpiracy();
  }

  managePasswordExpiracy(): void {
    if (this.memoryService.containKey('PasswordExpiryDate') && this.memoryService.containKey('PasswordExpiryThreshold')) {
      const expiracyDate = Number.parseInt(this.memoryService.getItem('PasswordExpiryDate'));
      const expiracyThreshold = Number.parseInt(this.memoryService.getItem('PasswordExpiryThreshold'));
      if (expiracyDate < expiracyThreshold) {
        if (confirm(`Su contraseña expira en ${expiracyDate} días,\n¿Desea cambiar su contraseña?`)) {
          this.openChangePasswordWindow();
        }
      }
    }
  }

  private openChangePasswordWindow(): void {
    if (this.modalChangesPassword == null) {
      this.modalChangesPassword = this.modalService.create(ChangePasswordComponent, {
        modalTitle: `Cambiar Contraseña a ${this.memoryService.getItem('currentUser')}`,
        height: 150,
        width: 450,
        resizable: true
      });
    } else {
      this.modalChangesPassword.instance.open();
    }
    this.modalChangesPassword.instance.start({ data: this.memoryService.getItem('currentUser'), isAdmin: false });
  }

  // TOC.
  showTOC(): void {
    this.control = 'TOC';

    this.openControl(this.control);
  }

  // Dashboard.
  openDashboard(): void {
    this.control = 'Dashboard';
    this.paddingRight = '250px';
    this.marginLeft = '-250px';
    this.sidebarRight = window.innerHeight - this._ribbonHeight + 'px';

    const tamanhoMapa = (window.innerHeight / 1.7) - this._ribbonHeight;
    this.mapHeight = tamanhoMapa + 'px';
    this.alturaMapa = window.innerHeight - tamanhoMapa - this._ribbonHeight + 'px';
    this.sidebarBottomWidth = window.innerWidth - 250 + 'px';
    // this.sidebarBottomWidth = window.innerWidth - 500 + 'px';

    window.onresize = () => {
      this.sidebarRight = window.innerHeight - this._ribbonHeight + 'px';
      this.globalService.setSidebarHeight(this.sidebarRight);

      const tamanhoMapaOnresize = (window.innerHeight / 1.7) - this._ribbonHeight;
      this.mapHeight = tamanhoMapaOnresize + 'px';
      this.alturaMapa = window.innerHeight - tamanhoMapaOnresize - this._ribbonHeight + 'px';
      this.globalService.setSidebarBottomHeight(this.alturaMapa);

      this.sidebarBottomWidth = window.innerWidth - 250 + 'px';
      // this.sidebarBottomWidth = window.innerWidth - 500 + 'px';
    };

    this.openControl(this.control);
  }

  openControl(estado: string): void {
    if (estado === 'TOC') {
      this.appEsriToc = 'block';
      this.appDashboard = 'none';
      this.classToggle = this.classToggle === '' ? 'toggled' : '';
    } else if (estado === 'Dashboard') {
      this.appEsriToc = 'none';
      this.appDashboard = 'block';
      this.classToggle = '';
    }
  }

  closeDashboard(): void {
    this.cerrarDashboard = true;

    if (this.cerrarDashboard === true && this.control === 'Dashboard') {
      this.classToggle = 'toggled';
      this.globalService.setDeleteData(true);

      this.sidebarRight = window.innerHeight - this._ribbonHeight + 'px';
      this.alturaMapa = '0px';
      this.paddingRight = '0px';
      this.marginLeft = '250px';
      this.sidebarBottomWidth = '0px';

      this.mapHeight = window.innerHeight - this._ribbonHeight + 'px';
      window.onresize = () => {
        this.mapHeight = window.innerHeight - this._ribbonHeight + 'px';
      };
    }
  }

  ngOnInit(): void { }

  ngOnDestroy(): void { }

}
