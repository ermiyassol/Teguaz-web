import { BusModel } from './../../models/bus.model';
// import { EmployeeModel } from './../../models/Employe.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { EmployeAccountService } from './../../services/employe-account.service';
import { BusCrudService } from 'src/app/services/bus.crud.service';
// import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-bus-crud',
  templateUrl: './bus-crud.component.html',
  styleUrls: ['./bus-crud.component.css'],
})
export class BusCrudComponent implements OnInit {
  form!: FormGroup;
  inputValue?: string;
  options: string[] = [];
  editMode = false;
  isLoading = false;
  // previewImage: string | undefined = '';
  // previewVisible = false;
  Drivers = [
    'Ermiyas Solomon',
    'Dagmawi Takele',
    'Secretary',
    'Financial-Manager',
  ]; // ! needs editing
  editCache: { [key: string]: { edit: boolean; data: BusModel } } = {};
  listOfBuses: BusModel[];

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfBuses.findIndex((item, index) => index === id);
    this.editCache[id] = {
      data: { ...this.listOfBuses[index] },
      edit: false,
    };
  }

  saveEdit(id: number): void {
    const index = this.listOfBuses.findIndex((item, index) => index === id);
    Object.assign(this.listOfBuses[index], this.editCache[id].data);
    this.editCache[id].edit = false;
    const key = this.listOfBuses[index].key!;
    this.busService.updatebus(this.listOfBuses[index], key).then(() => {
      this.message.create(
        'success',
        `bus information has been updated successfully`
      );
    });
  }

  updateEditCache(): void {
    this.listOfBuses.forEach((item, index) => {
      this.editCache[index] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  onDelete(id: number) {
    console.log('onDelete called');
    this.busService.deleteBus(this.listOfBuses[id]);
  }

  submitForm(): void {
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      const busNo = this.form.value.busNo;
      const d1 = this.form.value.driver1;
      const d2 = this.form.value.driver2;
      const drivers = [d1, d2];
      const bus = new BusModel(busNo, drivers);
      this.busService.addBus(bus).then(() => {
        this.message.create('success', `New Bus Registered Successfully`);
      });
    }
  }

  resetForm() {
    this.form.reset();
  }

  constructor(
    private fb: FormBuilder,
    private busService: BusCrudService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.busService.getDrivers();

    this.form = this.fb.group({
      busNo: [null, [Validators.required]],
      driver1: [null, [Validators.required]],
      driver2: [null, [Validators.required]],
    });

    if (!this.busService.checkBus()) {
      this.busService.setBuses();
    } else {
      this.listOfBuses = this.busService.retrieveBuses();
      this.updateEditCache();
    }

    this.busService.busList.subscribe((response) => {
      this.listOfBuses = response;
      this.updateEditCache();
    });

    this.busService.driversList.subscribe((response) => {
      this.Drivers = response;
      console.log(response);
    });
  }
}
