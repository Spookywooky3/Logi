var jwt = require("jsonwebtoken");
var asyncHandler = require("express-async-handler");

const User = require("../models/user-model");
const Company = require("../models/company-model");

// add permissions middleware later

const companyProtect = asyncHandler(async (req, res, next) => {
    if (req.user) {
        try {
            const employee = await Company.findOne({
                _id:
                    req.body.companyId == undefined
                        ? req.params.companyId
                        : req.body.companyId,
                employees: {
                    $elemMatch: {
                        id: req.user._id,
                    },
                },
            });

            if (!employee) {
                return res.status(401).json({ msg: "Not Authorized." });
            }
            
            next();
        } catch (error) {
            res.status(401).json({
                msg: `Internal error occured. ${error.message}`,
            });
        }
    } else {
        res.status(500).json({ msg: "Missing user data." });
    }
});

const tokenProtect = asyncHandler(async (req, res, next) => {
    // todo: check if starts with bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("bearer")
    ) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password -updatedAt -__v");

            if (req.user == null) {
                return res.status(401).json({ msg: "Not Authorized." });
            }

            next();
        } catch (error) {
            return res.status(401).json({ msg: error.message });
        }
    } else {
        return res.status(500).json({ msg: "Missing authorization token." });
    }
});

module.exports = {
    tokenProtect,
    companyProtect,
};
