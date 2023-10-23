import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { MemoryService } from '../../cache/memory.service';
import { RequestHelper } from '../../api/request/request-helper';
import { StoreProcedures } from '../../api/request/store-procedures.enum';
import { InputParameter } from '../../api/request/input-parameter';
import { GlobalService } from '../../Globals/global.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-execute-order',
  templateUrl: './execute-order.component.html',
  styleUrls: ['./execute-order.component.css']
})
export class ExecuteOrderComponent implements OnInit {
  recibi: any;
  causal: any;
  causalChanged: any = null;
  taskType: any;
  orden: any;
  comentario: any;
  causalModel: any;
  commentModel: any;
  comentarioID: any = null;
  observacion: any = null;
  fechaInit: any = null;
  fechaFinal: any = null;
  parameterJson: number;
  confirmacion: number;
  confirmacionPop: any;
 

  constructor(private apiService: ApiService, private memoryService: MemoryService,private globals: GlobalService) { }

  ngOnInit() {
    this.getCausals();
    this.gettypeComment();
  }

  start(buscarOrden: any): void {
    console.log(buscarOrden);
    this.orden = buscarOrden;
    this.causalModel=null;
    this.observacion=null;
    this.commentModel = null 
    this.fechaInit=null;
    this.fechaFinal=null;
  }
  gettypeComment() {

    this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(
        StoreProcedures.TipoComentarioLegalizar,
        [new InputParameter('una_orden', this.orden)]
      )
    ).subscribe(json => {
      console.log(json);
      this.gettypeCommentCompleted(JSON.parse(json[1]));


    });
  }

  gettypeCommentCompleted(jsonComment: any) {
    if (jsonComment['Table1'] != null) {
      this.comentario = jsonComment['Table1']

    }
  }
  ngChangetypeComment(commentId: any) {
    if (commentId != null) {
      this.comentarioID = commentId.COMMENT_TYPE_ID;

    }

  }

  getCausals() {

    this.apiService.callStoreProcedureV2(
      RequestHelper.getParamsForStoredProcedureV2(
        StoreProcedures.ObtenerCausalesLegalxOrden,
        [new InputParameter('numeroorden', this.orden)]
      )
    ).subscribe(json => {
      console.log(json);

      this.getCausalsCompleted(JSON.parse(json[1]));
    });
  }
  getCausalsCompleted(jsonCausal: any) {
    if (jsonCausal['Table1'] != null) {
      this.causal = jsonCausal['Table1'];

    }
  }
  ngChangeCausal(causalId: any) {
    if (causalId != null) {
      this.causalChanged = causalId.CODIGO;
    }
    console.log(this.causalChanged);

  }

  registerSimpleButton_Click() {
    // console.log(this.causalChanged);
    // console.log(this.observacion);
    // console.log(this.fechaFinal);
    // console.log(this.fechaInit);
    if (this.causalChanged === null) {
      alert('Seleccione la Causal, Falta Información');

    }
    if (this.comentarioID === null || this.observacion === null) {
      alert('Faltan datos para el comentario');

    }
    if (this.fechaFinal > this.fechaInit) {
      this.apiService.callStoreProcedureV2(
        RequestHelper.getParamsForStoredProcedureV2(
          StoreProcedures.EjecutarOrden,
          [
            new InputParameter('una_orden', this.orden),
            new InputParameter('una_causal', this.causalChanged),
            new InputParameter('una_fechaini', this.fechaInit),
            new InputParameter('una_fechafin', this.fechaFinal)
          ]
        )
      ).subscribe(json =>{
        console.log(json);
        this.parameterJson=parseInt(json[4]);
        console.log(this.parameterJson);
        
        
        if (this.parameterJson != 0) {
          alert('Error cambio Estado Ejecución');
          
        } else{

          // -------- Enviar estos valores  al componente legalizar orden
          this.globals.setFechaInitExecute(this.fechaInit);
          this.globals.setFechaFinExecute(this.fechaFinal);
          this.globals.setCausalExecute(this.causalChanged);

          this.setComment();
        }

      });


    } else {
      alert('La fecha inicial no puede ser mayor que la fecha final');
    }
  }

  setComment(){
    console.log("entre aca");
    console.log(this.comentarioID );
    console.log(this.observacion);
    
    
    
  
    if (this.comentarioID != null || this.observacion != null) {
      console.log('pase el if');
      
      this.confirmacionPop = confirm('¿Desea agregar el Comentario?');
      console.log(this.confirmacionPop);
      
      
      if (this.confirmacionPop === true) {

        this.apiService.callStoreProcedureV2(
          RequestHelper.getParamsForStoredProcedureV2(
            StoreProcedures.AdicionarComentarios,
            [
              new InputParameter('inuOrderId', this.orden),
              new InputParameter('inuCommentTypeId', this.comentarioID),
              new InputParameter('isbComment', this.observacion),
              new InputParameter('onuErrorCode', 0),
              new InputParameter('osbErrorMessage', 0)
              
            ]
          )
        ).subscribe(json =>{
          console.log(json);
          console.log(json[4]);
          
          this.confirmacion =parseInt(json[3]);
          console.log(this.confirmacion);
          
          if ( this.confirmacion== 0) {
            alert('Se ha agregado el comentario a la orden: ' + this.orden + ' satisfactoriamente');
            
          } else{

            alert('error:'+ json[4]);   // ----------------------------------- verificar este campo 
          }
          
       
  
        });
        
      } else{

      }
      
    }
  }

} // Termina Corchete
