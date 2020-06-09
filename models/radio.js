const mongoose = require('mongoose')

var userInfo = mongoose.Schema({
    gradeType:String,
    like:Number,
    userID:{type:mongoose.Schema.Types.ObjectId, ref:'user'}
})
var tracks = mongoose.Schema({
    platformTrackID:String,
    name:String,
    artist:String,
    lenght:Number,
    position:Number,
    isrcID:String,
    upcID:String,
    userID:{type:mongoose.Schema.Types.ObjectId, ref:'user'}
})
var chat = mongoose.Schema({
    time:Date,
    text:String,
    userID:{type:mongoose.Schema.Types.ObjectId, ref:'user'}
})
const radioSchema = mongoose.Schema({
    name: String,
    private: Boolean,
    link: String,
    tags: Array,
    avatar:String,
    livePossible:Boolean,
    livePlaying:Boolean,
    userInfo:[userInfo],
    tracks:[tracks],
    chat:[chat]
})

const radioModel = mongoose.model('radio', radioSchema)

module.exports = radioModel