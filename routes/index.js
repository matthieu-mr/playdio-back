var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
var radioModel = require('../models/radio')
var request = require('sync-request');
var  btoa  = require ( 'btoa' ) ; 
/* info compte api spotify */

/* Matthieu
  var client_id = '2a968ca9d4494feaabb6ef9bbdf6c33a'; // Your client id
  var client_secret = '7b8f199f21fb46129da726817a65ece9'; // Your secret
  var redirect_uri = 'https://auth.expo.io/@matthieumr/Playdio'; // Your redirect uri
 */

/* Ben 
var client_id = '1284402592a548409fd7d00216992891'; // Your client id
var client_secret = '0f64b6aee3cc41d586ec7515d58d6ab3'; // Your secret
var redirect_uri = 'https://auth.expo.io/@karantass/Playdio'; // Your redirect uri
 */

/* Marion
var client_id = 'a4468fd654fa4ee49b7a21052e9ae4c0'; // Your client id
var client_secret = 'e26ed95f1d5e43cc8f0eaf161e96bc69'; // Your secret
var redirect_uri = 'https://auth.expo.io/@mariont/Playdio'; // Your redirect uri
*/

var client_id = '1284402592a548409fd7d00216992891'; // Your client id
var client_secret = '0f64b6aee3cc41d586ec7515d58d6ab3'; // Your secret
var redirect_uri = 'https://auth.expo.io/@karantass/Playdio'; // Your redirect uri

/* --------------------------------------------------------- */
/* Gestion API Spotify */
/* function pour refresh les tokens */
async function refreshTokens(idSpotify) {
  const credsB64 = btoa(`${client_id}:${client_secret}`);
  const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
  const refreshToken = user[0].musicAccounts[0].refreshToken
  var requestSpotify = request('POST','https://accounts.spotify.com/api/token',{
    headers:{
      'Authorization': `Basic ${credsB64}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body:`grant_type=refresh_token&refresh_token=${refreshToken}`
  })
  var newToken = JSON.parse(requestSpotify.getBody())
  await userModel.updateOne(
    {musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}},
    { $set: {"musicAccounts.$.accessToken": newToken.access_token}}
  )
}


/* connection Spotify  */
router.get('/autorisation',function(req,res,next){
res.json({clientId : client_id,redirectURI: redirect_uri,clientSecret:client_secret})
}) 
/* recuperation information user + token */
router.post('/saveToken',async function(req,res,next){
    var requestSpotify = request('GET','https://api.spotify.com/v1/me',{
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+req.body.accessToken
      }
    })
    var reponse = JSON.parse(requestSpotify.getBody())
    var user = await userModel.findOne({email: reponse.email})
    if(user){
      res.json({result:"l'utilisateur existe déjà"})
    }else{
          var newUser = new userModel({
      email: reponse.email
    })
      newUser.musicAccounts.push({
        platfornUserID:reponse.id,
        platformURI:reponse.uri,
        refreshToken:req.body.refreshToken,
        accessToken:req.body.accessToken,
        namePlatform:'spotify'
      })
      await newUser.save()
      res.json({result:true,userInfo:newUser})
    }
  }) 
  
    /* example de request spotify */
    router.get('/exempleRequest',async function(req, res, next) {
      /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
      var idSpotify = 'x7kmell0jps7njqebispe817j'
      /* info dynamique que la requette a besoin */
      var artist = "Audioslave"
      var typeInfo = "track"
      /* function qui verrifie si le tocken access et valable */
      await refreshTokens(idSpotify)
      /* recuperation du token access a partir de la bdd */
      const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
      const userAccessToken =  user[0].musicAccounts[0].accessToken
      /* request vers spotify */
      var requestSpotify = request('GET','https://api.spotify.com/v1/search?q='+artist+'&type='+typeInfo,{
        headers:{
          'Authorization': 'Bearer '+userAccessToken,
        },
      })
      var response = JSON.parse(requestSpotify.getBody())
      /* renvoi du json vers le front */
      res.json({result:response})
    });
/* --------------------------------------------------------- */
/* POST sign-in */
router.post('/sign-in', function(req, res, next) {
});

/* --------------------------------------------------------- */
/* POST sign-up */
router.post('/sign-up', async function(req, res, next) {
  var user = await userModel.find({email:req.body.email})
  if(user.length > 0){
    await userModel.updateMany(
      {email: req.body.email},
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      }
    )
    var update = await userModel.find({email:req.body.email})
    res.json({result:update})
  }else{
    var newUser = await new userModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    })
      await newUser.save()
      res.json({result:true,dataUser:newUser});
  }
});
/* recuperation donnée pour le sign-up */
router.post('/infoSignUp',async function(req,res,next){
  var user = await userModel.find({email:req.body.email})
  res.json({infoUser:user})
})
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
/* GET user playlist */

router.get('/user-playlist', async function(req, res, next) {
    // Matthieu id spotify : "1127664154",
          /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
          var idSpotify = 'x7kmell0jps7njqebispe817j'
          /* function qui verrifie si le tocken access et valable */
          await refreshTokens(idSpotify)
          /* recuperation du token access a partir de la bdd */
          const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
          const userAccessToken =  user[0].musicAccounts[0].accessToken
          /* request vers spotify */


      // Matthieu id spotify : "1127664154",
      let userIdSpotify=1127664154

      var requestPlaylist = request('GET',`https://api.spotify.com/v1/users/${userIdSpotify}/playlists`,{
        headers:
            {
            'Authorization': 'Bearer '+userAccessToken,
             },
          })
        var response = JSON.parse(requestPlaylist.getBody())

  res.json({response})
});

/* --------------------------------------------------------- */
/* GET Spotify Search */

router.post('/user-search',async function(req, res, next) {

  // Matthieu id spotify : "1127664154",
          /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
          var idSpotify = 'x7kmell0jps7njqebispe817j'
          /* function qui verrifie si le tocken access et valable */
          await refreshTokens(idSpotify)
          /* recuperation du token access a partir de la bdd */
          const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
          const userAccessToken =  user[0].musicAccounts[0].accessToken
          /* request vers spotify */

  let title = "penitencier"

  var requestPlaylist = request('GET',`https://api.spotify.com/v1/search?q=${title}&type=track`,{
    headers:
        { 
        'postman-token': '7df9b449-eb44-a946-dace-115e5ca76d41',
        'cache-control': 'no-cache',
        'Authorization': 'Bearer '+userAccessToken,
        'content-type': 'application/json',
        accept: 'application/json' },
      })
    var response = JSON.parse(requestPlaylist.getBody())
    res.json({response})
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


/* --------------------------------------------------------- */
/* GET Spotify ?? */
router.post('/spotify-isrc', async function(req, res, next) {

  let isrc = "US43C1603405"
          /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
          var idSpotify = 'x7kmell0jps7njqebispe817j'
          /* function qui verrifie si le tocken access et valable */
          await refreshTokens(idSpotify)
          /* recuperation du token access a partir de la bdd */
          const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
          const userAccessToken =  user[0].musicAccounts[0].accessToken
          /* request vers spotify */

  var requestPlaylist = request('GET',`https://api.spotify.com/v1/search?q=isrc:${isrc}&type=track`,{
    headers:
        { 
        'postman-token': '7df9b449-eb44-a946-dace-115e5ca76d41',
        'cache-control': 'no-cache',
        'Authorization': 'Bearer '+userAccessToken,
        'content-type': 'application/json',
        accept: 'application/json' },
      })
    var response = JSON.parse(requestPlaylist.getBody())
    res.json({response})

});

module.exports = router;

