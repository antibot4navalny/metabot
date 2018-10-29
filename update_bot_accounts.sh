SCRIPTPATH=$(dirname "$0")
echo "Switching to script folder:""$SCRIPTPATH"
cd "$SCRIPTPATH"

csv_db_URL="https://blocktogether.org/show-blocks/SiJai3FyVmodO0XxkL2r-pezIK_oahHRwqv9I6U3"

curl --silent "$csv_db_URL".csv > bot_accounts.csv

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

	echo "var SCREEN_NAMES = {" >> bot_accounts.js
	tt-users-get-hydrated --user-ids bot_accounts.csv |
		jq '. | .screen_name' |
		sed -e 's/$/: {},/' \
		>> bot_accounts.js
	echo "}" >> bot_accounts.js
	
	echo "DB updated. Ready to continue?"
	read -n 1 -s	

	mv bot_accounts.js metabotTwitter

	version=`cat next_version.txt`
	
	
	sed -E "s/VVVVVV/$version/" manifest.template.json > MetabotTwitter/manifest.json
	sed -E "s/VVVVVV/$version/" updates.template.xml > updates.xml

	extensionator -o ./metabotTwitter.crx -i metabotTwitter.pem -d metabotTwitter -e .DS_Store

#	 Previously:
# 	 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension=metabotTwitter --pack-extension-key=metabotTwitter.pem --profile-directory="Profile 12"


	grep --invert-match '"update_url":' metabotTwitter/manifest.json > "for_Chrome_Store/manifest.json"
	rm metabotTwitter.zip
	zip --recurse-paths metabotTwitter.zip metabotTwitter for_Chrome_Store --exclude "metabotTwitter/manifest.json" --exclude "*/.DS_Store" --junk-paths

	## increment the rightmost component of version (assuming there is has at least two components)
	version="${version%.*}.$((${version##*.}+1))"
	echo $version > next_version.txt

	git add metabotTwitter.crx updates.xml next_version.txt metabotTwitter/manifest.json metabotTwitter/bot_accounts.js

	git commit -m "$version: update bot list from blocktogether"
	echo "About to push DB changes. Sounds good?"
	read -n 1 -s
	git push

	./update_chrome_web_store_version.sh

	mv bot_accounts.csv bot_accounts.previous.csv
	exit 0
fi
