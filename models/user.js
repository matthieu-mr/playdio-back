const mongoose = require('mongoose')
var musicAccounts = mongoose.Schema({
    platfornUserID:String,
    platformURI:String,
})
var notifications = mongoose.Schema({
    date:Date,
    content:Text,
    type:String,
    newField:String,
    userID:[{type:mongoose.Schema.Types.ObjectId, ref:'user'}]
})
var preferences = mongoose.Schema({
    sound:String,
    theme:String
})
const userSchema = mongoose.Schema({
    firtName: String,
    lastName: String,
    email: String,
    password: String,
    avatar:String,
    phoneNumber:Number,
    accountType:String,
    musicAccounts:[musicAccounts],
    notifications:[notifications],
    preferences:[preferences]
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel