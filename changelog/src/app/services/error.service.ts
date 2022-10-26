import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  public errorEmitter = new Subject<Error>();

  constructor() { }

  public handleError(err: Error | string) {
    if (typeof err === 'string'){
      err = new Error(err);
    }
    this.errorEmitter.next(err);
  }

}
