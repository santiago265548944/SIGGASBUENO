import { Injectable } from '@angular/core';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { MapAction } from './map-action';

@Injectable()
export class MapService {
   private subject = new Subject<any>();

   constructor() {}

   executeMapAction(action: MapAction) {
      this.subject.next(action);
   }

   getMapAction(): Observable<any> {
      return this.subject.asObservable();
   }
}
