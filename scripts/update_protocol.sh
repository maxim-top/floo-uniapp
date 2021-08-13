#!/bin/sh

web_root="../../floo-web/src/sdk/core/"
minip_root="../imsdk/core/"
pdir="protocol" 

cp -r ${web_root}${pdir} ${minip_root}

find ${minip_root}${pdir} -type f | xargs -i gsed -i 's/protobufjs\/light/protobufjs/g' {} 

./web_patch.sh
