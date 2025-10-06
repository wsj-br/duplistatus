---
sidebar_position: 8
---

# Release Management

## Versioning (Semantic Versioning)

The project follows Semantic Versioning (SemVer) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR** version (x.0.0): When you make incompatible API changes
- **MINOR** version (0.x.0): When you add functionality in a backward-compatible manner
- **PATCH** version (0.0.x): When you make backward-compatible bug fixes

## Merging `devel-MAJOR.MINOR.PATCH` to `master` using command line

To release your new version, you'll need to merge the `devel-MAJOR.MINOR.PATCH` branch into the `master` branch. This process incorporates all the new code from `devel-MAJOR.MINOR.PATCH` into your stable `master` branch, making it ready for a new release.

### 1. Merge the `devel-MAJOR.MINOR.PATCH` Branch into `master`

First, ensure your local `master` branch is up to date with the remote repository. This prevents merge conflicts and ensures you're building on the latest released code.

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

Next, merge the `devel-MAJOR.MINOR.PATCH` branch into `master`. This will apply all the changes from `devel-MAJOR.MINOR.PATCH` to your `master` branch.

```bash
# Merge the devel-MAJOR.MINOR.PATCH branch into master
git merge devel-MAJOR.MINOR.PATCH
```

Git will attempt to automatically merge the branches. If there are any **merge conflicts**, you'll need to manually resolve them in the affected files. After resolving conflicts, use `git add` to stage the changes and `git commit` to finalize the merge.

### 2. Tag the New Release

Once the `devel-MAJOR.MINOR.PATCH` branch is successfully merged into `master`, you should tag the new version. This creates a permanent reference point in your project's history, making it easy to find and revert to specific releases. Use a **lightweight** or **annotated** tag, with annotated tags being generally preferred for releases as they include more metadata like a message, author, and date.

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - New Features and Bug Fixes"
```

The `-a` flag creates an annotated tag, and the `-m` flag lets you add a message describing the release.

### 3. Push to GitHub

Finally, push both the updated `master` branch and the new tag to your remote GitHub repository. This makes the changes and the new release visible to everyone.

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

You can also push all tags at once using `git push --tags`. After this, the new version will be visible on GitHub, and you can create a new release on the GitHub UI associated with your new tag.

## Merging `devel-MAJOR.MINOR.PATCH` to `master` using GitHub 

Instead of a direct merge, you will create a **Pull Request (PR)** from `devel-MAJOR.MINOR.PATCH` to `master`. A pull request is a formal way to propose and review changes before they're merged.

1.  Navigate to [duplistatus repository](https://github.com/wsj-br/duplistatus) on GitHub.
2.  Click the **"Pull requests"** tab.
3.  Click **"New pull request."**
4.  Set the **base branch** to `master` and the **compare branch** to `devel-MAJOR.MINOR.PATCH`.
5.  GitHub will show a preview of all the changes. Review them and ensure there are no conflicts.
6.  Click **"Create pull request."**
7.  Add a title and description, then click **"Create pull request"** again.

After the pull request is created, you will see a green **"Merge pull request"** button if there are no conflicts. Clicking this button will merge all the commits from `devel-MAJOR.MINOR.PATCH` into `master`. 

## Creating a GitHub Release

Once the merge is complete, you can create a new release on GitHub, which automatically creates a tag for you.

1.  Navigate to [duplistatus repository](https://github.com/wsj-br/duplistatus) on GitHub.
2.  Go to the **"Releases"** section 
3.  Click **"Draft a new release."**
4.  In the **"Choose a tag"** field, type your new version number in the format `vMAJOR.MINOR.PATCH`, like `v0.8.18`. This will create a new tag.
5.  Select `master` as the target branch.
6.  Add a **release title** and **description** to document the changes in this version.
7.  Click **"Publish release."**

This will automatically:
- Create new Docker images (AMD64 and ARM64 architectures)
- Push the images to Docker Hub 
- Push the images to GitHub Container Registry (ghcr.io/wsj-br/duplistatus:latest)

## Manual Docker Image Build

To manually trigger the Docker image build workflow:

1. Navigate to [duplistatus repository](https://github.com/wsj-br/duplistatus) on GitHub.
2. Click on "Actions" tab
3. Select the "Build and Publish Docker Image" workflow
4. Click "Run workflow"
5. Select the branch to build from
6. Click "Run workflow"
