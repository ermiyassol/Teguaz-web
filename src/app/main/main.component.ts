import { Auth } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  isCollapsed = false;

  constructor(private auth: Auth) {}

  ngOnInit(): void {}

  onLogout() {
    this.auth.logout();
  }
}
