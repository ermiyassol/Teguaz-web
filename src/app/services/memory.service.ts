import { User } from './../models/auth.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MemoryService {
  userData: User = JSON.parse(localStorage.getItem('userData')!);

  getCompanyId() {
    return this.userData.cid;
  }
  constructor() {}
}
