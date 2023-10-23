import { InputParameterVector } from './input-parameter-vector';

export class StoreProcedureRequest {
  public User: string;
  public Password: string;
  public Procedure: string;
  public OutSrId: number;
  public IdProject: number;
  public TpOwner: string;
  public InputValue: InputParameterVector;
}
