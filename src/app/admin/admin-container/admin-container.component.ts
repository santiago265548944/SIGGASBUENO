import { Component, OnInit, ViewChild, Input, ComponentFactoryResolver } from '@angular/core';
import { AdminHostDirective } from './admin-host.directive';
import { AdminContent } from './admin-content';

@Component({
  selector: 'app-admin-container',
  templateUrl: './admin-container.component.html',
  styleUrls: ['./admin-container.component.css']
})
export class AdminContainerComponent implements OnInit {
  @ViewChild(AdminHostDirective) adminHostDirective: AdminHostDirective;
  title: string;

  private dynamicComponent: AdminContent;

  @Input()
  set component(value: AdminContent) {
    if (value != null) {
      this.loadComponent(value);
    }
  }

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
  }

  private loadComponent(item: AdminContent): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);

    const viewContainerRef = this.adminHostDirective.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<AdminContent>componentRef.instance).data = item.data;
    this.setTitle(item.data);
  }

  private setTitle(data: any) {
    if (data != null && data.title != null) {
      this.title = data.title;
    }
  }
}
