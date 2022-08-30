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

  manifest3template_for_channel()
  {
    manifest_for_channel "metadata/manifest3.template.json"
  }


  remove_manifest_fields()
  {
    fields="$1"

    jq \
      'del('"$fields"')'
  }
  
	clone_ext_contents_to_folder()
	{
		destination="$1"

		if script_argument_not_supplied destination; then
			echo "clone_ext_body_to_folder: ERROR: Destination folder is not specified" >&2
			exit 1
		else
		
			# Overall design:
			# - no recursion, copy immediate childs only
			# - sync: remove in destination what's not in source;
			# - don't copy what not changed
			# - create destination folder if not exists
			rsync \
				\
				`# transfer directories without recursing` \
				--dirs \
				\
				`# preserve times, executability` \
				--times --executability \
				\
				`# Delete that files from the receiving side` \
				`# that arent on the sending side.` \
				`# Files that are excluded from transfer are also excluded` \
				`# from being deleted ` \
				--delete \
				\
				`# dont delete $destination/assets/labels.json,` \
				`# $destinaton/manifest.json` \
				--exclude assets/ \
				--exclude manifest.json \
				\
				`# don't copy 'unused' extension scripts to destination` \
				--exclude unused/ \
				\
				`# trailing '/': copy the contents of this directory,` \
				`# as opposed to "copy the directory by name":` \
				"sources/" \
				\
				"$destination"
			 # ^^ Whole directories should be specified:
			 #  'dir' or 'dir/',
			 # not wildcards: 'dir/*'

		
			rsync \
				--times --executability \
				"assets/labels.json" \
				"$destination/assets/"
		fi  
	}
	
	zip_folder_to()
	{
		original_location="$(pwd)"
		source_folder="$1"
		destination_zip="$original_location/$2"
		
		cd "$source_folder"
		
		zip \
 			--recurse-paths \
			--filesync \
			"$destination_zip" \
			\
			`# Current folder (and its subfolders):` \
			. \
			--exclude ".DS_Store"

		cd "$original_location"
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
	clone_ext_contents_to_folder "releases/forFirefoxAMO"
	
	manifest2template_for_channel |
	remove_manifest_fields '
		.update_url,
		.background.persistent' \
		> "releases/forFirefoxAMO/manifest.json"
		
	zip_folder_to \
		"releases/forFirefoxAMO" \
		"releases/Firefox_local_debug.zip"


# Firefox Manifest3 version
	clone_ext_contents_to_folder "releases/forFirefoxAMO_manifestV3"
	rm "releases/forFirefoxAMO_manifestV3/background.html"

#   "background": {
#     "service_worker": "background.js", // Chrome
#     "scripts": ["background.js"]  // Firefox
#   }

	manifest2template_for_channel |
	jq '.background.scripts=[.background.service_worker] ' |
  remove_manifest_fields '
    .update_url,
    .background.service_worker'	 \
	  > "releases/forFirefoxAMO_manifestV3/manifest.json"

	zip_folder_to \
		"releases/forFirefoxAMO_manifestV3" \
		"releases/Firefox_manifestV3_local_debug.zip"


# For Chrome and Opera, strip unsupported field
	clone_ext_contents_to_folder "releases/ChromeOpera_debug_and_WebStore"
	
	manifest3template_for_channel |
	remove_manifest_fields \
	  '.browser_specific_settings'	 \
	> "releases/ChromeOpera_debug_and_WebStore/manifest.json"

# For Opera self-distribution of CRX via GitHub

	crx pack \
		--crx-version 3 \
		-o "releases/ChromeOpera_self_distribution.crx" \
		-p "credentials/metabotTwitter.pem" \
		"releases/ChromeOpera_debug_and_WebStore"

#	 Previously:
# 	 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension="releases/ChromeOpera_debug_and_WebStore" --pack-extension-key="credentials/metabotTwitter.pem" --profile-directory="Profile 12"


# For Chrome, remove update_url which is only necessary for Opera self-hosting
	manifest3template_for_channel |
	remove_manifest_fields '.update_url, .browser_specific_settings' \
	> "releases/ChromeOpera_debug_and_WebStore/manifest.json"


# For Chrome, ZIP is used in update_chrome_web_store_version.sh
# to publish to Chrome Web Store
	zip_folder_to \
		"releases/ChromeOpera_debug_and_WebStore" \
		"releases/forChromeWebStore.zip"
