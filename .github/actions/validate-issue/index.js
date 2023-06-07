const fs = require("fs");
const { getInput, setOutput, setFailed } = require("@actions/core");
const { context, getOctokit } = require("@actions/github");
const execSync = require("child_process").execSync;
const semver = require("semver");

(async function () {
  try {
    const issue = context.payload.issue;
    // Use for testing: read issue context from json file
    // const issue = JSON.parse(fs.readFileSync("./sample-context.json", "utf8"));

    if (!issue) {
      setFailed("github.context.payload.issue does not exist");
      return;
    }

    const token = getInput("repo-token");
    // const token = process.env.GH_TOKEN; // Uncomment for local testing

    // Create a GitHub client.
    const octokit = getOctokit(token);

    // Get owner and repo from context
    // process.env.GITHUB_REPOSITORY = "iowillhoit/gha-sandbox"; // Uncomment for local testing:
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const issue_number = issue.number;

    const { body } = issue;

    const sfVersionRegex = "@salesforce/cli/([0-9]+.[0-9]+.[0-9]+(-[a-zA-Z0-9]+.[0-9]+)?)";
    const sfdxVersionRegex = "sfdx-cli/([0-9]+.[0-9]+.[0-9]+(-[a-zA-Z0-9]+.[0-9]+)?)";
    const pluginVersionsRegex = "pluginVersions|Plugin Version:";

    const sfVersion = body.match(sfVersionRegex)?.[1];
    const sfdxVersion = body.match(sfdxVersionRegex)?.[1];
    const pluginVersionsIncluded = body.match(pluginVersionsRegex);

    // -----------------------------------------------------------------------------
    // This is a temp check to account for the known issue with node version 18.16.0
    const nodeVersionRegex = "node-v([0-9]+.[0-9]+.[0-9]+)";
    const nodeVersion = body.match(nodeVersionRegex)?.[1];
    if (nodeVersion.includes("18.16.")) {
      postComment("Hello, there is a known issue with Node `18.16.0`. Please try a different version.\nSee https://github.com/forcedotcom/cli/issues/2125 for more information.");
    }
    // -----------------------------------------------------------------------------

    if ((sfVersion || sfdxVersion) && pluginVersionsIncluded) {
      const oldCliMessage = fs.readFileSync("./messages/old-cli.md", "utf8");
      // TODO: Check for bundled plugins that are user installed (user) or linked (link)
      if (sfVersion && sfVersion.startsWith("1.")) {
        // TODO: We can eventually suggest using sf@v2
        const difference = findMinorDifference("@salesforce/cli", sfVersion);
        if (difference > 12) {
          postComment(oldCliMessage.replace("THE_CLI", "sf").replace("THE_AGE", difference));
          addMoreInfoLabel();
        }
      }
      if (sfdxVersion && sfVersion.startsWith("7.")) {
        // TODO: we can eventually suggest using sf@v2
        const difference = findMinorDifference("sfdx-cli", sfVersion);
        if (difference > 12) {
          postComment(oldCliMessage.replace("THE_CLI", "sfdx").replace("THE_AGE", difference));
          addMoreInfoLabel();
        }
      }
      return;
    } else {
      // Read contents of a markdown file for the comment body.
      const message = fs.readFileSync("./messages/provide-version.md", "utf8").replace("THE_USER", issue.user.login);

      const commentResponse = postComment(message);
      const labelResponse = addMoreInfoLabel();
    }

    // FUNCTIONS
    async function postComment(body) {
      const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number,
      });

      // Check that this comment has not been previously commented
      if (comments.length) {
        if (comments.some((comment) => comment.body === body)) {
          console.log("Already commented");
          return;
        }
      }

      return octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number,
        body,
      });
    }

    function addMoreInfoLabel() {
      return octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number,
        labels: ["more information needed"],
      });
    }

    function findMinorDifference(plugin, installed) {
      const distTags = execSync(`npm view ${plugin} dist-tags --json`).toString();
      const latest = JSON.parse(distTags).latest;
      return semver.minor(latest) - semver.minor(installed);
    }

    // Decided that this was not needed now, leaving in case we want to use it later
    // const getSortedVersions = (plugin) => {
    //   const allVersions = execSync(`npm view ${plugin} versions --json`).toString();
    //   const versions = JSON.parse(allVersions).filter((version) => !version.includes("-"));
    //   return semver.rsort(versions);
    // }
  } catch (error) {
    setFailed(error.message);
  }
})();
