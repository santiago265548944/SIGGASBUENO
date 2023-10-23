import { StoreProcedureRequest } from './store-procedure-request';
import { environment } from '../../../environments/environment';
import { StoreProcedures } from './store-procedures.enum';
import { InputParameter } from './input-parameter';
import { InputParameterVector } from './input-parameter-vector';
import { BytesEntryRequest } from './bytes-entry-request';

export class RequestHelper {
  static getGisParamsRequestBodyWithUser(userName: string, password: string): StoreProcedureRequest {
    const storeProcedureRequest = new StoreProcedureRequest();
    storeProcedureRequest.User = userName;
    storeProcedureRequest.Password = password;
    storeProcedureRequest.Procedure = StoreProcedures.ObtenerParametrosGis;
    storeProcedureRequest.OutSrId = environment.outSrId;
    storeProcedureRequest.IdProject = -1;
    storeProcedureRequest.InputValue = new InputParameterVector();
    storeProcedureRequest.InputValue.ParametersVector = new Array<InputParameter>();
    // TODO: Es el mismo que se autentica?
    storeProcedureRequest.InputValue.ParametersVector.push(new InputParameter('un_usuario', userName));
    return storeProcedureRequest;
  }

  static getMapasBaseRequestBody(): StoreProcedureRequest {
    const storeProcedureRequest = new StoreProcedureRequest();
    storeProcedureRequest.Procedure = StoreProcedures.ObtenerMapasBasePorApp;
    storeProcedureRequest.OutSrId = environment.outSrId;
    storeProcedureRequest.IdProject = -1;
    storeProcedureRequest.InputValue = new InputParameterVector();
    storeProcedureRequest.InputValue.ParametersVector = new Array<InputParameter>();
    storeProcedureRequest.InputValue.ParametersVector.push(new InputParameter('un_tipoaplicacion', '1'));
    return storeProcedureRequest;
  }

  static getParamsBytesEntry(fileName: string, fileExtension: string, bytesContent: any): BytesEntryRequest {
    const bytesEntryRequest = new BytesEntryRequest();
    bytesEntryRequest.fileName = fileName;
    bytesEntryRequest.extension = fileExtension;
    bytesEntryRequest.fileBytes = bytesContent;
    return bytesEntryRequest;
  }

  static getParamsForStoredProcedureV2(storeProcedure: string, parameters: Array<InputParameter>) {
    const storeProcedureRequest = new StoreProcedureRequest();
    storeProcedureRequest.Procedure = storeProcedure;
    storeProcedureRequest.OutSrId = environment.outSrId;
    storeProcedureRequest.IdProject = -1;
    storeProcedureRequest.InputValue = new InputParameterVector();
    storeProcedureRequest.InputValue.ParametersVector = parameters;
    return storeProcedureRequest;
  }
}
