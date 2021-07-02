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

  getEmployeeId() {
    return this.userData.eid;
  }

  getRole() {
    return this.userData.role;
  }

  all() {
    console.log(this.userData);
  }

  setUserData() {
    this.userData = JSON.parse(localStorage.getItem('userData')!);
  }

  constructor() {}
}
