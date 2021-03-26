import { TripModel } from './../models/trip.model';
import { SPModel } from './../models/startingPlace.model';
import { BusModel } from './../models/bus.model';
import { Subject } from 'rxjs';
import { MemoryService } from './memory.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase,
    private memory: MemoryService
  ) {
    this.companyId = this.memory.getCompanyId();
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

  setBuses() {
    const ref = this.db.database.ref('company/' + this.companyId + '/bus');
    ref.once('value', (snapshot) => {
      this.Buses = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: BusModel;
          temp = snapshot.val()[key];
          temp.key = key;
          temp.onTrip = temp.onTrip ? temp.onTrip : '';
          this.Buses.push(temp);
        }
      }
      this.busList.next(this.Buses);
    });
  }

  setSP(city: string) {
    const ref = this.db.database.ref('starting_places');
    ref
      .orderByChild('city')
      .equalTo(city)
      .on('value', (snapshot) => {
        // this.SP = [];
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            let temp: SPModel;
            temp = snapshot.val()[key];
            temp.key = key;
            temp.places.forEach((cur, index) => {
              temp.places[index].selectedBy = cur.selectedBy
                ? cur.selectedBy
                : [{ cid: '', destination: '' }];
            });
            this.SP = temp;
          }
        }
        this.SPList.next(this.SP);
      });
  }

  setRSP(city: string) {
    const ref = this.db.database.ref('starting_places');
    ref
      .orderByChild('city')
      .equalTo(city)
      .on('value', (snapshot) => {
        for (const key in snapshot.val()) {
          if (snapshot.val().hasOwnProperty(key)) {
            let temp: SPModel;
            temp = snapshot.val()[key];
            temp.key = key;
            temp.places.forEach((cur, index) => {
              temp.places[index].selectedBy = cur.selectedBy
                ? cur.selectedBy
                : [{ cid: '', destination: '' }];
            });
            this.RSP = temp;
          }
        }
        this.RSPList.next(this.RSP);
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
              temp.places.push(place);
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
    // .then((response) => {
    //   console.log(response);
    //   const sp = new SPModel(cityName, [place], response.key!);
    //   this.SP.push(sp);
    // });
  }
}
