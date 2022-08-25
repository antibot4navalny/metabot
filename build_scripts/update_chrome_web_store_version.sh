. credentials/set_chrome_web_store_credentials.sh
. channel_specific/set_chrome_extension_ID.sh
. channel_specific/set_chrome_trusted_testers_option.sh

access_tokens=$(mktemp).json || exit 1
trap "rm -f \"$access_tokens\"" EXIT


### Use only earlier AUTH_CODE expired:

# echo "Open your browser and get auth key at this URL:"
# echo
# echo -n "https://accounts.google.com/o/oauth2/auth?"
# echo -n "response_type=code&"
# echo -n "scope=https://www.googleapis.com/auth/chromewebstore&"
# echo -n "client_id=$CLIENT_ID&"
# echo -n "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
# echo
# 
# read -p "Enter auth key: " AUTH_CODE
# 
# 
# ## Request refreshed access tokens:
# 
# curl \
# 	--silent --show-error \
# 	"https://accounts.google.com/o/oauth2/token" \
# 	--data-urlencode "client_id=$CLIENT_ID" \
# 	--data-urlencode "client_secret=$CLIENT_SECRET" \
# 	--data-urlencode "code=$AUTH_CODE" \
# 	--data "grant_type=authorization_code" \
# 	--data "redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
# 	> "$access_tokens"
# 
# echo "Access tokens saved to: <""$access_tokens"">:"
# cat "$access_tokens"
# # 
# # echo
# # echo "Now proceeding to uploading to webstore"
# 
# refresh_token=`jq -r '.refresh_token' "$access_tokens"`
# echo "Using refresh token: <$refresh_token>"
# 
# 
# ### curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&code=$CODE&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq '.refresh_token'


# echo Access tokens based on refresh token:
curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&refresh_token=$refresh_token&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" > "$access_tokens"
# cat "$access_tokens"
ACCESS_TOKEN=`jq -r '.access_token' "$access_tokens"`

# echo "Ready to proceed?"
# read -n 1 -s < /dev/tty

### Experimental (installed from:
###   https://github.com/fregante/chrome-webstore-upload-cli )

chrome-webstore-upload \
	upload \
	--source "releases/metabotTwitter.zip" \
	--extension-id "$extension_ID" \
	--client-id $CLIENT_ID \
	--client-secret $CLIENT_SECRET \
	--refresh-token $ACCESS_TOKEN



chrome-webstore-upload \
	publish \
	--extension-id "$extension_ID" \
	--client-id $CLIENT_ID \
	--client-secret $CLIENT_SECRET \
	--refresh-token $ACCESS_TOKEN \
	"$testers_option"
