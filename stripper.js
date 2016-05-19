const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();

const stripeSecret = process.env.STRIPE_SK;
const stripePublic = process.env.STRIPE_PK;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('public'));

console.log("Secret key: ", stripeSecret);
console.log("Public key: ", stripePublic);

app.get('/', (req, res) => {
    const templatePath = path.normalize("./public/index.html");

    fs.readFile(templatePath, { encoding: "utf8"}, (err, content) => {
        if (err) {
            res.send(err);
        } else {
            res.send(content.toString("utf8").replace("STRIPE_PK", stripePublic));
        }
    });
});

app.post('/charge', (req, res) => {
    console.log("Request body:");
    console.log(req.body);

    const token = req.body.stripeToken;
    const amount = parseInt(req.body.amount);
    const currency = req.body.currency;

    var stripe = require("stripe")(stripeSecret);

    stripe.charges.create({
        amount: amount,
        currency: currency,
        source: token,
        description: "Charge for test@example.com"
    }, function(err, stripeResponse) {
        if (err) {
            res.send(err);
        } else {
            res.send({
                request: req.body,
                response: stripeResponse
            });
        }

    });

});

app.listen(3000);