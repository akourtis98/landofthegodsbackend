const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

ObjectId = require('mongodb').ObjectID;

const app = express();

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// to connect to db
const db = require("./db");
// const collection = "goals";

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

// delete goal by id route
app.delete('/delete/goal/:id', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        db.getDB().collection('goals').deleteOne({_id: ObjectId(req.params.id)});
    });
    if(!err){
        res.json("successsful deletion");
    }else{
        res.json(err);
    }
});

// login and give bearer token
app.post('/login', (req,res) => {
    db.getDB().collection('users').findOne({ email: req.body.email}, function(err, user) {
        if(user===null){
            res.end("Login invalid");
        }else if (user.email === req.body.email && user.pass === req.body.pass){

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
app.post("/add/user", (req, res, next) => {
    const inp = req.body;

    const user = {
        uname: inp.uname,
        pass: inp.pass,
        email: inp.email,
        fname: inp.fname,
        lname: inp.lname
    };

    db.getDB().collection("users").insertOne(user,(err,result)=>{
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
app.post("/update/goal:id", verifyToken, (req, res, next) => {
    res.json({
        stars: req.body.stars,
        updateddesc: req.body.updateddesc
    });
});

// make a new goal
app.post('/add/goal', verifyToken, (req,res,next)=>{
    // Document to be inserted
    const inp = req.body;

    const goal = {
        title: inp.title,
        desc: inp.desc
    };

    db.getDB().collection("goals").insertOne(goal,(err,result)=>{
        if(err){
            const error = new Error("Failed");
            error.status = 400;
            next(error);
        }
        else
            res.json({msg : "Successful!!!",error : null});
    });
});

// to get all records from collection 'goals'
app.get('/get/goals', verifyToken, (req, res) => {
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

const updateTime = () => {};

const addRating = () => {};

const updateUserProgress = () => {};

const regX = () => {};

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
