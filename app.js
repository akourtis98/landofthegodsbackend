const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

const app = express();

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// to connect to db
const db = require("./db");
const collection = "goals";

// just a test
app.get("/url", function(req, res, next) {
    res.json("test successful");
});

// to verify Token
const verifyToken = (req, res, next) => {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }

};

app.post('/login', (req,res) => {
    db.getDB().collection('users').findOne({ uname: req.body.uname}, function(err, user) {
        if(user===null){
            res.end("Login invalid");
        }else if (user.uname === req.body.uname && user.pass === req.body.pass){
            console.log("successful sign in");

            const user = {
                uname: req.body.uname,
                pass: req.body.pass
            };

            jwt.sign({user}, 'secretkey', { expiresIn: '30s' }, (err, token) => {
                res.json({
                    token
                });
            });
        } else {
            console.log("Credentials wrong");
            res.end("Login invalid");
        }
    });
});

// make a user account
app.post("/signup", (req, res, next) => {
    // Document to be inserted
    const userInput = req.body;

    db.getDB().collection("users").insertOne(userInput,(err,result)=>{
        if(err){
            const error = new Error("Failed");
            error.status = 400;
            next(error);
        }
        else
            res.json({msg : "Successful!!!",error : null});
    });
});

// update existing goal
app.post("/updategoal:id", verifyToken, (req, res, next) => {
    res.json({
        stars: req.body.stars,
        updateddesc: req.body.updateddesc
    });
});

// make a new goal
app.post('/makegoal', verifyToken, (req,res,next)=>{
    // Document to be inserted
    const userInput = req.body;

    // use Joi to validate input
    Joi.validate(userInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection("goals").insertOne(userInput,(err,result)=>{
                if(err){
                    const error = new Error("Failed to insert Todo Document");
                    error.status = 400;
                    next(error);
                }
                else
                    res.json({result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error : null});
            });
        }
    });
});

// to get all records from collection 'goals'
app.get('/getgoals', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.end(err);
            res.sendStatus(403);
        } else {
            db.getDB().collection("goals").find({}).toArray((err,goals)=>{
                if(err)
                    console.log(err);
                else{
                    res.json(goals);
                }
            });
        }
    });
});

db.connect((err)=>{
    // If err unable to connect to database
    if(err){
        console.log('unable to connect to database');
        process.exit(1);
    }
    // success connection to database
    else{
        app.listen(3000,()=>{
            console.log('connected to database, app listening on port 3000');
        });
    }
});
