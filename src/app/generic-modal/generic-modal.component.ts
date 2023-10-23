import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { Modal } from '../close.modal';
import { ConfigModal } from './config-modal';

@Component({
  selector: 'app-generic-modal',
  templateUrl: './generic-modal.component.html',
  styleUrls: ['./generic-modal.component.css']
})
@Modal()
export class GenericModalComponent implements OnInit {
  ok: Function;
  destroy: Function;
  closeModal: Function;

  @Input() _component: any;
  @Input() _conf: ConfigModal;

  public isOpen = false;
  public data;
  @ViewChild(BaseModalComponent) modal;
  constructor() { }

  ngOnInit() {
    this.modal._component = this._component;
    this.modal.conf = this._conf;
  }

  getData(data) {
    this.data = data;
  }

  close() {
    // this.closeModal();  //Elimina el DOM completamente
    this.modal.close();
  }

  open() {
    this.modal.open();
  }

  start(evt: any, title: string = null) {
    this.modal.start(evt, title);
  }
}
