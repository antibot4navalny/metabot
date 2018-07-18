csv_db_URL=https://blocktogether.org/show-blocks/SiJai3FyVmodO0XxkL2r-pezIK_oahHRwqv9I6U3

if [ -f bot_accounts.csv ]; then
	echo "Previous DB found, saving it..."
	mv bot_accounts.csv bot_accounts.previous.csv
fi

curl --silent https://blocktogether.org/show-blocks/SiJai3FyVmodO0XxkL2r-pezIK_oahHRwqv9I6U3.csv > bot_accounts.csv

if cmp --quiet bot_accounts.csv bot_accounts.previous.csv; then
	echo "No changes in DB to push"
	exit 1
else
	echo "DB changes detected, preparing to push them. Sounds right?"
	read -n 1 -s

	echo "/**" > bot_accounts.js
	date -u "+ * @updated: %Y-%m-%d %H:%M:%S" >> bot_accounts.js
	echo " * @source " $csv_db_URL >> bot_accounts.js
	echo "*/" >> bot_accounts.js

	echo "var BOT_ACCOUNTS = {" >> bot_accounts.js
	sed -e 's/$/: {},/' bot_accounts.csv >> bot_accounts.js
	echo "}" >> bot_accounts.js

	mv bot_accounts.js metabotTwitter

	version=`cat version.txt`
	
	## increment the rightmost component of version (assuming there is has at least two components)
	version="${version%.*}.$((${version##*.}+1))"
	
	sed -E "s/VVVVVV/$version/" manifest.template.json > MetabotTwitter/manifest.json
	sed -E "s/VVVVVV/$version/" updates.template.xml > updates.xml

	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=metabotTwitter --pack-extension-key=metabotTwitter.pem --profile-directory="Profile 12"

	echo $version > version.txt
	git add metabotTwitter.crx updates.xml version.txt metabotTwitter/manifest.json metabotTwitter/bot_accounts.js

	git commit -m "$version: update bot list from blocktogether"
	echo "About to push DB changes. Sounds good?"
	read -n 1 -s
	git push


	exit 0
fi
