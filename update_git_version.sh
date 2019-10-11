	git add metabotTwitter.crx updates.xml next_version.txt metabotTwitter/bot_accounts.js
		# metabotTwitter/manifest.json

	git commit -m "update list of known bots"
	echo "About to push DB changes." >&2
# 	echo "Sounds good?" >&2
# 	read -n 1 -s

	git push
