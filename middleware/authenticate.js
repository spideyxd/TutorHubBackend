const jwt = require("jsonwebtoken");
const User = require("../model/Schema");

const Authenticate = async (req, res, next) => {
  try {
    const token = (req.cookies.jwtoken?req.cookies.jwtoken:NULL);
    if(token){
      
      const verifyToken = jwt.verify(
      token,
      process.env.REACT_APP_TOKEN
    );
  
    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens:token": token,
    }); 
    

    if (!rootUser) {
      return res.status(401);
    }

    // console.log(token);

    req.token = token;
    req.rootUser = rootUser;  
    req.userID = rootUser._id;
    // console.log("jj");
    next();
  }
    
  } catch (err) {
    res.status(401).send("Uauthorized: noo token provided");
 
  }
};

module.exports = Authenticate;
