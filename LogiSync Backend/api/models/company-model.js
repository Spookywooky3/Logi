var mongoose = require("mongoose");

const decimalValidation = (value) => {
  if (typeof value !== undefined) {
    return parseFloat(value.toString());
  }

  return value;
};

const loadSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    data: {
      registration: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      weight: {
        type: mongoose.Types.Decimal128,
        required: true,
        get: decimalValidation,
      },
      distance: {
        type: mongoose.Types.Decimal128,
        required: true,
        get: decimalValidation,
      },
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
      timeCompleted: {
        type: Date,
        required: true,
      },
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
    toString: { getters: true },
  }
);

const employeeSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    permissions: {
      type: Map,
      of: Boolean,
      required: true,
      default: {
        owner: false,
        getEmployees: false,
        getAllLoads: false,
        editAllLoads: false,
      },
    },
  },
  {
    _id: false,
  }
);

/**
 * @type {mongoose.SchemaDefinitionProperty}
 */
const companySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please include a company name."],
    },
    employees: [
      {
        type: employeeSchema,
        required: [true, "Please intialize employees with a schema."],
        default: [],
      },
    ],
    loads: {
      type: [loadSchema],
      required: true,
    },
  },
  {
    toJSON: { getters: true },
    toObject: { getters: true },
    toString: { getters: true },
    timestamps: true,
    collection: "companies",
  }
);

module.exports = Company = mongoose.model("Company", companySchema);
