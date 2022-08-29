#!/bin/bash
. credentials/set_remote_source_for_bots.sh

labels_file="labels.json"

scp -p \
  "$remote_username"@"$remote_host":"$remote_location/$labels_file" \
  assets
