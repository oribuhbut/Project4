import { Component, OnInit } from '@angular/core';
import Stepper from 'bs-stepper';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private stepper: Stepper;

  showSpinner = false;
  name = "";
  identity = "";
  email = "";
  password = "";
  confirmPassword = "";
  city = "0";
  street = "";
  showMessage = false;
  message = "";

  constructor(private router: Router, private users_service: UsersService) {
  }

  ngOnInit() {
    this.stepper = new Stepper(document.querySelector('.bs-stepper'), {
      animation: true
    })
  }

  async nextStep() {
    this.showMessage = false;
    this.message = "";
    if (!this.name.length || !this.identity.length || !this.email.length || !this.password.length || !this.confirmPassword.length) {
      this.showMessage = true;
      this.message = "please fill all the fields";
      return;
    }
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!this.email.match(emailRegex)) {
      this.showMessage = true;
      this.message = "invalid email!";
      return;
    }
    if (this.password != this.confirmPassword) {
      this.showMessage = true;
      this.message = "passwords must be the same!";
      return;
    }
    this.showSpinner = true;
    await this.delay(2000);
    this.showSpinner = false
    var identityCheck = await this.users_service.checkIfIdIExist(this.identity);
    if (identityCheck) {
      this.stepper.next();
    }
    else {
      this.showMessage = true;
      this.message = "identity already in use";
    }
  }

  previousStep() {
    this.stepper.previous();
  }

  submitForm() {
    if (this.city == "0" || !this.street.length) {
      this.message = "please fill all the fields";
      this.showMessage = true;
      return;
    }
    let newRegisterUser = {
      name: this.name,
      identity: this.identity,
      password: this.password,
      city: this.city,
      street: this.street,
      email: this.email
    }
    this.users_service.register(newRegisterUser);
  }
  delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

}
