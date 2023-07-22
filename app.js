require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const auth = require("./middleware/authenticate");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const DetailUser = require("./model/Schema");
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT ||8000;
const BASE_URL=process.env.BASE_URL; 


  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try { 
    mongoose.connect(
      "mongodb+srv://shivam26:shivam26%40@prephourdatabase.fbbrdn6.mongodb.net/?retryWrites=true&w=majority" ,
        connectionParams
    );
    console.log("Database connected succesfully");
  } catch (error) {
    console.log(error);
    console.log("Database connection failed");
  }


  
app.post("/register", async (req, res) => {
  const {
    firstName,
    password,
    lastName,
    email,
  } = req.body;

  if (
    !firstName ||
    !password ||
    !lastName ||
    !email 
  )
    return res.status(422).json({ error: "Please fill the fields properly ." });

  DetailUser.findOne({ email }).then((userExist) => {
    if (userExist) return res.status(422).json({ msg: "error" });
    const user = new DetailUser({
      firstName,
      password,
      lastName,
      email,
    });

    console.log(user);
    user.save();
    return res.json({ msg: "success" });
  });
});


app.post("/submitDetails", async (req, res) => {
  const { email, mode, domain ,purpose} = req.body;

  const mentor = await DetailUser.find({
    role: "Mentor",
    mode: mode,
    domain: domain,
  });

  const userrr = await DetailUser.findOne({ email });
// console.log(mentor);
  mentor.map((val) => {
        DetailUser.findOneAndUpdate(
          { email: val.email },
          { $push: { mentors: { name: userrr.firstName, email,purpose } } },
          { new: true }
        ).then((dat) => {});
    // });
  });

  res.json({ msg: "success" });
});

// app.post("/deleteReq", async (req, res) => {
//   const { email, name } = req.body;

//   DetailUser.find({
//     role: "Mentor", 
//     'mentors.email':email
//   }).then((data) => {
//     if (data) {  
//       data.map((val) => {
       
//         DetailUser.findOneAndUpdate(
//           { email: val.email },
//           { $pull: { mentors: { name, email } } },
//           { new: true }
//         ).then((dat) => {});
//       });
//     }
//   });

//   res.json({ msg: "success" });
// });


// app.post("/decline", async (req, res) => {
//   const { email, name } = req.body;
//   const ans = await DetailUser.findOneAndUpdate(
//     { email: email },
//     { $pull: { mentors: { name } } },
//     { new: true }
//   );

//   res.json({ msg: "success" });
// });

app.post("/loginB", async (req, res) => {
  let token;
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(400).json({ msg: "NaN" });
    }
    const userLogin = await DetailUser.findOne({ email: email });

    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password);
      token = await userLogin.generateAuthToken();  

      res.cookie("jwtoken",token,{
        sameSite: 'none',
        secure: true,
        expires: new Date(Date.now() + 25892000000),
        httpOnly: false,
      });

      if (!isMatch) {
        res.status(400).json({ msg: "error" });
      } else {
        res.json({ msg: "success" });
      }
    } else {
      res.status(400).json({ msg: "error" });
    }
  } catch (err) {
    console.log(err); 
  }
});


app.get("/",(req,res)=>
{
res.send("hiiii");
}
);

// app.get('/getinfo', async (req, res) => {
//   try {
//     await auth(req, res); 
//     // Assuming auth is an asynchronous middleware
//     res.send(req.rootUser);
//     // console.log(req.rootUser);
//   } catch (error) {
//    console.log("getinfo me dikkat hai")
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// });
app.get("/getinfo", auth, (req, res) => {
  res.send(req.rootUser);
});


app.get("/logout", (req, res) => {
  res.clearCookie("jwtoken");
  res.status(200).send("User logout");
});

app.listen(PORT,console.log("listening",PORT));
