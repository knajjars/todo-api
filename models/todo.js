module.exports = function(sequelize, dataTypes){
    return sequelize.define('todo', {
        description: {
            allowNull: false,
            type: dataTypes.STRING,
            validate: {
                len: [1,250]
            }
        },
        completed: {
            allowNull: false,
            type: dataTypes.BOOLEAN,
            defaultValue: false
        }
    });
};