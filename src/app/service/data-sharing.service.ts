// data-sharing.service.ts

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class DataSharingService {
   private dataSubject = new Subject<any>();

   // Método para emitir datos compartidos
   sendData(data: any) {
      this.dataSubject.next(data);
   }

   // Método para suscribirse y recibir datos compartidos
   getData(): Observable<any> {
      return this.dataSubject.asObservable();
   }
   updateData(data: any) {
      this.dataSubject.next(data);
   }
}
