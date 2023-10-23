import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { StoreProcedures } from '../../api/request/store-procedures.enum';

@Component({
   selector: 'app-patrol',
   templateUrl: './patrol.component.html',
   styleUrls: ['./patrol.component.css']
})
export class PatrolComponent implements OnInit {
   codigo: any;
   contrasena: any;
   id: string;
   nombre: string;
   estado: string;
   checkActivo = document.getElementsByName('valor');
   checkInactivo = document.getElementsByName('valor');
   activo = '1';
   inactivo = '0';
   listP: any;
   listarPatrulleros: any;
   parametroPatrulleros: any;
   checkAct = true;
   botonModificar = true;
   botonC = false;
   // botonR = false;
   checkInAct = false;
   botonAdicionar = false;
   bloqueoIdentificacion = false;
   contratista: any;
   usuarioMovil: any;
   selectContra: any;
   contratistasP: any;
   listarContratistas: any;
   bloqueoContratista = false;

   constructor(private apiService: ApiService) {}

   ngOnInit() {
      this.listarPatrulleross();
      this.listarContratista();
   }

   // Listar patrulleros.
   listarPatrulleross(): void {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.PruebaListarPatrullaje, [])
         )
         .subscribe((json) => {
            if (json[0]) {
               this.listP = JSON.parse(json[0]);
               this.listarPatrulleros = this.listP['Table1'];
               this.almacenarPatrullerosVector(this.listP);
            }
         });
   }

   almacenarPatrullerosVector(json: any): void {
      if (json['Table1'] != null) {
         this.parametroPatrulleros = json['Table1'].map((item) => ({
            codigo: item.COD_PATRULLERO,
            nombre: item.NOM_PATRULLERO,
            estado: item.EST_LABORAL,
            identificacion: item.IDENTIFICACION,
            usuarioMovil: item.USUA_MOVIL,
            usuarioClave: item.CLAVE,
            codContratista: item.COD_CONTRATISTA
         }));
      }
   }

   listarContratista(): void {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ListarContratista, [])
         )
         .subscribe((json) => {
            if (json[0]) {
               this.contratistas(JSON.parse(json[0]));
               this.almacenarContratistas(JSON.parse(json[0]));
            }
         });
   }

   contratistas(contratista: any): void {
      if (contratista['Table1']) {
         this.listarContratistas = contratista['Table1'];
      }
   }

   private almacenarContratistas(json: any): void {
      if (json['Table1'] != null) {
         this.contratistasP = json['Table1'].map((item) => ({
            codigoCont: item.COD_CONTRATISTA,
            nombreCont: item.NOM_CONTRATISTA
         }));
      }
   }

   // Convierte el número de la posición del patrullero.
   seleccionDePatrullero(): void {
      this.botonC = true;
      // this.botonR = true;
      this.botonAdicionar = true;
      this.bloqueoIdentificacion = true;
      this.botonModificar = false;
      this.bloqueoContratista = true;

      const numPosicion = document.getSelection().anchorNode.nodeValue;
      const numPosString = String(numPosicion);
      let longitud: any;
      let numEntero: any;
      let contratista: any;
      let numeroDigitos: any;
      let vectorPatrullero: any;

      numeroDigitos = String(this.parametroPatrulleros.length);
      longitud = numPosString.substring(0, numeroDigitos.length);
      numEntero = parseInt(longitud, 10);

      // Traer el patrullero por el número de la posición.
      for (let index = 0; index < this.parametroPatrulleros.length; index++) {
         if (numEntero - 1 === index) {
            vectorPatrullero = this.parametroPatrulleros[index];
         }
      }

      for (let i = 0; i < this.contratistasP.length; i++) {
         if (this.contratistasP[i].codigoCont === vectorPatrullero.codContratista) {
            contratista = this.contratistasP[i].nombreCont;
         }
      }

      this.estado = vectorPatrullero.estado;
      this.codigo = vectorPatrullero.codigo;
      this.nombre = vectorPatrullero.nombre;
      this.id = vectorPatrullero.identificacion;
      this.selectContra = contratista;
      this.usuarioMovil = vectorPatrullero.usuarioMovil;
      this.contrasena = vectorPatrullero.usuarioClave;

      if (this.estado === '0') {
         this.checkAct = false;
         this.checkInAct = true;
      } else if (this.estado === '1') {
         this.checkAct = true;
         this.checkInAct = false;
      }
   }

   // Válida si el usuario esta activo o inactivo.
   verificarRadioButt(resultado: string): string {
      if ((<HTMLInputElement>this.checkActivo['0']).checked === true) {
         resultado = this.activo;
         return resultado;
      } else if ((<HTMLInputElement>this.checkInactivo['1']).checked === true) {
         resultado = this.inactivo;
         return resultado;
      }
   }

   nuevoPatrullero(): void {
      if (
         this.id !== null &&
         this.nombre !== null &&
         this.nombre !== '' &&
         this.usuarioMovil !== null &&
         this.usuarioMovil !== '' &&
         this.contratista !== undefined &&
         this.contratista !== '' &&
         this.contrasena !== null &&
         this.contrasena !== ''
      ) {
         const codigoContratista = this.contratista.COD_CONTRATISTA;

         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.CrearPatrullero, [
                  new InputParameter('codigo', 1),
                  new InputParameter('nombre', this.nombre),
                  new InputParameter('estado', this.verificarRadioButt(this.estado)),
                  new InputParameter('identificacion', this.id),
                  new InputParameter('codigo_contratista', codigoContratista),
                  new InputParameter('clave_usuario', this.contrasena),
                  new InputParameter('usuario_movil', this.usuarioMovil)
               ])
            )
            .subscribe((json) => {
               if (json[7]) {
                  this.listarPatrulleross();
                  alert('Patrullero creado con exito!!');
                  this.id = null;
                  this.nombre = null;
                  this.contrasena = null;
                  this.usuarioMovil = null;
                  this.contratista = undefined;
                  this.checkAct = true;
                  this.checkInAct = false;
               }
            });
      } else {
         alert('Debe llenar los campos requeridos.');
      }
   }

   modificarPatrullero(): void {
      if (
         this.nombre !== null &&
         this.nombre !== '' &&
         this.usuarioMovil !== null &&
         this.usuarioMovil !== '' &&
         this.contrasena !== null &&
         this.contrasena !== ''
      ) {
         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ActualizarPatrullero, [
                  new InputParameter('codigo', this.codigo),
                  new InputParameter('nombre', this.nombre),
                  new InputParameter('estado', this.verificarRadioButt(this.estado)),
                  new InputParameter('identificacion', this.id),
                  new InputParameter('clave_usuario', this.contrasena),
                  new InputParameter('usuario_movil', this.usuarioMovil)
               ])
            )
            .subscribe((json) => {
               if (json[6]) {
                  this.listarPatrulleross();
                  alert('Patrullero actualizado con exito!!');
                  this.start();
               }
            });
      } else {
         alert('No pueden quedar campos vacios.');
      }
   }

   // restablecerContra(): void {
   //   const mensajeConfirm = confirm(`¿Está seguro que desea restablecer la contraseña del patrullero ${this.nombre}?`);

   //   if (mensajeConfirm === true) {
   //     this.apiService
   //       .callStoreProcedureV2(
   //         RequestHelper.getParamsForStoredProcedureV2(
   //           StoreProcedures.RestClavePatrullero,
   //           [
   //             new InputParameter('codigo', this.codigo),
   //             new InputParameter('clave_usuario', '')
   //           ]
   //         )
   //       )
   //       .subscribe(json => {
   //         if (json[2]) {
   //           alert('Contraseña restablecida');
   //           this.start();
   //         }
   //       });
   //   } else {
   //     this.start();
   //   }
   // }

   onCancelar(): void {
      this.start();
   }

   start(): void {
      this.checkAct = true;
      this.botonModificar = true;
      this.botonC = false;
      // this.botonR = false;
      this.checkInAct = false;
      this.botonAdicionar = false;
      this.bloqueoIdentificacion = false;
      this.id = null;
      this.codigo = null;
      this.nombre = null;
      this.estado = null;
      this.contrasena = null;
      this.usuarioMovil = null;
      this.selectContra = null;
      this.contratista = undefined;
      this.bloqueoContratista = false;
   }
}
