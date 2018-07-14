// каждые 3 секунды на странице помечаются твиты от ботов, не помеченные ранее
setInterval(tick, 3000)


// добавляем стили для пометки ботов

var d = document.createElement('div')

// стиль для пометки красноватым фоном твитов от ботов
if(JSON.parse(document.querySelector('#init-data').value)["night_mode_activated"])
{
	var s = '.is_bot { background: #4b3333 !important; }'
} else {
	var s = '.is_bot { background: #FEE !important; }'
}
 	
// стиль для пометки блёклым текста твитов от ботов
 s += '.is_bot .bot_text { color: #808080; }'

 d.innerHTML = '<style>'+s+'</style>'
 document.body.appendChild(d)
 

function tick()
{
	var a=document.querySelectorAll('#permalink-overlay div.tweet')

	var i, x, t
	for (i = 0; i < a.length; i++)
	if (!a[i].dataset.mt_is_upd)
	{
		// выделяем все твиты, показанные на странице
		x=Number(a[i].getAttribute("data-user-id"))
		var actionName=""
		
		t = a[i]
		
		if (BOT_ACCOUNTS[x]) // проверка, есть ли пользователь в списке известных ботов
		{
			// подсвечиваем весь твит стилем is_bot
			//a[i].innerHTML += '&nbsp;[БОТ]'
			t.className += ' is_bot'
			
			// дописываем "БОТ: " перед именем автора твита
			fullNm=t.querySelector('span.FullNameGroup')
			fullNm.style.color = 'red'
			fullNm.innerHTML = "БОТ:&nbsp;" + fullNm.innerHTML

			// делаем текст твита более блёклым
			tweetTxt=t.querySelector('div.js-tweet-text-container p.tweet-text')
			tweetTxt.className = 'bot_text ' + tweetTxt.className
			
			menuAction = "Предложить реабилитировать"
			dmAction = "Реабилитировать из ботов"
		} else {
			menuAction = "Сообщить о кремлеботе"
			dmAction = "В кремлеботы"
		}
		// добавляем пункт меню "Пожаловаться / Реабилитировать" 
		twtBtn=t.querySelector('div.ProfileTweet-action div.dropdown-menu ul')

		tweetPermalink=(new URL(t.getAttribute("data-permalink-path") , document.location)).href
		// screenName=t.getAttribute("data-screen-name")
		// fullName=t.getAttribute("data-name")
		twtBtn.innerHTML +='<li class="dropdown-divider" role="presentation"></li>'
		twtBtn.innerHTML +="<li role='presentation'><a href=\"https://twitter.com/messages/compose?recipient_id=973677193816571905&text="+encodeURIComponent(tweetPermalink + "\n" + dmAction + ", вот почему:\n") + "\" target=\"_blank\">"+menuAction+"</a></li>"
		
		// помечаем твит как обработанный, чтобы впредь на него не тратить время
		a[i].dataset.mt_is_upd = 1
	}
}
