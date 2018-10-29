. ./set_chrome_web_store_credentials.sh

echo "Open your browser and get auth key at this URL:"
echo
echo -n "https://accounts.google.com/o/oauth2/auth?"
echo -n "response_type=code&"
echo -n "scope=https://www.googleapis.com/auth/chromewebstore&"
echo -n "client_id=$CLIENT_ID&"
echo -n "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
echo

read -p "Enter auth key: " AUTH_CODE

access_tokens=$(mktemp).json || exit 1
trap "rm -f \"$access_tokens\"" EXIT

curl \
	--silent --show-error \
	"https://accounts.google.com/o/oauth2/token" \
	--data-urlencode "client_id=$CLIENT_ID" \
	--data-urlencode "client_secret=$CLIENT_SECRET" \
	--data-urlencode "code=$AUTH_CODE" \
	--data "grant_type=authorization_code" \
	--data "redirect_uri=urn:ietf:wg:oauth:2.0:oob" > "$access_tokens"

# echo "Access tokens saved to: <""$access_tokens"">:"
# cat "$access_tokens"
# 
# echo
# echo "Now proceeding to uploading to webstore"

refresh_token=`jq -r '.refresh_token' "$access_tokens"`
echo "Using refresh token: <$refresh_token>"

# echo "Ready to proceed?"
# read -n 1 -s < /dev/tty
# 
node_modules/.bin/webstore \
	upload \
	--source "metabotTwitter.zip" \
	--extension-id cooadmmiojjmmfifkcainbnmhghfcbfi \
	--client-id $CLIENT_ID \
	--client-secret $CLIENT_SECRET \
	--refresh-token $refresh_token

node_modules/.bin/webstore \
	publish \
	--extension-id cooadmmiojjmmfifkcainbnmhghfcbfi \
	--client-id $CLIENT_ID \
	--client-secret $CLIENT_SECRET \
	--refresh-token $refresh_token
