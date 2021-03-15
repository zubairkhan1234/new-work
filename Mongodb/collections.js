

var mongoose = require('mongoose')


var dbURI = "mongodb+srv://zubairabc:zubairabc@cluster0.j83vk.mongodb.net/testdatabase?retryWrites=true&w=majority"

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.connection.on('connected', function () {
    console.log("Mongoose is connected")

})

mongoose.connection.on('disconnected', function () {
    console.log("mongoose is disconnected")
    process.exit(1)
})


mongoose.connection.on('error', function (err) {
    console.log('mongoose connecion is in error: ', err)
    process.exit(1)

})

mongoose.connection.on('SIGNIT', function () {
    console.log('app is turminating')
    mongoose.connection.close(function () {
        console.log('mongoose default connection is closed')
        process(0)
    })


})


var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    createdOn: { type: String, "default": Date.now }
})

var collageUser = mongoose.model('collageUser', userSchema)


module.exports = {
    collageUser: collageUser
}