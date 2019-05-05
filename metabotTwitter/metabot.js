// добавляем стили для пометки ботов

var d = document.createElement('div')

// стиль для пометки красноватым фоном твитов от ботов

if (document.querySelector('#init-data') === null ||	// вероятно, мобильный режим
	!JSON.parse(document.querySelector('#init-data').value)["night_mode_activated"])
	var s = '.bot_tweet_highlight { background: #FEE !important; }'		// light
else
	var s = '.bot_tweet_highlight { background: #4b3333 !important; }'	// dark

 	
// стиль для пометки блёклым текста твитов от ботов
 s += '.bot_tweet_highlight .bot_text { color: #808080; }'

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
				// подсвечиваем весь твит стилем bot_tweet_highlight
				t.parentNode.className+=" bot_tweet_highlight"
					/// ^^^ Убедиться, когда заработает проверка "является ботом?",
					/// что не покрашивается сразу всё вместо единственного твита.
				
				// дописываем "БОТ: " перед именем автора твита

///				// Неудавшаяся попытка встроиться над аватаром
///				fullNm=t.querySelectorAll('a[href]')[0].parentNode
///				fullNm.innerHTML = "БОТ:<BR>" + fullNm.innerHTML
				
				// Над full name
				fullNm=t.querySelectorAll('a[href]')[1].parentNode

				botCaption = document.createElement("div")
				botCaption.innerHTML="(БОТ)"
				botCaption.style.color = 'red'

				fullNm.appendChild(botCaption)
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
				// подсвечиваем весь твит стилем bot_tweet_highlight
				t.className += ' bot_tweet_highlight'
		
				// дописываем "БОТ: " перед именем автора твита
				fullNm=t.querySelector('span.FullNameGroup')

				botCaption = document.createElement("div")
				botCaption.innerHTML="БОТ:&nbsp;"
				botCaption.style.color = 'red'

				fullNm.prepend(botCaption)


				// делаем текст твита более блёклым
				tweetTxt=t.querySelector('div.js-tweet-text-container p.tweet-text')
				tweetTxt.className = 'bot_text ' + tweetTxt.className
		
				menuAction = "Сообщить об ошибочной подсветке"
				dmAction = "Это не кремлебот"
			} else {
				menuAction = "Сообщить о кремлеботе"
				dmAction = "В кремлеботы"
			}
			// добавляем пункт меню "Пожаловаться" / "Реабилитировать" 
			twtBtn=t.querySelector('div.ProfileTweet-action div.dropdown-menu ul')

			tweetPermalink=DOMPurify.sanitize(
				(new URL(t.getAttribute("data-permalink-path") , document.location)).href
			)
			// screenName=t.getAttribute("data-screen-name")
			// fullName=t.getAttribute("data-name")


			dropdownDivider=document.createElement("li")
			dropdownDivider.class="dropdown-divider"
			dropdownDivider.role="presentation"
			twtBtn.appendChild(dropdownDivider)

			botAction = document.createElement("li")
			botAction.role = "presentation"

			botActionLink = document.createElement("a")
			botActionLink.href = "https://twitter.com/messages/compose?recipient_id=1067060314884190209&text=" +
				encodeURIComponent(tweetPermalink + "\n" + dmAction + ", вот почему:\n")
			botActionLink.target="_blank"
			botActionLink.textContent=menuAction
			
			botAction.appendChild(botActionLink)
			twtBtn.appendChild(botAction)			
	
			// Mark tweet as processed to skip in subsequent passes
			a[i].dataset.mt_is_upd = 1
		}
	// каждые 3 секунды на странице помечаются твиты от ботов, не помеченные ранее
	setTimeout(tick, 3000);
}

tick();
