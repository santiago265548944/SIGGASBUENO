import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { StoreProcedureRequest } from './request/store-procedure-request';
import { MemoryService } from '../cache/memory.service';
import { BytesEntryRequest } from './request/bytes-entry-request';

@Injectable()
export class ApiService {

  constructor(private http: Http, private memoryService: MemoryService) { }

  public callStoreProcedureV2(requestBody: StoreProcedureRequest): Observable<any> {
    if (this.memoryService.containKey('currentUser') && this.memoryService.containKey('currentPass')) {
      requestBody.User = this.memoryService.getItem('currentUser');
      requestBody.Password = this.memoryService.getItem('currentPass');
    }

    return this.http
      .post(environment.apiUrl + '/CallStoreProcedureV2', requestBody)
      .map(response => {
        return response.json();
      })
      .catch(this.handleError);
  }



  public callServicesDetail(): Observable<any> {
    const arcServerUrl = this.memoryService.getItem('ArcGISServerURL').replace('{0}', this.memoryService.getItem('ArcGISServerName'))
                            .replace('{1}', this.memoryService.getItem('ArcGISServerPort'));

    return this.http
      .get(arcServerUrl + '?f=json')
      .map(response => {
        const jsonObject = response.json();
        jsonObject.baseUrl = arcServerUrl;
        return jsonObject;
      })
      .catch(this.handleError);
  }

  public callBytesEntry(requestBody: BytesEntryRequest): Observable<any> {
    return this.http
      .post(environment.fileUploadUrl + '/BytesEntry', requestBody)
      .map(response => {
        return response.json();
      })
      .catch(this.handleError);
  }


  private handleError (error: Response | any) {
    console.error('ApiService::handleError', error);
    return Observable.throw(error);
  }
}
