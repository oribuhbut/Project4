import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private url = "http://localhost:3000/";

  private User = new BehaviorSubject(null);
  currentUser = this.User.asObservable();
  private openCart = new BehaviorSubject(null);
  openCartDetails = this.openCart.asObservable();
  private cartProducts = new BehaviorSubject([]);
  cartProductsList = this.cartProducts.asObservable();
  private userOrders = new BehaviorSubject([]);
  userOrdersList = this.userOrders.asObservable();
  private clients = new BehaviorSubject("");
  numberOfClients = this.clients.asObservable();
  private products = new BehaviorSubject("");
  numberOfProducts = this.products.asObservable();
  private orders = new BehaviorSubject("");
  numberOfOrders = this.orders.asObservable();
  private Categories = new BehaviorSubject([]);
  CategoriesList = this.Categories.asObservable();
  private ProductsList = new BehaviorSubject([]);
  ProductsListObserve = this.ProductsList.asObservable();
  private singlePrd = new BehaviorSubject(null);
  singlePrdDtl = this.singlePrd.asObservable();

  constructor(
    private router: Router
  ) { }

  // register to database + adding jwt token to localstorage + navigation to homepage if its successfully

  register(newUser) {
    fetch(this.url + "users", {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          localStorage.setItem("token", res.data[0].token);
          this.router.navigate(['/homepage']);
          return;
        }
      })
      .catch((err) => {
        return err;
      })
  }

  // async login function to check if user is correctly logged-in and display more details, or show an error message instead

  async login(userData) {
    return new Promise((resolve, reject) => {
      fetch(this.url + "users/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (res.success) {
            localStorage.setItem("token", res.data[0].token);
            this.User.next(res.data[0]);
            resolve(res.success);
          }
          resolve(res.success);
        })
        .catch((err) => {
          reject(err);
        })
    })
  }

  // get user last order date 

  getLastOrder(user_id) {
    fetch(this.url + `users/userorders/?user_id=${user_id}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        //parsing the last order date from sql

        let parseDate = new Date(res.data[res.data.length - 1].order_date);
        let newDate = parseDate.getDate() + '/' + (parseDate.getMonth() + 1) + '/' + parseDate.getFullYear();
        res.data[res.data.length - 1].order_date = newDate;
        this.userOrders.next(res.data);
      })
      .catch((error) => {
        return error;
      })

  }

  // async function to check on registration if user picked an identity number that already exist on database

  checkIfIdIExist(id) {
    return new Promise((resolve, reject) => {
      fetch(this.url + `users/getId/?id=${id}`)
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          resolve(res.success);
          return;
        })
        .catch((err) => {
          reject(err);
        })
    })
  }

  // check if the session expired and the token is not valid anymore

  checkSession() {
    let token = localStorage.getItem("token");
    fetch(this.url + `users/session/?token=${token}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (!res.success) {
          localStorage.clear();
        }
        if (!res.success && this.router.url != "/homepage") {
          this.router.navigate(['/homepage'])
        }
        else {
          this.getLastOrder(res.data[0].id);
          this.checkRole(res.data[0].role);
          this.User.next(res.data[0]);
          this.getOpenedCart(res.data[0].id);
        }
      })
      .catch((err) => {
        return err;
      })
  }

  // check a role in case user without admin role trying to get in admin route

  checkRole(role) {
    if (this.router.url == "/admin" && role == 1) {
      this.router.navigate(['homepage']);
    }
  }

  // get the total number of clients for displaying on the homepage "Callout"

  getClientsCount() {
    fetch(this.url + "users/clients")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          this.clients.next(res.data.length);
        }
        else {
          this.clients.next("0");
        }
      })
      .catch((err) => {
        return err;
      })
  }

  // get the total number of products for displaying on the homepage "Callout"  

  getProductsCount() {
    fetch(this.url + "users/products")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          this.products.next(res.data.length);
        }
        else {
          this.products.next("0");
        }
      })
      .catch((err) => {
        return err;
      })
  }

  // get the total number of orders for displaying on the homepage "Callout"

  getOrdersCount() {
    fetch(this.url + "users/orders")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          this.orders.next(res.data.length);
        }
        else {
          this.orders.next("0");
        }
      })
      .catch((err) => {
        return err;
      })
  }

  // get incompleted shopping cart

  getOpenedCart(id) {
    fetch(this.url + `store/cartstatus/?id=${id}`)
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        if (res.data.length) {
          let parseDate = new Date(res.data[0].creation_date);
          let newDate = parseDate.getDate() + '/' + (parseDate.getMonth() + 1) + '/' + parseDate.getFullYear();
          res.data[0].creation_date = newDate;
          this.openCart.next(res.data[0]);
          this.getAllCartDetails(res.data[0].id);
        }
      })
      .catch((error) => {
        return error;
      })
  }

  //get the products from the incompleted cart

  getAllCartDetails(cartId) {
    fetch(this.url + `store/opencart/?cartId=${cartId}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.cartProducts.next(res.data);
      })
      .catch((error) => {
        return error;
      })
  }

  // add New Cart If user enter to the store without one

  addNewCart(user_id) {
    let obj = {
      user_id: user_id
    }
    fetch(this.url + 'users/cart', {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        return error;
      })
  }

  // get all products

  getProducts() {
    fetch(this.url + 'store/products')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          this.ProductsList.next(res.data);
        }
      })
      .catch((error) => {
        return error;
      })
  }

  // get all categories

  getCategories() {
    fetch(this.url + 'store/categories')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          this.Categories.next(res.data);
        }
      })
      .catch((error) => {
        return error;
      })
  }

  // get products from specific category for the sorting method in store page

  getCategoryProducts(category_id) {
    fetch(this.url + `store/categoryProducts/?category_id=${category_id}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          this.ProductsList.next(res.data);
        }
      })
      .catch((error) => {
        return error;
      })
  }

  // add new product 

  addProduct(product) {
    fetch(this.url + 'store/product', {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.getProducts();
      })
      .catch((error) => {
        return error;
      })
  }

  // update cart changes

  updateProductInCart(cart, product_id, quantity, price, cartProduct_id) {
    let obj = {
      cart_id: cart.id,
      product_id: product_id,
      quantity: quantity,
      price: price,
      cartProduct_id: cartProduct_id
    }
    fetch(this.url + 'users/updateCart', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.getAllCartDetails(cart.id);
      })
      .catch((error) => {
        return error;
      })
  }

  //delete product from cart

  deletePrtFromCrt(cartProduct_id, cart) {
    let obj = {
      cartPrtId: cartProduct_id
    }
    fetch(this.url + 'users/cart/product', {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.getAllCartDetails(cart.id);
      })
      .catch((error) => {
        return error;
      })
  }

  // get product details for edit in admin route

  getProductDtl(prdId) {
    fetch(this.url + `store/productDetails/?prdId=${prdId}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.singlePrd.next(res.data);
      })
      .catch((error) => {
        return error;
      })
  }

  // update product in admin route

  editProduct(product) {
    fetch(this.url + 'store/product', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.getProducts();
      })
      .catch((error) => {
        return error;
      })
  }

  // set new order

  Order(user, cart, total, city, street, shipping_date, credit_number) {
    let orderObj = {
      user_id: user.id,
      cart_id: cart.id,
      total: total,
      city: city,
      street: street,
      shipping_date: shipping_date,
      credit_number: credit_number
    };
    fetch(this.url + 'users/order', {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderObj)
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log(res);
      })
      .then((error) => {
        return error;
      })
  }
}
