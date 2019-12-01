
const http = require('http');
const url = require('url');
const fs = require('fs');
const formidable = require('formidable');
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const mongourl = 'mongodb+srv://miwa:123@cluster0-26uhj.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';

var restaurant = require('./model/restaurant.js');
var user = require('./model/user.js');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false});

var session = require('cookie-session');
var express = require('express');
app = express();
app.set('trust proxy',1);
app.use(session({
	name: 'session',
	keys: ['key1', 'key2']
}));


//CONECTING DB// APP CONFI
mongoose.connect(mongourl, {useMongoClient: true,});
var db = mongoose.connection;


app.set('view engine', 'ejs');



app.get('/', function(req, res) {
	if (!req.session.authenticated) {
		res.redirect('/login');
	}
	res.redirect('/restaurant');
	
});

//Login
app.get('/login', (req, res) => {
	res.render('login.ejs');
	res.end();
	
});


app.post('/login', urlencodedParser, (req, res) => {
	user.findOne({name:req.body.name}).exec(function (err, userExist) {

		if(userExist){
			if(userExist.name == req.body.name && userExist.password == req.body.password){
				req.session.authenticated = true;
        			req.session.username = userExist.name;
        			res.redirect('/restaurant');
			}else{
        			res.send('The password is incorrect');
				//res.redirect('/');
      			}
		}else{
			res.send('This user does not exist');
			//res.redirect('/');

		}
		if (err) return handleError(err);
	})
});


//Register
app.get('/register', (req, res) => {
	res.render('register.ejs');
	res.end();
	
});

app.post('/register', urlencodedParser, function(req, res) {
	user.findOne({name:req.body.name}).exec(function (err, userExist) {
		if(userExist){
	      		res.send('User exist!')
	    	}else{
	      		var newUser = new user({ name: req.body.name , password: req.body.password});
	      		newUser.save(function (err) {
				if (err) return handleError(err);
				res.send('success');
				res.redirect('login');
	    		})
	  	}
	})
	
});

//Logout
app.get('/logout', (req, res) => {
	res.render('login.ejs');
	res.end();
	req.session = null;
});

//create
app.get('/create', (req, res) => {
	res.render('upload.ejs');
});

//new restaurant
/*
app.post('/create', urlencodedParser, (req, res) => {

	var formidable = require('formidable');
	var form = new formidable.IncomingForm();
	//const db = client.db(dbName);
	form.parse(req, function(err, fields, files) {
		var newRes = {};
		newRes['name'] = fields.name;
		newRes['borough'] = fields.borough ;
		newRes['cuisine'] = fields.cuisine ;
		newRes['street'] = fields.street ;
		newRes['building'] = fields.building ;
		newRes['zipcode'] = fields.zipcode ;
		newRes['corlat'] = fields.corlat ;
		newRes['corlong'] = fields.corlong ;
		newRes['owner'] = req.session.username ;
		if(files.filetoupload){
       			const filename = files.filetoupload.path;
       			let mimetype = "images/jpeg";
       			if (files.filetoupload.type) {
         			mimetype = files.filetoupload.type;
       			}
       			fs.readFile(files.filetoupload.path, (err,data) => {
         		assert.equal(err,null);
         		newRes['photo_mimetype'] = mimetype;
         		newRes['photo'] = new Buffer.from(data).toString('base64');
console.log("PhotoSuccess");
     			})
   		}
		var rest = new restaurant(newRes);
		rest.save(function (err) {
			if (err) return handleError(err);
		      	// saved!
		      	res.send("Success");
		});
	});	
});*/

