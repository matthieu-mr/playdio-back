var mongoose = require('mongoose');

var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology : true
}
mongoose.connect('mongodb+srv://admin:0000@clusterplaydio-eykl6.azure.mongodb.net/dev?retryWrites=true&w=majority',
    options,         
    function(err) {
    console.log(err);
    }
);

module.exports = mongoose;