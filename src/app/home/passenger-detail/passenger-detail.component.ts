import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-passenger-detail',
  templateUrl: './passenger-detail.component.html',
  styleUrls: ['./passenger-detail.component.css'],
})
export class PassengerDetailComponent implements OnInit {
  validateForm!: FormGroup;
  seatPreview = false;
  seats: number[] = [];

  availableSeats(side: number) {
    this.seatPreview = true;
    this.seats = [];
    for (let seat = side; seat < 45; seat += 4) {
      this.seats.push(seat);
    }

    if (side == 1) {
      this.seats.push(45);
    } else if (side == 2) {
      this.seats.push(46);
    } else if (side == 3) {
      this.seats.push(48);
    } else if (side == 4) {
      this.seats.push(49);
    } else {
      this.seats = [];
      this.seats.push(47);
    }
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      fullName: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required]],
      seat: [null, [Validators.required]],
      terms: [true],
    });
  }
}
