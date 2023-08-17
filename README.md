<p align="center">
  <a href="https://github.com/digicatapult/check-version/actions"><img alt="check-version status" src="https://github.com/digicatapult/check-version/workflows/build-test/badge.svg"></a>
</p>

# Compares versions in package.json and package-lock.json and check they are higher than the latest published tag

This action reads package.json and package-lock.json version property and asserts that they are the same. The action fails if they are not.

The actiuon then gets all tags, selects the newest one per semver rules and checkes that your local version is higher than newest published tag. It fails otherwise.

## To use this action in your workflow, provide these inputs:

```
with:
  npm_package_location: './'
  token: ${{ secrets.GITHUB_TOKEN }}
```

npm_package_location - default is ./
If package.json and package-lock.json are not in the root directory, provide the correct path to their location.

## This action produces these outputs:

```
is_new_version:
    description: 'boolean indicating if this is a new version true'
version:
    description: 'current version'
build_date:
    description: 'date of the build'
is_prerelease:
    description: 'boolean indicating if this is a prerelease true'
```
