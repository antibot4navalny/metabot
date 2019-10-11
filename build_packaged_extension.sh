	. ./set_version.sh

# For all browsers
	sed -E "s/VVVVVV/$version/" manifest.template.json > metabotTwitter/manifest.json
	sed -E "s/VVVVVV/$version/" updates.template.xml > updates.xml

# For Firefox, save a copy with full manifest
	cp metabotTwitter/* Firefox_readonly_copy

# For Chrome and Opera, strip unsupported feild
	grep --invert-match --regexp='"browser_specific_settings":' "Firefox_readonly_copy/manifest.json" > "metabotTwitter/manifest.json"

# For Opera self-distribution of CRX via GitHub
	rm metabotTwitter.crx
	extensionator -o ./metabotTwitter.crx -i metabotTwitter.pem -d metabotTwitter -e .DS_Store -e .web-extension-id
#	 Previously:
# 	 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension=metabotTwitter --pack-extension-key=metabotTwitter.pem --profile-directory="Profile 12"


# For Chrome, remove update_url which is only necessary for Opera self-hosting
	grep --invert-match --regexp='"update_url":' --regexp='"browser_specific_settings":' "Firefox_readonly_copy/manifest.json" > "metabotTwitter/manifest.json"


# For Chrome
	rm metabotTwitter.zip
	zip --recurse-paths metabotTwitter.zip metabotTwitter --exclude "*/.DS_Store" --exclude "metabotTwitter/.web-extension-id" --junk-paths
