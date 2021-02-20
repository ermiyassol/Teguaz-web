import { MemoryService } from './memory.service';
import { EmployeeModel } from './../models/Employe.model';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  providedIn: 'root',
})
export class EmployeAccountService {
  Employees: EmployeeModel[] = [];
  companyId: string;
  employeeList = new Subject<EmployeeModel[]>();

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase,
    private memory: MemoryService
  ) {
    this.companyId = this.memory.getCompanyId();
  }

  getEmployee(id: number) {
    return this.Employees[id];
  }

  retriveEmployees() {
    return this.Employees;
  }

  checkEmployee() {
    return this.Employees.length;
  }

  deleteEmployee(Employee: EmployeeModel) {
    const key = Employee.key!;
    const index = this.Employees.indexOf(Employee);
    return this.db.database
      .ref('users')
      .orderByChild('eid')
      .equalTo(key)
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key!;
          this.db
            .list('users')
            .remove(childKey)
            .then(() => {
              this.db
                .list('company/' + this.companyId + '/employee')
                .remove(key)
                .then(() => {
                  this.Employees.splice(index, 1);
                  this.employeeList.next(this.Employees);
                });
            });
        });
      });
  }

  addEmployee(EmployeeDesc: EmployeeModel) {
    return this.http
      .post<authResponse>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
          environment.firebaseConfig.apiKey,
        {
          email: EmployeeDesc.email,
          password: EmployeeDesc.password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.db
            .list('company/' + this.companyId + '/employee')
            .push({
              fullName: EmployeeDesc.fullName,
              phoneNumber: EmployeeDesc.phoneNumber,
              role: EmployeeDesc.role,
              regDate: EmployeeDesc.regDate,
            })
            .then((response) => {
              const eid = response.key;
              // const cid = this.memory.getCompanyId();
              this.db
                .list('users')
                .push({
                  uid: res.localId,
                  cid: this.companyId,
                  eid: eid,
                  role: EmployeeDesc.role,
                })
                .then();
            });
        })
      );
  }

  setEmployees() {
    const ref = this.db.database.ref('company/' + this.companyId + '/employee');
    ref.once('value', (snapshot) => {
      this.Employees = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: EmployeeModel;
          temp = snapshot.val()[key];
          temp.key = key;
          this.Employees.push(temp);
        }
      }
      this.employeeList.next(this.Employees);
    });
    this.childChanged();
    this.childAdded();
  }

  // this one is used for every company sub property changes trip, name, passengers of trip . . . . . . etc
  childChanged() {
    console.log(this.companyId);
    const ref = this.db.database.ref('company/' + this.companyId + '/employee');
    ref.on('child_changed', (snapshot) => {
      this.Employees.forEach((cur, index) => {
        if (cur.key === snapshot.key) {
          this.Employees[index] = snapshot.val();
          this.Employees[index].key = snapshot.key;
          // console.log('changed value called');
        }
      });
      this.employeeList.next(this.Employees);
    });
    console.log('child changed called');
    console.log(this.Employees);
  }

  childAdded() {
    const ref = this.db.database.ref('company/' + this.companyId + '/employee');
    ref.on('child_added', (snapshot) => {
      let temp: EmployeeModel;
      temp = snapshot.val();
      temp.key = snapshot.key!;
      this.Employees.push(temp);
      console.log('child added called');
      this.employeeList.next(this.Employees);
    });
  }

  updateEmployee(Employee: EmployeeModel, key: string) {
    Employee.key = null!;
    console.log('key - ' + key);
    console.log(Employee);
    return this.db
      .list('company/' + this.companyId + '/employee')
      .update(key, Employee);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'ERROR: በድጋሚ ያስገቡ!!';
    if (error.error) {
      switch (error.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage =
            'ERROR: the EMAIL has been registered for another account!!';
          break;
        case 'EMAIL_NOT_FOUND':
          errorMessage = 'ERROR: ያስገቡት ኢሜል አልተመዘገበም ጸጋዬን ደውለው ያነጋግሩት!!';
          break;
        case 'INVALID_PASSWORD':
          errorMessage = 'ERROR: ፓስወርድ ተሳስተዋል በድጋሚ ይሞክሩ!!';
          break;
        default:
          errorMessage = error.error.error.message;
          break;
      }
      return throwError(errorMessage);
    }
    return throwError(errorMessage);
  }
}
