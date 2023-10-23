import 'reflect-metadata';
import {
  Component,
  ComponentFactoryResolver,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  ComponentRef,
  ElementRef,
  Input,
  EventEmitter,
  Output,
  OnInit,
  AfterContentInit,
  AfterViewInit
} from '@angular/core';
import { jqxWindowComponent } from '../../../node_modules/jqwidgets-scripts/jqwidgets-ts/angular_jqxwindow';
import { ConfigModal } from '../generic-modal/config-modal';

@Component({
  selector: 'app-base-modal',
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.css']
})
export class BaseModalComponent
  implements OnInit, AfterContentInit, AfterViewInit {
  public conf: ConfigModal;
  public component: any;
  evtParameters: any;
  cmpRef: ComponentRef<any>;
  @ViewChild('child', { read: ViewContainerRef })
  target;
  @ViewChild('customWindow') customWindow: jqxWindowComponent;
  @Output() public modalClose: EventEmitter<any> = new EventEmitter();
  @Input() public _component: any;
  @Input() public titleModal = '';

  constructor(
    public compiler: ComponentFactoryResolver,
    public viewContainer: ViewContainerRef
  ) { }

  ngAfterViewInit() {
    this.customWindow.setTitle(this.conf.modalTitle);
    this.customWindow.width(this.conf.width);
    this.customWindow.height(this.conf.height);
    this.customWindow.resizable(this.conf.resizable);
    this.customWindow.open();
  }

  public ngAfterContentInit() {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
    if (this._component) {
      const factory = this.compiler.resolveComponentFactory(this._component);
      this.cmpRef = this.target.createComponent(factory);
      this.cmpRef.instance['closeFunction'] = () => {
        this.close();
      };

      this.start(this.evtParameters);
    }
  }

  ngOnInit() { }

  onClose() {
    // this.customWindow.close();
    // this.modalClose.emit();
  }

  onOpen() {
    this.customWindow.bringToFront();
  }

  close() {
    this.customWindow.hide();
  }

  open() {
    this.customWindow.open();
  }

  start(evt: any, title: string = null) {
    try {
      if (this.cmpRef) {
        this.cmpRef.instance.start(evt);
      } else {
        this.evtParameters = evt;
      }

      if (title) { this.customWindow.setTitle(title); }
      
    } catch { }
  }
}
