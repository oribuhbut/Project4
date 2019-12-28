import { Component, OnInit, Output } from '@angular/core';
import { UsersService } from '../users.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  showSpinner = false;
  email = "";
  password = "";
  showMessage = false;
  message = "";
  CurrentUser;
  clients = "";
  products = "";
  orders = "";
  cart = {}
  userOrders = [];
  constructor(private users_service: UsersService, private router: Router) { }

  ngOnInit() {
    this.users_service.checkSession();
    this.users_service.getClientsCount();
    this.users_service.getProductsCount();
    this.users_service.getOrdersCount();
    this.users_service.currentUser.subscribe(data => this.CurrentUser = data);
    this.users_service.numberOfClients.subscribe(data => this.clients = data);
    this.users_service.numberOfProducts.subscribe(data => this.products = data);
    this.users_service.numberOfOrders.subscribe(data => this.orders = data);
    this.users_service.openCartDetails.subscribe(data => this.cart = data);
    this.users_service.userOrdersList.subscribe(data => this.userOrders = data);
  }

  async login() {
    this.showMessage = false;
    this.message = "";
    if (!this.email.length || !this.password.length) {
      this.showMessage = true;
      this.message = "please fill all the fields";
      return;
    }
    this.showSpinner = true;
    await this.delay(2000);
    this.showSpinner = false;
    let userData = {
      email: this.email,
      password: this.password
    }
    var result = await this.users_service.login(userData);
    if (!result) {
      this.message = "username or password are incorrect";
      this.showMessage = true;
      return;
    }
    else {
      this.email = "";
      this.password = "";
      if (this.CurrentUser.role < 1) {
        this.router.navigate(['admin']);
        return;
      }
      this.users_service.getOpenedCart(this.CurrentUser.id);
      this.users_service.getLastOrder(this.CurrentUser.id);
    }
  }

  // check user session specifically on click "start shopping/continue shopping buttons"

  checkUserSession() {
    let token = localStorage.getItem("token");
    fetch(`http://localhost:3000/users/session/?token=${token}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {

        if (res.success) {
          if (this.cart == null) {
            this.users_service.addNewCart(res.data[0].id);
          }
          this.router.navigate(['store']);
          return;
        }
        else {
          this.CurrentUser = null;
        }
      })
      .catch((err) => {
        return err;
      })
  }

  delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}
