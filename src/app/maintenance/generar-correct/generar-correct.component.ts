import { Component, OnInit, ViewChild } from '@angular/core';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { ApiService } from '../../api/api.service';
import { MemoryService } from '../../cache/memory.service';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { Subscription } from 'rxjs';
import { DataSharingService } from '../../service/data-sharing.service';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';

@Component({
   selector: 'app-generar-correct',
   templateUrl: './generar-correct.component.html',
   styleUrls: ['./generar-correct.component.css']
})
export class GenerarCorrectComponent implements OnInit {
   @ViewChild('myDataTable') myDataTable: jqxDataTableComponent;
   @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
   selectedTipoActividad: any;
   selectedActividad: any;
   selectedActividadOSF: any;
   activity: Array<any>;
   tipoactivity: Array<any>;
   user: any;
   perfil: any;
   buscarTipo: any;
   comentario: any;
   comentarioID: any = null;
   observacion: any = null;
   confirmacionPop: any;
   buscarActividad: any;
   orden: any;
   confirmacion: number;
   observable: any;
   subscription: Subscription;
   identifyResults: any;
   sharedData: any[] = [];
   lastOrderId: number = 0;

   // Configuración de la tabla
   dataTableColumns: Array<any>;
   dataAdapter: any;
   dataTableSource: any;

   constructor(
      private apiService: ApiService,
      private memoryService: MemoryService,
      private dataSharingService: DataSharingService
   ) {
      this.subscription = this.dataSharingService.getData().subscribe((data) => {
         this.identifyResults = data;
         // Aquí puedes realizar cualquier procesamiento necesario con los datos compartidos
         this.identifyResults = data;
         this.prepareDataTableColumns();
         this.prepareDataTableSource(this.identifyResults); // Configura la tabla con los datos compartidos
      });
   }

   ngOnInit(): void {
      this.loadDropDownActivity();
      this.loadDropDownTipoActivity();
      this.prepareDataTableColumns();
      this.prepareDataTableSource(this.identifyResults);
   }

   private loadDropDownTipoActivity(): void {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerActividades, [])
         )
         .subscribe((json) => {
            if (json[0] != null) {
               this.loadDropDownTipoActivityCompleted(JSON.parse(json[0]));
            }
         });
   }

   private loadDropDownTipoActivityCompleted(json: any): void {
      if (json['Table1'] != null) {
         this.tipoactivity = json['Table1'];
      }
   }
   private loadDropDownActivity(): void {
      this.apiService
         .callStoreProcedureV2(
            RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerActividades, [])
         )
         .subscribe((json) => {
            if (json[0] != null) {
               this.loadDropDownActivityCompleted(JSON.parse(json[0]));
            }
         });
   }

   private loadDropDownActivityCompleted(json: any): void {
      if (json['Table1'] != null) {
         this.activity = json['Table1'];
      }
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

   Agregar() {
      // Verifica si observable no está vacío antes de agregarlo a observacion
      if (this.observable.trim() !== '') {
         // Agrega el contenido de observable a observacion
         if (this.observacion !== null) {
            this.observacion += '\n'; // Agrega un salto de línea si observacion ya tiene contenido
         } else {
            this.observacion = ''; // Inicializa observacion si es nulo
         }
         this.observacion += this.observable;
         // Limpia el campo de observable después de agregarlo
         this.observable = '';
      }
   }

   Remover() {
      this.observacion = '';
   }

   Cancelar() {
      const confirmacion = confirm('¿Estás seguro de que deseas cancelar?');

      if (confirmacion) {
         // Si el usuario confirma, realiza las acciones de cancelación
         this.selectedActividad = '';
         this.selectedTipoActividad = '';
      }
   }

   generarOrden() {
      // Verificar si el localStorage está disponible en este navegador
      if (typeof localStorage === 'undefined') {
         alert('El almacenamiento local no está disponible en este navegador.');
         return;
      }

      // Captura la actividad seleccionada
      const actividadSeleccionada = this.selectedActividad.DESCRIPCION;

      // Captura el contenido del área de texto (observación)
      const observacion = String(this.observacion);

      // Verifica si los campos están vacíos
      if (!actividadSeleccionada || !observacion) {
         alert('Debes completar los campos.');
         return; // Detiene la ejecución si los campos están vacíos
      }

      // Genera una orden con 6 números al azar y la convierte a una cadena
      const ordenGenerada = this.generarNumeroOrden().toString();

      this.lastOrderId++;
      // Crea un objeto Date para la fecha actual
      const currentDate = new Date();

      // Convierte la fecha actual a una cadena (puedes personalizar el formato)
      const dateString = currentDate.toLocaleDateString(); // Ejemplo de formato: "MM/DD/AAAA"

      // Almacena la actividad, la observación, la orden y el estado "realizada" en localStorage
      this.memoryService.setItem('actividadSeleccionada', actividadSeleccionada);
      this.memoryService.setItem('observacion', observacion);
      this.memoryService.setItem('numeroOrden', ordenGenerada);
      this.memoryService.setItem('estadoOrden', 'Registrada'); // Cambiado a 'Registrada'

      // Almacena los datos de la tabla en localStorage
      this.memoryService.setItem('tablaDatos', this.identifyResults);

      // Crea un arreglo para llevar un registro de órdenes realizadas (si aún no existe)
      let ordenesRealizadas = JSON.parse(localStorage.getItem('ordenesRealizadas')) || [];

      // Agrega la orden actual al arreglo de órdenes realizadas con el estado "realizada"
      ordenesRealizadas.push({
         id: this.lastOrderId,
         numeroOrden: ordenGenerada,
         actividad: actividadSeleccionada,
         observacion: observacion,
         fecha: dateString,
         estadoOrden: 'Registrada' // Nuevo campo
      });

      // Almacena el arreglo actualizado en localStorage
      localStorage.setItem('ordenesRealizadas', JSON.stringify(ordenesRealizadas));

      // Muestra la orden generada
      alert(`Orden generada: ${ordenGenerada}`);

      // Limpia los campos después de guardar la orden
      this.selectedActividad = null;
      this.observacion = '';
   }

   generarNumeroOrden() {
      // Genera una orden con 6 números al azar
      const numeroOrden = Math.floor(100000 + Math.random() * 900000);
      return numeroOrden;
   }

   prepareDataTableColumns(): void {
      this.dataTableColumns = [
         { text: 'Capa', dataField: 'layerName', width: 200 },
         { text: 'Valor', dataField: 'value', width: 200 }
      ];
   }

   // Prepara los datos para la tabla basados en los objetos feature
   prepareDataTableSource(features: any[]): void {
      const localData = [];
      for (const feature of features) {
         localData.push({ layerName: feature.layerName, value: feature.value });
      }

      const source = {
         datatype: 'array',
         dataFields: [
            { name: 'layerName', type: 'string' },
            { name: 'value', type: 'string' }
         ],
         localdata: localData
      };

      this.dataAdapter = new jqx.dataAdapter(source);
   }
}
