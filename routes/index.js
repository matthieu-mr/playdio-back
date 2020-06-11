var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
var radioModel = require('../models/radio')
var request = require('sync-request');
var  btoa  = require ( 'btoa' ) ; 
const variables = require ('../variables');

const client_id = variables.client_id;
const client_secret = variables.client_secret;
const redirect_uri = variables.redirect_uri;


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
  

/* --------------------------------------------------------- */
/* POST sign-in */
router.post('/sign-in',async function(req, res, next) {
  var result = false
  var user = null
  var error = []
  
  if(req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }

  if(error.length == 0){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
      password: req.body.passwordFromFront
    })
    
    if(user){
      result = true
    } else {
      error.push('email ou mot de passe incorrect')
    }
    res.json({result, user, error})
  }


  
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


/* GET search user  */
router.post('/userList',async function(req, res, next) {
  var regex = new RegExp('^'+req.body.firstName+'.*','i')
  var search = await userModel.find({firstName:{$regex: regex}})
/*   var user = await radioModel.find({name:'test'}).populate("userInfo.userID").exec()
  console.log("user[0].userInfo",user[0].userInfo[0].userID.firstName)
  console.log("search",search[0].firstName)
  search = search.filter(elem=>elem._id!=user[0].userInfo[0].userID._id) */
  res.json({userList:search})
});
/* GET  user list playlist  */
router.post('/userListplaylist',async function(req, res, next) {

  var user = await radioModel.find({_id:req.body.playlistID}).populate("userInfo.userID").exec()
  res.json({userList:user[0]})
});
router.post('/userAdmin',async function(req, res, next) {
  await radioModel.updateOne(
    {name:req.body.namePlaylist,
    userInfo:{$elemMatch:{userID: req.body.idUser}}},
    { $set: {"userInfo.$.gradeType": req.body.gradeType}})
  res.json({userList:true})
});
router.post('/deleteUser',async function(req, res, next) {
  var deleteUser = await radioModel.update(
    {name:req.body.namePlaylist},
    {$pull:{userInfo:{_id:req.body.idDelete}}}
    )
  res.json()
});
router.post('/addUser',async function(req, res, next) {

  var addUser = await radioModel.updateOne(
    {_id:req.body.playlistId},
    { $push: {"userInfo":
              {
                userID:req.body.idUser,
                like:0,
                gradeType:"public"
              }}}
    )
  res.json()
});

/* --------------------------------------------------------- */
/* POST radio */
router.post('/radio', async function(req, res, next) {
  var userId = req.body.userId;
  var discoverRadio = await radioModel.find();
  var myRadio = await radioModel.find({userInfo:{$elemMatch:{userID: userId, gradeType:"composer"}}});
  var communityRadio = await radioModel.find({userInfo:{$elemMatch:{userID: userId, gradeType: "bandmaster"||"public"}}});
  res.json({discoverRadio, myRadio, communityRadio})
});


/* --------------------------------------------------------- */
/* POST radio playlist from DB */
router.post('/radio-playlist', async function(req, res, next) {
  var userId = req.body.userId;
  var radioId = req.body.radioId;
  var radio = await radioModel.findOne({_id: radioId})
  res.json(radio)
});



/* --------------------------------------------------------- */
/* GET user playlist */

