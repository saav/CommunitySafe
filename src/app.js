const express = require('express');
// require("./db/conn");
const app = express();
const port = process.env.PORT || 3002;
const path = require('path');
const hbs = require('hbs');
const Register = require('./models/register');
const { rmSync } = require('fs');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const mongoose = require('mongoose');
// const multer  = require('multer');
// const ImageModel = require("./image.model");
// const Upload = require("C:/Users/tarun/OneDrive/Desktop/Dummy-hack-X-niet-project/src/models/Upload.js");

//setting options for multer
// const Storage = multer.diskStorage({
//     destination :"uploads",
//     filename : (req,file , cb) =>{
//         cb(null,file.originalname);
//     }
// });

// const upload = multer({ storage: Storage })
// .single('testImage');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//serving public file
const public_path = path.join(__dirname, '../public');
app.use(express.static(public_path));

mongoose
  .connect('mongodb://127.0.0.1:27017/nodeproject')
  .then(() => {
    console.log('The connection is sucessfully');
  })
  .catch(() => {
    console.log('The connection is not sucessfully');
  });

//serving dynamic file
const dynamic_path = path.join(__dirname, '../templates/views');
app.set('view engine', 'hbs');
app.set('views', dynamic_path);

//serving dynamic file
const partials_path = path.join(__dirname, '../templates/partials');
hbs.registerPartials(partials_path);

app.get('/', (req, res) => {
  res.render('home');
});
app.get('/geomap', (req, res) => {
  res.render('geomap');
});
app.get('/realtime', (req, res) => {
  res.render('realtime');
});
app.get('/sosbutton', (req, res) => {
  res.render('sosbutton');
});
app.get('/recovery', (req, res) => {
  // console.log(`This is my secret page token ${req.cookies.jwt}`)
  res.render('recovery');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/logout', auth, async (req, res) => {
  try {
    req.document.tokens = req.document.tokens.filter((currentEle) => {
      return currentEle.token !== req.token;
    });

    res.clearCookie('jwt');
    await req.document.save();
    res.render('login');
  } catch (error) {
    res.status(500).send(error);
  }
});

// use post request
app.post('/register', async (req, res) => {
  try {
    const password = req.body.password;
    const confirmpassword = req.body.password;
    if (password === confirmpassword) {
      const userdata = new Register({
        fullname: req.body.fullname,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
      });
      const token = await userdata.mytoken();
      console.log('my token is ' + token);

      res.cookie('jwt', token, {
        expires: new Date(Date.now() + 50000),
        httpOnly: true,
      });
      const savedata = await userdata.save();
      res.status(201).render('home');
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const useremail = await Register.findOne({ email: email });
    const token = await useremail.mytoken();
    console.log('This is my token ' + token);

    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 50000),
      httpOnly: true,
    });
    if (useremail.password === password) {
      res.status(201).render('home');
    } else {
      res.send('invalid login details');
    }
  } catch (error) {
    res.status(400).send('invalid loing detail');
  }
});

app.get('/blog1', (req, res) => {
  res.render('blog1');
});
app.get('/payment', (req, res) => {
  res.render('payment');
});
app.get('/shelter', (req, res) => {
  res.render('shelter');
});
app.get('/predict', (req, res) => {
  res.render('predict');
});

// payment database

const paySchema = {
  amount: Number,
  name: String,
  exp_month: Number,
  exp_year: Number,
  card_number: Number,
  cvv: Number,
};
const Pay = new mongoose.model('pay', paySchema);

const insertItems = async (data) => {
  try {
    const result = await data.save();
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

app.post('/pay', (req, res) => {
  const data = new Pay({
    amount: req.body.amount,
    name: req.body.name,
    exp_month: req.body.exp_month,
    exp_year: req.body.exp_year,
    card_number: req.body.card_number,
    cvv: req.body.cvv,
  });
  console.log(req.body.amount);
  console.log(req.body.name);
  // console.log(data);
  insertItems(data);
});

// realtime
// const chatSchema ={
//     name: String,
//     text : String,
// }
// const Chat = new mongoose.model("chat",chatSchema);

// const insertItemsInChat = async (data) => {
//     try {
//         const result = await data.save();
//         console.log(result);
//     }
//     catch (err) {
//         console.log(err);
//     }
// }

// app.post("/upload",(req,res) =>{
//     const data = new Chat({
//         name : req.body.chat,
//         // text:
//     })
//     console.log(req.body.amount);
//     console.log(req.body.name);
//     // console.log(data);
//     insertItems(data);
// });

// Shelter donation

const donateSchema = {
  name: String,
  phone: Number,
  address: String,
  people: Number,
};
const Donate = new mongoose.model('donate', donateSchema);

const insertItemsDonate = async (data) => {
  try {
    const result = await data.save();
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};

app.post('/donate', (req, res) => {
  const data = new Donate({
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    people: req.body.people,
  });
  // console.log(req.body.amount);
  console.log(req.body.name);
  // console.log(data);
  insertItemsDonate(data);
});

app.listen(port, () => {
  console.log(`the server is running port no ${port}`);
});