//new restaurant
app.post('/fileupload', (req,res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    console.log(JSON.stringify(files));
    if (files.filetoupload.size == 0) {
      res.status(500).end("No file uploaded!");  
    }
    let filename = files.filetoupload.path;
    /*if (fields.restaurant_id) {
      var restaurant_id = (fields.restaurant_id.length > 0) ? fields.restaurant_id : "untitled";
      console.log(`restaurant_id = ${restaurant_id}`);
    }*/
    if (fields.restaurant_name) {
      var restaurant_name = (fields.restaurant_name.length > 0) ? fields.restaurant_name : "n/a";
      console.log(`restaurant_name = ${restaurant_name}`);
    }
    if (fields.borough) {
      var borough= (fields.borough.length > 0) ? fields.borough : "n/a";
      console.log(`borough = ${borough}`);
    }
    if (fields.cuisine) {
      var cuisine= (fields.cuisine.length > 0) ? fields.cuisine : "n/a";
      console.log(`cuisine = ${cuisine}`);
    }
    if (fields.street) {
      var street= (fields.street.length > 0) ? fields.street : "n/a";
      console.log(`street = ${street}`);
    }
    if (fields.building) {
      var building= (fields.building.length > 0) ? fields.building : "n/a";
      console.log(`building = ${building}`);
    }
    if (fields.zipcode) {
      var zipcode= (fields.zipcode.length > 0) ? fields.zipcode : "n/a";
      console.log(`zipcode = ${zipcode}`);
    }
    if (fields.lat) {
      var lat= (fields.lat.length > 0) ? fields.lat : "n/a";
      console.log(`lat = ${lat}`);
    }
    if (fields.lon) {
      var lon= (fields.lon.length > 0) ? fields.lon : "n/a";
      console.log(`lon = ${lon}`);
    }
    if (fields.owner) {
      var owner= (fields.owner.length > 0) ? fields.owner : "n/a";
      console.log(`owner = ${owner}`);
    }
    if (files.filetoupload.type) {
      var mimetype = files.filetoupload.type;
      console.log(`mimetype = ${mimetype}`);
    }

    if (!mimetype.match(/^image/)) {
      res.status(500).end("Upload file not image!");
      return;
    }

    fs.readFile(filename, (err,data) => {
      let client = new MongoClient(mongourl);
      client.connect((err) => {
        try {
          assert.equal(err,null);
        } catch (err) {
          res.status(500).end("MongoClient connect() failed!");
        }
        const db = client.db(dbName);
        let new_r = {};
        new_r['name'] = restaurant_name;
	new_r['borough'] = borough;
        new_r['cuisine'] = cuisine;
        new_r['mimetype'] = mimetype;
        new_r['street'] = street;
        new_r['building'] = building;
        new_r['zipcode'] = zipcode;
        new_r['lat'] = lat;
        new_r['lon'] = lon;
        new_r['owner'] = owner;
        new_r['image'] = new Buffer.from(data).toString('base64');
        insertRestaurant(db,new_r,(result) => {
          client.close();
          res.status(200).end('Restaurant was inserted into MongoDB!');
	  res.end('<html><body><a href="/restaurants">Back</a></body></html>')
        });
      });
    });
  });
});


//list restaurants
app.get('/restaurant', (req,res) => {
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    findRestaurant(db,{},(restaurants) => {
      client.close();
      console.log('Disconnected MongoDB');
      res.render("list.ejs",{restaurants:restaurants});
    });
  });
});

const findRestaurant = (db,criteria,callback) => {
  const cursor = db.collection("restaurants").find(criteria);
  let restaurants = [];
  cursor.forEach((doc) => {
    restaurants.push(doc);
  }, (err) => {
    // done or error
    assert.equal(err,null);
    callback(restaurants);
  })
}

function insertRestaurant(db,r,callback) {
  db.collection('restaurants').insertOne(r,function(err,result) {
    assert.equal(err,null);
    console.log("insert was successful!");
    console.log(JSON.stringify(result));
    callback(result);
  });
}

//Display
app.get('/display', (req,res) => {
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }      
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    let criteria = {};
    criteria['_id'] = ObjectID(req.query._id);
    findRestaurant(db,criteria,(restaurants) => {
      client.close();
      console.log('Disconnected MongoDB');
      console.log('Restaurant returned = ' + restaurant.length);
      let image = new Buffer(restaurants[0].image,'base64');     
      console.log(restaurants[0].mimetype);
      if (restaurants[0].mimetype.match(/^image/)) {
        res.render('restaurant.ejs',{restaurants:restaurants});
      } else {
        res.status(500).end("Not JPEG format!!!");  
      }
    });
  });
});

//map
app.get('/map', (req,res) => {
  let client = new MongoClient(mongourl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    let criteria = {};
    criteria['_id'] = ObjectID(req.query._id);
    findRestaurant(db,criteria,(restaurants) => {
      client.close();
      console.log('Disconnected MongoDB');
      console.log('Restaurant returned = ' + restaurants.length);	
	res.render("leaflet.ejs", {restaurants:restaurants});
	res.end(); 
    }); 
 });
});




	
		
	



app.listen(process.env.PORT || 8099);
