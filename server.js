/**
 * Created by khalilnajjar on 7/7/16.
 */
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
   res.send('Express root');
});

app.listen(port, function (req, res) {
    console.log('Listening on port ' + port );
})