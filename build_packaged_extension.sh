	. ./set_version.sh

	sed -E "s/VVVVVV/$version/" manifest.template.json > MetabotTwitter/manifest.json
	sed -E "s/VVVVVV/$version/" updates.template.xml > updates.xml

	extensionator -o ./metabotTwitter.crx -i metabotTwitter.pem -d metabotTwitter -e .DS_Store

#	 Previously:
# 	 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension=metabotTwitter --pack-extension-key=metabotTwitter.pem --profile-directory="Profile 12"


	grep --invert-match '"update_url":' metabotTwitter/manifest.json > "for_Chrome_Store/manifest.json"
	rm metabotTwitter.zip
	zip --recurse-paths metabotTwitter.zip metabotTwitter for_Chrome_Store --exclude "metabotTwitter/manifest.json" --exclude "*/.DS_Store" --junk-paths
