var exp = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");

var app = exp();

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(exp.json());

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nomadstribe_db",
});

// get users data
app.get("/users", (req, res) => {
  connection.connect((err) => {
    connection.query("select * from users", (err, result, fields) => {
      res.json(result);
    });
  });
});

app.get("/users/:id", (req, res) => {
  connection.connect((err) => {
    connection.query(
      "select * from users where id=" + req.params.id,
      (err, result, fields) => {
        res.json(result);
      }
    );
  });
});

// get user detail using Email
// app.get("/users/:email", (req, res) =>{

//     connection.connect((err)=>{
//         connection.query("select * from users where email="+req.params.email, (err, result, fields)=>{

//             res.json(result);
//         })
//     });
// });

// get user by email
app.get("/users/email/:email", (req, res) => {
  const userEmail = req.params.email;
  const query = "SELECT * FROM users WHERE email = ?";
  connection.query(query, [userEmail], (err, result) => {
    res.json(result);
   
  });
});

// check email and password
app.post("/usersVerification", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  const query = "SELECT * FROM users WHERE email=? AND password=?";
  connection.query(query, [userEmail, userPassword], (err, result) => {
    if (err) {
      console.error(`Database error: ${err}`);
      return res.json({ msg: "Database error" });
    }

    if (result.length === 0) {
      return res.json({ msg: "NotFound" });
    }
    res.json({ msg: "OK" });
  });
});

// insert user data
app.post("/users", (req, res) => {
  connection.connect((err) => {
    const { first_name, last_name, email, password, photo } = req.body;
    const query =
      "INSERT INTO users (first_name, last_name, email, password, photo) VALUES (?, ?, ?, ?, ?)";
    connection.query(
      query,
      [first_name, last_name, email, password, photo],
      (err, result) => {
        if (err) {
          res.json({ status: "Error" });
        } else {
          res.json({ status: "OK" });
        }
      }
    );
  });
});

// get trips data
app.get("/trips", (req, res) => {
  connection.connect((err) => {
    connection.query("select * from trips", (err, result, fields) => {
      res.json(result);
    });
  });
});

// insert trip data
app.post("/trips", (req, res) => {
  connection.connect((err) => {
    const { title, destination, highlights, tags, cost } = req.body;
    const query =
      "INSERT INTO trips(title, destination, highlights, tags, cost) VALUES (?, ?, ?, ?, ?)";
    connection.query(
      query,
      [title, destination, highlights, tags, cost],
      (err, result) => {
        if (err) {
          res.json({ status: "Error" });
        } else {
          res.json({ status: "OK" });
        }
      }
    );
  });
});

// GET last trip for trip_id

app.get("/lastTripID", (req, res)=>{
    connection.connect((err)=>
    {
        connection.query("SELECT trip_id FROM trips ORDER BY trip_id DESC LIMIT 1", (err, result, fields)=>{
            res.json(result);
        });
    });
});

// GET trip photos

app.get("/tripPhotos", (req, res) => {
  connection.connect((err) => {
    connection.query("select * from  trip_photos", (err, result, fields) => {
      res.json(result);
    });
  });
});

// GET photo by trip id

app.get("/getPhotos/:trip_id", (req, res) => {
    connection.connect((err)=>{
        connection.query("SELECT * FROM trip_photos WHERE trip_id="+req.params.trip_id,(err, result, fields) => {

            if (err) {
                console.log(err);
            } else {
                
                res.json(result);
            }
          });
    });
})

// insert photos of trip

app.post("/tripPhotos", (req, res) => {
  connection.connect((err) => {
    const {trip_id, images } = req.body;
    const query = "INSERT INTO trip_photos(trip_id,images) VALUES (?, ?)";

    connection.query(query, [trip_id, images], (err, result) => {
      if (err) {
        res.json({ status: "Image: Error" });
      } else {
        res.json({ status: "Image: OK" });
      }
    });
  });
});

// RIGHT JOIN of trips and trip images