router.post('/user-playlist', async function(req, res, next) {
    // Matthieu id spotify : "1127664154",
          /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
          var idSpotify = req.body.idSpotify
          /* function qui verrifie si le tocken access et valable */
          await refreshTokens(idSpotify)
          /* recuperation du token access a partir de la bdd */
          const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
          const userAccessToken =  user[0].musicAccounts[0].accessToken
          /* request vers spotify */

      // Matthieu id spotify : "1127664154",
      let userIdSpotify=req.body.idSpotify



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
          var idSpotify = req.body.userId
          /* function qui verrifie si le tocken access et valable */
          await refreshTokens(idSpotify)
          /* recuperation du token access a partir de la bdd */
          const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
          const userAccessToken =  user[0].musicAccounts[0].accessToken
          /* request vers spotify */

  let title = req.body.search_term
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
  

  router.post('/playlist-item',async function(req, res, next) {

    // Matthieu id spotify : "1127664154",
            /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
            var idSpotify = req.body.idSpotify
            /* function qui verrifie si le tocken access et valable */
            await refreshTokens(idSpotify)
            /* recuperation du token access a partir de la bdd */
            const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}})
            const userAccessToken =  user[0].musicAccounts[0].accessToken
            /* request vers spotify */

    let playlist_id = req.body.idPlayslistSpotifyFromFront
  
    var requestPlaylist = request('GET',`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,{
      headers:
          { 
          'Authorization': 'Bearer '+userAccessToken,
          accept: 'application/json' },
        })

      var response = JSON.parse(requestPlaylist.getBody())
      res.json({response})
    });
    




/* --------------------------------------------------------- */
/* POST radio create */
router.post('/radio-create',async function(req, res, next) {

  // Matthieu id spotify : "1127664154",



//console.log("recup du back", req.body.infoplaylist)
let data = req.body.resultat
let datatDecoded = decodeURIComponent(data)
let dataResult = JSON.parse(datatDecoded)

console.log("dataResult : ",dataResult)
var idSpotifyFromBase = await userModel.findOne(
  { email: dataResult.infoUser.email }
  )


console.log("result body ----",dataResult.listMusic[0].image)

let test ="stringAafficher";
let name = dataResult.name


  var newRadio = await new radioModel({
    name: dataResult.name,
    private: dataResult.isPrivate,
    link: test,
    avatar:dataResult.listMusic[0].image,
    livePossible:true,
    tracks:dataResult.listMusic, 
  })
      newRadio.userInfo.push({
        gradeType: "composer",
        like:0,
        userID:idSpotifyFromBase._id
      })
  
 await newRadio.save()


var idRadio = await radioModel.findOne(
  { name: name}, {userInfo:{$elemMatch:{userID: idSpotifyFromBase._id}}}
  )
console.log("id radio --------->",idRadio._id)

res.json({result:true,idRadio:idRadio._id})



console.log(dataResult.name)

//  console.log("retour 2 data",dataResult);

res.json({response:"ok back"})

});



/* --------------------------------------------------------- */
/* Post radio delete */
router.post('/radio-delete', async function(req, res, next) {

  var radioId = req.body.radioId;
  var result = await radioModel.deleteOne({_id: radioId});

  res.json(result)

});


/* --------------------------------------------------------- */
/* PUT radio update */
router.put('/radio-update', function(req, res, next) {
});



/* --------------------------------------------------------- */
/* GET search */
router.get('/search', function(req, res, next) {
});


/* --------------------------------------------------------- */
/* POST playlist in Play screen */
router.post('/play', async function(req, res, next) {





  


  /* idPlaylist posted from Front */ 
  var idPlaylist = req.body.idPlaylist;
  /* idSpotify posted from Front */ 
  var idSpotify = req.body.idSpotify;
  await refreshTokens(idSpotify);
  /* Recuperation of the access token from DB */
  const user = await userModel.find({musicAccounts:{$elemMatch:{platfornUserID: idSpotify}}});
  const userAccessToken =  user[0].musicAccounts[0].accessToken;

  /* Spotify playlist request */
  var requestPlaylist = request('GET',`https://api.spotify.com/v1/playlists/${idPlaylist}/tracks`,{
    headers:
        { 
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+userAccessToken
        }
    }
  )
  var response = JSON.parse(requestPlaylist.getBody())
  res.json({response: response, userAccessToken: userAccessToken})

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
          var idSpotify = 'dimdimou'
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

// ********************************************************************
// TESTS
// ********************************************************************


/* --------------------------------------------------------- */
/* GET test maj de radio */

