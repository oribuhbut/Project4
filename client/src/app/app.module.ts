import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { StoreComponent } from './store/store.component';
import { HomepageComponent } from './homepage/homepage.component';
import { SearchfilterPipe } from './searchfilter.pipe';
import { AdminComponent } from './admin/admin.component';
import { HighlightPipe } from './highlight.pipe';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    StoreComponent,
    HomepageComponent,
    SearchfilterPipe,
    AdminComponent,
    HighlightPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
