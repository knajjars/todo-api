var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/sql-example.sqlite'
});

var Todo = sequelize.define('todos', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 120]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
});

sequelize.sync().then(function () {
    Todo.findOne({
        where: {
            id: 12
        }
    }).then(function(todo){
        if(todo){
            console.log(todo.toJSON());
        } else {
            console.log('Todo not found');
        }
    }).catch(function(err){
        console.log(err);
    });
    Todo.create({
        description: 'Walk my pig',
        completed: true
    }).catch(function (err) {
        console.log(err);
    });
});