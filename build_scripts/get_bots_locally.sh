. credentials/set_local_source_for_validated_bots.sh

cat "$validated_bots_location" | 
../../common/sh/utils/extract_IDs_from_account_classes.sh \
> bot_accounts.csv
