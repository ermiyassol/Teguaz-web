import { TripModel } from './../models/trip.model';
import { SPModel } from './../models/startingPlace.model';
import { BusModel } from './../models/bus.model';
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

  // RSPUpdate(
  //   updatedForm: check[],
  //   // startingCity: string,
  //   destinationCity: string
  // ) {
  //   this.RSP.places.forEach((place, pindex) => {
  //     updatedForm.forEach((updatedPlace) => {
  //       if (place.name == updatedPlace.value) {
  //         if (place.selectedBy?.length == 0) {
  //           if (updatedPlace.checked == true) {
  //             this.RSP.places[pindex].selectedBy?.push({
  //               cid: this.companyId,
  //               destination: destinationCity,
  //             });
  //           }
  //         }
  //         place.selectedBy?.forEach((selected, sindex) => {
  //           if (
  //             selected.cid == this.companyId &&
  //             updatedPlace.checked == true &&
  //             selected.destination == destinationCity
  //           ) {
  //           } else if (
  //             selected.cid == this.companyId &&
  //             updatedPlace.checked == false &&
  //             selected.destination == destinationCity
  //           ) {
  //             this.RSP.places[pindex].selectedBy?.splice(sindex, 1);
  //           } else if (
  //             place.selectedBy?.length == sindex + 1 &&
  //             selected.destination != destinationCity
  //           ) {
  //             this.RSP.places[pindex].selectedBy?.push({
  //               cid: this.companyId,
  //               destination: destinationCity,
  //             });
  //           } else {
  //           }
  //         });
  //       }
  //     });
  //   });

  //   this.db.list('starting_places').update(this.RSP.key!, this.RSP);
  // }

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

  setBuses() {
    const ref = this.db.database.ref('company/' + this.companyId + '/bus');
    ref.on('value', (snapshot) => {
      this.Buses = [];
      for (const key in snapshot.val()) {
        if (snapshot.val().hasOwnProperty(key)) {
          let temp: BusModel;
          temp = snapshot.val()[key];
          temp.key = key;
          temp.onTrip = temp.onTrip ? temp.onTrip : false;
          if (!temp.onTrip) {
            this.Buses.push(temp);
          }
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

  // setRSP(city: string) {
  //   const ref = this.db.database.ref('starting_places');
  //   ref
  //     .orderByChild('city')
  //     .equalTo(city)
  //     .on('value', (snapshot) => {
  //       for (const key in snapshot.val()) {
  //         if (snapshot.val().hasOwnProperty(key)) {
  //           let temp: SPModel;
  //           temp = snapshot.val()[key];
  //           temp.key = key;
  //           if (temp.places) {
  //             temp.places.forEach((cur, index) => {
  //               temp.places[index].selectedBy = cur.selectedBy
  //                 ? cur.selectedBy
  //                 : [];
  //             });
  //           }
  //           this.RSP = temp;
  //         }
  //       }
  //       this.RSPList.next(this.RSP);
  //     });
  // }

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

  addTrip(newTrip: TripModel) {
    newTrip.passengers = [];
    newTrip.key = null!;
    return this.db.list('trip').push(newTrip);
  }
}
