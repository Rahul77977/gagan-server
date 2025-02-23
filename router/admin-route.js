const express=require("express")
const {verifyToken} = require('../middlewere/auth');
const admincontroller=require("../controller/admin-controller");
const adminmiddlewere = require('../middlewere/admin-middlewere');

const router=express.Router();


router.get('/users', verifyToken,adminmiddlewere,admincontroller );

  // User authentication route
  router.get('/admin-auth', verifyToken,adminmiddlewere, (req, res) => {
    res.status(200).json({ ok: true,message:"welcome admin" });
  });

  router.get('/user-auth', verifyToken, (req, res) => {
    res.status(200).json({ ok: true });
  });

  

 
module.exports = router;
