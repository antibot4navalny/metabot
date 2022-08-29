  #!/bin/bash
  . ../../common/sh/utils/common_funcs.sh

  cat_arg_or_stdin()
  {
    arg="$1"
    if script_argument_supplied arg; then
      cat "$arg"
    else
      cat
    fi 
  }

  put_version_info_manifest()
  {
    cat_arg_or_stdin "$@" |
    jq --arg new_version "$version" \
      '.version=$new_version'
  }
  
  manifest_for_channel()
  {
    cat_arg_or_stdin "$@" |
    json5 |
    jq \
      --arg channel "$(<channel_specific/manifest_channel.txt)" \
      --from-file "build_scripts/manifest_for_channel.jq" |

    put_version_info_manifest
  }

  manifest2template_for_channel()
  {
    manifest_for_channel "metadata/manifest.template.json"
  }

  remove_manifest_fields()
  {
    fields="$1"

    jq \
      'del('"$fields"')'
  }
  

	. build_scripts/set_version.sh

# For all browsers
	
  # If file exists and not empty--
  # updates.xml make sense only for public self-hosted releases.
	if [[ -s "channel_specific/updates.template.xml" ]]
  then
    sed -E "s/VVVVVV/$version/" "channel_specific/updates.template.xml" > "channel_specific/updates.xml"
  fi

# For Firefox, save a copy with full manifest
	cp metabotTwitter/* releases/Firefox_readonly_copy

	manifest2template_for_channel |
	remove_manifest_fields '
		.update_url,
		.background.persistent' |

	grep --invert-match \
		--regexp='"hot-reload.js",' \
		--regexp='"flags.js"' \

		> "releases/Firefox_readonly_copy/manifest.json"
		
	rm releases/FirefoxTestBuild.zip
	zip releases/FirefoxTestBuild.zip \
	  releases/Firefox_readonly_copy/* \
	  --junk-paths


# For Chrome and Opera, strip unsupported feild
	cp -p metabotTwitter/* releases/ChromeOpera_readonly_copy

	manifest2template_for_channel |
	remove_manifest_fields '
		.browser_specific_settings'	 \
	> "releases/ChromeOpera_readonly_copy/manifest.json"

# For Opera self-distribution of CRX via GitHub
	rm releases/metabotTwitter.crx
	extensionator -o releases/metabotTwitter.crx -i "credentials/metabotTwitter.pem" -d releases/ChromeOpera_readonly_copy -e .DS_Store 
#	 Previously:
# 	 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension=metabotTwitter --pack-extension-key="credentials/metabotTwitter.pem" --profile-directory="Profile 12"


# For Chrome, remove update_url which is only necessary for Opera self-hosting
	manifest2template_for_channel |
	remove_manifest_fields '.update_url, .browser_specific_settings' \
	> "releases/ChromeOpera_readonly_copy/manifest.json"


# For Chrome
	rm releases/metabotTwitter.zip
	zip --recurse-paths releases/metabotTwitter.zip releases/ChromeOpera_readonly_copy --exclude "*/.DS_Store" --junk-paths
