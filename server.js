/**
 * Created by khalilnajjar on 7/7/16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require("underscore");
var db = require('./db');
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

var todos = [];
var nextId = 1;

app.get('/', function (req, res) {
    res.send('Express root');
});

app.get('/todos', function (req, res) {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed')) {
        where.completed = JSON.parse(query.completed);
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }
    console.log(where);
    db.todo.findAll({ where: where }).then(function (todos) {
        res.json(todos);
    }, function (err) {
        res.status(500).send(err);
    });
});

app.get('/todos/:id', function (req, res) {

    var todosId = parseInt(req.params.id, 10);

    db.todo.findById(todosId).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).json('IP not found');
        }
    }, function (err) {
        res.status(500).json(err);
    })

});

app.post('/todos', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function (todo) {
        res.json(todo.toJSON());
    }, function (err) {
        res.status(500).json(err);
    })


});

app.delete('/todos/:id', function (req, res) {
    var todosIp = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todosIp });
    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).json({ "error": "no id found" });
    }
});

app.put('/todos/:id', function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todosIp = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, { id: todosIp });
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }
    ;

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description.trim();
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }
    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});

db.sequelize.sync().then(function () {
    app.listen(port, function (req, res) {
        console.log('Listening on port ' + port);
    });
});
