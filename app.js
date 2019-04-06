const express = require("express");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

ObjectId = require('mongodb').ObjectID;

const app = express();

let day; // this will hold the days passed working towards your goal

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

// to connect to db
const db = require("./db");
// const collection = "goals";

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
        db.getDB().collection('Goals').deleteOne({_id: ObjectId(req.params.id)});
    });
    if(!err){
        res.json("successsful deletion");
    }else{
        res.json(err);
    }
});

// login and give bearer token
app.post('/login', (req,res) => {
    db.getDB().collection('Users').findOne({ email: req.body.email}, function(err, user) {
        if(user===null){
            res.json({error: "Login invalid"});
        }else if (user.email === req.body.email && user.pass === req.body.pass){
            jwt.sign({user}, 'secretkey', { expiresIn: '30s' }, (err, token) => {
                res.json({token});
            });
        } else {
            console.log("Credentials wrong");
            res.json({error: "Login invalid"});
        }
    });
});

// make a user account
app.post("/add/user", (req, res) => {
    const inp = req.body; 

    const user = {
        uname: inp.uname,
        pass: inp.pass,
        email: inp.email,
        fname: inp.fname,
        lname: inp.lname
    };

    db.getDB().collection("Users").insertOne(user,(err,result)=>{
        if(err){
            console.log("there is an error: + err");
        }
        else
            res.json({msg : "Great!"});
    });
});

// make a new goal
app.post('/update/goal', verifyToken, (req,res,next)=>{
    // Document to be inserted
    const inp = req.body;

    const goal = {
        title: inp.title,
        desc: inp.desc,
        user_id: inp.emai
    };

    // check if it already exists to replace with new one, if it doesnt make new
    // one:
    db.getDB().collection("Goals").insertOne(goal,(err,result)=>{
        if(err){
            console.log(err);
        }
        else
            res.json({msg : "Successful!"});
    });
});

// to get all records from collection 'goals'
app.get('/get/goals', verifyToken, (req, res) => {
            db.getDB().collection("Goals").find({}).toArray((err, goals)=>{
                if(err)
                    console.log(err);
                else{
                    res.json(goals);
                }
            });
});


// insert new row in daily progress
app.post('/update/progress', verifyToken, (req,res,next)=>{
    // Document to be inserted
    const inp = req.body;

    const progress = {
        rating: inp.rating,
        desc: inp.desc,
        user_id: inp.user_id,
        goal_id: inp.goal_id,
        type: req.type
//      day: getOnlyDayFromDateData()
    };

    //check if daily already exists and if it does replace it, else:
    db.getDB().collection("Progress").insertOne(progress,(err,result)=>{
        if(err){
            console.log(err);
        }
        else
            res.json({msg : "Successful!!!", error : null, inserted: daily});
    });
});


// for when a day passes by
const updateProgress = () => {
    // reset daily
    // for when user loses, their data gets reset
    // delete all records from general progress collection
    // get all records from general progress table
    app.get('/delete/daily-progress', verifyToken, (req, res) => {
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            if(err) {
                console.log(err);
            } else {
                db.getDB().collection("Progress").deleteMany({});
            };
        });
    });
};

// for when user loses, their data gets reset
// delete all records from general progress collection
// get all records from general progress table
app.get('/delete/progress', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            console.log(err);
        } else {
            db.getDB().collection("Progress").deleteMany({});
        };
    });
});

// get all records from general progress table (later specify for user)
app.get('/get/progress', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            console.log(err);
        res.sendStatus(403);
        } else {
            db.getDB().collection("Progress").find({}).toArray((err,goal)=>{
                if(err)
                    console.log(err);
                else{
                    res.json(goals);
                }
            });
        }
    });
});

const getDate = () => {
    return new Date(year, month, day);
};

const getDay = () => {
    return new Date(day);
};

// 24h counter
const hoursCounter = () => {
    // once it returns true (which is every 24 hours)
    // once it completes call setCurrentDayOfGoal()
};

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
