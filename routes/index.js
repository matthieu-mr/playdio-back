var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
var request = require('sync-request');

/* --------------------------------------------------------- */
/* POST sign-in */
router.post('/sign-in', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* POST sign-up */
router.post('/sign-up', async function(req, res, next) {
  
  var user = await userModel.find({email:req.body.email})
  /* if(si l'utisateur n'a pas de compte musique) */
  var newUser = await new userModel({
    firtName: req.body.firtName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  })
  await newUser.save()
  /* else if(l'utisateur a un compte spotify) */
/*   var newUser = await new userModel({
    firtName: req.body.firtName,
    lastName: req.body.name,
    email: req.body.email,
    password: req.body.password,
  })
 */


  /* else if(l'utisateur a un compte deezer) */
  res.json({result:true,dataUser:newUser});
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

