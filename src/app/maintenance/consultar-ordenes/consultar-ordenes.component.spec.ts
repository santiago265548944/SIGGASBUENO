import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarOrdenesComponent } from './consultar-ordenes.component';

describe('ConsultarOrdenesComponent', () => {
   let component: ConsultarOrdenesComponent;
   let fixture: ComponentFixture<ConsultarOrdenesComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         declarations: [ConsultarOrdenesComponent]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(ConsultarOrdenesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
