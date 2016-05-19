const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/charge', function (req, res) {
    console.log("Request body:");
    console.log(req.body);

    const token = req.body.stripeToken;
    const amount = parseFloat(req.body.amount);
    const currency = req.body.currency;

    var stripe = require("stripe")(
        "sk_test_Y1jsEyKcPYWpDRGAVgAs4ksY"
    );

    stripe.charges.create({
        amount: amount,
        currency: currency,
        source: token,
        description: "Charge for test@example.com"
    }, function(err, charge) {
        if (err) {
            res.send(err);
        } else {
            res.send(charge);
        }

    });

});

app.listen(3000);