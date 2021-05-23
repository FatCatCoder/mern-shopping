const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.js');
const argon2 = require('argon2');
const base64url = require('base64url');
const redis = require("redis");
const redisClient = redis.createClient();
const jwtGen = require('../../utils/jwtGen');
const auth = require('../../utils/validate');

// middleware //

// blacklist middleware
function blacklistCheck(req, res, next){
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    const decoded = jwt.verify(tokenSplit[1], process.env.SECRET);

    redisClient.get(tokenSplit[1], (error, data) => {
        if(error){
            return res.status(403).send({ error });
        }
        else if(data){
            console.log('you are blacklisted', data)
            return res.status(403).send({ error });
        }
        else if(!data){
            return next();
        }
        
    });
}




// Routes //

// Login
router.post('/login', async (req, res) =>{
    try{
        // destructure
        const {name, password} = req.body;

        // find if user exists
        const user = await User.findOne({ name: name });

        if(!user){
            return res.status(401).json({error: "Username or Password Incorrect"})
        }

        // check pwd 
        const validatePwd = await argon2.verify(user.password, password);

        if(!validatePwd){
            return res.status(401).json({error: "Username or Password Incorrect"})
        }

        // give gen token and return it
        const token = 'Bearer ' + jwtGen(user._id);
        res.set('Authorization', token).send();
        //res.status(200).json({token});
    }
    catch(error){
      console.log(error.message);
    }
})

// Register
router.post('/register', async (req, res) =>{
    try{
        // destructure
        const {email, name, password} = req.body;

        // find if user exists
        const user = await User.findOne({ email: email, name: name });
        if(user){
            return res.status(401).json({error: "Email is already in Use"})
        }
        else if(user){
            return res.status(401).json({error: "Username is already in Use"})
        }
        // hash pwd and save user to db
        const hash = await argon2.hash(password, {type: argon2.argon2id});
        const newUser = new User({email: email, name: name, password: hash})
        await newUser.save()

        // gen token and return it
        const token = 'Bearer ' + jwtGen(newUser._id);
        res.set('Authorization', token).send();
        //res.status(200).json({token})
    }
    catch(error){
      console.log(error.message);
    }
    
})

// logout
router.post('/logout', (req, res) => {
    // get token and get user id
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    const decoded = jwt.verify(tokenSplit[1], process.env.SECRET);

    const EXP = decoded.exp - Math.floor(new Date().getTime()/1000.0)

    redisClient.setex(tokenSplit[1], EXP, decoded.jti, (error, data) => {
        if(error){
            console.log(error, data);
            res.send({error});
        }
    })
    
    
    /*
    redisClient.get(decoded.user, (error, data) => {
        console.log(data);
        if(error){
            res.send({error})
        }
        else if(data !== null){
            const parsedData = JSON.parse(data);
            parsedData[decoded.user].push(tokenSplit[1]);
            redisClient.setex(decoded.user, decoded.exp - Math.floor(new Date().getTime()/1000.0), JSON.stringify(parsedData));
            return res.status(200).send({"message": "Logout successful"});
        }
        const blacklistData = {
            [decoded.user]: [token],
        }
        const parsedData =JSON.parse(data);
        parsedData[decoded.user].push(tokenSplit[1]);
        redisClient.setex(decoded.user, decoded.exp - Math.floor(new Date().getTime()/1000.0), JSON.stringify(parsedData));
        return res.status(200).send({"message": "Logout successful"})
    })
    */

    res.json({"message": "logged out"});
})

// verify

router.get('/verify', blacklistCheck, passport.authenticate('jwt', {session: false}), (req, res, next) => {
    try{
        res.json({isVerified: true});
    }
    catch(error){
        console.log(error.message);
        res.status(500).send("server error");
    }
})

router.get('/ttl', (req, res) => {
    const token = req.headers.authorization;
    const tokenSplit = token.split(' ');
    const decoded = jwt.verify(tokenSplit[1], process.env.SECRET);

    redisClient.ttl(tokenSplit[1], (err, reply) =>{
        console.log(reply);
    });
})



module.exports = router;