var express = require("express");
var router = express.Router();

const { 
    getCompany,
    registerCompany, 
    deleteCompany,
    createLoad, 
    getLoads, 
    updateLoad, 
    deleteLoad, 
    getEmployees,
    addEmployee,
    removeEmployee,
    updateEmployee,
    getPermissions,
} = require("../controllers/company-controller");

const { 
    companyProtect, 
    tokenProtect 
} = require("../middleware/authentication");

// Company Routes
// POST
router.post("/register", tokenProtect, registerCompany);

// DELETE
router.delete("/", tokenProtect, companyProtect, deleteCompany);

// GET
router.get("/:companyIds", tokenProtect, getCompany);

// Load Routes
// POST
router.post("/log", tokenProtect, companyProtect, createLoad);

// PATCH
router.patch("/log", tokenProtect, companyProtect, updateLoad);

// DELETE
router.delete("/log", tokenProtect, companyProtect, deleteLoad);

// GET
router.get("/log/:companyId", tokenProtect, companyProtect, getLoads);

// Employee Routes
// GET
router.get("/employees/:companyId", tokenProtect, companyProtect, getEmployees);
router.get("/employees/:companyId/:id", tokenProtect, companyProtect, getPermissions);

// POST
router.post("/employees", tokenProtect, companyProtect, addEmployee);

// PATCH
router.patch("/employees", tokenProtect, companyProtect, updateEmployee);

// DELETE
router.delete("/employees", tokenProtect, companyProtect, removeEmployee);


module.exports = router;
