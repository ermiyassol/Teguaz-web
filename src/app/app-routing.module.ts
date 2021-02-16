import { DrawerComponent } from './main/view-admin-account/drawer/drawer.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ViewAdminAccountComponent } from './main/view-admin-account/view-admin-account.component';
import { CreateAdminComponent } from './main/create-admin/create-admin.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'main' },
  {
    path: 'main',
    component: MainComponent,
    children: [
      { path: 'create_Admin', component: CreateAdminComponent },
      { path: 'view_Admin_Account', component: ViewAdminAccountComponent },
      { path: 'view_Admin_Account/:id', component: DrawerComponent },
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
