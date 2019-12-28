import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { StoreComponent } from './store/store.component';
import { HomepageComponent } from './homepage/homepage.component';
import { AdminComponent } from './admin/admin.component';


const routes: Routes = [
  {path:'register', component:RegisterComponent},
  {path:'store',component:StoreComponent},
  {path:'homepage',component:HomepageComponent},
  {path:'',component:HomepageComponent},
  {path:'admin', component:AdminComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
