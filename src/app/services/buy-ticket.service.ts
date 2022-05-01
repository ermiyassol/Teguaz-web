import { TripService } from './trip.service';
import { TripModel } from 'src/app/models/trip.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BuyTicketService {
  filteredTrips: TripModel[] = [];
  filteredTripsList = new Subject<TripModel[]>();

  filterTrips(startingCity: string, destinationCity: string, date: string) {
    const trips = this.tripService.retrieveTrips();
    const formatedDate = new Date(date).toDateString();
    startingCity = startingCity.toLowerCase();
    destinationCity = destinationCity.toLowerCase();
    this.filteredTrips = trips.filter((trip) => {
      const tripFormatedDate = new Date(
        trip.date.split(' / ')[0]
      ).toDateString();
      return (
        trip.startingCity.split(' / ')[0].toLowerCase() == startingCity &&
        trip.destinationCity.split(' / ')[0].toLowerCase() == destinationCity &&
        formatedDate == tripFormatedDate &&
        trip.passengers.length < 49
      );
    });

    this.filteredTripsList.next(this.filteredTrips);
  }

  constructor(private tripService: TripService) {}
}
