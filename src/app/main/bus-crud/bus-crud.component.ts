import { BusModel } from './../../models/bus.model';
import { EmployeeModel } from './../../models/Employe.model';
// import { EmployeeModel } from './../../models/Employe.model';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
// import { EmployeAccountService } from './../../services/employe-account.service';
import { BusCrudService } from 'src/app/services/bus.crud.service';
// import * as validator from 'ethiopic-date';
// import { etdate } from 'ethiopic-date';

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
  invalidDriverName = '';
  // previewImage: string | undefined = '';
  // previewVisible = false;
  Drivers: EmployeeModel[] = []; // ! needs editing
  editCache: { [key: string]: { edit: boolean; data: BusModel } } = {};
  listOfBuses: BusModel[];
  editError = false;

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

  private editformValidation(data: BusModel) {
    if (
      data.busNo == '' ||
      data.drivers[0] == '' ||
      data.drivers[1] == '' ||
      data.seatNo == null ||
      data.seatNo == 0
    ) {
      return false;
    } else {
      return true;
    }
  }

  saveEdit(id: number): void {
    const data = this.editCache[id].data;
    if (this.editformValidation(data)) {
      this.editError = false;
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
    } else {
      this.editError = true;
      this.message.create(
        'error',
        `Please insert valid Data in the editing FORM!!!`
      );
    }
  }

  updateEditCache(): void {
    this.listOfBuses.forEach((item, index) => {
      this.editCache[index] = {
        edit: false,
        data: { ...item },
      };
    });
  }

  private driversValidator(control: FormControl): { [s: string]: boolean } {
    if (control.value != '') {
      // console.log(control.value);
      const name = this.Drivers.map((cur) => cur.fullName == control.value);
      // console.log(name);
      if (!name[0]) {
        this.invalidDriverName = control.value;
        return { required: true, error: true };
      }
      this.invalidDriverName = '';
      return {};
    }
    this.invalidDriverName = '';
    return {};
  }

  onDelete(id: number) {
    console.log('onDelete called');
    this.busService.deleteBus(this.listOfBuses[id]);
  }

  submitForm(): void {
    if (this.invalidDriverName != null && this.invalidDriverName != '') {
      // console.log(this.invalidDriverName);
      this.message.create(
        'error',
        `Driver '${this.invalidDriverName}' is not registered in the system!!!`
      );
    }
    for (const i in this.form.controls) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }

    if (this.form.valid) {
      const busNo = this.form.value.busNo;
      const d1 = this.form.value.driver1;
      const d2 = this.form.value.driver2;
      const drivers = [d1, d2];
      const seatNo = this.form.value.seatNo;
      const bus = new BusModel(busNo, drivers, seatNo);
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
    private message: NzMessageService // private etdate: ethiopic-Date,
  ) {}

  ngOnInit(): void {
    // const etdate = require('ethiopic-date');
    // console.log(etdate.now());
    // let System: any;
    // System.import('./node_modules/ethiopic-date/index.js').then((file: any) => {
    //   console.log(file.now());
    // });
    this.busService.getDrivers();

    this.form = this.fb.group({
      busNo: [null, [Validators.required]],
      driver1: [null, [Validators.required, this.driversValidator.bind(this)]],
      driver2: [null, [Validators.required, this.driversValidator.bind(this)]],
      seatNo: [null, [Validators.required]],
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
