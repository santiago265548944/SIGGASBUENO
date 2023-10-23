import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appAdminHost]'
})
export class AdminHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
