<p align="center">
  <a href="https://github.com/digicatapult/check-version/actions"><img alt="check-version status" src="https://github.com/digicatapult/check-version/workflows/build-test/badge.svg"></a>
</p>

# Compares versions in package.json and package-lock.json and check they are higher than the latest published tag

This action reads package.json and package-lock.json version property and asserts that they are the same. The action fails if they are not.

The action then gets all tags, selects the newest one per semver rules and checks that your local version is higher than newest published tag.

## To use this action in your workflow, provide these inputs:

```
with:
  npm_package_location: './' // optional
  token: ${{ secrets.GITHUB_TOKEN }}
  fail_on_same_version: 'true' // optional
```

| input                | required | default | description                                                                                                          |
| :------------------- | :------: | :-----: | :------------------------------------------------------------------------------------------------------------------- |
| npm_package_location |    N     |  `./`   | If `package.json` and `package-lock.json` are not in the root directory, provide the correct path to their location. |
| token                |    Y     |    -    | Provide `${{ secrets.GITHUB_TOKEN }}` so the action can access the GitHub API                                        |
| fail_on_same_version |    N     | `true`  | Set whether the action should fail if the version exactly matches the latest published tag.                          |

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
```