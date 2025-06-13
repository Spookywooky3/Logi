var express = require("express");
var router = express.Router();

const { registerUser, loginUser, getLoggedInUser } = require("../controllers/user-controller");
const { tokenProtect } = require('../middleware/authentication');

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/me', tokenProtect, getLoggedInUser);

module.exports = router;
