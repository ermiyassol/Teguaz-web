import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface Account {
  accountNumber: string;
  admin: string;
  fullName: string;
  money: string;
  phoneNumber: string;
  pin: string;
  key?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  accountOwener: Account[] = [];
  responseMessage = new Subject<string>();
  constructor(private http: HttpClient) {}

  searchAccount(fullName: string, phoneNumber: string, accountNo: string) {
    this.http
      .get<any>(
        'https://bank-demo-3dfb4-default-rtdb.firebaseio.com/account.json'
      )
      .pipe(
        map((data) => {
          const response: Account[] = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              const temp: Account = data[key]!;
              if (
                temp.fullName == fullName &&
                temp.phoneNumber == phoneNumber &&
                temp.accountNumber == accountNo
              ) {
                temp.key = key;
                response.push(temp);
              }
            }
          }
          if (response.length == 0) {
            this.responseMessage.next(
              'Invalid Data Inserted! please Try Again'
            );
          }
          return response;
        })
      )
      .subscribe((response) => {
        console.log('accounts', response);
      });
  }
}
