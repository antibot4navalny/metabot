csv_db_URL="https://blocktogether.org/show-blocks/SiJai3FyVmodO0XxkL2r-pezIK_oahHRwqv9I6U3"

while
	../../common/sh/utils/ensure_internet_connection.sh
	curl --silent "$csv_db_URL".csv > bot_accounts.csv
	[ ! -s "bot_accounts.csv" ]		# The loop ending test
do :; done
