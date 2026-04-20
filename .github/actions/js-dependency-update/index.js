const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const validateBranchName = ({branchName}) => {
  const branchNameRegex = /^[a-zA-Z0-9._-]+$/;
  return branchNameRegex.test(branchName);
}

const validateDirectoryName = ({directoryName}) => {
  const directoryNameRegex = /^[a-zA-Z0-9_-/]+$/;
  return directoryNameRegex.test(directoryName);
}

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

  const baseBranch = core.getInput('base-branch');
  const targetBranch = core.getInput('target-branch');
  const githubToken = core.getInput('github-token');
  const workingDirectory = core.getInput('working-directory');
  const debug = core.getBooleanInput('debug');

  const commonExecOptions = { 
    cwd: workingDirectory
  };

  core.setSecret(githubToken);

  if (debug) {
    core.info(`[js-dependency-update] Base branch: ${baseBranch}`);
    core.info(`[js-dependency-update] Target branch: ${targetBranch}`);
    core.info(`[js-dependency-update] Working directory: ${workingDirectory}`);
  }

  if (!validateBranchName({ branchName: baseBranch })) {
    core.setFailed(`Invalid base branch name: ${baseBranch}. Branch names can only contain letters, numbers, dots, underscores, and hyphens.`);
    return;
  }
  if (!validateBranchName({ branchName: targetBranch })) {
    core.setFailed(`Invalid target branch name: ${targetBranch}. Branch names can only contain letters, numbers, dots, underscores, and hyphens.`);
    return;
  }
  if (!validateDirectoryName({ directoryName: workingDirectory })) {
    core.setFailed(`Invalid working directory name: ${workingDirectory}. Directory names can only contain letters, numbers, underscores, hyphens, and slashes.`);
    return;
  }

  await exec.exec('npm update', [], {
    ...commonExecOptions
  });

  const gitStatusOutput = await exec.getExecOutput('git status -s package*.json', [], {
    ...commonExecOptions
  });

  let updatesAvailable = 'false';
  if (gitStatusOutput.stdout.trim() != '') {
    updatesAvailable = 'true';
    core.info('[js-dependency-update] Changes detected in package.json or package-lock.json. Committing changes and creating pull request...');
    await exec.exec(`git config --global user.name "gh-automation"`);
    await exec.exec(`git config --global user.email "gh-automation@example.com"`);
    await exec.exec(`git checkout -b ${targetBranch}`, [], {
      ...commonExecOptions
    });
    await exec.exec(`git add package.json package-lock.json`, [], {
      ...commonExecOptions
    });
    await exec.exec(`git commit -m "Update dependencies"`, [], {
      ...commonExecOptions
    });
    await exec.exec(`git push -u origin ${targetBranch} --force`, [], {
      ...commonExecOptions
    });
    // Create pull request using octokit API
    const octokit = github.getOctokit(githubToken);
    
    try {
      await octokit.rest.pulls.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        title: `Update dependencies - ${targetBranch}`,
        body: `This pull request updates the dependencies in package.json and package-lock.json.`,
        head: targetBranch,
        base: baseBranch
      });
    } catch (error) {
      core.error(`[js-dependency-update] Failed to create pull request`);
      core.setFailed(`[js-dependency-update] ${error.message}`);
    }
  } else {
    core.info('[js-dependency-update] No changes detected in package.json or package-lock.json. Dependencies are up to date.');
  }

  core.info(`Setting output "updates-available" to ${updatesAvailable}`);
  core.setOutput('updates-available', updatesAvailable);

}

run()