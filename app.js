//jshint esversion:6


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const { Console, log } = require("console");
const _ = require('lodash');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/todoListDB", { useNewUrlParser: true });
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

console.log(process.env.MONGODB_URI);

console.log("Database Connected on glitch");

const itemsSchema = {
  task: String
};
const Item = mongoose.model(
  "Item",
  itemsSchema
);

const task1 = new Item({
  task: "Go Swiming"
});
const task2 = new Item({
  task: "Go Gym"
});
const task3 = new Item({
  task: "Relax "
});

const defaultItems = [task1, task2, task3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};
const List = mongoose.model(
  "List",
  listSchema
);

const day = date.getDate();

app.get("/", function (req, res) {

  
  Item.find({})
    .then(function (items) {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved defult items to DB");
            res.redirect("/")
          })
          .catch(function (err) {
            console.log(err.message);
          });
      }else{
        res.render("list", { listTitle: day, newListItems: items });
      }
      
    })
    .catch(function (err) {
      console.log(err.message);
      console.log("err");
    });
 
});


app.get('/todolist/:customListName', function(req, res) {
  const customListName = _.kebabCase(_.toLower(req.params.customListName));
  List.findOne({ name: customListName })
  .then(function (found) {
    if(!found){
      
      //Create a new list
      const newListStart = new Item({
        task: "Welcome to your "+ customListName + " list"
      });
      const list = new List({
      name: customListName,
      items: newListStart
      })
      console.log("Welcome to your "+ customListName + " list")
      list.save();
      res.redirect("/todolist/" + customListName);
      
    }else{
      //show existing list
      const newListName = _.replace(_.startCase(found.name), /-/g, ' ');
      res.render("list", { listTitle: newListName, newListItems: found.items });
    } 
    
  })
  .catch(function (err) {
    console.log(err.message);
  });
    
  
});




app.post("/", function (req, res) { 
 
  const taskName = req.body.newItem; 
  const listName = req.body.list; 

  let newtask = new Item({
    task: taskName 
  });
  if(listName === day ){
    newtask.save();
    res.redirect("/");
  }else{
    const _listName = _.toLower(listName);
    List.findOne({ name: _listName })
      .then(function (found) {
        if (found) {
          found.items.push(newtask);
          found.save();
          res.redirect("/todolist/" + _listName);
        } else {
          console.log(`List ${_listName} not found`);
          res.redirect("/");
        }
      })
      .catch(function (err) {
        console.log(err.message);
        res.redirect("/");
      });
  }
});

app.post("/delete", function (req, res) { 
  
  const checkboxValue = req.body.checkbox;
  const checkboxValuesArr = checkboxValue.split(/\s+/); // split the value by space
  const itemId = checkboxValuesArr[0];
  const listTitle = checkboxValuesArr.slice(1).join(" ");
  

  if(listTitle === day ){
    Item.findByIdAndRemove(itemId)
    .then(function () { 
      console.log("Item deleted"); // Success
      res.redirect("/");
    })
    .catch(function (err) {
      console.log(err.message);
    });
  }else{
    const _listTitle = _.toLower(listTitle)
    console.log(_listTitle); 
    // to start from here
    List.findOneAndUpdate({name: _listTitle}, {$pull: {items: {_id: itemId}}})
  .then(function(foundList) {
    console.log(`item from ${foundList.name} list is deleted `);
    res.redirect("/todolist/" + _listTitle);
  })
  .catch(function(err) {
    console.log(err.message);
  });
  }
 
});

app.post("/newList", function (req, res) { 
 
 res.redirect("/todolist/" + req.body.newList);
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, "0.0.0.0", function () {
  console.log("Server started on port " + process.env.PORT);
});