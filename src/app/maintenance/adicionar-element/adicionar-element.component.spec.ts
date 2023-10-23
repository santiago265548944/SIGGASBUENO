import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionarElementComponent } from './adicionar-element.component';

describe('AdicionarElementComponent', () => {
   let component: AdicionarElementComponent;
   let fixture: ComponentFixture<AdicionarElementComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         declarations: [AdicionarElementComponent]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(AdicionarElementComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
