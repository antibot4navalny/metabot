#!/bin/bash
. ../../common/sh/utils/common_funcs.sh
. ./credentials/set_remote_source_for_bots.sh

labels_file="labels.json"

scp -p \
  "$remote_username"@"$remote_host":"$remote_location/$labels_file" \
  metabotTwitter
