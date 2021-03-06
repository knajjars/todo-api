var bcrypt = require('bcrypt');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
var crypto = require('crypto-js');

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define('users', {
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            allowNull: false,
            type: DataTypes.VIRTUAL,
            validate: {
                len: [7, 20]
            },
            set: function (value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function (user, options) {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function (body) {
                return new Promise(function (resolve, reject) {
                    if (typeof body.email === 'string' && typeof body.password === 'string') {
                        user.findOne({
                            where: {
                                email: body.email
                            }
                        }).then(function (user) {
                            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                                return reject();
                            }
                            resolve(user);
                        }, function () {
                            reject();
                        })
                    }
                });
            },
            findByToken: function (token) {
                return new Promise(function (resolve, reject) {
                    try {
                        var decodedJWT = jwt.verify(token, 'qwert');
                        var bytes = crypto.AES.decrypt(decodedJWT.token, 'abc123');
                        var tokenData = JSON.parse(bytes.toString(crypto.enc.Utf8));
                        user.findById(tokenData.id).then(function (user) {
                            if (user) {
                                resolve(user);
                            } else {
                                reject();
                            }
                        }, function () {
                            reject();
                        })
                    } catch (e) {
                        reject();
                    }
                });
            }

        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            },
            generateToken: function (type) {
                if (!_.isString(type)) {
                    return undefined;
                }
                try {
                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encryptedData = crypto.AES.encrypt(stringData, 'abc123').toString();

                    var token = jwt.sign({
                        token: encryptedData
                    }, 'qwert');

                    return token;

                } catch (e) {
                    console.log(e);
                    return undefined;
                }
            }
        }
    });

    return user;
};