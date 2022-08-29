#!/bin/bash
. ../../common/sh/utils/common_funcs.sh
. build_scripts/credentials/set_remote_source_for_bots.sh

labels_file="assets/labels.json"

scp -p \
  "$remote_username"@"$remote_host":"$remote_location/$labels_file" \
  assets
