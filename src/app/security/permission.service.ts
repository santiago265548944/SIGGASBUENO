import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import { RequestHelper } from '../api/request/request-helper';
import { StoreProcedures } from '../api/request/store-procedures.enum';
import { InputParameter } from '../api/request/input-parameter';
import { MemoryService } from '../cache/memory.service';

@Injectable()
export class PermissionService {

  private disableMode = {
    Invisible: 1,
    Disable: 2
  };

  optionsToDisable = {};
  constructor() {

  }

  parsePermissionData(result: any, keyIndex: number, valueIndex: number): void {
    if (result != null && result.Table1 != null) {
      for (const item of result.Table1) {
        const values = Object.keys(item).map(key => item[key]);
        this.optionsToDisable[values[keyIndex]] = values[valueIndex];
      }
    }
  }

  isOptionDisabled(name: string): boolean {
    return this.optionsToDisable[name] && this.optionsToDisable[name] === this.disableMode.Disable;

  }

  isOptionDisabledByNames(names: string[]): boolean {
    let index = 0;
    let result = false;
    do {
      result = this.isOptionDisabled(names[index]);
      index++;
    } while (!result && index < names.length);
    return result;
  }

  isOptionHidden(name: string): boolean {
    return this.optionsToDisable[name] && this.optionsToDisable[name] === this.disableMode.Invisible;
  }

  isOptionHiddenByNames(names: string[]): boolean {
    let index = 0;
    let result = false;
    do {
      result = this.isOptionHidden(names[index]);
      index++;
    } while (!result && index < names.length);
    return result;
  }

}
