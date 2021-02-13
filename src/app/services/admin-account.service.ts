import { AdminModel } from './../models/Admin.model';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface authResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
  passwordHash?: string;
  providerUserInfo?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAccountService {
  Admins: AdminModel[] = [];
  adminList = new Subject<AdminModel[]>();

  constructor(private http: HttpClient, private db: AngularFireDatabase) {}

  addAdmin(adminDesc: AdminModel) {
    this.db.list('company').push({companyName: adminDesc.companyName, logoUrl: adminDesc.logoUrl}).then(response => {
      const cid = response.key;
      console.log(cid);
      return this.http.post<authResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseConfig.apiKey, {
      email: adminDesc.username+'@gmail.com',
      password: adminDesc.password,
      returnSecureToken: true,
    }).subscribe(res => {
      console.log(res);
      this.db.list('users').push({uid: res.localId, cid: cid, role: 'Admin'}).then();
      console.log('request successfully send');
    })
    // );
    })
    return true;
  }

  setBooks() {
    const ref = this.db.database.ref('company');
    ref.once('value', (snapshot) => {
      this.Admins = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: AdminModel;
          temp = snapshot.val()[key];
          temp.key = key;
          this.Admins.push(temp);
        }
      }
      this.adminList.next(this.Admins);
    });
  }
}
