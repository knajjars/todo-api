/**
 * Created by khalilnajjar on 7/7/16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require("underscore");

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
    var matchedTodo = _.findWhere(todos, {id: todosIp});
    if(matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.post('/todos', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');
    body.description = body.description.trim();
    if ( !_.isString(body.description) || !_.isBoolean(body.completed) || body.description.length === 0) {
        return res.status(400).send();
    }

    body.id = nextId++;
    todos.push(body);

    res.json(body);
});

app.delete('/todos/:id', function(req, res) {
    var todosIp = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos, {id: todosIp});
    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).json({"error":"no id found"});
    }
});

app.put('/todos/:id', function(req, res){
    var body = _.pick(req.body, 'description', 'completed');
    var todosIp = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos,{ id: todosIp});
    var validAttributes = {};

    if(!matchedTodo){
        return res.status(404).send();
    }

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed;
    } else if(body.hasOwnProperty('completed')) {
        return res.status(400).send();
    };

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description.trim();
    } else if(body.hasOwnProperty('description')){
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});

app.listen(port, function (req, res) {
    console.log('Listening on port ' + port );
});