const mongoose = require("../config/MongoConnect");

const ProblemSchema = new mongoose.Schema(
  {
    problem_slug: {
        type: String,
        required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sampleInput: {
      type: String,
      required: true,
    },
    sampleOutput: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
    },
    // createdBy: {
    //   type: String,
    //   required: true,
    // },
    // updatedBy: {
    //   type: String,
    // },
    isPublished: {
      type: Boolean,
      default: false,
    },
    testCasesInput: {
      type: String,
      required: true,
    },
    testCasesOutput: {
      type: String,
      required: true,
    },

    editorial: {
      type: String,
    },

    // template: {
    //   type: Object,
    // },
    // isDeleted: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
); 


module.exports = mongoose.model("Problem", ProblemSchema);
