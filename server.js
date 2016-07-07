/**
 * Created by khalilnajjar on 7/7/16.
 */
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

var todos = [
    {
        description: 'Buy milk',
        completed: false,
        id: 1
    },{
        description: 'Lunch with mom',
        completed: false,
        id: 2
    }, {
        description: 'Learn NodeJS',
        completed: true,
        id: 3
    }
]

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

app.listen(port, function (req, res) {
    console.log('Listening on port ' + port );
});