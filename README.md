<p align="center">
  <a href="https://github.com/digicatapult/check-version/actions"><img alt="check-version status" src="https://github.com/digicatapult/check-version/workflows/build-test/badge.svg"></a>
</p>

# Compares versions in package.json and package-lock.json and check they are higher than the latest published tag also does for Cargo and Poetry manager

This action can read package.json and package-lock.json as well as Cargo.toml and pyproject.toml version property and asserts that they are the same.

The action then gets all tags, selects the newest one per semver rules and checks that your local version is higher than newest published tag.

## To use this action in your workflow, provide these inputs:

```
with:
  package_manager: 'npm' // optional
  location: './' // optional
  token: ${{ secrets.GITHUB_TOKEN }}
  fail_on_same_version: 'true' // optional
```

| input                | required | default | description                                                                                 |
| :------------------- | :------: | :-----: | :------------------------------------------------------------------------------------------ |
| package_manager      |    N     |  `npm`  | Provide a package manager as a string. 'npm' is default, other options: `cargo`,` `poetry`` |
| location             |    N     |  `./`   | Provide path to package/toml files. Default is `./`                                         |
| token                |    Y     |    -    | Provide `${{ secrets.GITHUB_TOKEN }}` so the action can access the GitHub API               |
| fail_on_same_version |    N     | `true`  | Set whether the action should fail if the version exactly matches the latest published tag. |

## This action produces these outputs:

```
is_new_version:
    description: 'boolean indicating if this is a new version'
version:
    description: 'current version'
build_date:
    description: 'date of the build'
is_prerelease:
    description: 'boolean indicating if this is a prerelease'
npm_release_tag:
    description: 'release tag for npm packages. `latest` or `next`'
```
