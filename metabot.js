setInterval(tick, 3000)

var d = document.createElement('div')
var s = ''
	+ '.is_bot { background: #FEE !important; }'
	+ '.is_bot .bot_text { display: none; color: #999; font-style: italic; }'
d.innerHTML = '<style>'+s+'</style>'
document.body.appendChild(d)

function tick()
{
	if (!BOT_ACCOUNTS) return

	var a = document.querySelectorAll('ytd-comment-renderer #header-author a.yt-simple-endpoint')

	var i, x, t
	for (i = 0; i < a.length; i++)
	if (!a[i].dataset.mt_is_upd)
	{
		if (x = /(user|channel)\/(.+)$/.exec(a[i].href)) x = x[2]
		else x = ''

		if (BOT_ACCOUNTS[x]) // проверка есть ли в базе
		{
			// подсвечиваем заголовок
			if (x) a[i].innerHTML += ' [БОТ]'
			a[i].style.color = 'red'
			a[i].title = 'Дата регистрации: ' + BOT_ACCOUNTS[x].date_rus;
			
			// контейнер комментария
			t = a[i]; while (t.id != 'main') t = t.parentNode
			t.className += ' is_bot'

			// убираем текст
			t = t.querySelector('#content-text')
			t.innerHTML = '<a href="/results?search_query=ЕРКЮ">#ЕРКЮ</a>'
				+ ' —﻿ <span onclick="this.parentNode.querySelector(\'div\').style.display=\'block\'" title="Нажми, чтобы посмотреть" style="cursor: pointer">комментарий бота спрятан...</span>'
				+ '<div class="bot_text">' + t.innerHTML + '</div>'
		}

		a[i].dataset.mt_is_upd = 1
	}
}
