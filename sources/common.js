function getInitData()
{
	initData=
		document.querySelector('#init-data')
	if (initData)
		return JSON.parse(initData.value)
	else
		return null
}

var screennameRegex="[A-Za-z0-9_]+"
