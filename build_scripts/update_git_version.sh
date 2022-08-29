	git add releases/metabotTwitter.crx "channel_specific/updates.xml" next_version.txt assets/labels.json

	git commit -m "update list of known bots"
	echo "About to push DB changes." >&2
# 	echo "Sounds good?" >&2
# 	read -n 1 -s

	git push
