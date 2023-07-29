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
      process.env.MONGO_URI ,
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
    subject,
    classes,
     qualifications
  } = req.body;
console.log(qualifications);
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
      subject,
      classes,
      qualifications
    });

    user.save();
    return res.json({ msg: "success" });
  });
});
app.post("/testimonial", async (req, res) => {
  const { email, test,itemEmail } = req.body;

  try {
   
    const tutor = await DetailUser.findOne({ email:itemEmail });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Add the new testimonial to the tutor's data
    tutor.testimonials.push({ email, test});
    await tutor.save();

    return res.status(200).json({ message: 'Testimonial submitted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});


app.post("/request", async (req, res) => {
  const { firstName,email,itemEmail} = req.body;

  const mentor = await DetailUser.find({
    email:itemEmail
  });
  
  // console.log(mentor);
  // console.log(itemEmail);
  // const userrr = await DetailUser.findOne({ email });
  mentor.map((val) => {
  DetailUser.findOneAndUpdate(
    { email: val.email },
    { $push: { students: { name:firstName, email } } },
    { new: true }
    ).then((dat) => {});


  res.json({ msg: "success" });
});
});

app.post("/deleteReq", async (req, res) => {
  const { email, name } = req.body;

  DetailUser.find({
    role: "Mentor", 
    'mentors.email':email
  }).then((data) => {
    if (data) {  
      data.map((val) => {
       
        DetailUser.findOneAndUpdate(
          { email: val.email },
          { $pull: { mentors: { name, email } } },
          { new: true }
        ).then((dat) => {});
      });
    }
  });

  res.json({ msg: "success" });
});


app.post("/decline", async (req, res) => {
  const { email, userEmail } = req.body;
  console.log(userEmail);
  const ans = await DetailUser.findOneAndUpdate(
    { email: email },
    { $pull: { students: { email:userEmail } } },
    { new: true }
  );

  res.json({ msg: "success" });
});


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

app.get("/getAllTutors", (req, res) => {
  // Use the find method to retrieve all tutors from the database
  DetailUser.find({}, (err, tutors) => {
    if (err) {
      console.error("Error fetching tutors:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(tutors);
    }
  });
});
app.get('/getReviewsByTutorEmail', async (req, res) => {
  const { email } = req.query;

  try {
    const tutor = await DetailUser.findOne({ email });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Assuming reviews are stored as an array in the tutor document
    const reviews = tutor.testimonials || [];

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get("/getinfo", auth, (req, res) => {
  res.send(req.rootUser);
});


app.get("/logout", (req, res) => {
  res.clearCookie("jwtoken");
  res.status(200).send("User logout");
});

app.listen(PORT,console.log("listening",PORT));
