import { MemoryService } from './../../services/memory.service';
import { BusModel } from './../../models/bus.model';
import { TripService } from './../../services/trip.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

interface check {
  label: string;
  value: string;
  checked?: boolean;
  disabled: boolean;
}

@Component({
  selector: 'app-trip-operation',
  templateUrl: './trip-operation.component.html',
  styleUrls: ['./trip-operation.component.css'],
})
export class TripOperationComponent implements OnInit {
  SPForm: FormGroup;
  returnForm: FormGroup;
  Form: FormGroup;
  citiesList: string[] = [];
  busesList: check[] = [];
  isLoading = false;
  returningTrip = false;
  SPList: check[] = [];
  returnSPList: check[] = [];

  log(value: object[]): void {
    console.log(value);
  }

  SPchanged() {
    console.log('SPChange called');
    const start = this.Form.value.startingCity;
    const destination = this.Form.value.destinationCity;
    if (start && destination) {
      this.tripService.setSP(start);
    }
  }

  RSPchanged() {
    const start = this.returnForm.value.startingCity;
    const destination = this.returnForm.value.destinationCity;

    if (start && destination) {
      this.tripService.setRSP(start);
    }
  }

  submitSPForm() {
    for (const i in this.SPForm.controls) {
      this.SPForm.controls[i].markAsDirty();
      this.SPForm.controls[i].updateValueAndValidity();
    }

    if (this.SPForm.valid) {
      const start =
        this.SPForm.value.start + ' / ' + this.SPForm.value.amharicStart;
      const city = this.SPForm.value.city;
      this.tripService.addSP(city, start);
      this.SPForm.reset();
      // .then(() => {
      //   this.message.create(
      //     'success',
      //     `'${start}' was added to '${city}' Trip starting places`
      //   );
      // });
    }
  }

  submitForm() {
    // console.log(this.SPList);
    for (const i in this.Form.controls) {
      this.Form.controls[i].markAsDirty();
      this.Form.controls[i].updateValueAndValidity();
    }
    if (this.returningTrip) {
      for (const i in this.returnForm.controls) {
        this.returnForm.controls[i].markAsDirty();
        this.returnForm.controls[i].updateValueAndValidity();
      }
    }
    if (
      (this.Form.valid && !this.returningTrip) ||
      (this.returningTrip && this.Form.valid && this.returnForm.valid)
    ) {
      console.log(this.Form.value);
    }
  }

  private returnDateCalc(DMY: string) {
    const dateArr = DMY.split(' ');
    const exceptions = [
      'Jan 31',
      'Feb 28',
      'Mar 31',
      'Feb 29',
      'Mar 31',
      'Apr 30',
      'May 31',
      'Jun 30',
      'Jul 31',
      'Aug 31',
      'Sep 30',
      'Oct 31',
      'Nov 30',
      'Dec 31',
      'Jan 31',
    ];
    const index = exceptions.indexOf(dateArr[0] + ' ' + dateArr[1]);
    if (index != -1) {
      if (index == 2) {
        return exceptions[index + 3].substr(0, 3) + ' 01 ' + dateArr[2];
      } else if (index == 13) {
        const nextYear = parseInt(dateArr[2]) + 1;
        return exceptions[index + 1].substr(0, 3) + ' 01 ' + nextYear;
      } else {
        return exceptions[index + 1].substr(0, 3) + ' 01 ' + dateArr[2];
      }
    } else {
      const x = +dateArr[1] + 1;
      dateArr[1] = x.toString();
      return dateArr.join(' ');
    }
    // return DMY;
  }

  clickSwitch() {
    for (const i in this.Form.controls) {
      this.Form.controls[i].markAsDirty();
      this.Form.controls[i].updateValueAndValidity();
    }
    if (this.Form.valid) {
      const date = this.Form.value.date.toString();
      const param = date.substr(4, 11);
      const nextDate = this.returnDateCalc(param);
      date.replace(param, nextDate);
      this.returnForm.patchValue({
        date: new Date(date),
        time: this.Form.value.time,
        startingCity: this.Form.value.destinationCity,
        destinationCity: this.Form.value.startingCity,
        busNo: this.Form.value.busNo,
      });
    } else {
      this.returningTrip = false;
      this.message.create(
        'error',
        `Please fill all fields of the first trip form!!`
      );
    }
  }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private tripService: TripService,
    private memory: MemoryService,
    private notification: NzNotificationService
  ) {}

  ngOnInit(): void {
    this.tripService.setBuses();
    this.tripService.setDestination();
    // this.tripService.setStartingPlace();
    this.tripService.busList.subscribe((response) => {
      this.busesList = [
        { label: 'Select Bus NO.', value: '', disabled: false },
      ];
      response.forEach((cur) => {
        this.busesList.push({
          label: cur.busNo,
          value: cur.busNo,
          disabled: cur.onTrip != '',
        });
      });
      console.log(this.busesList);
    });
    this.tripService.destinationList.subscribe((response) => {
      this.citiesList = response;
      console.log(response);
    });
    this.tripService.SPList.subscribe((response) => console.log(response));

    this.SPForm = this.fb.group({
      city: ['', [Validators.required]],
      start: [null, [Validators.required]],
      amharicStart: [null, [Validators.required]],
    });

    this.Form = this.fb.group({
      date: [null, [Validators.required]],
      time: [
        'Sun Feb 28 2021 10:00:48 GMT+0300 (Moscow Standard Time)',
        [Validators.required],
      ],
      startingCity: ['', [Validators.required]],
      destinationCity: ['', [Validators.required]],
      startingPlace: [null, [Validators.required]],
      busNo: ['', [Validators.required]],
    });

    this.returnForm = this.fb.group({
      date: [null, [Validators.required]],
      time: [null, [Validators.required]],
      startingCity: ['', [Validators.required]],
      destinationCity: ['', [Validators.required]],
      startingPlace: [null, [Validators.required]],
      busNo: ['', [Validators.required]],
    });

    this.tripService.SPList.subscribe((response) => {
      this.SPList = [];
      const destination = this.Form.value.destinationCity;
      console.log(response);
      const companyId = this.memory.getCompanyId();
      response.places.forEach((cur) => {
        cur.selectedBy?.forEach((scur) => {
          if (scur.cid == companyId && scur.destination == destination) {
            this.SPList.push({
              label: cur.name,
              value: cur.name,
              checked: true,
              disabled: false,
            });
          } else {
            this.SPList.push({
              label: cur.name,
              value: cur.name,
              checked: false,
              disabled: false,
            });
          }
        });
      });
    });

    this.tripService.RSPList.subscribe((response) => {
      this.returnSPList = [];
      const destination = this.returnForm.value.destinationCity;
      const companyId = this.memory.getCompanyId();
      response.places.forEach((cur) => {
        cur.selectedBy?.forEach((scur) => {
          if (scur.cid == companyId && scur.destination == destination) {
            this.returnSPList.push({
              label: '',
              value: '',
              checked: true,
              disabled: false,
            });
          } else {
            this.returnSPList.push({
              label: '',
              value: '',
              checked: false,
              disabled: false,
            });
          }
        });
      });
    });
  }
}
