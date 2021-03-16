var express = require('express')
var morgan = require('morgan')
var cors = require('cors')
var bodyParser = require('body-parser')
var path = require('path')
var jwt = require('jsonwebtoken')
var serverRoutes = require("./serverRoutes/auth")
const cookieParser = require('cookie-parser')
var PORT = process.env.PORT || 8000
var {SERVER_SECRET} = require('./core/index')


var app = express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use('/', express.static(path.resolve(path.join(__dirname, "public"))))
app.use('/', serverRoutes)
app.use(cookieParser())




app.use(function (req, res, next) {
    console.log('cookie', req.cookies)

    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    console.log("Asign value of token  " , req.cookies.jToken)

    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        console.log("decodedData .................>>>>>>>>>>  " , decodedData)
        if (!err) {
            const issueDate = decodedData.iat * 1000
            const nowDate = new Date().getTime()
            const diff = nowDate - issueDate

            if (diff > 300000) {
                res.status(401).send('Token Expired')

            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                    role: decodedData.role
                }, SERVER_SECRET)
                
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                })
                req.body.jToken = decodedData
                req.headers.jToken = decodedData
                next()
            }
        } else {
            res.status(401).send('invalid Token')
        }

    });

})


app.listen(PORT, () => {
    console.log('server is running on Port ', PORT)
})
