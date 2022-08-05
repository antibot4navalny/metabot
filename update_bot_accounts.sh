SCRIPTPATH=$(dirname "$0")
echo "Switching to script folder:""$SCRIPTPATH" >&2
cd "$SCRIPTPATH"

# ./download_current_blocktogether_blacklist.sh
# ./get_bots_locally.sh
  ./retrieve_bots_list.sh

if cmp --quiet metabotTwitter/labels.json labels.previous.json; then
	echo "No changes in DB to push" >&2
	exit 1
else
	echo "DB changes detected, preparing to push them." >&2
# 	echo Sounds right?" >&2
# 	read -n 1 -s

	./build_packaged_extension.sh
	./increment_extension_version.sh

	./update_git_version.sh
	./update_chrome_web_store_version.sh
	./update_mozilla_addons_version.sh

	cp metabotTwitter/labels.json labels.previous.json
	exit 0
fi
