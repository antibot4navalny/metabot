	git add metabotTwitter.crx updates.xml next_version.txt metabotTwitter/manifest.json metabotTwitter/bot_accounts.js

	git commit -m "$version: update bot list from blocktogether"
	echo "About to push DB changes." >&2
# 	echo "Sounds good?" >&2
# 	read -n 1 -s

	git push
