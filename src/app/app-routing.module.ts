import { ViewAdminAccountComponent } from './main/view-admin-account/view-admin-account.component';
import { CreateAdminComponent } from './main/create-admin/create-admin.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'main' },
  { path: 'main', component: MainComponent, children: [
    { path: 'create_Admin', component: CreateAdminComponent },
    { path: 'view_Admin_Account', component: ViewAdminAccountComponent }
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
