import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { DataSharingService } from '../../service/data-sharing.service';
import { Subscription } from 'rxjs';
import { MemoryService } from '../../cache/memory.service';

@Component({
   selector: 'app-adicionar-element',
   templateUrl: './adicionar-element.component.html',
   styleUrls: ['./adicionar-element.component.css']
})
export class AdicionarElementComponent implements OnInit {
   @ViewChild('myDataTable') myDataTable: jqxDataTableComponent;
   orderSelected: string; // Variable para almacenar el número de orden seleccionado
   searchTerm: string; // Variable para almacenar el número de orden ingresado manualmente
   numeroDeOrdenes: string[]; // Arreglo para almacenar los números de orden
   identifyResults: any = [];
   subscription: Subscription;

   dataTableColumns: Array<any>;
   dataAdapter: any;

   constructor(
      private dataSharingService: DataSharingService,
      private memoryService: MemoryService
   ) {
      this.subscription = this.dataSharingService.getData().subscribe((data) => {
         console.log('Datos compartidos recibidos:', data);
         this.identifyResults = data;
         this.prepareDataTableColumns();
         this.prepareDataTableSource(this.identifyResults);
      });
   }
   ngOnInit(): void {
      this.prepareDataTableColumns();
      this.prepareDataTableSource(this.identifyResults);
      // Cargar los números de orden almacenados en el localStorage
      const ordenesRealizadas = JSON.parse(localStorage.getItem('ordenesRealizadas'));

      if (ordenesRealizadas) {
         // Extraer los números de orden de los datos almacenados
         this.numeroDeOrdenes = ordenesRealizadas.map((orden) => orden.numeroOrden);
      } else {
         // Si no hay datos en el localStorage, inicializa el arreglo vacío
         this.numeroDeOrdenes = [];
      }
   }

   filterOptions() {
      if (this.searchTerm) {
         // Si se ingresa un valor en el input, filtra el arreglo de números de orden
         this.numeroDeOrdenes = this.numeroDeOrdenes.filter((orden) =>
            orden.includes(this.searchTerm)
         );
      } else {
         // Si el input está vacío, restaura el arreglo completo
         this.loadOrdenesFromLocalStorage();
      }
   }

   // Método para cargar los números de orden desde localStorage
   loadOrdenesFromLocalStorage() {
      const ordenesRealizadas = JSON.parse(localStorage.getItem('ordenesRealizadas'));

      if (ordenesRealizadas) {
         // Extraer los números de orden de los datos almacenados
         this.numeroDeOrdenes = ordenesRealizadas.map((orden) => orden.numeroOrden);
      } else {
         // Si no hay datos en el localStorage, inicializa el arreglo vacío
         this.numeroDeOrdenes = [];
      }
   }
   agregarElementos() {
      if (!this.orderSelected) {
         alert('Por favor, selecciona un número de orden.');
         return;
      }

      // Obtener el número de orden seleccionado
      const numeroOrden = this.orderSelected;

      // Almacena los datos de la tabla en localStorage
      this.memoryService.setItem('tablaDatos', this.identifyResults);
      // Guardar el número de orden en el localStorage
      localStorage.setItem('numeroOrdenSeleccionado', numeroOrden);

      // Mostrar un mensaje de alerta
      alert('Número de orden agregado satisfactoriamente.');

      // Puedes realizar otras acciones aquí si es necesario

      // Limpia el campo de búsqueda
      this.searchTerm = '';
      this.orderSelected = '';
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
