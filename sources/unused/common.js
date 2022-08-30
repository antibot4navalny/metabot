function getInitData()
{
	initData=
		document.querySelector('#init-data')
	if (initData)
		return JSON.parse(initData.value)
	else
		return null
}
