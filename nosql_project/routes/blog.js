//NEW ROUTER OBJECT TO HANDLE REQUESTS
const express = require('express');
const router = express.Router();

const bcrypt = require("bcrypt");

//
const mongo = require("mongodb");
const ObjectId = mongo.ObjectId;


const dbs = require("../database/database");

//LEADING TO HOME PAGE
router.get('/',async function (req, res) {
  const data= await dbs.getdb().collection("tech_info").find({}).project({content:0}).toArray();
  res.render('posts-list',{data:data});
});

//to create a new post
router.get('/new-post', async function (req, res) {
  const db = dbs.getdb();
  const content = await db.collection("authors").find({}).toArray();
  res.render('create-post', { content: content });
});


//forms that has to be submitted
router.post("/forms", async function (req, res) { //get connection with the database
  const database = dbs.getdb();
  //url containing data is stored  
  const data = req.body;
  data.user_email=req.session.user_mail;
  //authors data is fetched
  const authors_data = await database.collection("authors").find({ _id: new ObjectId(req.body.author) }).toArray()
  //data is added in the request object
  const handling_read = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  data.date=handling_read.toLocaleDateString('en-US', options)
  data.authors = {
    _id: req.body.author,
    //the promise returned after fetching the data from collection is metadata.hecnce it is converted to array,therefore we us [0]
    name: authors_data[0].author_name,
    eamilId: authors_data[0].eamil
  }
  //insert the data which is an object in the collection tech_info
  const result = await database.collection("tech_info").insertOne(data);
  res.redirect("/");
});

//LEADING TO VIEW CONTENT OF A PAGE
router.get("/view/:id",async function(req,res){
  const id=req.params.id;
  const [data]= await dbs.getdb().collection("tech_info").find({_id:new ObjectId(id)}).toArray();

  res.render("post-detail",{data})
});

//LEADING TO UPDATE PAGE
router.get("/edit/:id",function(req,res){
 const id=req.params.id;
 res.render("update-post",{id:id})
})

//LEADING TO UPDATE A DOCUMENT 
router.post("/edit/:id/forms",async function(req,res){
  const id=req.params.id;
  const data=req.body;
  let obj_id;
  try{
    obj_id=new ObjectId(id)
  }
  catch(error){
      // Default error handling function
      // Will become active whenever any route / middleware crashes
      return res.status(404).render('404');
  }
  const result=await dbs.getdb().collection("tech_info").updateOne({_id:new ObjectId(obj_id)},{$set:{title:data.title,summary:data.summary,content:data.content}})
  res.redirect("/")
})

//DELETE
router.post("/delete/:id",async function(req,res){
  const id=req.params.id;
  await dbs.getdb().collection("tech_info").deleteOne({_id:new ObjectId(id)});
  res.redirect("/")
})

router.get("/comments/:id",async function(req,res)
{
  const id=req.params.id;
 const data_1= await dbs.getdb().collection("comments").find({tech_id:id}).toArray();
 res.json(data_1);//It encodes the promise into json format
})


router.post("/comment/:id/store",async function(req,res)
{
  const id=req.params.id;
  const data=req.body;
  data.tech_id=id;
  console.log("entered")
  console.log(data)
  await dbs.getdb().collection("comments").insertOne({title:data.title,comment:data.comment,tech_id:data.tech_id});
  res.json({message:"done!"})
})

//auth signup
router.get("/signup",async function(req,res)
{
  let inputdata=req.session.sign_up;
  if(!inputdata)
  {
    inputdata={
      email:"" ,
      confirm_email:"",
      password:"",
      hasError:"" 
    }
  }
  req.session.sign_up=null;
  res.render('signup',{inputdata:inputdata});
})

//auth login
router.get("/login",async function(req,res)
{
  let data=req.session.login_error;
  if(!data)
  {
    data={
    email:"",
    password:"",
    hasError:""
  }
  }
  req.session.login_error=null;
  res.render('login',{data:data});
})

router.post('/signup', async function (req, res) {
  const password_hashed = await bcrypt.hash(req.body.password, 12);//the data is hashed by a string of 12 character 
  const data = {
    email: req.body.email,
    confirm_email: req.body["confirm-email"],
    password: password_hashed
  };
  const result = await dbs.getdb().collection("user_auth_data").findOne({ email: data.email });
  console.log(result)
  if (result ||data.email==data || data.password.trim() < 6) {
    console.log("There is already an email registered with this id");
    //we store dta in session
    req.session.sign_up={
      email: req.body.email,
      confirm_email: req.body["confirm-email"],
      hasError:true
    };
    req.session.save(function()
    {
      res.redirect("/signup")
    })
    return ;
  }
  await dbs.getdb().collection("user_auth_data").insertOne(data);
  res.redirect("/login")
});


//login post data
router.post('/login', async function (req, res) {
  data = req.body;
  req.session.login_error={email:data.email,password:data.password,hasError:true};
  const result =await dbs.getdb().collection("user_auth_data").findOne({ email: data.email });
  //If the email given is not exsisting in database,then the above result ="0"
  if (!result) {
    console.log("The email is invalid");
    return res.redirect("/login");

  }
  //check with password
  let password;
  console.log(data.password + " and " + result.password)
  try {
    password = await bcrypt.compare(data.password, result.password);
  } catch (error) {
    console.log(error)
  }

  if (!password) {
    console.log("password is incorrect");
    return res.redirect("/login");
  }
  req.session.user={email:result.email,id:result._id};//storing the data takes some time hence the save property tells the js to execute after it is saved
  req.session.isAuthenticated=true;
  req.session.user_mail=result.email;
  req.session.save(function()
    {
      res.redirect("/");
    }
  );
  });

router.get("/logout",function(req,res)
{
  req.session.isAuthenticated=false;
  req.session.user_mail=null;
  res.redirect("/");
})








module.exports = router;