var express = require('express')
var bcrypt = require('bcrypt-inzi')
var jwt = require('jsonwebtoken')
var {SERVER_SECRET} = require('../core/index')

var { collageUser } = require('../Mongodb/collections')
console.log(collageUser)


var api = express.Router()



api.post('/signup', (req, res, next) => {
    console.log(req.body.userName)
    console.log(req.body.email)
    console.log(req.body.city)
    console.log(req.body.gender)
    console.log(req.body.role)
    console.log(req.body.password)
    if (!req.body.userName
        || !req.body.email
        || !req.body.password
        || !req.body.gender
        || !req.body.city
        || !req.body.role) {
        res.status(403).send(`
        please send complete information
        e.g:
        {
            "name": "xyz",
            "email": "xyz@gmail.com",
            "password": "1234",
            "phone": "01312314",
            "role" : "company ",
            "city" : "city ",
        }`);
        return
    };

    

    collageUser.findOne({ email: req.body.email }, function (err, data) {



        if (err) {
            console.log(err)
        } else if (!data) {

            bcrypt.stringToHash(req.body.password).then(function (HashPassword) {
                var newUaser = new collageUser({
                    "name": req.body.userName,
                    "email": req.body.email,
                    "password": HashPassword,
                    "role": req.body.role,
                    "gender": req.body.gender,
                    "city": req.body.city
                });

                newUaser.save((err, data) => {
                    if (!err) {
                        res.status(200).send({
                            message: "User created"
                        })
                    } else {
                        console.log(err)
                        res.status(403).send({
                            message: "user already exist"
                        })
                    };

                });

            })


        } else if (err) {
            res.status(500).send({
                message: "db error"
            })
        } else {

            res.status(403).send({
                message: "User already exist"
            })
        }
    })


});

api.post("/login", (req, res, next) => {
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail)
    console.log(userPassword)

    if (!userEmail || !userPassword) {

        res.status(403).send(`
            please send email and passwod in json body.
            e.g:
            {
                "email": "malikasinger@gmail.com",
                "password": "abc",
            }`)
        return;
    }

    collageUser.findOne({ email: userEmail },
        function (err, loginRequestUser) {
            console.log(loginRequestUser)

            if (err) {
                res.status(500).send({
                    message: 'an errer occured'
                })
                console.log(err)
            } else if (loginRequestUser) {

                console.log(loginRequestUser)

                bcrypt.varifyHash(userPassword, loginRequestUser.password).then(match => {

                    if (match) {

                        var token = jwt.sign({
                            name: loginRequestUser.name,
                            email: loginRequestUser.email,
                            phone: loginRequestUser.phone,
                            role: loginRequestUser.role,
                            id: loginRequestUser.id,
                            ip: req.connection.remoteAddress

                        }, SERVER_SECRET);

                        res.cookie('jToken', token, {
                            maxAge: 86_400_000,
                            httpOnly: true
                        });


                        res.status(200).send({
                            message: "login success",

                            loginRequestUser: {
                                name: loginRequestUser.name,
                                email: loginRequestUser.email,
                                phone: loginRequestUser.phone,
                                role: loginRequestUser.role
                            }
                        });

                    } else {
                        console.log('not matched')
                        res.status(404).send({
                            message: "Incorrect password"
                        })
                    }
                }).catch(e => {
                    console.log("errer : ", e)
                })

            } else {
                res.send({
                    message: "User not found",
                    status: 403
                })
            }

        })

})


module.exports = api;