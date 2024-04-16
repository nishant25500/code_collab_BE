const Feedback = require("../../../model/Feedback");
const Problems = require("../../../model/Problems");
const User = require("../../../model/User");
const Visitor = require("../../../model/Visitor");

const router = require("express").Router();

router.route("/").get((req, res, next) => {
  res.json({
    message: "Hello World as admin",
  });
});

router.route("/users").get(async (req, res, next) => {
  const AllUsers = await User.find({
    attributes: ["id", "username", "email", "createdAt", "updatedAt"],
    order: [["createdAt", "DESC"]],
  });
  const VisitorCount = await Visitor.findOne({});

  res.json({
    message: "All Users",
    users: AllUsers,
    visitors: VisitorCount.visitorCount,
  });
});

router.route("/clear-visitors").post(async (req, res, next) => {
  const VisitorCount = await Visitor.findOne({});
  VisitorCount.visitorCount = 0;
  await VisitorCount.save();
  res.json({
    message: "Visitors Cleared",
  });
});

router.route("/feedbacks").get(async (req, res, next) => {
  const AllFeedbacks = await Feedback.find({
    order: [["createdAt", "DESC"]],
  });
  res.json({
    message: "All Feedbacks",
    feedbacks: AllFeedbacks,
  });
});

router.route("/feedback").delete(async (req, res, next) => {
  const { id } = req.query;
  const feedbackF = await Feedback.findOne({
    _id: id,
  });
  if (!feedbackF) {
    return res.json({
      message: "Feedback Not Found",
    });
  }
  const resp = await Feedback.deleteById(id);
  res.json({
    message: "Feedback Deleted",
  });
});

router.route("/problems").get(async (req, res, next) => {
  const AllProblems = await Problems.find({});

  res.json({
    message: "All Problems",
    problems: AllProblems,
  });
});

router.route("/problem").post(async (req, res, next) => {
  const {
    title,
    description,
    sampleInput,
    sampleOutput,
    difficulty,
    tags,
    testCasesInput,
    testCasesOutput,
  } = req.body;

  const newProblem = new Problems({
    problem_slug: title.replace(/ /g, "-").toLowerCase(),
    title,
    description,
    sampleInput,
    sampleOutput,
    difficulty,
    tags,
    testCasesInput,
    testCasesOutput,
  });

  await newProblem.save();
  res.json({
    message: "Problem Created",
    problem: newProblem,
  });
});

router.route("/problem/:_id").patch(async (req, res, next) => {
  const { _id } = req.params;
  const {
    title,
    description,
    sampleInput,
    sampleOutput,
    difficulty,
    tags,
    testCasesInput,
    testCasesOutput,
    isPublished,
  } = req.body;

  const problem = await Problems.findOne({
    where: {
      _id,
    },
  });

  if (problem) {
    problem.problem_slug = title.replace(/ /g, "-").toLowerCase();
    problem.title = title;
    problem.description = description;
    problem.sampleInput = sampleInput;
    problem.sampleOutput = sampleOutput;
    problem.difficulty = difficulty;
    problem.tags = tags;
    problem.testCasesInput = testCasesInput;
    problem.testCasesOutput = testCasesOutput;
    problem.isPublished = isPublished;
    await problem.save();
    res.json({
      message: "Problem Updated",
      problem,
    });
  } else {
    res.json({
      message: "Problem Not Found",
    });
  }
});

module.exports = router;
