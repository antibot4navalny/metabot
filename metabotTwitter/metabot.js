// каждые 3 секунды на странице помечаются твиты от ботов, не помеченные ранее
setInterval(tick, 3000)


// добавляем стили для пометки ботов

var d = document.createElement('div')

// стиль для пометки красноватым фоном твитов от ботов

if (document.querySelector('#init-data') === null ||	// вероятно, мобильный режим
	!JSON.parse(document.querySelector('#init-data').value)["night_mode_activated"])
	var s = '.is_bot { background: #FEE !important; }'		// light
else
	var s = '.is_bot { background: #4b3333 !important; }'	// dark

 	
// стиль для пометки блёклым текста твитов от ботов
 s += '.is_bot .bot_text { color: #808080; }'

 d.innerHTML = '<style>'+s+'</style>'
 document.body.appendChild(d)
 

function tick()
{
	var a=document.querySelectorAll('#permalink-overlay div.tweet')
	var m=document.querySelectorAll('div[data-testid=tweet], article[data-testid=tweetDetail]')

	var i, x, t

	// мобильная версия: выделяем все твиты, показанные на странице
	for (i = 0; i < m.length; i++)
		if (!m[i].dataset.mt_is_upd)
		{
			x=m[i].querySelector('a[href]').getAttribute('href').substring(1)
			t=m[i]

			if (SCREEN_NAMES[x]) /// здесь должна быть проверка "является ботом?"
			{
				// подсвечиваем весь твит стилем is_bot
				t.parentNode.className+=" is_bot"
					/// ^^^ Убедиться, когда заработает проверка "является ботом?",
					/// что не покрашивается сразу всё вместо единственного твита.
				
				// дописываем "БОТ: " перед именем автора твита

///				// Неудавшаяся попытка встроиться над аватаром
///				fullNm=t.querySelectorAll('a[href]')[0].parentNode
///				fullNm.innerHTML = "БОТ:<BR>" + fullNm.innerHTML
				
				// Над full name
				fullNm=t.querySelectorAll('a[href]')[1].parentNode
				fullNm.innerHTML = fullNm.innerHTML+"(БОТ)"
				fullNm.style.color = 'red'
			}
			m[i].dataset.mt_is_upd = 1
		}

	// десктопная версия: выделяем все твиты, показанные на странице
	for (i = 0; i < a.length; i++)
		if (!a[i].dataset.mt_is_upd)
		{
			x=Number(a[i].getAttribute("data-user-id"))
			var actionName=""
	
			t = a[i]
	
			// проверяем, есть ли пользователь в списке известных ботов
			if (BOT_ACCOUNTS[x])
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
			// добавляем пункт меню "Пожаловаться" / "Реабилитировать" 
			twtBtn=t.querySelector('div.ProfileTweet-action div.dropdown-menu ul')

			tweetPermalink=(new URL(t.getAttribute("data-permalink-path") , document.location)).href
			// screenName=t.getAttribute("data-screen-name")
			// fullName=t.getAttribute("data-name")
			twtBtn.innerHTML +='<li class="dropdown-divider" role="presentation"></li>'
			twtBtn.innerHTML +="<li role='presentation'><a href=\"https://twitter.com/messages/compose?recipient_id=973677193816571905&text="+encodeURIComponent(tweetPermalink + "\n" + dmAction + ", вот почему:\n") + "\" target=\"_blank\">"+menuAction+"</a></li>"
	
			// Mark tweet as processed to skip in subsequent passes
			a[i].dataset.mt_is_upd = 1
		}
}
