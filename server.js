/**
 * Created by khalilnajjar on 7/7/16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var _ = require("underscore");
var db = require('./db');
var middleware = require('./middleware')(db);

var port = process.env.PORT || 3000;


app.use(bodyParser.json());

var todos = [];

app.get('/', function (req, res) {
    res.send('Express root');
});

app.get('/todos', middleware.requireAuthentication, function (req, res) {
    var query = req.query;

    var where = {
        userId: req.user.get('id')
    };

    if (query.hasOwnProperty('completed')) {
        where.completed = JSON.parse(query.completed);
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }
    db.todo.findAll({where: where}).then(function (todos) {
        res.json(todos);
    }, function (err) {
        res.status(500).send(err);
    });
});

app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {

    var todosId = parseInt(req.params.id, 10);

    db.todo.findOne({
        where: {
            id: todosId,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).json('IP not found');
        }
    }, function (err) {
        res.status(500).json(err);
    })

});

app.post('/todos', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function (todo) {
        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo) {
            res.json(todo.toJSON());
        });
    }, function (e) {
        res.status(400).json(e);
    });


});

app.post('/user', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (user) {
        res.json(user.toPublicJSON());
    }, function (err) {
        res.status(400).json(err);
    })
});

app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todosId = parseInt(req.params.id, 10);
    db.todo.findOne({
        where: {
            id: todosId,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if (todo) {
            db.todo.destroy({
                where: {
                    id: todosId
                }
            });
            res.status(204).send();
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    });
});

app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'completed', 'description');
    var todosId = parseInt(req.params.id, 10);
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findOne({
        where: {
            id: todosId,
            userId: req.user.get('id')
        }
    }).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (err) {
                res.status(400).json(err);
            })
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    })
});

app.post('/user/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function (user) {

        var token = user.generateToken('authentication');
        userInstance = user;

        return db.token.create({
            token: token
        })
    }).then(function (tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function () {
        res.status(401).send();
    });
});

app.delete('/user/login', middleware.requireAuthentication, function(req, res) {
   req.token.destroy().then(function(){
       res.status(204).send();
   }).catch(function(){
       res.status(500).send();
   })
});


db.sequelize.sync({force: true}).then(function () {
    app.listen(port, function (req, res) {
        console.log('Listening on port ' + port);
    });
});
