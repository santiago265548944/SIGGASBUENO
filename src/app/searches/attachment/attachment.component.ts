import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { saveAs } from 'file-saver/FileSaver';
import { jqxExpanderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxExpander';
import { jqxDataTableComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxdatatable';
import { jqxLoaderComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxloader';
import { EmbeddedSelectionComponent } from '../../selection/embedded-selection/embedded-selection.component';
import { MapService } from '../../map-service/map.service';
// tslint:disable-next-line:import-blacklist
import { Subscription } from 'rxjs';
import {
   SelectAction,
   SelectActionType,
   OwnerSelection
} from '../../map-service/map-actions/select-action';
import { EmapActions } from '../../map-service/emap-actions.enum';
import { ApiService } from '../../api/api.service';
import { BytesEntryRequest } from '../../api/request/bytes-entry-request';
import { RequestHelper } from '../../api/request/request-helper';
import { InputParameter } from '../../api/request/input-parameter';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { AttachmentMimeTypes } from './attachment-mime-types';
import { MemoryService } from '../../cache/memory.service';

@Component({
   selector: 'app-attachment',
   templateUrl: './attachment.component.html',
   styleUrls: ['./attachment.component.css']
})
export class AttachmentComponent implements OnInit {
   @ViewChild('fileInput') fileInput: ElementRef;
   @ViewChild('jqxLoader') jqxLoader: jqxLoaderComponent;
   dataAdapter: any;
   dataTableColumns: Array<any>;
   subscription: Subscription;
   tagFieldValues: Array<String>;
   tagFieldValueSelected: String;
   attachmentSelected: any;
   attachmentSelectType = OwnerSelection.Attachment;

   constructor(
      private mapService: MapService,
      private apiService: ApiService,
      private memoryService: MemoryService
   ) {
      this.dataAdapter = new jqx.dataAdapter({});
      this.dataTableColumns = new Array<any>();
      this.subscription = this.mapService
         .getMapAction()
         .subscribe((mapAction) => this.handleSelectAction(mapAction));
   }

   ngOnInit() {
      this.prepareDataTableColumns();
   }

   handleSelectAction(mapAction: SelectAction) {
      if (mapAction.owner === this.attachmentSelectType) {
         if (mapAction.EMapAction === EmapActions.Select) {
            if (mapAction.selectActionType === SelectActionType.ViewSelectionResponse) {
               this.fillElementDropDown(mapAction.selectedFeatures);
            }
         }
      }
   }

   private fillElementDropDown(selectFeatures: any) {
      this.cleanGrid();
      this.initTagFieldValues();
      selectFeatures.forEach((feature) => {
         for (const name in feature.attributes) {
            if (name === 'TAG') {
               this.tagFieldValues.push(feature.attributes[name]);
            }
         }
      });
   }

   private initTagFieldValues(): void {
      if (this.tagFieldValues == null) {
         this.tagFieldValues = new Array<String>();
      } else {
         this.tagFieldValues.splice(0, this.tagFieldValues.length);
      }
   }

   onFileInputChange(event): void {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
         const result = reader.result;
         if (typeof result === 'string') {
            // Si es una cadena, podemos usar split
            this.sendFile(file.name, this.getType(file), result.split(',')[1]);
         } else if (result instanceof ArrayBuffer) {
            // Si es un ArrayBuffer, puedes manejarlo de acuerdo a tus necesidades
         }
      };
      reader.readAsDataURL(file);
   }

   private sendFile(fileName: string, fileType: string, fileStream: any) {
      this.startProgress();
      const bytesEntryRequest = RequestHelper.getParamsBytesEntry(fileName, fileType, fileStream);
      bytesEntryRequest.user = this.memoryService.getItem('currentUser');
      bytesEntryRequest.password = this.memoryService.getItem('currentPass');
      this.apiService.callBytesEntry(bytesEntryRequest).subscribe((json) => {
         this.associateIdFileWithTag(json);
      });
   }

   private getType(file: any) {
      let type = '';
      let isTypeSet = false;
      if (file.type != null && file.type !== '') {
         type = file.type.split('/')[1];
         isTypeSet = true;
         if (type.length > 5) {
            isTypeSet = false;
         }
      }

      if (!isTypeSet && file.name.indexOf('.') > 0) {
         const fileNameParts = file.name.split('.');
         type = fileNameParts[fileNameParts.length - 1];
      }
      return type;
   }

   private associateIdFileWithTag(fileId: string): void {
      if (fileId !== '') {
         if (this.tagFieldValueSelected !== null && this.tagFieldValueSelected !== '') {
            const unTagParam = new InputParameter('un_Tag', this.tagFieldValueSelected);
            const unIdParam = new InputParameter('un_ID', fileId);

            this.apiService
               .callStoreProcedureV2(
                  RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.InsertarAdjunto, [
                     unTagParam,
                     unIdParam
                  ])
               )
               .subscribe((json) => {
                  this.prepareFillGrid();
                  if (json[2]) {
                     alert(json[2]);
                  }
               });
         } else {
            this.stopProgress();
         }
      } else {
         this.stopProgress();
      }
   }

   onAddClickEventHandler(): void {
      if (this.tagFieldValueSelected != null && this.tagFieldValueSelected !== '') {
         this.fileInput.nativeElement.click();
      } else {
         alert('Debe seleccionar un elemento.');
      }
   }

   prepareFillGrid() {
      this.attachmentSelected = null;
      if (this.tagFieldValueSelected != null && this.tagFieldValueSelected !== '') {
         const unTagParam = new InputParameter('un_Tag', this.tagFieldValueSelected);
         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerAdjuntos, [
                  unTagParam
               ])
            )
            .subscribe((json) => {
               this.fillGrid(json);
            });
      } else {
         this.cleanGrid();
         this.stopProgress();
      }
   }

   fillGrid(jsonResult: any) {
      if (jsonResult['1']) {
         const jsonTable = JSON.parse(jsonResult['1']);
         if (jsonTable['Table1']) {
            this.prepareDataTableSource(jsonTable['Table1']);
         }
      }
      this.stopProgress();
   }

   prepareDataTableColumns(): void {
      this.dataTableColumns = [
         { text: 'Id', dataField: 'IDADJUNTO' },
         { text: 'Adjunto', dataField: 'NOMBREADJUNTO' },
         { text: 'Extension', dataField: 'EXTENSION', hidden: true }
      ];
   }

   prepareDataTableSource(data: any): void {
      const source: any = {
         localData: data,
         dataType: 'array',
         dataFields: [
            { name: 'IDADJUNTO', type: 'string' },
            { name: 'NOMBREADJUNTO', type: 'string' },
            { name: 'EXTENSION', type: 'string' }
         ]
      };

      this.dataAdapter = new jqx.dataAdapter(source);
   }

   onTagFieldValueChanged(): void {
      this.prepareFillGrid();
   }

   onRowSelect(event): void {
      if (event.args && event.args.row) {
         this.attachmentSelected = event.args.row;
      }
   }

   onRemoveClickEventHandler(): void {
      if (this.attachmentSelected != null) {
         if (confirm('Desea eliminar este registro?')) {
            this.startProgress();
            const unTagParam = new InputParameter('un_Tag', this.tagFieldValueSelected);
            const unIdParam = new InputParameter('un_Adjunto', this.attachmentSelected.IDADJUNTO);
            this.apiService
               .callStoreProcedureV2(
                  RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.EliminarAdjuntos, [
                     unTagParam,
                     unIdParam
                  ])
               )
               .subscribe((json) => {
                  if (json[2]) {
                     alert(json[2]);
                  }
                  this.prepareFillGrid();
                  this.stopProgress();
               });
         }
      }
   }

   onDownloadEventHandler(): void {
      if (this.attachmentSelected != null) {
         this.startProgress();
         const unIdParam = new InputParameter('un_Adjunto', this.attachmentSelected.IDADJUNTO);
         this.apiService
            .callStoreProcedureV2(
               RequestHelper.getParamsForStoredProcedureV2(StoreProcedures.ObtenerArchivoAdjunto, [
                  unIdParam
               ])
            )
            .subscribe((json) => {
               if (json[1]) {
                  const attachmentName = this.getFileName();
                  saveAs(this.dataStreamToBlob(json[1]), attachmentName);
               }
               this.stopProgress();
            });
      }
   }

   private dataStreamToBlob(data: any): Blob {
      data = atob(data);
      const arrayBuffer = new ArrayBuffer(data.length);
      const intArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < data.length; i++) {
         intArray[i] = data.charCodeAt(i);
      }

      const mimeType = AttachmentMimeTypes.getMimeType(this.attachmentSelected.EXTENSION);
      return new Blob([intArray], { type: mimeType });
   }

   private getFileName() {
      if (this.attachmentSelected.NOMBREADJUNTO.indexOf('.') < 0) {
         return `${this.attachmentSelected.NOMBREADJUNTO}.${this.attachmentSelected.EXTENSION}`;
      } else {
         return this.attachmentSelected.NOMBREADJUNTO;
      }
   }

   private startProgress(): void {
      this.jqxLoader.open();
   }

   private stopProgress(): void {
      this.jqxLoader.close();
   }

   private cleanGrid(): void {
      this.dataAdapter = new jqx.dataAdapter({});
   }

   start(evt: any) {
      this.cleanGrid();
   }
}