router.get('/test-update-radio',async function(req, res, next) {
  var radioName = "Radio Marion"

  await radioModel.updateOne(
    {name:radioName},
    {$push: 
      {"tracks": 
        {
          name:"Believe",
          artist:"Cher",
          album:"Believe",
          image:"https://i.scdn.co/image/ab67616d0000b27361c83e0a3e42be611729c840",
          length:239026,
          position: 1,
          isrcID:"GBAHT9803002",
          upcID:null,
          spotifyId:"2goLsvvODILDzeeiT4dAoR",
          href:"https://api.spotify.com/v1/tracks/2goLsvvODILDzeeiT4dAoR",
          externalUrl:"https://open.spotify.com/track/2goLsvvODILDzeeiT4dAoR",
          previewUrl:"https://p.scdn.co/mp3-preview/579967c91dc409b693b9819c12bbba83e4d0f9a4?cid=774b29d4f13844c495f206cafdad9c86",
          uri:"spotify:track:2goLsvvODILDzeeiT4dAoR",
        }
      }
    }
  )

  await radioModel.updateOne(
    {name:radioName},
    {$push: 
      {"tracks": 
        {
          name:"Bohemian Rhapsody - 2011 Mix",
          artist:"Queen",
          album:"A Night At The Opera (2011 Remaster)",
          image:"https://i.scdn.co/image/ab67616d0000b273e319baafd16e84f0408af2a0",
          length:354320,
          position:11,
          isrcID:"GBUM71029604",
          upcID:null,
          spotifyId: "4u7EnebtmKWzUH433cf5Qv",
          href:"https://api.spotify.com/v1/tracks/4u7EnebtmKWzUH433cf5Qv",
          externalUrl:"https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv",
          previewUrl:null,
          uri:"spotify:track:4u7EnebtmKWzUH433cf5Qv",
        }
      }
    }
  )

  await radioModel.updateOne(
    {name:radioName},
    {$push: 
      {"tracks": 
        {
          name:"Like a Virgin",
          artist:"Madonna",
          album:"Like a Virgin (Reissue)",
          image:"https://i.scdn.co/image/ab67616d0000b273e09cc42d97962159cd0ab1e6",
          length:218626,
          position:3,
          isrcID:"USWB10002748",
          upcID:null,
          spotifyId:"1ZPlNanZsJSPK5h9YZZFbZ",
          href:"https://api.spotify.com/v1/tracks/1ZPlNanZsJSPK5h9YZZFbZ",
          externalUrl:"https://open.spotify.com/track/1ZPlNanZsJSPK5h9YZZFbZ",
          previewUrl:"https://p.scdn.co/mp3-preview/693e9d74bf04462da738351385fdc225cc465edc?cid=774b29d4f13844c495f206cafdad9c86",
          uri:"spotify:track:1ZPlNanZsJSPK5h9YZZFbZ",
        }
      }
    }
  )

  res.json({result:true})
});


/* GET test ajout de radio */

router.get('/test-radio-creation',async function(req, res, next) {
  var newRadio = await new radioModel({
    name: "Radio Rock Metal",
    private: true,
    link: "",
    avatar: "http://www.sickandsound.it/wp-content/uploads/2017/10/Rock-and-metal-in-2018.jpg",
    tags: ["ROCK","METAL"],
    livePossible:true,
    livePlaying:true,
  })
  newRadio.userInfo.push({
    gradeType: "bandmaster",
    like:0,
    userID:'5eda3317a70a8042c8814473'
  })
  newRadio.userInfo.push({
    gradeType:"bandmaster",
    like:0,
    userID:'5eda54934b437a052471a86c'
  })
  newRadio.userInfo.push({
    gradeType:"composer",
    like:0,
    userID:'5ee00cc69f32fc0ae27decac'
  })
  newRadio.userInfo.push({
    gradeType:"bandmaster",
    like:0,
    userID:'5ee09f829aba3efe4b68eba4'
  })
  
  await newRadio.save()

  res.json({result:true})
});

/* example de request spotify */

router.get('/exempleRequest',async function(req, res, next) {
  /*information a mettre en dur pour l'instant. il faudra créer un store pour recuperer cette donnée  */
  var idSpotify = 'dimdimou'
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