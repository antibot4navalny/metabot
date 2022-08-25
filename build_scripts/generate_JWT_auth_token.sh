#
# JWT Encoder Bash Script
#

JWT_user=$1
JWT_secret=$2

header='{
  "alg": "HS256",
  "typ": "JWT"
}'

jti=`jot -r 1  0 9999999999999999`

payload='{
    "iss": "'"$JWT_user"'",
    "jti": "0.'"$jti"'"
}'

# Use jq to set the dynamic `iat` and `exp`
# fields on the header using the current time.
# `iat` is set to now, and `exp` is now + 1 second.
payload=$(
	echo "${payload}" |
	jq --arg time_str "$(date +%s)" \
		'
		($time_str | tonumber) as $time_num
		| .iat=$time_num
		| .exp=($time_num + 300)
		'
)

base64_encode()
{
	declare input=${1:-$(</dev/stdin)}
	# Use `tr` to URL encode the output from base64.
	printf '%s' "${input}" | base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n'
}

json() {
	declare input=${1:-$(</dev/stdin)}
	printf '%s' "${input}" | jq -c .
}

hmacsha256_sign()
{
	declare input=${1:-$(</dev/stdin)}
	printf '%s' "${input}" | openssl dgst -binary -sha256 -hmac "${JWT_secret}"
}

header_base64=$(echo "${header}" | json | base64_encode)
payload_base64=$(echo "${payload}" | json | base64_encode)

# echo "Pre-encode header is:" >&2
# echo "${header}" >&2

# echo "Pre-encode payload is:" >&2
# echo "${payload}" >&2

header_payload=$(echo "${header_base64}.${payload_base64}")
signature=$(echo "${header_payload}" | hmacsha256_sign | base64_encode)

# echo "Encoded header is:" >&2
# echo "${header_payload}.${signature}" >&2
echo "${header_payload}.${signature}"
