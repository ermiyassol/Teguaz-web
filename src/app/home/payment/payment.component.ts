import { PaymentService } from './../../services/payment.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  isVisible = false;
  imgSrc = '';
  validateForm!: FormGroup;

  paymentSelected(imageStr: string) {
    this.imgSrc = imageStr;
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.paymentService.searchAccount(
        this.validateForm.value.fullName,
        this.validateForm.value.phoneNumber,
        this.validateForm.value.accountNumber
      );
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      fullName: ['Dagem Kefyalew', [Validators.required]],
      phoneNumber: ['988276555', [Validators.required]],
      accountNumber: ['1000085', [Validators.required]],
      pin: ['1000085', [Validators.required]],
    });
  }
}
