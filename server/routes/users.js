var express = require('express');
var router = express.Router();
var response = require('./../Modules/response');
var con = require('./../Modules/mySqlCreatePool');
var jwt = require('jsonwebtoken');
var secret = "d19db8e3262fdad5d222ca4701602fcee1564432300";


//session
router.get('/session', function (req, res, next) {
  let decoded;
  try {
    decoded = jwt.verify(req.query.token, secret);
    con.query(`SELECT * FROM users WHERE identity='${decoded.data.identity}'`, function (error, result) {
      if (error) {
        response.setResponse(false, "Error", error);
        res.json(response.getResponse());
        return;
      }
      response.setResponse(true, "Success", result);
      res.json(response.getResponse());
      return;
    })
  } catch (err) {
    response.setResponse(false, "Session Off", null);
    res.json(response.getResponse());
    return;
  }
});

//register
router.put('/', function (req, res, next) {
  const { name, identity, password, city, street, email } = req.body;
  con.query('INSERT INTO users (name, identity, email, password, city, street) VALUES(?,?,?,?,?,?)', [name, identity, email, password, city, street,], function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    con.query('SELECT * FROM users WHERE identity=?', [identity], function (error, result) {
      if (error) {
        response.setResponse(false, "Error", error);
        res.json(response.getResponse());
        return;
      }
      try {
        let jwtData = {
          name: name,
          identity: identity
        };
        decoded = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 2),
          data: jwtData
        }, secret);
        result[0].token = decoded;
        response.setResponse(true, "Success", result);
        res.json(response.getResponse());
        return;
      } catch (err) {
        response.setResponse(false, "Error", err);
        res.json(response.getResponse());
        return;
      }
    })
  })
})

//check identity uniqueness
router.get('/getId', function (req, res, next) {
  var identity = req.query.id;
  con.query('SELECT * FROM users WHERE identity=?', [identity], function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    if (result.length > 0) {
      response.setResponse(false, "identity already exist", null);
      res.json(response.getResponse());
      return;
    }
    response.setResponse(true, "Success", null);
    res.json(response.getResponse());
  })
})

//login
router.post('/login', function (req, res, next) {
  let decoded;
  const { email, password } = req.body;
  con.query('SELECT * FROM users WHERE email=? and password=?', [email, password], function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    if (result.length < 1) {
      response.setResponse(false, "user name or password incorrect");
      res.json(response.getResponse());
      return;
    }
    try {
      let jwtData = {
        name: result[0].name,
        identity: result[0].identity
      };
      decoded = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 2),
        data: jwtData
      }, secret);

      result[0].token = decoded;
      response.setResponse(true, "Success", result);
      res.json(response.getResponse());
      return;
    } catch (err) {
      response.setResponse(false, "Error", err);
      res.json(response.getResponse());
      return;
    }
  })
})

//get all clients
router.get('/clients', function (req, res, next) {
  con.query('SELECT * FROM users WHERE role > 0', function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    if (!result.length) {
      response.setResponse(false, "No Clients", null);
      res.json(response.getResponse());
      return;
    }
    response.setResponse(true, "Success", result);
    res.json(response.getResponse());
    return;
  })
})

//get all products
router.get('/products', function (req, res, next) {
  con.query('SELECT * FROM products', function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    if (!result.length) {
      response.setResponse(false, "No Products", null);
      res.json(response.getResponse());
      return;
    }
    response.setResponse(true, "Success", result);
    res.json(response.getResponse());
    return;
  })
})

//get all orders
router.get('/orders', function (req, res, next) {
  con.query('SELECT * FROM orders', function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    if (!result.length) {
      response.setResponse(false, "No Orders", result);
      res.json(response.getResponse());
      return;
    }
    response.setResponse(true, "Orders List", result);
    res.json(response.getResponse());
    return;
  })
})

// add new cart for the user

router.put('/cart', function (req, res, next) {
  const { user_id } = req.body;
  con.query('INSERT INTO carts (user_id, creation_date) VALUES(?,curdate())', [user_id], function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    response.setResponse(true, "Cart added", null);
    res.json(response.getResponse());
  })
})

// get all user orders

router.get('/userorders', function (req, res, next) {
  let user_id = req.query.user_id;

  con.query('SELECT * FROM orders WHERE user_id=?', [user_id], function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    response.setResponse(true, "User Orders", result);
    res.json(response.getResponse());
    return;
  })
})

// update cart 

router.post('/updateCart', function (req, res, next) {
  const { cart_id, product_id, quantity, price, cartProduct_id } = req.body;
  if (quantity == 0) {
    con.query('DELETE FROM cart_product WHERE product_id=? and cart_id=?', [product_id, cart_id], function (error, result) {
      if (error) {
        response.setResponse(false, "Error", error);
        res.json(response.getResponse());
        return;
      }
      response.setResponse(true, "Item Deleted From Cart", null);
      res.json(response.getResponse());
      return;
    })
    return;
  }
  if (cartProduct_id === undefined) {
    con.query(`INSERT INTO cart_product (product_id, quantity, total_price, cart_id) VALUES(${product_id},${quantity},${quantity * price},${cart_id})`,
      function (error, result) {
        if (error) {
          response.setResponse(false, "Error", error);
          res.json(response.getResponse());
          return;
        }
        response.setResponse(true, "Item Added To Cart", null);
        res.json(response.getResponse());
        return
      })
  }
  else {
    con.query('UPDATE cart_product SET quantity=?, total_price=? WHERE cart_id=? and product_id=?', [quantity, quantity * price, cart_id, product_id], function (error, result) {
      if (error) {
        response.setResponse(false, "Error", error);
        res.json(response.getResponse());
        return;
      }
      response.setResponse(true, "Item Updated In Cart", null);
      res.json(response.getResponse());
      return
    })
  }
})

// delete product from cart

router.delete('/cart/product', function (req, res, next) {
  const { cartPrtId } = req.body;
  con.query('DELETE FROM cart_product WHERE id=?', [cartPrtId], function (error, result) {
    if (error) {
      response.setResponse(false, "Error", error);
      res.json(response.getResponse());
      return;
    }
    response.setResponse(true, "Product Deleted From Cart", null);
    res.json(response.getResponse());
    return
  })
})

// place order

router.put('/order', function (req, res, next) {

  const { user_id, cart_id, total, city, street, shipping_date, credit_number } = req.body;
  con.query(`INSERT INTO orders (user_id, cart_id, total, city, street, order_date, shipping_date, credit_number)
              VALUES(?,?,?,?,?,curdate(),?,?)`, [user_id, cart_id, total, city, street, shipping_date, credit_number],
    function (error, result) {
      if (error) {
        response.setResponse(false, "Error", error);
        res.json(response.getResponse());
        return;
      }
      response.setResponse(true, "Order Placed", result);
      res.json(response.getResponse());
      return
    });
})

module.exports = router;
