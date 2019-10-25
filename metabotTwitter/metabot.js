// import { fillTemplate } from './common.js';


function setStyle(divElement, style)
{
	divElement.innerHTML = '<style>'+style+'</style>'
}

function addStyle(s)
{
	var d = document.createElement('div')
	
	if(s) setStyle(d,s)
	
	return document.body.appendChild(d)
}



// добавляем стили для пометки ботов

// reduced-contrast style for tweet bodies posted by bots
s = '.bot_tweet_highlight .bot_text { color: #808080; }'
addStyle(s)


// стиль для пометки красноватым фоном твитов от ботов
tweetBackgroundStyle=addStyle()

function defineTweetBackgroundStyle()
{
	if (document.querySelector('#init-data') === null) // likely mobile mode / new design
		// dark mode: <meta name="theme-color" content="#1C2938">
		// light mode: <meta name="theme-color" content="#FFFFFF">
		dark_mode = ! (document.querySelector(
			":root > head > meta[name=theme-color]")
			.getAttribute("content").toUpperCase() == "#FFFFFF")
	else  // likely desktop mode, old design
		dark_mode = getInitData()["night_mode_activated"] ? true : false

	if (dark_mode)
		var s = '.bot_tweet_highlight { background: #4b3333 !important; }'	// dark
	else
		var s = '.bot_tweet_highlight { background: #FEE !important; }'		// light

	setStyle(tweetBackgroundStyle, s)
}

 

function reportTweetCaption(isBot)
{
	return isBot?
		"Сообщить о нехарактерном для бота" :	// "Untypical for bot"
		"Сообщить о кремлеботе";		// "Possibly a bot"
}

function normalizedPathname()
{
	// normalize '/username/[with_replies]' to 'username'
	loc=document.location
	return (loc.pathname+loc.search).substring(1).replace("/with_replies","")
}

function isStatusView()
{
	path=document.location.pathname
	return path.includes("/status/") &&
 		(document.location.search=="") 	// Enable comments as cgi params
}

function isProfileView()
{
	pathWithRepliesRemoved=normalizedPathname()
	userNameMatch=pathWithRepliesRemoved
		.match(screennameRegex)

	return (document.location.search=="") && 
		(! pathWithRepliesRemoved.includes("/")) &&
		(userNameMatch) &&
		(userNameMatch[0]==pathWithRepliesRemoved)
}


function buildNewDesignMenuAction(
			actionToCloneBefore,
			menuItemCaption,
			template, parameters)
{

	reportingUser=prefillGoogleForms() ? extractExtensionUserFromBodyScript() : ""
	
	clonedAction=actionToCloneBefore.cloneNode(true)

	fillInMenuItem (
		clonedAction,
		clonedAction.querySelector("span"),
		template, parameters,
		reportingUser,
		menuItemCaption)

	actionToCloneBefore.before(clonedAction)
}

function buildTweetDropdownAction(
	actionToCloneBefore,
	blockUserAction,
	reportTweetAction,
	userProfileHeadingScreenName)
{	
	tweetAuthor=blockUserAction.querySelector("span")
		.textContent
		.match('@'+screennameRegex)[0]
		.substring(1)

	reportedUser=isProfileView() ?
		// top of the screen profile heading
		userProfileHeadingScreenName.innerText.substring(1) :
		tweetAuthor
	
	tweetID=reportTweetAction.getAttribute('href').split("/").pop()

	tweetInvokedFrom=encodeURIComponent(
		"https://twitter.com/"+tweetAuthor+"/status/"+tweetID)
	
	isBot = SCREEN_NAMES[reportedUser]

	template=isBot ?
		templateReportUntypicalTweetUrl :
		templateReportTweetUrl

	var parameters = {
		reportedAccount: reportedUser, 
		tweetInvokedFrom: tweetInvokedFrom}

	
	buildNewDesignMenuAction(
		actionToCloneBefore,
		reportTweetCaption(isBot),
		template, parameters)
}


function expandDetachedDropdownMenu(
	dropdownMenuPath, 
	profileHeadingScreennamePath)
	
{
	dropdownMenu=document.querySelector(dropdownMenuPath)
	if(dropdownMenu)  if (! dropdownMenu.dataset.metabotActionAdded)
	{
		dropdownFirstElement=dropdownMenu.children[0]
		
		if(dropdownFirstElement)
		{
			// It's most unlikely that user dropdown menu contains tweet report 
			// Therefore, if tweet report item is present, assume it's tweet dropdown
			if (dropdownMenu.querySelector(
				'a[href^="/i/report/status"]') )
			{
				isTweetDropdown=true
				isUserDropdown=false
			// if tweet report item is not present, but user report item is,
			// assume it's a user dropdown
			} else if (dropdownMenu.querySelector(
				'a[href^="/i/report/user/"]') )
			{
				isTweetDropdown=false
				isUserDropdown=true
			} else
			// Otherwise assume we should keep the menu intact
			{
				isTweetDropdown=false
				isUserDropdown=false
			}

			if (isTweetDropdown || isUserDropdown)
			{
				menuItems = dropdownMenu.querySelectorAll(
					":scope > "+
					"[role=menuitem]:not(.r-1awozwy)"+
					// exclude Cancel non-actionable menu item
					// (occurs in mobile design only)
					":not([href$='/hidden'])")
					// exclude "Show hidden replies" 
					// which are '<a>' nodes matching href '/.../status/.../hidden'
 
				reportUserOrTweetMenuItem=
					dropdownMenu.querySelector(
						'a[href^="/i/report"]')
			
				userProfileHeadingScreenName=
					document.querySelector(
						profileHeadingScreennamePath)
			}
			
			if (isUserDropdown)
			{
//				userID=reportUserOrTweetMenuItem
//						.getAttribute('href').split("/").pop()
 					// tested in DesktopNewDesign only
					// currently not used; can be used to use different menu item captions and/or different forms


			} else if (isTweetDropdown)
				buildTweetDropdownAction(
					reportUserOrTweetMenuItem,
					menuItems[menuItems.length-2],
						// "Block [ @username ]" is expected at this position

					reportUserOrTweetMenuItem,
					userProfileHeadingScreenName)

			dropdownMenu.dataset.metabotActionAdded=true
		}
	}
}


