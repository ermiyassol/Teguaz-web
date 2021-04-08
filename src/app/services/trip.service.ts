import { TripModel } from './../models/trip.model';
import { SPModel } from './../models/startingPlace.model';
import { BusModel, onTrip } from './../models/bus.model';
import { Subject } from 'rxjs';
import { MemoryService } from './memory.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface check {
  label: string;
  value: string;
  checked?: boolean;
  disabled: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class TripService {
  companyId: string;
  Destinations: string[] = [];
  destinationList = new Subject<string[]>();
  Buses: BusModel[] = [];
  busList = new Subject<BusModel[]>();
  SP: SPModel;
  SPList = new Subject<SPModel>();
  RSP: SPModel;
  RSPList = new Subject<SPModel>();
  driversList = new Subject<string[]>();
  Trips: TripModel[] = [];
  tripsList = new Subject<TripModel[]>();

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase,
    private memory: MemoryService
  ) {
    this.companyId = this.memory.getCompanyId();
  }

  returnDrivers(busNo: string) {
    const driver = this.Buses.filter((bus) => bus.busNo == busNo).map(
      (cur) => cur.drivers
    );
    this.driversList.next(driver[0]);
  }

  save() {
    console.log(this.SP);
  }

  SPUpdate(
    updatedForm: check[],
    type: string, // SP / RSP
    destinationCity: string
  ) {
    const temp: SPModel = type == 'SP' ? this.SP : this.RSP;

    temp.places.forEach((place, pindex) => {
      updatedForm.forEach((updatedPlace) => {
        if (place.name == updatedPlace.value) {
          if (place.selectedBy?.length == 0) {
            if (updatedPlace.checked == true) {
              temp.places[pindex].selectedBy?.push({
                cid: this.companyId,
                destination: destinationCity,
              });
            }
          }
          const selectedDestinations = place.selectedBy?.map(
            (cur) => cur.destination
          );
          place.selectedBy?.forEach((selected, sindex) => {
            if (
              selected.cid == this.companyId &&
              updatedPlace.checked == true &&
              selected.destination == destinationCity
            ) {
            } else if (
              selected.cid == this.companyId &&
              updatedPlace.checked == false &&
              selected.destination == destinationCity
            ) {
              temp.places[pindex].selectedBy?.splice(sindex, 1);
            } else if (
              place.selectedBy?.length == sindex + 1 &&
              updatedPlace.checked == true &&
              !selectedDestinations?.includes(destinationCity)
            ) {
              temp.places[pindex].selectedBy?.push({
                cid: this.companyId,
                destination: destinationCity,
              });
            } else {
            }
          });
        }
      });
    });
    type == 'SP' ? (this.SP = temp) : (this.RSP = temp);
    this.db.list('starting_places').update(temp.key!, temp);
  }

  setDestination() {
    const ref = this.db.database.ref('company/' + this.companyId + '/place');
    ref.once('value', (snapshot) => {
      this.Destinations = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          const temp: string = snapshot.val()[key].destination;
          this.Destinations.push(temp);
        }
      }
      this.destinationList.next(this.Destinations);
    });
  }

  onTripValidationforReturnTrip(
    busNo: string,
    date: String,
    type: string
  ): Boolean {
    let isValidated = true;
    const onTrip = this.Buses.filter((bus) => bus.busNo == busNo).map(
      (bus) => bus.onTrip
    )[0];
    const fetchedDate = date.split('/');
    onTrip.forEach((cur) => {
      const dateArr = cur.date.split('/');

      const result =
        fetchedDate[0] == dateArr[0]
          ? parseInt(dateArr[1]) - parseInt(fetchedDate[1])
          : 30 - parseInt(dateArr[1]) + parseInt(fetchedDate[1]);
      // console.log(dateArr[1] + ' - ' + fetchedDate[1] + ' = ' + result);
      if (result < 2 && result > -2 && type == 'comp') {
        isValidated = false;
      }
      if (
        (cur.date == date && type == 'equal') ||
        (result < 0 && type == 'equal')
      ) {
        isValidated = false;
      }
    });
    return isValidated;
  }

  setBuses(date: string) {
    const ref = this.db.database.ref('company/' + this.companyId + '/bus');
    ref.on('value', (snapshot) => {
      this.Buses = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: BusModel;
          temp = snapshot.val()[key];
          temp.key = key;
          temp.onTrip = temp.onTrip ? temp.onTrip : [];
          // if (!temp.onTrip) { // ! do the date validation here
          const onTripValidator = temp.onTrip.filter((cur) => cur.date == date);
          if (onTripValidator.length == 0) {
            this.Buses.push(temp);
          }
          // }
        }
      }

      this.busList.next(this.Buses);
    });
  }

  setSP(city: string, type: string) {
    const ref = this.db.database.ref('starting_places');
    ref
      .orderByChild('city')
      .equalTo(city)
      .on('value', (snapshot) => {
        // this.SP = {};
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            let temp: SPModel;
            temp = snapshot.val()[key];
            temp.key = key;
            temp.places.forEach((cur, index) => {
              temp.places[index].selectedBy = cur.selectedBy
                ? cur.selectedBy
                : [];
            });
            type == 'SP' ? (this.SP = temp) : (this.RSP = temp);
          }
        }
        type == 'SP' ? this.SPList.next(this.SP) : this.RSPList.next(this.RSP);
      });
  }

  addSP(cityName: string, start: string) {
    const place = { name: start, selectedBy: [] };
    const ref = this.db.database.ref('starting_places');
    ref
      .orderByChild('city')
      .equalTo(cityName)
      .once('value', (snapshot) => {
        if (snapshot.val()) {
          let temp;
          for (const key in snapshot.val()) {
            if (snapshot.val().hasOwnProperty(key)) {
              temp = snapshot.val()[key];
              if (temp.places) {
                temp.places.push(place);
              } else {
                temp.places = [place];
              }
            }
            this.db.list('starting_places').update(key, temp);
          }
        } else {
          this.db.list('starting_places').push({
            city: cityName,
            places: [place],
          });
        }
      });
  }

  addTrip(newTrip: TripModel, date: string) {
    newTrip.passengers = [];
    newTrip.key = null!;
    return this.db
      .list('trip')
      .push(newTrip)
      .then((response) => {
        const selectedBus = this.Buses.filter(
          (bus) => bus.busNo == newTrip.busNo
        )[0];
        const onTripValue = new onTrip(
          response.key!,
          new Date(date).toLocaleDateString()
        );
        selectedBus.onTrip.push(onTripValue);
        this.db
          .list('company/' + this.companyId + '/bus')
          .update(selectedBus.key!, selectedBus);
      });
  }

  // this.companyId
  setTrips() {
    const ref = this.db.database.ref('trip');
    ref
      .orderByChild('companyId')
      .equalTo(this.companyId)
      .on('value', (snapshot) => {
        this.Trips = [];
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            let temp: TripModel;
            temp = snapshot.val()[key];
            temp.key = key;
            temp.passengers = temp.passengers ? temp.passengers : [];
            this.Trips.push(temp);
          }
        }
        this.Trips.sort((a, b) => {
          const x = a.date.split(' / ')[1];
          const y = b.date.split(' / ')[1];
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
        this.tripsList.next(this.Trips);
      });
  }
}
