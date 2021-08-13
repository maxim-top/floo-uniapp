#!/bin/sh

comm=$1
test -z $comm && comm="create"

web_root="../../floo-web/src/sdk/"
minip_root="../imsdk/"
patch_dir="./patches/"

declare -a source_dirs=("utils" "core/base" "core/protocol" "model" "manage")

if [ "$comm" == "create" ] ; then
  echo "create patches ..."
  mkdir -p $patch_dir

  let i=0
  for d in ${source_dirs[@]}
  do
    let i++
    echo "create patch for $d"
    patch_file=`printf "%04d" $i`-${d//\//\-}.patch
    diff -r -u ${web_root}$d ${minip_root}$d  > ${patch_dir}${patch_file}
  done

  echo "$i patches generated"
  ls ${patch_dir}

else
  echo "apply patches ..."
  for p in `ls patches`
  do  
    echo "apply patch $p"
  done
fi
  