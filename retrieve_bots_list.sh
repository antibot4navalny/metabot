#!/bin/bash
. ../../common/sh/utils/common_funcs.sh
. ./set_remote_source_for_bots.sh

create_temp_burner_dir burner_location

bots_list="bots.tsv"
prospects_list="prospects.tsv"


scp -p \
  "$remote_username"@"$remote_host":"$remote_location/$bots_list" \
  "$remote_username"@"$remote_host":"$remote_location/$prospects_list" \
  "$burner_location"

cat \
  "$burner_location/$bots_list" \
  "$burner_location/$prospects_list" |
  
cut -f 1,1 > "bot_accounts.csv"
