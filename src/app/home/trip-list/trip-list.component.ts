import { Router } from '@angular/router';
import { AdminAccountService } from 'src/app/services/admin-account.service';
import { BuyTicketService } from './../../services/buy-ticket.service';
import { TripModel } from 'src/app/models/trip.model';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filtered-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css'],
})
export class FilteredTripListComponent implements OnInit {
  trips: TripModel[] = [];

  formatOne = (percent: number): string => ``;

  fetchPrice(sp: string, dp: string) {
    return this.adminService.fetchPrice(sp, dp);
  }

  constructor(
    private buyTicketService: BuyTicketService,
    private adminService: AdminAccountService,
    private routes: Router
  ) {}

  tripSelected(index: number) {
    console.log('trips selected');
    // todo track selected trip in ticket buying service
    this.routes.navigate(['./passenger_detail']);
  }

  ngOnInit(): void {
    this.buyTicketService.filteredTripsList.subscribe((response) => {
      console.log('search response', response);
      if (response) {
        this.trips = response;
      }
    });
  }
}
