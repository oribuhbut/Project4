var express = require('express');
var router = express.Router();
var response = require('./../Modules/response');
var con = require('./../Modules/mySqlCreatePool');

// get cart status

router.get('/cartstatus', function (req, res, next) {
    let id = req.query.id;
    con.query(`SELECT id FROM carts WHERE user_id=${id}`, function (error, result) {
        if (error) {
            response.setResponse(false, "ERROR", error);
            res.json(response.getResponse());
            return;
        }
        if (!result.length) {
            response.setResponse(true, "No carts found", null);
            res.json(response.getResponse());
            return;
        }
        con.query(`SELECT * FROM carts WHERE id NOT IN(SELECT cart_id FROM orders) and user_id=${id}`, function (error, result) {
            if (error) {
                response.setResponse(false, "ERROR", error);
                res.json(response.getResponse());
                return;
            }
            if (result.length < 1) {
                response.setResponse(true, "You have no open carts", null);
                res.json(response.getResponse());
                return;
            }
            response.setResponse(true, "you have open cart", result)
            res.json(response.getResponse());
        })
    })
})

// get products details if you have a open cart

router.get('/opencart', function (req, res, next) {
    let cart_id = req.query.cartId;
    con.query(`SELECT b.name as product_name, b.category_id , b.price , b.photo , a.id as cartProduct_id, a.product_id , a.quantity, a.total_price
            FROM cart_product a JOIN products b ON b.id = a.product_id WHERE cart_id = ${cart_id};`, function (error, result) {
        if (error) {
            response.setResponse(false, "ERROR", error);
            res.json(response.getResponse());
            return;
        }
        response.setResponse(true, "cart products", result);
        res.json(response.getResponse());
    })
})

// get all products

router.get('/products', function (req, res, next) {
    con.query('SELECT * FROM products', function (error, result) {
        if (error) {
            response.setResponse(false, "ERROR", error);
            res.json(response.getResponse());
            return;
        }
        if (result.length < 1) {
            response.setResponse(false, "No Products", null);
            res.json(response.getResponse());
            return;
        }
        response.setResponse(true, "Products List", result);
        res.json(response.getResponse());
    })
})

// get all categories

router.get('/categories', function (req, res, next) {
    con.query('SELECT * FROM categories', function (error, result) {
        if (error) {
            response.setResponse(false, "ERROR", error);
            res.json(response.getResponse());
            return;
        }
        if (result.length < 1) {
            response.setResponse(false, "No Categories", null);
            res.json(response.getResponse());
            return;
        }
        response.setResponse(true, "Categories List", result);
        res.json(response.getResponse());
    })
})

// get products form specific category

router.get('/categoryProducts', function (req, res, next) {
    let category_id = req.query.category_id;
    con.query(`SELECT * FROM products WHERE category_id =${category_id}`, function (error, result) {
        if (error) {
            response.setResponse(false, "ERROR", error);
            res.json(response.getResponse());
            return;
        }
        if (result.length < 1) {
            response.setResponse(true, "No products in this category", null);
            res.json(response.getResponse());
            return;
        }
        response.setResponse(true, "Products", result);
        res.json(response.getResponse());
    })
})

// add new product (admin)

router.put('/product', function (req, res, next) {
    const { name, category, price, photo } = req.body;

    con.query('INSERT INTO products (name, category_id, price, photo) VALUES(?,?,?,?)', [name, category, price, photo], function (error, result) {
        if (error) {
            response.setResponse(false, "Error", error);
            res.json(response.getResponse());
            return;
        }
        response.setResponse(true, "Product added", null);
        res.json(response.getResponse());
    })
})

// get product details (admin)

router.get('/productDetails', function (req, res, next) {
    let prdId = req.query.prdId;
    con.query('SELECT * FROM products WHERE id=?', [prdId], function (error, result) {
        if (error) {
            response.setResponse(false, "Error", error);
            res.json(response.getResponse());
            return;
        }
        response.setResponse(true, "Product Details", result);
        res.json(response.getResponse());
    })
})

// update product (admin)

router.post('/product', function (req, res, next) {
    const { id, name, category_id, price, photo } = req.body;
    con.query('UPDATE products SET name=?, category_id=?, price=?, photo=? WHERE id=?', [name, category_id, price, photo, id], function (error, result) {
        if (error) {
            response.setResponse(false, "Error", error);
            res.json(response.getResponse());
            return;
        }
        response.setResponse(true, "Product Updated", null);
        res.json(response.getResponse());
    })
})

module.exports = router;