const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-atul:Atul123@cluster0.6pxhz.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema= new mongoose.Schema({
  name: String
});

const Item=mongoose.model("item",itemsSchema);


const item1=new Item({
  name:"Welcome todo list"
});

const item2=new Item({
  name:"hit the +button to add new item"
});

const item3=new Item({
  name:"hit this to delelte an element"
});

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name :String,
  items:[itemsSchema]
});

const List = mongoose.model("list",listSchema);


app.get("/",function(req,res){

Item.find({},function(err,foundItems){
  if(foundItems.length ===0)
  {
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully inserted");
      }
    });
    res.redirect("/");
  }else{
    res.render("list",{listTitle : "Today", newListItems: foundItems});

  }
  });
});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list =new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name,newListItems: foundList.items});
      }
    }
  });

});

app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const listName= req.body.list;
  const item=new Item({
    name: itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


});


app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName=== "Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }


})
app.get("/about",function(req,res){
  res.render("about");
})



app.listen(process.env.PORT || 3000,function(){
  console.log("Server is running on 3000 port.")
});
