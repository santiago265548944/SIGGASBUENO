import { Injectable } from '@angular/core';

@Injectable()
export class MemoryService {
  constructor() {
    this.remove('currentPass');
  }

  public setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  public getItem(key: string): string {
    return localStorage.getItem(key);
  }

  public containKey(key: string): boolean {
    if (localStorage.getItem(key) === null) {
      return false;
    } else {
      return true;
    }
  }

  public remove(key: string): void {
    localStorage.removeItem(key);
  }
}
