const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

function jwtGen(user_id){
    const payload = {
        user: user_id,
        jti: uuidv4()
    };
    return jwt.sign(payload, process.env.SECRET, {expiresIn: "10m" })
}

module.exports = jwtGen;