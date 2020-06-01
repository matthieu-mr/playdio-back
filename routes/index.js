var express = require('express');
var router = express.Router();
var userModel = require('../models/user')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* creation du compte utilisateur */
router.post('/sign-up',async function(req, res, next) {
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
module.exports = router;
