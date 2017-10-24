# Branching

An overview of how this project handles branching.

## Feature branch

When a contributor wishes to make a change on the repository, they must first checkout develop, pull the latest version, then create a feature branch from develop.

The branch name should look something like this:

`issue-8-short-description-of-change`

If there is an issue on the latest production branch, we may create a branch off of master.

## Pull Request

Once the feature branch is complete, a pull request must be made to the appropriate branch -- develop for a feature, or master for a hotpatch.

The pull request must pass the Semaphore build before being merged in. When mergeing, the commit message must follow the following conventions:

| Message  | Release Type | Description                                   | 
|----------|--------------|-----------------------------------------------|
| feat     | Minor        | A new feature being added to the application  |
| fix      | Patch        | A bug fix                                     | 
| perf     | Patch        | A performance issue fix                       |

The commit message must look like this:

`message: a short description (issue-#)`

## Deployment

When we are ready to cut a release for deployment, we must checkout the master branch, merge develop into master, then push master to origin.

This will kick off the Semaphore build and, if successful, will create a new release and publish to the NPMJS Registry for us.