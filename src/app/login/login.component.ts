import { Auth } from './../services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isVisible = false;
  form!: FormGroup;
  options: string[] = [];
  subscription: Subscription;
  isLoading = false;
  passwordVisible = false;

  onInput(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    if (!value || value.indexOf('@') >= 0) {
      this.options = [];
    } else {
      this.options = ['gmail.com', 'yahoo.com', 'lycos.com'].map(
        (domain) => `${value}@${domain}`
      );
    }
  }

  submitForm(): void {
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      this.isLoading = true;
      const email = this.form.value.email;
      const password = this.form.value.password;
      this.auth.login({ email: email, password: password }).subscribe(
        () => {},
        (error) => {
          this.isLoading = false;
          if (error.includes('email')) {
            this.form.patchValue({ email: null });
          } else {
            this.form.patchValue({ password: null });
          }
          this.message.create('error', error);
        }
      );
    }
  }

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private message: NzMessageService,
    private routes: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['ermiyasst@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      remember: [true],
    });

    this.subscription = this.auth.user.subscribe((response) => {
      this.isLoading = false;
      if (response) {
        this.routes.navigate(['main']);
      }
    });
  }

  showModal(): void {
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
