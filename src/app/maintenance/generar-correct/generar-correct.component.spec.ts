import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarCorrectComponent } from './generar-correct.component';

describe('GenerarCorrectComponent', () => {
   let component: GenerarCorrectComponent;
   let fixture: ComponentFixture<GenerarCorrectComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         declarations: [GenerarCorrectComponent]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(GenerarCorrectComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
