import { AdminModel } from './../../models/Admin.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminAccountService } from 'src/app/services/admin-account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-admin-account',
  templateUrl: './view-admin-account.component.html',
  styleUrls: ['./view-admin-account.component.css']
})
export class ViewAdminAccountComponent implements OnInit, OnDestroy {
  admins: AdminModel[] = [];
  subscription: Subscription;

  constructor(private adminService: AdminAccountService) { }

  ngOnInit(): void {
    this.subscription = this.adminService.adminList.subscribe(response => {
      this.admins = response;
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
