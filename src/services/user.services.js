const UserModel = require("../models/user.models.js");

class UserServices {
    async findByEmail(email) {
        return UserModel.findOne({ email });
    }
}

module.exports = UserServices;
