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
        desc: inp.desc,
        user_id: inp.user_id,
        goal_id: inp.goal_id
    };

    db.getDB().collection("Goals").insertOne(goal,(err,result)=>{
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


// insert new row in daily progress
app.post('/add/daily-progress', verifyToken, (req,res,next)=>{
    // Document to be inserted
    const inp = req.body;

    const daily = {
        rating: inp.rating,
        desc: inp.desc,
        user_id: inp.user_id,
        goal_id: inp.goal_id,
        day: getOnlyDayFromDateData()
    };

    db.getDB().collection("DailyProgress").insertOne(daily,(err,result)=>{
        if(err){
            const error = new Error("Failed");
            error.status = 400;
            next(error);
        }
        else
            res.json({msg : "Successful!!!", error : null, inserted: daily});
    });
});

// insert new row in daily progress
app.post('/add/general-progress', verifyToken, (req,res,next)=>{
    // Document to be inserted
    const inp = req.body;

    const daily = {
        rating: inp.rating,
        title: inp.title,
        user_id: inp.user_id,
        goal_id: inp.goal_id,
        day: getCurrentDayOfGoal()
    };

    db.getDB().collection("DailyProgress").insertOne(daily,(err,result)=>{
        if(err){
            const error = new Error("Failed");
            error.status = 400;
            next(error);
        }
        else
            res.json({msg : "Successful!!!", error : null, inserted: daily});
    });
});

// to edit desc and rating of work session
const updateDailyProgress = () => {
   //  find daily by user_id
   //  make new object with new data
   //  and replace old one with it
   //  make a new goal
   //  app.post('/add/daily-progress', verifyToken, (req,res,next)=>{
   //      // Document to be inserted
   //      const inp = req.body;

   //      const daily = {
   //          rating: inp.rating,
   //          desc: inp.desc,
   //          user_id: inp.user_id,
   //          goal_id: inp.goal_id,
   //          day: getOnlyDayFromDateData()
   //      };

   //      db.getDB().collection("DailyProgress").insertOne(daily,(err,result)=>{
   //          if(err){
   //              const error = new Error("Failed");
   //              error.status = 400;
   //              next(error);
   //          }
   //          else
   //              res.json({msg : "Successful!!!", error : null, inserted: daily});
   //      });
   // });
};

// for when a day passes by
const deleteDailyProgress = () => {
    // reset daily
    // for when user loses, their data gets reset
    // delete all records from general progress collection
    // get all records from general progress table
    app.get('/delete/daily-progress', verifyToken, (req, res) => {
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            if(err) {
                res.end(err);
                res.sendStatus(403);
            } else {
                db.getDB().collection("DailyProgress").deleteMany({});
            };
        });
    });

};

// for when user loses, their data gets reset
// delete all records from general progress collection
// get all records from general progress table
app.get('/delete/general-progress', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.end(err);
            res.sendStatus(403);
        } else {
            db.getDB().collection("GeneralProgress").deleteMany({});
        };
    });
});

// get all records from general progress table
app.get('/get/general-progress', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err) {
            res.end(err);
            res.sendStatus(403);
        } else {
            db.getDB().collection("GeneralProgress").find({}).toArray((err,goal)=>{
                if(err)
                    console.log(err);
                else{
                    res.json(goals);
                }
            });
        }
    });
});

const updateGeneralProgress = () => {
    // take from daily progress and insert it to general and reset daily
};

const getDateData = () => {
    return new Date(year, month, day);
};

const getOnlyDayFromDateData = () => {
    return new Date(day);
};

const setCurrentDayOfGoal = () => {
    day =+ 1;
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
