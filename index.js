const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express().use(body_parser.json());



const token = process.env.TOKEN;  //not token from get
const mytoken = process.env.MYTOKEN;

app.listen(8000 || process.env.PORT, () => {
    console.log("webhook is listening");
});

app.get("/webhook", (req, res) => {

    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];


    if (mode && token) {

        if (mode == "subscribe" && token == mytoken) {
            res.status(200).send(challenge);
        }

        else {
            res.status(403);
        }

    }

});

app.post("/webhook", (req, res) => {


    let body_param = req.body;

    console.log(JSON.stringify(body_param, null, 2));

    var phone_number_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
    var from = body_param.entry[0].changes[0].value.messages[0].from;
    var msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;


    if (body_param.object) {

        if (

            body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0] &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0] &&
            body_param.entry[0].changes[0].value.messages[0].text

        ) {

            console.log(from);
            console.log(msg_body);

            axios({
                method: "POST",
                url: "https://graph.facebook.com/v15.0/" + phone_number_id + "/messages?access_token=" + token,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: "Hi ..I have received your message: " + msg_body
                    }
                },
                headers: { "Content-Type": "application/json" },
            });


        }


        else if (

            body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0] &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0] &&
            body_param.entry[0].changes[0].value.messages[0].button

        ) {
            let button = body_param.entry[0].changes[0].value.messages[0].button.payload;
            console.log(button);

            if (button === 'Yes-Button-Payload') {
                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v15.0/" + phone_number_id + "/messages?access_token=" + token,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        text: {
                            body: "Great..looking forward on seeing you for the interview!!"
                        }
                    },
                    headers: { "Content-Type": "application/json" },
                });
            }
            else if (button === 'No-Button-Payload') {
                axios({
                    method: "POST",
                    url: "https://graph.facebook.com/v15.0/" + phone_number_id + "/messages?access_token=" + token,
                    data: {
                        messaging_product: "whatsapp",
                        to: from,
                        text: {
                            body: "We will send you a new timeslot in a while"
                        }
                    },
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        res.sendStatus(200);

    }
    else {
        res.sendStatus(404);
    }
});

app.get("/", (req, res) => {

    res.status(200).send("Webhook setup");

})

