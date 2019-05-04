SCRIPTPATH=$(dirname "$0")
echo "Switching to script folder:""$SCRIPTPATH" >&2
cd "$SCRIPTPATH"

# ./download_current_blocktogether_blacklist.sh
./get_bots_locally.sh

if cmp --quiet bot_accounts.csv bot_accounts.previous.csv; then
	echo "No changes in DB to push" >&2
	exit 1
else
	echo "DB changes detected, preparing to push them." >&2
# 	echo Sounds right?" >&2
# 	read -n 1 -s

	. ./build_bot_accounts_js.sh
	. ./build_packaged_extension.sh
	. ./increment_extension_version.sh

	. ./update_git_version.sh
	./update_chrome_web_store_version.sh
	./update_mozilla_addons_version.sh

	mv bot_accounts.csv bot_accounts.previous.csv
	exit 0
fi
