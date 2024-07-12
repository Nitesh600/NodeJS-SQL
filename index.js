const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const { render } = require('ejs');
const methodOverride = require("method-override");
const { connect } = require('http2');
const { v4: uuidv4 } = require("uuid");


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'X_user',
  password: "Nitesh@3925"
});
 

// let getRandomUser = ()=> {
//   return [
//     faker.string.uuid(),
//     faker.internet.userName(),
//     faker.internet.email(),
//     faker.internet.password(),
//   ]
// };

// let q = "INSERT INTO temp (id, username,email,password) VALUES ?";

// let data = [];
// for(i = 1; i <= 100; i++) {
//   data.push(getRandomUser());
// }

// try{
//   connection.query(q, [data],(err,result)=>{
//     if(err) throw err;    
//     console.log(result)
//   });
// }catch(err){
//   console.log(err);
// }

// connection.end();


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine", "views");
app.set("views", path.join(__dirname, "/views"));




app.get("/", (req,res)=>{
  let q = `SELECT count(*) FROM temp`;
  try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    let count = result[0]["count(*)"];
    res.render("home.ejs", {count});
  });
  }catch(err){
    console.log(err);
    res.send("some error in DB");
  }
});
app.get("/user", (req,res)=>{
   let q = "SELECT * FROM temp";
   try{
    connection.query(q,(err,users)=>{
      if(err) throw err;
      res.render("user.ejs", {users});
    });
    }catch(err){
      console.log(err);
      res.send("some error in DB");
    }
  });

  app.get("/user/:id/edit", (req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM temp WHERE id = '${id}'`;
    try{
  connection.query(q,(err,result)=>{
    let user = result[0];
    if(err) throw err;
    res.render("edit.ejs", {user});
    
  });
  }catch(err){
    console.log(err);
    res.send("some error in DB");
  }
   });

   app.patch("/user/:id", (req,res)=>{
    let {id} = req.params;
    let {password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM temp WHERE id = '${id}'`;
    try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    let user = result[0];
    if(formPass == ""){
      res.send("Please Enter Password to Delete User");
    } else if(formPass != user.password){
      res.send("WRONG Password"); 
    }else{
      let q2 = `UPDATE temp SET username = '${newUsername}' WHERE id = '${id}' `;
      connection.query(q2, (err, result)=>{
        if(err) throw err;
        res.redirect("/user");
      });
    }
       
  });
  }catch(err){
    console.log(err);
    res.send("some error in DB");
  }
   });

   app.post("/user/new", (req, res) => {
    let { username, email, password } = req.body;
    let id = uuidv4();
    res.render("new.ejs" );
    //Query to Insert New User
    let q = `INSERT INTO temp (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
    
    try {
      connection.query(q, (err, result) => {
         if (err) throw err;
        console.log("added new user");
        
      });
    } catch (err) {
      res.send("some error occurred");
      res.redirect("/user");
    }
  });
  
  app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM temp WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });
  
  app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM temp WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
  
        if (user.password != password) {
          res.send("WRONG Password entered!");
        } else {
          let q2 = `DELETE FROM temp WHERE id='${id}'`; //Query to Delete
          connection.query(q2, (err, result) => {
            if (err) throw err;
            else {
              console.log(result);
              console.log("deleted!");
              res.redirect("/user");
            }
          });
        }
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });

app.listen(port, ()=>{
  console.log(`app is listening to the port ${port}`);
});



