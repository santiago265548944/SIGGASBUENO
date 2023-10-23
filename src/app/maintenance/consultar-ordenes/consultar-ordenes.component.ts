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
import moment = require('moment');
import { Subscription } from 'rxjs';
import { GlobalService } from '../../Globals/global.service';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';
import { DataSharingService } from '../../service/data-sharing.service';

@Component({
   selector: 'app-consultar-ordenes',
   templateUrl: './consultar-ordenes.component.html',
   styleUrls: ['./consultar-ordenes.component.css']
})
export class ConsultarOrdenesComponent implements OnInit {
   @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
   showModal: boolean = false;
   ordenesRealizadas: any[] = []; // Propiedad para almacenar todas las órdenes realizadas
   id: number;
   selectedOrder: string; // Propiedad para almacenar el número de orden seleccionado
   selectedOrderDetails: any; // Propiedad para almacenar los detalles de la orden seleccionada
   fechaGeneracion: string;
   estadoOrden: string;
   activity: string;
   observacion: string;
   tableData: any[] = [];
   identifyResults: any = [];
   subscription: Subscription;
   dataTableColumns: Array<any>;
   dataAdapter: any;

   usuarioPorDefecto: string = 'SOPORTEGIS';
   maquinaDefault: string = 'GYG-SOPORTE';

   openModal() {
      this.showModal = true;
   }

   closeModal() {
      this.showModal = false;
   }
   constructor(
      private apiService: ApiService,
      private memoryService: MemoryService,
      private modalService: ModalService,
      private dataSharingService: DataSharingService
   ) {
      this.subscription = this.dataSharingService.getData().subscribe((data) => {
         console.log('Datos compartidos recibidos:', data);
         this.identifyResults = data;
         this.prepareDataTableColumns();
         this.prepareDataTableSource(this.identifyResults);
      });

      // console.log('soy el de consulta', this.identifyResults);
   }

   ngOnInit(): void {
      this.prepareDataTableColumns();
      this.prepareDataTableSource(this.identifyResults);
      // Llama a la función para obtener las órdenes realizadas
      this.obtenerOrdenesRealizadas();

      // Recupera los datos de la tabla si están almacenados en el almacenamiento local
      const tablaDatosString = localStorage.getItem('tablaDatos');

      if (tablaDatosString) {
         // Si hay información en localStorage, convierte la cadena JSON a un arreglo
         this.tableData = JSON.parse(tablaDatosString);
      }
   }

   obtenerOrdenesRealizadas() {
      // Verificar si el localStorage está disponible en este navegador
      if (typeof localStorage === 'undefined') {
         console.error('El almacenamiento local no está disponible en este navegador.');
         return;
      }

      // Recupera las órdenes realizadas desde localStorage
      const ordenesString = localStorage.getItem('ordenesRealizadas');

      if (ordenesString) {
         // Si hay información en localStorage, convierte la cadena JSON a un arreglo
         this.ordenesRealizadas = JSON.parse(ordenesString);
      } else {
         // Si no hay información en localStorage, muestra un mensaje o realiza alguna acción predeterminada
         console.log('No hay órdenes realizadas almacenadas en localStorage.');
      }
   }

   seleccionarOrden() {
      // Buscar los detalles de la orden seleccionada en el arreglo de órdenes realizadas
      this.selectedOrderDetails = this.ordenesRealizadas.find(
         (orden) => orden.numeroOrden === this.selectedOrder
      );
      this.id = this.selectedOrderDetails.id;
      // Actualiza las propiedades del componente con los detalles de la orden
      this.fechaGeneracion = this.selectedOrderDetails.fecha;
      this.estadoOrden = this.selectedOrderDetails.estadoOrden;
      this.activity = this.selectedOrderDetails.actividad;
      this.observacion = this.selectedOrderDetails.observacion;
   }
   buscarOrdenes() {
      if (!this.selectedOrder) {
         alert('Por favor, selecciona un número de orden.');
         return;
      }

      // Busca la orden seleccionada en el arreglo de órdenes realizadas
      const ordenSeleccionada = this.ordenesRealizadas.find(
         (orden) => orden.numeroOrden === this.selectedOrder
      );

      if (ordenSeleccionada) {
         // Si se encuentra la orden, muestra sus detalles en los campos correspondientes
         this.fechaGeneracion = ordenSeleccionada.fechaGeneracion;
         this.estadoOrden = ordenSeleccionada.estadoOrden;
         this.activity = ordenSeleccionada.activity;
         this.observacion = ordenSeleccionada.observacion;
      } else {
         // Si no se encuentra la orden, muestra un mensaje de error
         alert('La orden seleccionada no se encuentra en la lista de órdenes realizadas.');
      }
   }

   checkBuscarOrden() {}
   buscarTagElemento() {}
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
