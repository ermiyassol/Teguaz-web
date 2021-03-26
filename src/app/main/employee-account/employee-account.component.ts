import { EmployeeModel } from './../../models/Employe.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EmployeAccountService } from './../../services/employe-account.service';
// import { Router, ActivatedRoute } from '@angular/router';

// interface EmployeeModel {
//   id: number;
//   name: string;
//   age: number;
//   address: string;
// }

@Component({
  selector: 'app-employee-account',
  templateUrl: './employee-account.component.html',
  styleUrls: ['./employee-account.component.css'],
})
export class EmployeeAccountComponent implements OnInit {
  form!: FormGroup;
  inputValue?: string;
  options: string[] = [];
  editMode = false;
  isLoading = false;
  previewImage: string | undefined = '';
  previewVisible = false;
  empRoles = ['Driver', 'Ticket Seller', 'Secretary', 'Financial-Manager'];
  editCache: { [key: string]: { edit: boolean; data: EmployeeModel } } = {};
  listOfEmployees: EmployeeModel[];

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfEmployees.findIndex((item, index) => index === id);
    this.editCache[id] = {
      data: { ...this.listOfEmployees[index] },
      edit: false,
    };
    console.log('oncancel called');
  }

  saveEdit(id: number): void {
    const index = this.listOfEmployees.findIndex((item, index) => index === id);
    Object.assign(this.listOfEmployees[index], this.editCache[id].data);
    this.editCache[id].edit = false;
    const key = this.listOfEmployees[index].key!;
    this.employeeService
      .updateEmployee(this.listOfEmployees[index], key)
      .then(() => {
        this.message.create(
          'success',
          `${this.listOfEmployees[index]['fullName']}'s account has been updated successfully`
        );
      });
  }

  updateEditCache(): void {
    this.listOfEmployees.forEach((item, index) => {
      this.editCache[index] = {
        edit: false,
        data: { ...item },
      };
    });
    console.log(this.editCache);
  }

  onDelete(id: number) {
    console.log('onDelete called');
    this.employeeService.deleteEmploye(this.listOfEmployees[id]);
  }

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
      const regDate = new Date().toUTCString();
      const fullName = this.form.value.fullName;
      const email = this.form.value.email;
      const password = this.form.value.fullName;
      const role = this.form.value.role;
      const phoneNumber = this.form.value.phoneNumber;
      const employee = new EmployeeModel(
        fullName,
        password,
        email,
        phoneNumber,
        role,
        regDate
      );
      this.employeeService.addEmployee(employee).subscribe(
        () => {
          this.message.create(
            'success',
            `Account has been created for ${fullName}`
          );
        },
        (error) => {
          this.message.create('error', error);
          this.form.patchValue({ email: null });
        }
      );
    }
  }

  resetForm() {
    this.form.reset();
  }

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeAccountService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['Ermiyas Solomon', [Validators.required]],
      role: ['Ticket Seller', [Validators.required]],
      password: ['112233', [Validators.required, Validators.minLength(6)]],
      email: ['ermiyasst@gmail.com', [Validators.required, Validators.email]],
      phoneNumber: [
        '0939866118',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^-?(0|[0-9]\d*)?$/),
        ],
      ],
    });

    if (!this.employeeService.checkEmployee()) {
      this.employeeService.setEmployees();
    } else {
      this.listOfEmployees = this.employeeService.retriveEmployees();
      this.updateEditCache();
    }

    this.employeeService.employeeList.subscribe((response) => {
      this.listOfEmployees = response;
      this.updateEditCache();
    });
  }
}
