import { AdminModel } from './../../models/Admin.model';
import { AdminAccountService } from './../../services/admin-account.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router, ActivatedRoute } from '@angular/router';
// import {  } from "module";

function getBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    console.log(file);
  });
}

@Component({
  selector: 'app-create-admin',
  templateUrl: './create-admin.component.html',
  styleUrls: ['./create-admin.component.css'],
})
export class CreateAdminComponent implements OnInit {
  form!: FormGroup;

  submitForm(): void {
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      const companyName = this.form.value.companyName;
      const username = this.form.value.username;
      const password = this.form.value.password;
      const logoUrl = this.form.value.url;
      const admin = new AdminModel(companyName, username, password, logoUrl);
      // console.log(admin);
      if (this.adminService.addAdmin(admin)) {
        this.form.reset();
        this.message.create(
          'success',
          `Admin Account created successfully for ${companyName}`
        );
        this.routes.navigate(['../view_Admin_Account'], {
          relativeTo: this.route,
        });
      }
    }
  }

  resetForm() {
    this.form.reset();
  }

  constructor(
    private fb: FormBuilder,
    private adminService: AdminAccountService,
    private message: NzMessageService,
    private routes: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      companyName: [null, [Validators.required]],
      username: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      url: [null, [Validators.required]],
    });
  }
}
