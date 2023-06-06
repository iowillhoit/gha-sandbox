import { getInput, setOutput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

(function () {
  const issue = context.payload.issue;
  console.log(issue);
})();