app.get("/getTripData", (req, res) => {
    connection.connect((err)=>{
        connection.query("SELECT trips.trip_id,trips.title,trips.destination,trips.highlights,trips.tags,trips.cost, trip_photos.images FROM trips RIGHT JOIN trip_photos ON trips.trip_id = trip_photos.trip_id",(err, result, fields) => {

            if (err) {
                console.log(err);
            } else {
                
                res.json(result);
            }
          });
    });
})

app.get("/getTripData/:trip_id", (req, res) => {
    connection.connect((err)=>{
        connection.query("SELECT trips.trip_id,trips.title,trips.destination,trips.highlights,trips.tags,trips.cost, trip_photos.images FROM trips RIGHT JOIN trip_photos ON trips.trip_id = trip_photos.trip_id WHERE trips.trip_id="+req.params.trip_id,(err, result, fields) => {
            if (err) {
                console.log(err);
            } else {
                
                res.json(result);
            }
          });
    });
})

// DisplayTrip
app.get("/displayTrip/:trip_id", (req, res) => {
    connection.connect((err)=>{
        connection.query("SELECT trips.trip_id,trips.title,trips.destination,trips.highlights,trips.tags,trips.cost, trip_photos.images, trip_hotels.hotel_name, trip_hotels.hotel_cost, trip_schedule.day, trip_schedule.day_info FROM trips RIGHT JOIN trip_photos ON trips.trip_id = trip_photos.trip_id RIGHT JOIN trip_hotels ON trips.trip_id = trip_hotels.trip_id RIGHT JOIN trip_schedule ON trips.trip_id = trip_schedule.trip_id WHERE trips.trip_id="+req.params.trip_id,(err, result, fields) => {
            if (err) {
                console.log(err);
            } else {
                
                res.json(result);
            }
          });
    });
})

// GET days shedules
app.get("/tripDays/:trip_id",(req, res)=> {
  connection.connect((err)=>{
    connection.query("SELECT day, day_info FROM trip_schedule WHERE trip_id="+req.params.trip_id, (err, result, fields)=>{

      if(err){
        console.log(err);
      }
      else{
        res.json(result);
      }
    })
  })
})

// GET Hotels
app.get("/tripHotels/:trip_id",(req, res)=> {
  connection.connect((err)=>{
    connection.query("SELECT hotel_name, hotel_cost FROM trip_hotels WHERE trip_id="+req.params.trip_id, (err, result, fields)=>{

      if(err){
        console.log(err);
      }
      else{
        res.json(result);
      }
    })
  })
})


// GET trip Hotels
app.get("/tripHotels", (req, res) => {
    connection.connect((err) => {
      connection.query("select * from  trip_hotels", (err, result, fields) => {
        res.json(result);
      });
    });
  });

// POST trip hotels
app.post("/tripHotels", (req, res) => {
    connection.connect((err) => {
      const {trip_id, hotel_name, hotel_cost } = req.body;
      const query = "INSERT INTO trip_hotels(trip_id, hotel_name, hotel_cost) VALUES (?,?,?)";
  
      connection.query(query, [trip_id, hotel_name, hotel_cost], (err, result) => {
        if (err) {
          res.json({ status: "Hotel: Error" });
          console.log(err);
        } else {
          res.json({ status: "Hotel: OK" });
        }
      });
    });
  });

  // GET days
  app.get("/tripDays", (req, res) => {
    connection.connect((err) => {
      connection.query("select * from  trip_schedule", (err, result, fields) => {
        res.json(result);
      });
    });
  });

  // POST days
  app.post("/tripDays", (req, res) => {
    connection.connect((err) => {
      const {trip_id, day, day_info } = req.body;
      const query = "INSERT INTO trip_schedule(trip_id, day, day_info) VALUES (?,?,?)";
  
      connection.query(query, [trip_id, day, day_info], (err, result) => {
        if (err) {
          res.json({ status: "Day: Error" });
          console.log(err);
        } else {
          res.json({ status: "Day: OK" });
        }
      });
    });
  });


app.listen(process.env.PORT || 2009);
