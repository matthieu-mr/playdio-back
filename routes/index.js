var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
var radioModel = require('../models/radio')
var request = require('sync-request');
/* info compte api spotify */
var client_id = '1284402592a548409fd7d00216992891'; // Your client id
var client_secret = '0f64b6aee3cc41d586ec7515d58d6ab3'; // Your secret
var redirect_uri = 'https://auth.expo.io/@karantass/Playdio'; // Your redirect uri
/* --------------------------------------------------------- */
/* GET/post autorisation/save token Spotify */
router.get('/autorisation',function(req,res,next){
  
res.json({clientId : client_id,redirectURI: redirect_uri})
}) 

router.post('/saveToken',async function(req,res,next){
 /*  var newRefreshToken = await  */
    
    var requestSpotify = request('GET','https://api.spotify.com/v1/me',{
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+req.body.accessToken
      }
    })
    var reponse = JSON.parse(requestSpotify.getBody())
    var user = await userModel.findOne({email: reponse.email})
    console.log(user)

    if(user){
      console.log(1)
      res.json({result:"l'utilisateur existe déjà"})
    }else{
          var newUser = new userModel({
      email: reponse.email
    })
    console.log(newUser)
      newUser.musicAccounts.push({
        platfornUserID:reponse.id,
        platformURI:reponse.uri,
        refreshToken:req.body.refreshToken,
      })
      await newUser.save()
      res.json({result:true,userInfo:newUser})
    }

    
    


  
  }) 
  

/* --------------------------------------------------------- */
/* POST sign-in */
router.post('/sign-in', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* POST sign-up */
<<<<<<< HEAD
router.post('/sign-up',async function(req, res, next) {
  console.log('je suis dans sigu-up')
  console.log(req.body.firstName)
  /* var user = await userModel.find({email:req.body.email}) */
  /* if(!user){ */
      var newUser = await new userModel({
    firstName: req.body.firstName,
=======
router.post('/sign-up', async function(req, res, next) {
  
  var user = await userModel.find({email:req.body.email})
  /* if(si l'utisateur n'a pas de compte musique) */
  var newUser = await new userModel({
    firtName: req.body.firtName,
>>>>>>> d3847c2e27056a98593a769d92ae54d8eba39e3d
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  })
    await newUser.save()
    res.json({result:true,dataUser:newUser});
  /* } */
  res.json({result:false});

  
});

/* --------------------------------------------------------- */
/* GET home page === radio page ? */
router.get('/', function(req, res, next) {
  // Backend affiché sur Heroku
  res.render('index', { title: 'Playdio' });
});

/* --------------------------------------------------------- */
/* GET radio */
router.get('/radio', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* POST radio create */
router.post('/radio-create', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* PUT radio update */
router.put('/radio-update', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* DELETE radio delete */
router.delete('/radio-delete', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* GET search */
router.get('/search', function(req, res, next) {
});


/* --------------------------------------------------------- */
/* GET music play */
router.get('/play', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* GET settings */
router.get('/settings', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* DELETE account */
router.delete('/account-delete', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* GET Soundiiz */
router.get('/soudiiz', function(req, res, next) {

  // req exemple : https://soundiiz.com/v1/openapi/lookup/track/US43C1603405/sources?access_token=48c1c9b73c444307914965a24ffa8c40

  let apiToken ="48c1c9b73c444307914965a24ffa8c40" // token from soundiiz
  
  let isrcTrackToSearch = "US43C1603405" // isrc of the track
  
  let urlSoundiiz ="https://soundiiz.com/v1/openapi/lookup/track/"+isrcTrackToSearch+"/sources?access_token="+apiToken
    let reqSoundiz = request('GET', urlSoundiiz);
    let repSoundiz=JSON.parse(reqSoundiz.getBody()) // ---> request result
    console.log(repSoundiz) // ---> result from the request 

    res.json({ repSoundiz });

});

/* Add soudiiz  */

/* --------------------------------------------------------- */
/* GET Spotify ?? */
router.get('/spotify', function(req, res, next) {
});

module.exports = router;

