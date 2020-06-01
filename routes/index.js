var express = require('express');
var router = express.Router();
var request = require('sync-request');




/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("hello bibiche")
  res.render('index', { title: 'Express' });
});



router.get('/soudiiz', function(req, res, next) {

// req exemple : https://soundiiz.com/v1/openapi/lookup/track/US43C1603405/sources?access_token=48c1c9b73c444307914965a24ffa8c40
  let apiToken ="48c1c9b73c444307914965a24ffa8c40" // token from soundiiz
  let isrcTrackToSearch = "US43C1603405" // 
  
  let urlSoundiiz ="https://soundiiz.com/v1/openapi/lookup/track/"+isrcTrackToSearch+"/sources?access_token="+apiToken
 

  var reqSoundiz = request('GET', urlSoundiiz);
  let repSoundiz=JSON.parse(reqSoundiz.getBody())
  console.log(repSoundiz)

    res.json({ repSoundiz });

 // res.render('index', { title: 'Express' });
});



/* Add soudiiz  */

module.exports = router;
