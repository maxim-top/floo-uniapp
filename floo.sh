#!/bin/sh

test ! -n "$1" && echo "Please specify project name" && exit 1

project=$1
echo "Creating new project: $project"

pdir="./$project"
mkdir -p $pdir

cp LICENCE-MAXIM.md $pdir/
cp README-project.md $pdir/README.md
cp ChangeLog.md $pdir/
cp .gitignore $pdir/
cp prettier.config.js $pdir/
cp .prettierignore $pdir/

cp app.css $pdir/
cp App.vue $pdir/
cp main.js $pdir/
cp manifest.json $pdir/
cp pages.json $pdir/
cp package.json $pdir/
cp sitemap.json $pdir/

cp -R third $pdir/
cp -R pages $pdir/
cp -R pages_chat $pdir/
cp -R static $pdir/

rm -rf $pdir/sdk

mkdir -p $pdir/im
cp floo-3.0.0.uniapp.js $pdir/im/

find $pdir -type f | xargs gsed -i'' -E "s/import flooim from (.*)\/sdk\/index';/import flooim from \1\/im\/floo-3.0.0.uniapp';/g"

echo "done."
