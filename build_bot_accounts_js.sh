	echo "/**" > bot_accounts.js
	date -u "+ * @updated: %Y-%m-%d %H:%M:%S" >> bot_accounts.js

	if [ ! -z ${csv_db_URL+x} ]; then	# if variable set
		echo " * @source " "$csv_db_URL" >> bot_accounts.js
	fi
	echo "*/" >> bot_accounts.js

	echo "var BOT_ACCOUNTS = {" >> bot_accounts.js
	awk '{printf "\"%s\": {},\n", $0}' bot_accounts.csv >> bot_accounts.js
	echo "}" >> bot_accounts.js

	echo "var SCREEN_NAMES = {" >> bot_accounts.js
	tt-users-get-hydrated --user-ids bot_accounts.csv |
		jq '. | .screen_name' |
		sed -e 's/$/: {},/' \
		>> bot_accounts.js
	echo "}" >> bot_accounts.js
	
	echo "DB updated." >&2
# 	echo "Ready to continue?" >&2
# 	read -n 1 -s	

	mv bot_accounts.js metabotTwitter
