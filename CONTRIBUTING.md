# Contributing

Contributing is always welcome! If you see something in the issues for the project and would like to take a stab at it, give it a shot and put in a pull request and it'll be looked at as soon as possible.

If you find an issue with the project, please submit an issue with the version of the package that you currently have:

`npm view action-runner version`

And the verison of node that you are running:

`node -v`

Along with any other useful information such as error messages/codes, operating system, environment, steps to recreate, etc.

Feature requests are also more than welcome!

## Branching

All branches should be made off of the develop branch unless specifically release related. Once you are finished with your branch, you must submit a pull request to be reviewed, and if successful, it will be merged back into develop.

Branches should include the issue number they are related to. We will not accept any pull requests that are not tied to an underlying issue.

Once we are ready to release the new package, we will then merge develop into master, and our test suite will be run and, if successful, a new release will be made

## Commits

We will be following the following commit scheme:

| Message  | Release Type | Description                                   | 
|----------|--------------|-----------------------------------------------|
| Breaking | Major        | Changes that break the current implementation |
| Fix      | Minor        | Bug fixes                                     | 
| Update   | Minor        | Updating features of the application          |
| New      | Minor        | Creating new features for the application     |

When you create your branch, feel free to commit as often as you like with whatever commit messages you see fit on your branch. When you submit your pull request and it is approved, the merger will squash your commits into a single commit with the correct message and merge it in.

## Compiling

This project uses typescript, and files must be compiled before they can be run. To install typescript on your machine, you can run the command `npm install typescript -g`, and once installed you can compile by running the command `tsc`, or you may run `tsc -w` to watch for changes and compile of file change.

## Tests

All pull requests should have appropriate tests associated with it unless specific valid reasoning is given why there should be no tests. All tests should be added in the appropriate files under `/src/spec` and all tests must pass for a pull request to be merged.

You can run the tests using the command `npm test` and run the test and view coverage information with `npm run coverage`.

## Thank you

All issues, ideas, comments, and pull requests are greatly appreciated! I'm excited to see what the GitHub community can do for action-runner, and I truly look forward to working with you all!