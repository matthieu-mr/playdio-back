const mongoose = require('mongoose')
var musicAccounts = mongoose.Schema({
    platfornUserID:String,
    platformURI:String,
    refreshToken:String,
    accessToken:String,
    namePlatform:String,
})
var notifications = mongoose.Schema({
    date:Date,
    content:String,
    type:String,
    newField:String,
    userID:{type:mongoose.Schema.Types.ObjectId, ref:'user'}
})
var preferences = mongoose.Schema({
    sound:String,
    theme:String
})
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    avatar: String,
    phoneNumber:Number,
    accountType:String,
    musicAccounts:[musicAccounts],
    notifications:[notifications],
    preferences:[preferences]
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel