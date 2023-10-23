import { Component, OnInit, ViewChild, ComponentRef } from '@angular/core';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ApiService } from '../../api/api.service';
import { MemoryService } from '../../cache/memory.service';
import { CodeValue } from '../../generic-class/code-vale';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { ExecuteOrderComponent } from '../execute-order/execute-order.component';
import { ModalService } from '../../modal.module';
// import { LegalizationOrderModel } from './legalization-order-model';
import { e } from '@angular/core/src/render3';
import { logging } from 'selenium-webdriver';
import moment = require('moment');
import { Subscription } from 'rxjs';
import { GlobalService } from '../../Globals/global.service';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';

@Component({
   selector: 'app-legalization-order',
   templateUrl: './legalization-order.component.html',
   styleUrls: ['./legalization-order.component.css']
})
export class LegalizationOrderComponent implements OnInit {
   @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
   fechaInitExecute: Subscription;
   fechaFinExecute: Subscription;
   causalExecute: Subscription;
   // model: LegalizationOrderModel;
   modalExecuteOrder: ComponentRef<any> = null;
   interventorValues: Array<CodeValue>;
   perfil: any;
   user: any;
   ordernes: Array<CodeValue>;
   resultOrders: Array<any>;
   orderSelected: any;
   buscarOrden: any;
   opcion = false;
   actividadOSF: any = '';
   actividad: string = '';
   cuadrillaAsignada: string = '';
   cuadrillaInterventor1: any = '';
   ordenCorrectivo: any;
   correctivo: any;
   plano: string;
   checkAP = false;
   checkRE = false;
   checkNT = false;
   checkLegalized = 0;
   tipoOrdenCP: string;
   tipoTrabajo: number;
   resultOrdersTag: any;
   resultCorrItems: any;
   resultTotal: any;
   personInterventor: any;
   intenvertor: any;
   guardaIterventor: any;
   sTasktype: any;
   dataPreItems: any;
   operUnit: any;
   observacion: any = null;
   ldcType: any;
   ldcTypeValue: any;
   causal: any = '';
   persona: any;
   personaCambio: any;
   causalCambio: any;
   causa_legal: any = null;
   causalegal: any;
   causalValue: {};
   causalTiene: {};
   cambioCasual: any = null;
   personaSelect: any = null;
   data: any;
   arryPasarData: Array<any>;
   disableTF: boolean = false;
   FechasETF: boolean = false;
   interventorTF: boolean = true;
   planoTF: boolean = false;
   fechLegalizacion: any;
   fechaGeneracion: any;
   fechaProgramacion: any;
   fechaInieje: any = null;
   fechaFineje: any = null;
   fechaFin: any;
   fechaInicio: any;
   fechaFin1: any;
   fechaInicio1: any;
   observacionNull: any;
   validaJson: any;
   fechaVaidarTF: boolean = false;
   causalegal1: any = null;
   fechaLegalizacion: string;
   cuadrillaInterventor: any;

   constructor(
      private apiService: ApiService,
      private memoryService: MemoryService,
      private modalService: ModalService,
      private globals: GlobalService
   ) {
      // this.model = new LegalizationOrderModel;
      this.fechaInitExecute = this.globals.fechaInitExecute$.subscribe(
         (datos) => {
            this.fechaInicio = datos;
            this.fechaVaidarTF = true;
            this.FechasETF = true;
         },
         (error) => {
            console.log(error);
         }
      );

      this.fechaFinExecute = this.globals.fechaFinExecute$.subscribe(
         (datoFecha) => {
            this.fechaFin = datoFecha;
            // this.fechaVaidarTF=true
            // this.FechasETF = true;
         },
         (error) => {
            console.log(error);
         }
      );
      this.causalExecute = this.globals.causalExecute$.subscribe(
         (datoCausal) => {
            this.causalegal = datoCausal;
            this.getCausals(this.tipoTrabajo);
         },
         (error) => {
            console.log(error);
         }
      );
   }

   ngOnInit() {
      this.getParameters();
      this.setUser();
      this.resetForm();
      // this.getCausals(this.tipoTrabajo);
   }

   getParameters() {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.obtenerparametros, [])
         )
         .subscribe((json) => {
            this.getParametersCompleted(JSON.parse(json[0]));
         });
   }

   getParametersCompleted(jsonParameter) {
      if (jsonParameter['Table1'] != null) {
         jsonParameter['Table1'].forEach((element) => {
            const values = Object.values(element);
            if (values[1] === 'TIPOLDC') {
               this.ldcTypeValue = values[0];
               this.ldcType = parseInt(this.ldcTypeValue);
            }
         });
      }
   }
   // Dependiendo del usuario(perfil) que este conectado va atraer el ID y el USER.
   private setUser() {
      this.user = this.memoryService.getItem('currentUser');
      console.log(this.user);
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerPerfilUsuario, [
               new InputParameter('un_id', this.user)
            ])
         )
         .subscribe((json) => {
            this.perfil = JSON.parse(json['1']);
            console.log(this.perfil);
            this.getOrders();
         });
   }

   // Trae todos los interventores de la BD.
   resetForm() {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ResetObtenerInterventor, [])
         )
         .subscribe((json) => {
            if (json[0]) {
               this.resetFormCompleted(JSON.parse(json[0]));
            }
         });
   }

   resetFormCompleted(jsonInterventor: any) {
      if (jsonInterventor != null) {
         this.intenvertor = jsonInterventor['Table1'];
      }
   }

   completedInterventor(salveinterventor) {
      if (salveinterventor != null) {
         this.guardaIterventor = salveinterventor.ID;
      }
   }

   // Si la OT. Legalizada es 1 muestra las ordenes que han sido legalizadas.
   inpOTLegalized() {
      if (this.opcion === false) {
         this.checkLegalized = 1;
         this.getOrders();
         // this.resetInterventor();
      } else if (this.opcion === true) {
         this.checkLegalized = 0;
         this.getOrders();
      }
   }

   // Si la ordern seleccionada no tiene interventor manda un mensaje y habilita para seleccionar un interventor.
   // ----------------------------------------------------------- FALTA PASAR LOS OTROS PERFILES ----------------------
   validacionPerfilInterventor() {
      switch (this.perfil) {
         case 5:
            break;
         case 6:
            break;
         case 7:
            this.loadLegalSection();
            if (this.personInterventor === '-1') {
               this.cuadrillaInterventor = null;
               this.interventorTF = false;
               alert(
                  'La orden no se le ha asignado el interventor, Seleccione y guarde la información.'
               );
               this.resetForm();
            } else {
               this.intenvertor = null;
               this.interventorTF = true;
            }
            break;
      }
   }

   // Obtiene todas las ordenes si legalizar.
   private getOrders() {
      this.startProgress();
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
               StoreProcedures.ObtenerOrdenesMantenimiento,
               [
                  new InputParameter('un_perfil', this.perfil),
                  new InputParameter('un_usuario', this.user),
                  new InputParameter('una_opcion', this.checkLegalized)
               ]
            )
         )
         .subscribe((json) => {
            if (json[2] != null) {
               this.loadResultadoOrdenesCompleted(JSON.parse(json[2]));
            }
            this.stopProgress();
         });
   }

   loadResultadoOrdenesCompleted(json: any) {
      if (json['Table1'] != null) {
         this.resultOrders = json['Table1'];
      }
   }

   onResultOrdenes(orden: any) {
      if (orden != null) {
         this.buscarOrden = orden.ORDEN;
      }
   }

   // Dependiendo de la orden que se seleccione busca x datos.
   buscarOrdenes() {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerInfoOrden, [
               new InputParameter('una_orden', this.buscarOrden)
            ])
         )
         .subscribe((json) => {
            console.log(json);
            this.fechaGeneracion = json[1];
            this.fechaProgramacion = json[2];
            this.actividadOSF = `${json[3]} - ${json[4]}`;
            this.operUnit = json[5];
            this.cuadrillaAsignada = `${this.operUnit} - ${json[6]}`;
            this.actividad = `${json[7]} - ${json[8]}`;
            this.observacion = json[11];
            this.tipoOrdenCP = json[13];
            this.tipoTrabajo = json[14];
            this.sTasktype = json[15];
            this.plano = json[19];
            this.cuadrillaInterventor = json[21];
            this.personInterventor = json[20];
            this.fechLegalizacion = json[24];
            this.fechaInieje = json[25];
            this.fechaFineje = json[26];
            this.causalegal = json[28];
            console.log(this.fechLegalizacion);

            if (this.fechLegalizacion === 'null') {
               this.fechLegalizacion = '';
            } else {
               this.fechLegalizacion;
            }
            this.planoTF = false;
            this.checkAP = false;
            this.checkRE = false;
            this.checkNT = false;
            if (this.plano) {
               this.planoTF = true;
               switch (this.plano) {
                  case 'AP':
                     this.checkAP = true;
                     break;
                  case 'RE':
                     this.checkRE = true;
                     break;
                  case 'NT':
                     this.checkNT = true;
                     break;
               }
            } else {
               this.plano = 'NA';
            }
            this.buscarPlanos();
            this.tipoOrden();
            this.validarFechas();
            // this.validacionPerfilInterventor();
         });
   }

   validarFechas() {
      if (this.fechaInieje != '01-JAN-00' && this.fechaFineje != '01-JAN-00') {
         const fechaEquipo = moment(this.fechaInieje).format('YYYY-MM-DD');
         const fechaEquipo1 = moment(this.fechaFineje).format('YYYY-MM-DD');

         this.fechaInicio = fechaEquipo;
         this.fechaFin = fechaEquipo1;
         this.fechaVaidarTF = true;
         this.FechasETF = true;
      } else {
         this.fechaInicio = null;
         this.fechaFin = null;
         this.fechaVaidarTF = false;
         this.FechasETF = false;
      }
   }

   // Guarda el interventor en la BD.
   guardarIterventor() {
      if (this.cuadrillaInterventor != null) {
         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(
                  StoreProcedures.ActualizarTecnicoContratista,
                  [
                     new InputParameter('una_orden', this.buscarOrden),
                     new InputParameter('un_cuadinter', this.guardaIterventor),
                     new InputParameter('un_tecnico', 0),
                     new InputParameter('un_tecnicoInt', 0)
                  ]
               )
            )
            .subscribe((json) => {
               if (json) {
                  alert('Informacion de Cuadrilla Interventor Salvada correctamente!');
               }
            });
      } else {
         alert('Por Favor Seleccione un Interventor!');
      }
   }

   // Busca los planos dependiendo de lo que esta almancenado en la varible this.plano.
   buscarPlanos() {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ActualizaPlano, [
               new InputParameter('una_orden', this.buscarOrden),
               new InputParameter('un_valor', this.plano)
            ])
         )
         .subscribe((json) => {});
   }

   // Dependiendo del tipo de orden (P,C,CP) llena la tabla de correctivo, items y elementos.
   tipoOrden() {
      switch (this.tipoOrdenCP) {
         case 'P': //Preventivo
            this.getPrevItems(this.sTasktype);
            this.getCorrItems(this.sTasktype);
            this.getTotalCorreItems(this.sTasktype);
            this.getOrderTags();
            break;
         case 'C': //Correctivo
            this.getCorrItems(this.tipoTrabajo);
            this.getTotalCorreItems(this.tipoTrabajo);
            this.getOrderTags();
            // prueba
            // this.observacion = null;
            break;
         case 'CP': //Correctivo por Preventivo
            this.getPrevItems(this.tipoTrabajo);
            this.getCorrItems(this.sTasktype);
            this.getTotalCorreItems(this.sTasktype);
            this.getOrderTags();

            break;
      }
      this.validacionPerfilInterventor();
   }

   getPrevItems(preStak: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerItemsPreventivo, [
               new InputParameter('una_orden', this.buscarOrden),
               new InputParameter('un_tipotrabajo', preStak)
            ])
         )
         .subscribe((json) => {
            this.getPrevItemsCompleted(JSON.parse(json[2]));
         });
   }

   getPrevItemsCompleted(jsonPrevItems: any) {
      if (jsonPrevItems != null) {
         this.dataPreItems = jsonPrevItems['Table1'];
      }
   }

   // Dependiendo de la orden y del tipo de trabajo trae los datos que se muestran en la tabla correctivos(Items).
   getCorrItems(tipoCP: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerItemsCorrectivo, [
               new InputParameter('una_orden', this.buscarOrden),
               new InputParameter('un_tipotrabajo', tipoCP)
            ])
         )
         .subscribe((json) => {
            this.getCorrItemsCompleted(JSON.parse(json[2]));
         });
   }

   getCorrItemsCompleted(jsonTable: any) {
      if (jsonTable['Table1'] != null) {
         this.resultCorrItems = jsonTable['Table1'];
      }
   }

   // Suma los datos hasta hora. Nose ha utilizado.
   getTotalCorreItems(totalCP: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
               StoreProcedures.ObtenerSumaItemsCorrectivo,
               [
                  new InputParameter('una_orden', this.buscarOrden),
                  new InputParameter('un_tipotrabajo', totalCP)
               ]
            )
         )
         .subscribe((json) => {
            this.getTotalCorreItemsCompleted(JSON.parse(json[2]));
         });
   }

   getTotalCorreItemsCompleted(jsonTotal: any) {
      if (jsonTotal['Table1'] != null) {
         this.resultTotal = jsonTotal['Table1'];
      }
   }

   // Dependiendo de la orden, trae los tags que se mostrarán en la tabla elementos.
   getOrderTags() {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerTagsCorrectivos, [
               new InputParameter('una_orden', this.buscarOrden)
            ])
         )
         .subscribe((json) => {
            this.getOrderTagsCompleted(JSON.parse(json[1]));
         });
   }

   getOrderTagsCompleted(jsonResult: any) {
      if (jsonResult['Table1'] != null) {
         this.resultOrdersTag = jsonResult['Table1'];
      }
   }

   private loadLegalSection() {
      console.log('entro aca');

      if (this.ldcType === 2 && this.tipoOrdenCP === 'P') {
         console.log('sorry');
      }
      this.getPersonas(this.operUnit);
      this.getCausals(this.tipoTrabajo);
   }

   getPersonas(operUnitPersons: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerPersonas, [
               new InputParameter('una_cuadrilla', operUnitPersons)
            ])
         )
         .subscribe((json) => {
            this.getPersonasCompleted(JSON.parse(json[1]));
         });
   }
   getPersonasCompleted(jsonPersona: any) {
      if (jsonPersona != null) {
         this.persona = jsonPersona['Table1'];
         console.log(this.persona);
      }
   }
   ngChangePersona(changePerson: any) {
      if (changePerson != null) {
         this.personaSelect = changePerson.ID;
      }
      console.log(changePerson);
   }

   getCausals(taskType: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerCausalesLegal, [
               new InputParameter('un_tipotrabajo', taskType)
            ])
         )
         .subscribe((json) => {
            this.getCausalsCompleted(JSON.parse(json[1]));
         });
   }

   getCausalsCompleted(jsonCausal: any) {
      console.log(this.causalegal);
      console.log(jsonCausal);

      if (this.causalegal != 'null') {
         this.causa_legal = parseInt(this.causalegal);
         console.log(this.causa_legal);
         console.log('me vine por el 1');
         jsonCausal['Table1'].forEach((element) => {
            const values = Object.values(element);
            if (values[0] === this.causa_legal) {
               this.causalValue = values[1];
               this.causalTiene = this.causalValue;
               this.causal = null;
               console.log(this.causalTiene);

               console.log(this.causa_legal);
               this.disableTF = true;
               this.FechasETF = true;
            }
         });
      } else {
         // this.causa_legal=0;
         console.log('me vine por el 0');
         this.causal = jsonCausal['Table1'];
         this.causalTiene = null;
         console.log(this.causal);
         this.disableTF = false;
      }
      // }
   }

   ngChangeCausal(changeCausal: any) {
      if (changeCausal != null) {
         this.causa_legal = changeCausal.CODIGO;
      }
      console.log(this.causa_legal);
   }

   RegisterCommentarioOrden() {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.RegisterCommentarioOrden, [
               new InputParameter('una_orden', this.buscarOrden)
            ])
         )
         .subscribe((json) => {
            console.log(json['Table1']);
            // observationMemoEdit
            // mainLegalCausalLookUpEdit
         });
   }

   //---------------------------------- AQUI EMPIEZA LEGALIZACION -----------------------------------
   private GetAddData(orderid: any, taskType: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerDatosAdicionales, [
               new InputParameter('una_orden', orderid),
               new InputParameter('un_tipotrabajo', taskType)
            ])
         )
         .subscribe((json) => {
            console.log(json);

            if (json[2]) {
               console.log(json[2]);
            }
            // this.validaJson = (JSON.parse(json[2]));
         });
   }
   private GetTempAddData(orderid: any, taskType: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(
               StoreProcedures.ObtenerDatosAdicionalesTemp,
               [
                  new InputParameter('una_orden', orderid),
                  new InputParameter('un_tipotrabajo', taskType)
               ]
            )
         )
         .subscribe((json) => {
            console.log(json);
         });
   }
   legalizeOrder() {}

   legalizeSimpleButton_Click() {
      console.log(this.causa_legal);
      console.log(this.personaSelect);
      console.log(this.observacion);
      console.log(this.tipoTrabajo);
      console.log(this.fechaInicio);
      console.log(this.fechaFin);

      if (this.causa_legal === null) {
         alert('Se debe indicar un causal de legalización');
      } else if (this.personaSelect === null) {
         alert('Se debe indicar la persona de la unidad operativa que legaliza');
      } else if (this.observacion === null) {
         alert('El comentario para legalización es obligatorio');
      } else if (this.fechaInicio === null || this.fechaFin === null) {
         alert('Se deben indicar ambas fechas de inicio y fin de la orden.');
      } else {
         switch (this.ldcType) {
            case 1: //GDO
               switch (this.tipoOrdenCP) {
                  case 'P':
                     break;

                  case 'C':
                     var DTC = this.GetAddData(this.buscarOrden, this.tipoTrabajo);
                     // this.legalizeOrder(this.buscarOrden,this.causa_legal,);
                     break;
                  case 'CP':
                     break;
               }

               break;

            default:
               break;
         }
         // this.cleanVariables()
      }
   }

   validateAddData() {}
   //-------------------------------------------------- TERMINA LEGALIZACION -----------------

   //-------------------------------------- EMPIEZA RECHAZAR------------------------------------

   simpleButton5_Click() {
      this.saveComents();

      // ------------------------------------------------ESPERA DE CONFIRMACION ------------------------
      // this.changeOrderStatus(this.buscarOrden, 4);
      // this.notifyRejectedOrderToLegalizador();
      // this.resetForm();
      // this.getOrders();
      //   this.cleanVariables();
      alert('Orden rechazada para revisión nuevamente por el interventor');
   }

   saveComents() {
      console.log('entrea guardar comentarios');
   }
   private changeOrderStatus(orderId: any, status: any) {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.CambiarEstadoOrden, [
               new InputParameter('una_orden', orderId),
               new InputParameter('un_estado', status)
            ])
         )
         .subscribe((json) => {
            console.log(json);
         });
   }
   private notifyRejectedOrderToLegalizador() {
      this.getOperatingUnitMails(this.operUnit);
      // alert( this.operUnit + ' Orden ' + this.buscarOrden
      //   + ' rechazada la orden ' + ' ha sido rechazada por el legalizador' + this.user + ' para su aprobación o rechazo de interventoria '
      // );
      this.getInspectorsMails(this.operUnit);
      // alert( this.operUnit + ' Orden ' + this.buscarOrden
      // + ' rechazada la orden ' + ' ha sido rechazada por el legalizador' + this.user + ' para su aprobación o rechazo de interventoria ');
      this.getLegalizerMails(this.operUnit);
      // alert( this.operUnit + ' Orden ' + this.buscarOrden
      // + ' rechazada la orden ' + ' ha sido rechazada por el legalizador' + this.user + ' para su aprobación o rechazo de interventoria ');
   }

   private getOperatingUnitMails(operUnit: any) {
      console.log('prueba alert 1');
      try {
         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(
                  StoreProcedures.ObtenerCorreoContratista,
                  [new InputParameter('una_cuadrilla', operUnit)]
               )
            )
            .subscribe((json) => {
               console.log(json);
               if (json[1] == 'NO') {
                  return 'eric.guerrero@ludycom.com';
               }
               return json[1];
            });
      } catch (error) {
         console.error(error);
         return 'eric.guerrero@ludycom.com';
      }
   }

   private getInspectorsMails(operUnit: any) {
      console.log('prueba alert 2');

      try {
         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(
                  StoreProcedures.ObtenerCorreoInterventor,
                  [new InputParameter('una_cuadrilla', operUnit)]
               )
            )
            .subscribe((json) => {
               console.log(json);
               if (json[0] == 'NO') {
                  return 'eric.guerrero@ludycom.com';
               }
               return json[0];
            });
      } catch (error) {
         console.error(error);
         return 'eric.guerrero@ludycom.com';
      }
   }

   private getLegalizerMails(operUnit: any) {
      console.log('entre alert 3');

      try {
         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(
                  StoreProcedures.ObtenerCorreoLegalizador,
                  []
               )
            )
            .subscribe((json) => {
               console.log(json);
               if (json[0] == 'NO') {
                  return 'eric.guerrero@ludycom.com';
               }
               return json[0];
            });
      } catch (error) {
         console.error(error);
         return 'eric.guerrero@ludycom.com';
      }
   }

   // ----------------------------------------------------- AQUI TERMINA RECHAZAR -------------------------

   openExecuteOrder(): void {
      if (this.modalExecuteOrder == null) {
         this.modalExecuteOrder = this.modalService.create(ExecuteOrderComponent, {
            modalTitle: 'Ejecutar orden (Cambio de estado)',
            height: 280,
            width: 500,
            resizable: true
         });
      } else {
         this.modalExecuteOrder.instance.open();
      }
      this.modalExecuteOrder.instance.start(this.buscarOrden);
   }

   private startProgress(): void {
      if (this.jqxLoader) {
         this.jqxLoader.open();
      }
   }

   private stopProgress(): void {
      if (this.jqxLoader) {
         this.jqxLoader.close();
      }
   }

   cleanVariables() {
      this.orderSelected = null;
      this.fechaGeneracion = null;
      this.fechaProgramacion = null;
      this.fechLegalizacion = null;
      this.actividad = null;
      this.actividadOSF = null;
      this.cuadrillaAsignada = null;
      this.causalCambio = null;
      this.planoTF = true;
      this.planoTF = true;
      this.planoTF = true;
      this.causalTiene = null;
      this.causalCambio = null;
      this.personaCambio = null;
      this.observacionNull = null;
      this.personaSelect = null;
      this.causa_legal = null;
      //  this.intenvertor=null;
      // this.model.CuadrillaInterventor=null;
      // this.fechaInieje= null;
      // this.fechaFineje=null;
      // this.fechaInicio=null;
      // this.fechaFin=null;
      // this.FechasETF = true;
   }
   start(): void {
      // this.cleanVariables();
   }
} // Termina llaves.
