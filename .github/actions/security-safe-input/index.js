const core = require('@actions/core');

async function run() {
  try {
    const prTitle = core.getInput('pr-title');
    if (prTitle.startsWith('feature:') || prTitle.startsWith('fix:')) {
      core.info('PR title is valid.');
    } else {
      core.setFailed('PR title is invalid.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();