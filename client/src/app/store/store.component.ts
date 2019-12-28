import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import * as $ from 'jquery';
import { Router } from '@angular/router';


@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  CurrentUser = [];
  cartProducts = [];
  cartDetails = {};
  totalPrice = 0;
  Categories = [];
  Products = [];
  search = "";
  searchInCart = "";
  showSpinner = false;
  selectedProductId: number;
  selectedProductPrice: number;
  selectedProductQty: number;
  selectedCartProductId: number;
  city = "";
  street = "";
  allOrdersDates = [];
  shippingDate = null;
  credit_card = "";
  orderValid = null;
  orderMessage = "";
  constructor(private users_service: UsersService, private router: Router) { }

  ngOnInit() {
    this.users_service.getCategories();
    this.users_service.getProducts();
    this.users_service.checkSession();
    this.users_service.currentUser.subscribe(data => this.CurrentUser = data);
    this.users_service.openCartDetails.subscribe(data => this.cartDetails = data);
    this.users_service.cartProductsList.subscribe((data) => { this.cartProducts = data; this.totalPriceUpdate() });
    this.users_service.CategoriesList.subscribe(data => this.Categories = data);
    this.users_service.ProductsListObserve.subscribe(data => this.Products = data);
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

  totalPriceUpdate() {
    this.totalPrice = 0;
    if (this.cartProducts.length) {
      for (let i = 0; i < this.cartProducts.length; i++) {
        this.totalPrice += this.cartProducts[i].quantity * this.cartProducts[i].price;
      }
    }
  }

  delay(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  setItemInModal(product_id, product_price) {
    this.selectedCartProductId = undefined;
    this.selectedProductId = product_id;
    this.selectedProductPrice = product_price;
    if (!this.cartProducts.length) {
      this.selectedProductQty = 0;
      return;
    }
    for (let i = 0; i < this.cartProducts.length; i++) {
      if (this.cartProducts[i].product_id == product_id) {
        this.selectedProductQty = this.cartProducts[i].quantity;
        this.selectedCartProductId = this.cartProducts[i].cartProduct_id;
        return;
      }
      if (i == this.cartProducts.length - 1 && this.cartProducts[i].product_id != product_id) {
        this.selectedProductQty = 0;
        return;
      }
    }
  }

  increaseQuantity() {
    this.selectedProductQty++;
  }

  reduceQuantity() {
    if (this.selectedProductQty == 0) {
      return;
    }
    this.selectedProductQty--;
  }

  saveProduct() {
    console.log(this.cartDetails ,"cart details");
    console.log(this.selectedProductId ,"selectedProductId");
    console.log(this.selectedProductQty ,"selectedProductQty");
    console.log(this.selectedProductPrice ,"selectedProductPrice");
    console.log(this.selectedCartProductId ,"selectedCartProductId");
    this.users_service.updateProductInCart(this.cartDetails, this.selectedProductId, this.selectedProductQty, this.selectedProductPrice, this.selectedCartProductId);
  }

  removePrtFromCrt(cartProduct_id) {
    this.users_service.deletePrtFromCrt(cartProduct_id, this.cartDetails);
  }

  async fillOrderDtl() {
    await this.getAllOrdersDates();
    this.sidebar();
    if (!this.cartProducts.length) {
      return;
    }
  }

  dblClickTrigger(e) {
    this[e.target.name] = this.CurrentUser[e.target.name]
  }

  getAllOrdersDates() {
    this.allOrdersDates = [];
    return new Promise((resolve, reject) => {
      fetch("http://localhost:3000/users/orders")
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (res.data.length) {
            var filterDates = res.data.map(x => x.shipping_date);
            for (let i = 0; i < filterDates.length; i++) {
              let parseDate = new Date(filterDates[i]);
              let newDate = parseDate.getFullYear() + '-' + (parseDate.getMonth() + 1) + '-' + parseDate.getDate();
              this.allOrdersDates.push(newDate)
            }
            resolve(true);
          }
          resolve(false);
        })
        .catch((error) => {
          reject(error);
        })
    });
  }

  placeOrder() {
    this.orderMessage = "";
    this.orderValid = null;
    if (!this.city.length || !this.street.length || !this.credit_card.length || !this.shippingDate.length) {
      this.orderValid = false;
      this.orderMessage = "Fill All The Fields";
      return;
    }
    let counter = 0;
    for (let i = 0; i < this.allOrdersDates.length; i++) {
      if (this.shippingDate == this.allOrdersDates[i]) {
        counter++
      }
      if (counter == 3) {
        this.orderValid = false;
        this.orderMessage = "Max Shipping Orders For This Date";
        return;
      }
    }
    let visaRegex = /^(\d{4}-){3}\d{4}$|^(\d{4} ){3}\d{4}$|^\d{16}$/;
    if (!this.credit_card.match(visaRegex)) {
      this.orderValid = false;
      this.orderMessage = "Invalid credit card (format 4-4-4-4)";
      return;
    }
    this.orderValid = true;
    this.users_service.Order(this.CurrentUser,
      this.cartDetails,
      this.totalPrice,
      this.city, this.street,
      this.shippingDate, this.credit_card);
  }

  updateSearchValue(e) {
    this[e.target.name] = e.target.value;
  }

  download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadOrderTxt() {
    var text = `\r Hello and Thank you for your Order in Software Solutions! \r , your order will arrive at ${this.shippingDate}. total-price: ${this.totalPrice}\r`;
    var filename = "Order.txt";
    this.download(filename, text);
  }

  returnToHomePage() {
    window.location.href = "http://localhost:4200/homepage";
  }
}
