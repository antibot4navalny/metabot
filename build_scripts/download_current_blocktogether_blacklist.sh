csv_db_URL="https://blocktogether.org/show-blocks/HYZ_Qq1P1xyxcDDbgLQ3l8OhhFLAolDZvpUqHP3A"
	# @antibot_blklist

while
	../../common/sh/utils/ensure_internet_connection.sh
	curl --silent "$csv_db_URL".csv > bot_accounts.csv
	[ ! -s "bot_accounts.csv" ]		# The loop ending test
do :; done
