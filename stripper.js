const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();

const stripeSecret = process.env.STRIPE_SK;
const stripePublic = process.env.STRIPE_PK;
const stripe = require("stripe")(stripeSecret);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log("Secret key: ", stripeSecret);
console.log("Public key: ", stripePublic);

const chargeWithToken = ({ stripeToken, amount, currency }, done) => {
    console.log("Charging using token " + stripeToken + ".");

    stripe.charges.create({
        amount: amount,
        currency: currency,
        source: stripeToken,
        description: "Charge via token for test@example.com"
    }, done);
};

const chargeWithCardDetails = ({ cardNumber, cvc, expiryMonth, expiryYear, amount, currency }, done) => {
    console.log("Charging using explicit card details.");

    stripe.charges.create({
        source: {
            number: cardNumber,
            cvc: cvc,
            exp_month: expiryMonth,
            exp_year: expiryYear,
        },
        amount: amount,
        currency: currency,
        description: "Charge via card details for test@example.com"
    }, done);
};

const sendTemplate = (relativePath, res) => {
    const templatePath = path.normalize(relativePath);

    fs.readFile(templatePath, { encoding: "utf8"}, (err, content) => {
        if (err) {
            res.send(err);
        } else {
            res.send(content.toString("utf8").replace("STRIPE_PK", stripePublic));
        }
    });
};

app.get('/withtoken', (req, res) => sendTemplate("./public/with-token.html", res));
app.get('/', (req, res) => sendTemplate("./public/with-token.html", res));
app.get('/withcard', (req, res) => sendTemplate("./public/with-card.html", res));

app.post('/charge', (req, res) => {
    const body = req.body;

    console.log("Request body:");
    console.log(body);

    const responseHandler = (err, stripeResponse) => {
        if (err) {
            res.send(err);
        } else {
            res.send({
                request: req.body,
                response: stripeResponse
            });
        }
    };

    if (body.stripeToken) {
        chargeWithToken(body, responseHandler);
    } else {
        chargeWithCardDetails(body, responseHandler);
    }
});

app.listen(3000);