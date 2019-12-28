import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import * as $ from 'jquery';
import { Router } from '@angular/router';
import { ab2str } from './../../../node_modules/arraybuffer-to-string/';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  CurrentUser = [];
  cart = [];
  Categories = [];
  Products = [];
  search = "";
  showSpinner = false;
  newProductOption = false;
  title = "";
  price: number;
  photo: string;
  category: number = 0;
  singlePrd = {};
  constructor(private users_service: UsersService, private router: Router) { }

  ngOnInit() {
    this.users_service.getCategories();
    this.users_service.getProducts();
    this.users_service.checkSession();
    this.users_service.currentUser.subscribe(data => this.CurrentUser = data);
    this.users_service.cartProductsList.subscribe(data => this.cart = data);
    this.users_service.CategoriesList.subscribe(data => this.Categories = data);
    this.users_service.ProductsListObserve.subscribe(data => this.Products = data);
    this.users_service.singlePrdDtl.subscribe(data => this.singlePrd = data);
  }

  async getCategoryProducts(category_id) {
    this.showSpinner = true;
    await this.delay(800);
    this.showSpinner = false;
    if (category_id == "all") {
      this.users_service.getProducts();
    }
    else {
      this.users_service.getCategoryProducts(category_id);
    }
  }
  sidebar() {
    $('#sidebar').toggleClass('visible');
  }
  delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  addPhoto(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      this.photo = reader.result as string;
    }
  }

  editPhoto(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      this.singlePrd[0].photo = reader.result as string;
    }
  }

  displayProductAddingForm() {
    this.newProductOption = true;
  }

  addProduct() {
    if (!this.title.length || this.category == 0 || !this.photo.length || isNaN(this.price) || this.price < 1) {
      return;
    }

    this.category = Number(this.category);
    this.price = Number(this.price);

    let product = {
      name: this.title,
      category: this.category,
      price: this.price,
      photo: this.photo
    }
    this.users_service.addProduct(product);
    this.title = "";
    this.price = undefined;
    this.photo = "";
    this.category = 0;
  }

  getProductDetails(prdId) {
    this.users_service.getProductDtl(prdId);
  }

  editProduct() {
    this.users_service.editProduct(this.singlePrd[0]);
  }

}
