  #!/bin/bash
	. build_scripts/set_version.sh

# For all browsers
	sed -E "s/VVVVVV/$version/" manifest.template.json > metabotTwitter/manifest.json
	
  # If file exists and not empty--
  # updates.xml make sense only for public self-hosted releases.
	if [[ -s "channel_specific/updates.template.xml" ]]
  then
    sed -E "s/VVVVVV/$version/" "channel_specific/updates.template.xml" > "channel_specific/updates.xml"
  fi

# For Firefox, save a copy with full manifest
	cp metabotTwitter/* Firefox_readonly_copy
	grep --invert-match \
		--regexp='"update_url":' \
		--regexp='"hot-reload.js",' \
		--regexp='"persistent": false' \
		--regexp='"flags.js"' \
		"metabotTwitter/manifest.json" > \
		"Firefox_readonly_copy/manifest.json"
	rm FirefoxTestBuild.zip
	zip FirefoxTestBuild.zip Firefox_readonly_copy/* --junk-paths


# For Chrome and Opera, strip unsupported feild
	cp -p metabotTwitter/* ChromeOpera_readonly_copy
	grep --invert-match --regexp='"browser_specific_settings":' "metabotTwitter/manifest.json" > "ChromeOpera_readonly_copy/manifest.json"

# For Opera self-distribution of CRX via GitHub
	rm metabotTwitter.crx
	extensionator -o ./metabotTwitter.crx -i "credentials/metabotTwitter.pem" -d ChromeOpera_readonly_copy -e .DS_Store 
#	 Previously:
# 	 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension=metabotTwitter --pack-extension-key="credentials/metabotTwitter.pem" --profile-directory="Profile 12"


# For Chrome, remove update_url which is only necessary for Opera self-hosting
	grep --invert-match --regexp='"update_url":' --regexp='"browser_specific_settings":' "metabotTwitter/manifest.json" > "ChromeOpera_readonly_copy/manifest.json"


# For Chrome
	rm metabotTwitter.zip
	zip --recurse-paths metabotTwitter.zip ChromeOpera_readonly_copy --exclude "*/.DS_Store" --junk-paths
