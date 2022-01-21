const { Schema, model } = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    local: {
        email: String,
        password: String,
    },
    google: {
        id: String,
        name: String,
        email: String
    },
    discord: {
        id: String,
        username: String,
        email: String
    },
    github: {
        id: String,
        username: String,
        email: String
    }
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = model('User', userSchema);