var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var asyncHandler = require("express-async-handler");

const User = require("../models/user-model");
const Company = require("../models/company-model");

// TODO: omit password from returns later
// THE FUCKING PERFORMANCE

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const loginUser = asyncHandler(async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please include all fields." });
    }

    email = email?.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    if (await bcrypt.compare(password, user.password)) {
      return res.status(200).json({
        user,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ msg: "Invalid credentials." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  try {
    let { first_name, last_name, username, email, password } = req.body;

    if (!first_name || !last_name || !username || !email || !password) {
      return res.status(400).json({ msg: "Please include all fields." });
    }

    first_name = first_name?.charAt(0).toUpperCase() + first_name?.slice(1);
    // Check for hyphenated and multiworded lastnames later
    last_name = last_name?.charAt(0).toUpperCase() + last_name?.slice(1);

    username = username?.trim().toLowerCase();
    email = email?.trim().toLowerCase();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      companyIds: [],
    });

    if (user) {
      return res.status(201).json({ user });
    }

    return res.status(500).json({ msg: "There was an error creating the user." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

const getLoggedInUser = asyncHandler(async (req, res) => {
  try {
    let companies = [];
    if (req.user.companyIds.length > 0) {
      companies = await Company.find({ _id: { $in: req.user.companyIds } }).select(
        "-employees -loads -createdAt -updatedAt -__v"
      );
    }

    return res.status(200).json({ user: req.user, companies });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = {
  registerUser,
  loginUser,
  getLoggedInUser,
};
