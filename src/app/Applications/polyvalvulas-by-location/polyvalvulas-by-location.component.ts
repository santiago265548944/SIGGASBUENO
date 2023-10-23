import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CodeValue } from '../../generic-class/code-vale';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ApiService } from '../../api/api.service';
import { MapService } from '../../map-service/map.service';
import { MemoryService } from '../../cache/memory.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';

@Component({
  selector: 'app-polyvalvulas-by-location',
  templateUrl: './polyvalvulas-by-location.component.html',
  styleUrls: ['./polyvalvulas-by-location.component.css']
})
export class PolyvalvulasByLocationComponent implements OnInit, AfterViewInit {
  @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
  departmentSelected: string;
  departmentValues: Array<CodeValue>;
  citySelected: string;
  cityValues: Array<CodeValue>;

  constructor(
    private mapService: MapService,
    private apiService: ApiService,
    private memoryService: MemoryService
  ) {
    this.departmentValues = new Array<CodeValue>();
    this.cityValues = new Array<CodeValue>();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.startProgress();

    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerDepartamentos,
            []
          )
        )
        .subscribe(json => {
          if (json['0']) {
            const jsonTable = JSON.parse(json['0']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.departmentValues.push(<CodeValue>{
                  Value: element.NOMBRE,
                  Code: element.CODIGO.toString()
                });
              });
            }
          }
          this.stopProgress();
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  onDepartmentChange(evt: string) {
    this.startProgress();
    this.cityValues = new Array<CodeValue>();
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ObtenerLocalidades,
            [new InputParameter('un_Departamento', evt)]
          )
        )
        .subscribe(json => {
          if (json['1']) {
            const jsonTable = JSON.parse(json['1']);
            if (jsonTable['Table1']) {
              jsonTable['Table1'].forEach(element => {
                this.cityValues.push(<CodeValue>{
                  Value: element.NOMBRE,
                  Code: element.CODIGO.toString()
                });
              });
            }
          }
          this.stopProgress();
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  executeAccept() {
    this.startProgress();
    this.cityValues = new Array<CodeValue>();
    try {
      this.apiService
        .callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.ConsumoPolivalvulaLocalidad,
            [
              new InputParameter('un_departamento', this.departmentSelected),
              new InputParameter('una_Localidad', this.citySelected),
              new InputParameter('una_Reguladora', '1')
            ]
          )
        )
        .subscribe(json => {
          alert(json['0']);
          // alert(Object.getOwnPropertyNames(json['0']));
          // if (json['1']) {
          //   const jsonTable = JSON.parse(json['1']);
          //   if (jsonTable['Table1']) {
          //     jsonTable['Table1'].forEach(element => {
          //       this.cityValues.push(<CodeValue>{
          //         Value: element.NOMBRE,
          //         Code: element.CODIGO.toString()
          //       });
          //     });
          //   }
          // }
          this.stopProgress();
        });
    } catch (error) {
      console.log(error);
      this.stopProgress();
    }
  }

  private startProgress(): void {
    this.jqxLoader.open();
  }

  private stopProgress(): void {
    this.jqxLoader.close();
  }
}
