#!/bin/bash

# use provided repository or default to bpmn-io/diagram-js
REPO="${1:-bpmn-io/diagram-js}" 
GIT_REMOTE="git@github.com:$REPO.git"

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"
cd ..

npm run generate-docs

cd docs
git init
git add .
git commit -m "Deployed to Github Pages"
git checkout -b gh-pages

git remote add origin $GIT_REMOTE
git push --force $GIT_REMOTE gh-pages
