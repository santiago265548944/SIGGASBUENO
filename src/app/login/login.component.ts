import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api/api.service';
import { MemoryService } from '../cache/memory.service';
import { RequestHelper } from '../api/request/request-helper';
import { LoginModel } from './login-model';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('jqxLoader')
  jqxLoader: jqxLoaderComponent;

  model: LoginModel;
  loading = false;
  returnUrl: string;
  tipo = 'password';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private memoryService: MemoryService
  ) {
    this.model = new LoginModel();
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.memoryService.containKey('currentUser')) {
      this.model.Usuario = this.memoryService .getItem('currentUser');
    }
  }

  login() {
    this.startProgress();
    this.loading = true;
    this.apiService
      .callStoreProcedureV2(
        RequestHelper.getGisParamsRequestBodyWithUser(
          this.model.Usuario,
          this.model.Password
        )
      )
      .subscribe(json => {
        const result = this.handleErrorResponse(json);
        if (result != null) {
          if (result['Table1']) {
            this.memoryService.setItem('currentUser', this.model.Usuario);
            this.memoryService.setItem('currentPass', this.model.Password);
            result['Table1'].forEach(element => {
              this.memoryService.setItem(
                element.NOMBREPARAMETRO,
                element.VALORPARAMETRO
              );
            });
            this.router.navigate([this.returnUrl]);
          }
        }
        this.loading = false;
        this.stopProgress();
      });
  }

  private handleErrorResponse(json): any {
    const posResult = Object.getOwnPropertyNames(json);
    if (posResult != null && posResult.length > 0) {
      const result = typeof(json[posResult[0]]) === 'string' ?  JSON.parse(json[posResult[0]].toString()) :  json[posResult[0]];
      if (!result['ErrorMessage']) {
        return result;
      } else {
        alert(result['ErrorMessage']);
      }
    }
    return null;
  }

  type(): void {
    if (this.tipo === 'password') {
      this.tipo = 'text';
    } else if (this.tipo === 'text') {
      this.tipo = 'password';
    }
  }

  private startProgress(): void {
    this.jqxLoader.open();
  }

  private stopProgress(): void {
    this.jqxLoader.close();
  }
}
