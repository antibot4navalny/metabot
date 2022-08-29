. credentials/set_mozilla_AMO_credentials.sh
. channel_specific/set_firefox_extension_ID.sh
. channel_specific/set_firefox_channel_option.sh

echo "webext signing:" >&2

#cd "sources"

### Not required at the moment:
# WEB_EXT_API_KEY="$JWT_user"
# WEB_EXT_API_SECRET="$JWT_secret"
# WEB_EXT_ID="{$extension_ID}"
# WEB_EXT_SOURCE_DIR="sources"

### Reports "The WebExtension could not be signed" but actually successfully submits for review:
# node_modules/.bin/webext submit \
# 	--source-dir="sources" \
# 	--api-key="$JWT_user" \
# 	--api-secret="$JWT_secret" \
# 	--id="{$extension_ID}"

## Original: Submits successfully but also reports stacktrace 

	# TODO: Try using https://github.com/fregante/web-ext-submit to avoid misleading error message
	# ...until this issue is fixed: https://github.com/mozilla/web-ext/issues/804

web-ext sign \
	"$channel_option" \
	--source-dir="releases/Firefox_readonly_copy" \
	--artifacts-dir="releases" \
	--api-key="$JWT_user" \
	--api-secret="$JWT_secret" \
	--id="{$extension_ID}"



echo "Generating JWN Auth token:" >&2
JWT_auth_token=`./build_scripts/generate_JWT_auth_token.sh "$JWT_user" "$JWT_secret"`

# echo "Uploading the updated extension:" >&2
# # !! Works to update specifically the already-listed:
# curl "https://addons.mozilla.org/api/v4/addons/{$extension_ID}/versions/0.2.28/" -g -XPUT --form "upload=@web-ext-artifacts/metabot_for_twitter-0.2.28-an+fx.xpi" -H "Authorization: JWT $JWT_auth_token"
# 

###############################
# 
# ### WebApps only:
# curl "https://addons.mozilla.org/api/v4/addons/" \
#      -g -XPOST -F "upload=web-ext-artifacts/metabot_for_twitter-0.2.15-an+fx.xpi" -F "version=0.2.15" \
#      -H "Authorization: JWT $JWT_user"
# 
# 
# ### ?? General programattic use:
# curl "https://addons.mozilla.org/api/v4/addons/metabot-for-twitter/versions/0.2.15/" \
#     -g -XPUT --form "upload=web-ext-artifacts/metabot_for_twitter-0.2.15-an+fx.xpi" \
#     -H "Authorization: JWT $JWT_user"

# {
#     "iss": "$JWT_user",
#     "jti": "0.473...",
#     "iat": 1447273096,
#     "exp": 1447273156
# }

# exp: expiration time. It should be a Unix epoch timestamp in UTC time and must be no longer than five minutes past the issued at time.