function expandDynamicallyAppearingDropdownMenu()
{
	// desktop, new design
	expandDetachedDropdownMenu (
		"div [role=menu] div div.css-1dbjc4n div.css-1dbjc4n",
		"div.r-1g94qm0"+
			" div div div.r-1wbh5a2 span")

	// mobile, new and old Twitter design
	expandDetachedDropdownMenu (
		"div.r-pm9dpa.r-1rnoaur",
//LATER:
		"div.css-1dbjc4n.r-1g94qm0 "+
			"div.css-1dbjc4n.r-18u37iz.r-1wbh5a2"+
			" span")
//EARLIER:		"div.r-1cad53l.r-1b9bua6 div.r-1g594qm0"+
//			" div.r-18u37iz.r-1wbh5a2 span")

	setTimeout(expandDynamicallyAppearingDropdownMenu, 1000);
}


function markTweets()
{
	if (isStatusView() || isProfileView() )
	{
		defineTweetBackgroundStyle()

		var a=document.querySelectorAll('#permalink-overlay div.tweet')
			// get all tweets on tweet focus page for old design, desktop
	
		if (a.length>0)
		{
			mobile_mode=false
			highlight_tweets=true
		}
		else
		{
			var a=document.querySelectorAll('div.stream div.tweet')
				// get all tweets on user profile page for old design, desktop
			mobile_mode=false
			highlight_tweets=false
		}
		if (a.length==0)
		{
			mobile_mode=true
			a=document.querySelectorAll('article[role=article]');
			// In conversation view, works both for focused tweet and
			// for parent / child replies of the focused tweet.
				
			highlight_tweets=isStatusView()
		}
	

		var i, x, t
	
		for (i = 0; i < a.length; i++)

			// process only tweets not processed in earlier passes			
			if (!a[i].dataset.mt_is_upd)
			{
				t = a[i]
		
				x=mobile_mode ?
					a[i].querySelector('a[href]').getAttribute('href').substring(1) :						
					(isStatusView() ?
						a[i].getAttribute("data-user-id") :
						document.querySelector("div.ProfileNav")
							.getAttribute("data-user-id") )
						// getInitData()["profile_user"]["id_str"]
			
		
				isBot= (SCREEN_NAMES[x] || BOT_ACCOUNTS[x])
		
				if (isBot && highlight_tweets)
				{
					// highlight all tweets shown on the page
					botCaption = document.createElement("span")
					botCaption.innerHTML="БОТ:&nbsp;"
					botCaption.style.color = 'red'

					// дописываем "БОТ: " перед именем автора твита
					fullname=t.querySelector(mobile_mode?
						"span" :
						'span.FullNameGroup')

					fullname.prepend(botCaption)
		
					elementToHightlight=mobile_mode ?
						t.parentNode :
						t

					if (elementToHightlight.
						querySelector(
						":scope > article > div > div")
						.innerText=="" )
					// Highlight tweets only if they are not retweeted-by, no matter who retweeted or who posted the original tweet.
					{
						// подсвечиваем весь твит стилем bot_tweet_highlight
						elementToHightlight.className+=" bot_tweet_highlight"

						// reduce contrast for tweet text
						tweetTextselector = mobile_mode ?
							// - for focused tweet:
							':scope > div > div > span' + ', ' +
							// - for parent / child replies of the focused tweet
							':scope > div > div > div > div > span'
							:
							// for desktop, old design
							'div.js-tweet-text-container p.tweet-text'

						tweetTxts = t.querySelectorAll(tweetTextselector)
						tweetTxts.forEach(
							function(element) {
								element.className='bot_text ' + element.className;
							});						
					}			
				}
		
		
				if (! mobile_mode)
				{
					// old design, desktop:
					menuAction = reportTweetCaption(isBot)

					// inject custom menu item: "Tweet non/typical for a bot"
					 
					tweetPermalink=DOMPurify.sanitize(
						(new URL(t.getAttribute("data-permalink-path"),
							document.location)).href
					)

					reportedAccount=
						isStatusView() ?
							t.getAttribute("data-screen-name") :
						isProfileView() ?
							normalizedPathname() :
							""
//							getInitData()["profile_user"]["screen_name"]
							// ^^ not ready as of initial load of user profile page

					var parameters = {
						reportedAccount: reportedAccount, 
						tweetInvokedFrom:
							encodeURIComponent(tweetPermalink)}


					template = isBot ?
						templateReportUntypicalTweetUrl :
						templateReportTweetUrl

					addOldDesignMenuItemSeparted(
						t,
						template,
						parameters,
						menuAction,
						false)
				}

				// Mark tweet as processed to skip in subsequent passes
				a[i].dataset.mt_is_upd = 1
			}
	}
	// repeat every 3 seconds
	setTimeout(markTweets, 3000);
}



expandDynamicallyAppearingDropdownMenu();
markTweets();
