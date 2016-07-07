/**
 * Created by khalilnajjar on 7/7/16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

var todos = [];
var nextId = 1;

app.get('/', function (req, res) {
   res.send('Express root');
});

app.get('/todos', function(req, res) {
   res.send(todos);
});

app.get('/todos/:id', function (req, res) {
    var todosIp = parseInt(req.params.id, 10);
    var flag = false;
    for (var i = 0; i < todos.length; i++) {
        if(todos[i].id === todosIp) {
            res.json(todos[i]);
            flag = true;
            break;
        }
    } 
    if (flag === false) {
        res.status(404).send();
    }
});

app.post('/todos', function(req, res){
    var body = req.body;
    body.id = nextId++;
    todos.push(body);

    res.json(body);
});

app.listen(port, function (req, res) {
    console.log('Listening on port ' + port );
});