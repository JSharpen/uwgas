---
name: sandbox-workflow
description: >-
  Use this skill when the user asks to start an experiment, enter a sandbox, reset/nuke a broken sandbox branch, or promote a successful sandbox branch back to dev.
---

# Sandbox Experimental Workflow

This skill defines how to safely isolate risky experimental work for the UWGAS project.

## 1. Enter Sandbox Mode
When the user asks to start an experiment or enter the sandbox:
1. Verify the current working tree is clean (`git status`). Stash or commit if dirty.
2. Ensure you are branching from the latest `dev`:
   `git checkout dev && git pull origin dev`
3. Create and switch to the sandbox branch:
   `git checkout -b sandbox dev` (if it doesn't exist) or `git checkout sandbox`

## 2. Nuke & Reset Sandbox
When an experiment fails and the user asks to scrap it or reset the sandbox:
1. Switch back to dev and update:
   `git checkout dev && git pull origin dev`
2. Force-delete the broken sandbox branch:
   `git branch -D sandbox`
3. Recreate a fresh sandbox from dev:
   `git checkout -b sandbox dev`

## 3. Promote Sandbox to Dev
When an experiment succeeds and the user asks to lock it in or promote it to dev:
1. Ensure the sandbox is committed and working tree is clean.
2. Run strict quality checks before merging:
   `npm run typecheck && npm run lint`
3. Switch to dev:
   `git checkout dev`
4. Merge the sandbox:
   `git merge sandbox -m "Merge successful sandbox experiment into dev"`
5. Push to GitHub:
   `git push origin dev`

