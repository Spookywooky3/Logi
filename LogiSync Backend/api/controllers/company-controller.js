var asyncHandler = require("express-async-handler");
var mongoose = require("mongoose");

const Company = require("../models/company-model");
const User = require("../models/user-model");

const { PermissionKeys } = require("../../types/types");
const { json } = require("express");

/* TODO:
    Type validation for load create, weight decimal etc. Maybe do on frontend? or maybe both do research
    Dymically create employee permissions based off PermissionKeys object
    Add try catch to all functions
    migrate from using username to _id for faster db times or even index username
    make db calls more consistent, clean and concise.
*/


/* EMPLOYEES */
// GET
// params: { companyId }
const getEmployees = asyncHandler(async (req, res) => {
  try {
    let { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ msg: "Please include a companyId." });
    }

    let company = await Company.findById(new mongoose.Types.ObjectId(companyId)).select(
      "employees"
    );

    let employeeIds = company.employees.map((employee) => employee.id);

    let users = await User.find({ _id: { $in: employeeIds } }).select(
      "-password -companyIds -createdAt -updatedAt -__v"
    );

    let employees = company.employees.map((employee) => {
      return {
        ...users.find((user) => user._id == employee.id).toObject(),
        permissions: employee.permissions,
      };
    });

    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// POST
// body: { companyId, email, permissions  }
const addEmployee = asyncHandler(async (req, res) => {
  try {
    let { companyId, email, permissions } = req.body;

    if (!companyId || !email || !permissions) {
      return res.status(500).json({ msg: "Please include all fields." });
    }

    email = email?.trim().toLowerCase();

    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ msg: "That user does not exist." });
    }

    let employeeExists = await Company.findOne({
      _id: new mongoose.Types.ObjectId(companyId),
      employees: {
        $elemMatch: {
          id: user._id,
        },
      },
    });

    if (employeeExists) {
      return res.status(400).json({ msg: "That employee already exists." });
    }

    let permissionsObj = Object.keys(PermissionKeys).reduce((acc, key) => {
      acc[key] = permissions?.[key] || false;
      return acc;
    }, {});

    let employee = await Company.findByIdAndUpdate(
      new mongoose.Types.ObjectId(companyId),
      {
        $push: {
          employees: {
            id: user._id,
            permissions: permissionsObj,
          },
        },
      }
    );

    if (!employee) {
      return res
        .status(500)
        .json({ msg: "An error occurred while adding the employee." });
    }

    await user.updateOne({ $push: { companyIds: companyId } });

    return res.status(201).json({ msg: "Added employee.", employee });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// DELETE
// body: { companyId, id }
const removeEmployee = asyncHandler(async (req, res) => {
  try {
    let { companyId, id } = req.body;

    if (!companyId || !id) {
      return res.status(500).json({ msg: "Please include all fields." });
    }

    let employeeExists = await Company.findOne(
      { _id: new mongoose.Types.ObjectId(companyId) },
      { id: id }
    );

    if (!employeeExists) {
      return res.status(400).json({ msg: "That employee does not exist." });
    }

    let employee = await Company.findByIdAndUpdate(
      new mongoose.Types.ObjectId(companyId),
      {
        $pull: {
          employees: {
            id: id,
          },
        },
      }
    );

    if (!employee) {
      return res.status(500).json({
        msg: "An error occurred while removing the employee.",
      });
    }

    let user = await User.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {
      $pull: {
        companyIds: companyId,
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Error removing user from company." });
    }

    return res.status(200).json({ msg: "Removed employee." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// PATCH
// body: { companyId, id, permissions }
const updateEmployee = asyncHandler(async (req, res) => {
  try {
    let { companyId, id, permissions: permissionsData } = req.body;

    if (!companyId || !id || !permissionsData) {
      return res.status(500).json({ msg: "Please include all fields." });
    }

    let permissions = Object.keys(PermissionKeys).reduce((acc, key) => {
      acc[key] = permissionsData?.[key] || false;
      return acc;
    }, {});

    let company = await Company.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(companyId),
        employees: {
          $elemMatch: {
            id: id,
          },
        },
      },
      {
        $set: {
          "employees.$.permissions": permissions,
        },
      }
    );

    if (!company) {
      return res.status(500).json({
        msg: "An error occurred while updating the employee.",
      });
    }

    return res.status(200).json({ msg: "Updated employee.", employee: company });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// GET
// params: { companyId, id }
const getPermissions = asyncHandler(async (req, res) => {
  try {
    let { companyId, id } = req.params;

    if (!companyId || !id) {
      return res.status(400).json({ msg: "Please include all fields." });
    }

    let permissions = await Company.findOne(
      {
        _id: new mongoose.Types.ObjectId(companyId),
        employees: {
          $elemMatch: {
            id: id,
          },
        },
      },
      {
        "employees.permissions.$": 1,
      }
    );

    return res.status(200).json({ permissions: permissions.employees[0].permissions });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

/* LOADS */
// GET
// params: { companyId }
const getLoads = asyncHandler(async (req, res) => {
  try {
    let { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ msg: "Please include a companyId." });
    }

    let permissions = await Company.findOne(
      {
        _id: new mongoose.Types.ObjectId(companyId),
        employees: {
          $elemMatch: {
            id: req.user._id,
          },
        },
      },
      {
        "employees.permissions.$": 1,
      }
    );

    let loads = await Company.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $project: {
          _id: 0,
          loads: {
            $cond: {
              if: {
                $eq: [
                  permissions.employees[0].permissions.get(PermissionKeys.getAllLoads),
                  true,
                ],
              },
              then: "$loads",
              else: {
                $filter: {
                  input: "$loads",
                  as: "load",
                  cond: {
                    $eq: ["$$load.employeeId", req.user._id],
                  },
                },
              },
            },
          },
        },
      },
    ]);

    return res.status(200).json(loads[0]);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// DELETE
// body: { companyId, loadId }
const deleteLoad = asyncHandler(async (req, res) => {
  try {
    let { companyId, loadId } = req.body;

    if (!companyId || !loadId) {
      return res.status(500).json({ msg: "Please include all fields." });
    }

    let loads = await Company.updateOne(
      {
        _id: new mongoose.Types.ObjectId(companyId),
        "loads._id": new mongoose.Types.ObjectId(loadId),
      },
      {
        $pull: {
          loads: {
            _id: new mongoose.Types.ObjectId(loadId),
          },
        },
      }
    );

    return res.status(200).json({ loads });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// PATCH
// body: { companyId, loadId, { data } }
const updateLoad = asyncHandler(async (req, res) => {
  try {
    let { companyId, loadId, updatedLoad } = req.body;

    if (!companyId || !loadId || !updatedLoad) {
      return res.status(500).json({ msg: "Please include all fields." });
    }

    let loads = await Company.updateOne(
      {
        _id: new mongoose.Types.ObjectId(companyId),
        "loads._id": new mongoose.Types.ObjectId(loadId),
      },
      {
        $set: {
          "loads.$": updatedLoad,
        },
      }
    );

    return res.status(200).json({ loads });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// add try catch statements to below functions
// POST
// body: { companyId, title,  { data } }
const createLoad = asyncHandler(async (req, res) => {
  try {
    let { companyId, title, data } = req.body;

    if (!companyId || !title || !data) {
      return res.status(500).json({ msg: "Please include all fields." });
    }

    let result = await Company.findByIdAndUpdate(new mongoose.Types.ObjectId(companyId), {
      $push: {
        loads: {
          title: title,
          employeeId: req.user._id,
          data: data,
        },
      },
    });

    if (!result) {
      return res.status(500).json({ msg: "An error occurred while creating the load." });
    }

    return res.status(201).json({ msg: "Logged load." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

/* COMPANY */
// DELETE
// body: { companyId }
const deleteCompany = asyncHandler(async (req, res) => {
  try {
    let { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ msg: "Please include a companyId." });
    }

    let company = await Company.findById(new mongoose.Types.ObjectId(companyId));

    if (!company) {
      return res.status(400).json({ msg: "No company found." });
    }

    // I should really migrate to using _id instead of username for faster db times
    const employees = company.employees.map((employee) => employee.id);

    await User.updateMany(
      { _id: { $in: employees } },
      { $pull: { companyIds: companyId } }
    );

    await company.deleteOne();

    return res.status(200).json({ msg: "Deleted company." });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

//GET
//params: { [companyIds] }
const getCompany = asyncHandler(async (req, res) => {
  try {
    let companyIds = req.params.companyIds.split(",");

    if (!companyIds || companyIds.length === 0) {
      return res.status(400).json({ msg: "Please include a companyId." });
    }

    const companies = await Company.find({
      _id: { $in: companyIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).select("name");

    if (companies.length === 0) {
      return res.status(400).json({ msg: "No companies found." });
    }

    return res.status(200).json(companies);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// Look into optimization of this function
// POST
// body: { name }
const registerCompany = asyncHandler(async (req, res) => {
  try {
    let { name } = req.body;
    let { _id } = req.user;

    if (!name) {
      return res.status(400).json({ msg: "Please include a name." });
    }

    const companyExists = await Company.findOne({
      name: name,
      employees: {
        $elemMatch: {
          id: _id,
          "permissions.owner": true,
        },
      },
    });

    if (companyExists) {
      return res.status(400).json({ msg: "A company with that name already exists." });
    }

    const company = await Company.create({
      name: name,
      employees: [
        {
          id: _id,
          permissions: {
            owner: true,
            getEmployees: true,
            getAllLoads: true,
            editAllLoads: true,
          },
        },
      ],
      loads: [],
    });

    if (!company) {
      return res
        .status(500)
        .json({ msg: "An error occurred while creating the company." });
    }

    let user = await User.findByIdAndUpdate(new mongoose.Types.ObjectId(_id), {
      $push: { companyIds: company._id },
    });

    if (!user) {
      return res
        .status(500)
        .json({ msg: "An error occurred while updating the company owner." });
    }

    return res.status(201).json({ msg: "Created company.", company });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = {
  // Company
  getCompany,
  registerCompany,
  deleteCompany,
  // Loads
  createLoad,
  getLoads,
  updateLoad,
  deleteLoad,
  // Employees
  getEmployees,
  addEmployee,
  removeEmployee,
  updateEmployee,
  getPermissions,
};
