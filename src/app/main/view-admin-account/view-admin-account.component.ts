import { AdminModel } from './../../models/Admin.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminAccountService } from 'src/app/services/admin-account.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-admin-account',
  templateUrl: './view-admin-account.component.html',
  styleUrls: ['./view-admin-account.component.css'],
})
export class ViewAdminAccountComponent implements OnInit, OnDestroy {
  admins: AdminModel[] = [];
  subscription: Subscription;
  isLoading = false;

  openDrawer(i: number) {
    this.routes.navigate([i], { relativeTo: this.route });
    // console.log(i);
  }

  constructor(
    private adminService: AdminAccountService,
    private routes: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.adminService.setAdmins();
    this.subscription = this.adminService.adminList.subscribe((response) => {
      this.admins = response;
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
