// import { getInput, setOutput, setFailed } from "@actions/core";
// import { context, getOctokit } from "@actions/github";

const { context } = require("@actions/github");

(function () {
  const issue = context.payload.issue;
  console.log(issue);
})();
