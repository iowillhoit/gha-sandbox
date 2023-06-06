// import { getInput, setOutput, setFailed } from "@actions/core";
// import { context, getOctokit } from "@actions/github";

const { context } = require("@actions/github");

(function () {
  const issue = context.payload.issue;
  console.log(issue);

  const { body } = issue;

  // cli version including prerelease tags
  const sfVersionRegex =
    "@salesforce/cli/([0-9]+.[0-9]+.[0-9]+(-[a-zA-Z0-9]+.[0-9]+)?)";
  const sfdxVersionRegex =
    "sfdx-cli/([0-9]+.[0-9]+.[0-9]+(-[a-zA-Z0-9]+.[0-9]+)?)";
  const sfVersion = body.match(sfVersionRegex);
  const sfdxVersion = body.match(sfdxVersionRegex);

  if (!sfVersion && !sfdxVersion) {
    console.log("SF Version not included");
  }

  // Confirm that the user provided --verbose version output ("pluginVersions" or "Plugin Version:")
  const pluginVersionsIncluded = body.match(/pluginVersions|Plugin Version:/g);

  if (!pluginVersionsIncluded) {
    console.log("Plugin Version not included");
  }

  // TODO:
  // - At mention the author in message
  // - Could check how old the CLI version is and warn if it is over X version old
  // - Automatically add the "more information needed" label if the issue is missing information
  // - Check for bundled plugins that are user installed (user) or linked (link)
})();
