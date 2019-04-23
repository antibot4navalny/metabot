SCRIPTPATH=$(dirname "$0")
echo "Switching to script folder:""$SCRIPTPATH" >&2
cd "$SCRIPTPATH"

./download_current_blocktogether_blacklist.sh

if cmp --quiet bot_accounts.csv bot_accounts.previous.csv; then
	echo "No changes in DB to push" >&2
	exit 1
else
	echo "DB changes detected, preparing to push them." >&2
# 	echo Sounds right?" >&2
# 	read -n 1 -s

	./build_packaged_extension.sh

	git add metabotTwitter.crx updates.xml next_version.txt metabotTwitter/manifest.json metabotTwitter/bot_accounts.js

	git commit -m "$version: update bot list from blocktogether"
	echo "About to push DB changes." >&2
# 	echo "Sounds good?" >&2
# 	read -n 1 -s
	git push

	./update_chrome_web_store_version.sh
	./update_mozilla_addons_version.sh

	mv bot_accounts.csv bot_accounts.previous.csv
	exit 0
fi
