const core = require('@actions/core');

async function run(params) {
  /*
    1. Parse the input parameters
      1.1 Get the base branch to compare against
      1.2 Get the target branch for the pull request
      1.3 Get the GitHub token for authentication (to create pull requests and commit changes)
      1.4 Get the working directory to run the npm commands in.
    2. Execute the npm commands to check for outdated dependencies and update them.
      2.1 Run `npm outdated` to get a list of outdated dependencies.
      2.2 Run `npm update` to update the dependencies in package.json and package-lock.json.
    3. Check if there are any changes to commit (i.e., if package.json or package-lock.json were updated).
    4. If there are changes:
        3.1.1 Add and commit files to the target branch.
        3.1.2 Create a pull request from to the base branch using octokit API.
    5. If there are no changes, log that dependencies are up to date and exit.
  */
  core.info('Starting the JS dependency update action...');
}

run()