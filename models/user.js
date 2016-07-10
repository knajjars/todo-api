module.exports = function(sequelize, DataTypes) {
    return sequelize.define('users', {
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING,
            validate: {
                len: [7,20]
            }
        }
    });
}