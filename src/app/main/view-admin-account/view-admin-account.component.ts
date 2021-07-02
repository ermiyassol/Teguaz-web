import { TripService } from './../../services/trip.service';
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
  tripsCount: number[] = [];

  openDrawer(i: number) {
    this.routes.navigate([i], { relativeTo: this.route });
    // console.log(i);
  }

  constructor(
    private adminService: AdminAccountService,
    private routes: Router,
    private route: ActivatedRoute,
    private tripService: TripService
  ) {}

  private countTrips() {
    this.admins.forEach((company) => {
      const num = this.tripService.countUpcomingTrips(company.key!);
      this.tripsCount.push(num);
    });
  }

  dateConverter() {
    const compyAdmin = this.admins;
    compyAdmin.forEach((company, index) => {
      this.admins[index].regDate = new Date(
        company.regDate
      ).toLocaleDateString();
    });
  }

  ngOnInit(): void {
    this.admins = this.adminService.retriveAdmins();
    this.subscription = this.adminService.adminList.subscribe((response) => {
      this.admins = response;
      this.countTrips();
      this.dateConverter();
      this.isLoading = false;
    });
    if (!this.adminService.checkAdmin()) {
      this.isLoading = true;
      this.adminService.setAdmins();
    } else {
      this.countTrips();
      this.dateConverter();
    }

    console.log(this.admins);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
