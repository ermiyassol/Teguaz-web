import { MemoryService } from './../services/memory.service';
import { BusCrudService } from 'src/app/services/bus.crud.service';
import { Auth } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  isCollapsed = false;
  role = this.memory.getRole();

  constructor(
    private auth: Auth,
    private busService: BusCrudService,
    private memory: MemoryService
  ) {}

  ngOnInit(): void {
    this.busService.setBuses();
  }

  onLogout() {
    this.auth.logout();
  }
}
