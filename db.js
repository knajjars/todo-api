var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
    sequelize = new Sequelize (process.env.DATABASE_URL, {
        'dialect': 'postgres'
    });
} else if (env === 'development') {
    sequelize = new Sequelize (undefined, undefined, undefined, {
        'dialect' : 'sqlite',
        'storage' : __dirname + '/data/dev-todo-api.sqlite'
    });
}

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;