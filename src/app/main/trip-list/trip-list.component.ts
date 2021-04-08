import { Router, ActivatedRoute } from '@angular/router';
import { TripService } from './../../services/trip.service';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TripModel } from 'src/app/models/trip.model';

interface displayTrip {
  bussNo: string;
  date: string[];
  destinationCity: string[];
  driver: string;
  startingCity: string[];
}

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css'],
})
export class TripListComponent implements OnInit {
  switchValue = false;
  languageIndex = 0;
  trips: displayTrip[] = [];

  switchChange() {
    this.switchValue ? (this.languageIndex = 1) : (this.languageIndex = 0);
  }

  viewDetail(index: number) {
    this.routes.navigate(['../../' + index + '/trip/detail'], {
      relativeTo: this.route,
    });
  }

  constructor(
    private tripsService: TripService,
    private routes: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.tripsService.tripsList.subscribe((response) => {
      this.trips = [];
      response.forEach((curTrip) => {
        this.trips.push({
          bussNo: curTrip.busNo,
          date: curTrip.date.split(' / '),
          destinationCity: curTrip.destinationCity.split(' / '),
          driver: curTrip.driver,
          startingCity: curTrip.startingCity.split(' / '),
        });
      });
    });
    this.tripsService.setTrips();
  }
}
