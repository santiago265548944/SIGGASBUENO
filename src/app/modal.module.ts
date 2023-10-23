import {
    Component, NgModule, ViewChild, OnInit, ViewContainerRef,
    Compiler, ReflectiveInjector, Injectable, Injector, ComponentRef, ComponentFactoryResolver
} from '@angular/core';
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs/Rx';
import { GenericModalComponent } from './generic-modal/generic-modal.component';
import { ConfigModal } from './generic-modal/config-modal';

// the modalservice
@Injectable()
export class ModalService {
    private vcRef: ViewContainerRef;
    private injector: Injector;
    public activeInstances = 0;

    constructor(private compiler: Compiler, private _resolver: ComponentFactoryResolver) {
    }

    registerViewContainerRef(vcRef: ViewContainerRef): void {
        this.vcRef = vcRef;
    }

    registerInjector(injector: Injector): void {
        this.injector = injector;
    }

    create(component: any, conf: ConfigModal): ComponentRef<any> {
        const componentRef$ = new ReplaySubject();
        const componentFactory = this._resolver.resolveComponentFactory(GenericModalComponent);

        const childInjector = ReflectiveInjector.resolveAndCreate([], this.injector);
        const componentRef = this.vcRef.createComponent(componentFactory, 0, childInjector);
        Object.assign(componentRef.instance, { _component: component, _conf: conf }); // pass the @Input parameters to the instance
        this.activeInstances++;
        componentRef.instance['componentIndex'] = this.activeInstances;
        componentRef.instance['destroy'] = () => {
            this.activeInstances--;
            componentRef.destroy();
        };
        componentRef$.next(componentRef);
        componentRef$.complete();

        return componentRef;
    }

    // create<T>(component: any, parameters?: Object): Observable<ComponentRef<T>> {
    //     const componentRef$ = new ReplaySubject();
    //     const componentFactory = this._resolver.resolveComponentFactory(GenericModalComponent);

    //     const childInjector = ReflectiveInjector.resolveAndCreate([], this.injector);
    //     const componentRef = this.vcRef.createComponent(componentFactory, 0, childInjector);
    //     Object.assign(componentRef.instance, { _component: component }); // pass the @Input parameters to the instance
    //     this.activeInstances++;
    //     componentRef.instance['componentIndex'] = this.activeInstances;
    //     componentRef.instance['destroy'] = () => {
    //         this.activeInstances--;
    //         componentRef.destroy();
    //     };
    //     componentRef$.next(componentRef);
    //     componentRef$.complete();

    //     return <Observable<ComponentRef<T>>>componentRef$.asObservable();
    // }
}

// this is the modal-placeholder, it will container the created modals
@Component({
    selector: 'app-modal-placeholder',
    template: `<div #modalplaceholder></div>`
})
export class ModalPlaceholderComponent implements OnInit {
    @ViewChild('modalplaceholder', { read: ViewContainerRef }) viewContainerRef;

    constructor(private modalService: ModalService, private injector: Injector) {

    }
    ngOnInit(): void {
        this.modalService.registerViewContainerRef(this.viewContainerRef);
        this.modalService.registerInjector(this.injector);
    }
}

// module definition
@NgModule({
    declarations: [ModalPlaceholderComponent],
    exports: [ModalPlaceholderComponent],
    providers: [ModalService],
})
export class ModalModule {
}
