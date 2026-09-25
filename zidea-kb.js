(function () {
  const FAQ_BASE = [
    { category: 'general', question: 'What is Zidea?', answer: 'Zidea is a social product and idea platform that helps users explore ideas, meet people, chat, generate new concepts, and play lightweight games in one app.', keywords: ['zidea','idea','platform','social','app','website'], aliases: ['what is the zidea app','what does zidea do','what is zidea used for','what can zidea do'] },
    { category: 'general', question: 'What can I do on Zidea?', answer: 'You can sign up, search for people, chat, make voice calls, generate ideas, save and star ideas, upload short idea videos, explore community posts, and play arcade games.', keywords: ['features','do','zidea','dashboard','explore','chat','arcade','ideas'], aliases: ['what can i do on zidea','what are the features of zidea','what is this website for'] },
    { category: 'general', question: 'How does Zidea work?', answer: 'Zidea is organized into main areas like Dashboard, Chat, Explore, Ideas, Library, Profile, Arcade, and ZiD AI. You sign in, browse the app, and use those sections to connect, create, and share.', keywords: ['how','work','use','main','sections','dashboard','explore','chat'], aliases: ['how do i use zidea','how does this app work','how does the zidea app work','what are the main parts of zidea'] },
    { category: 'general', question: 'What are the main sections of Zidea?', answer: 'The main sections include Dashboard, Explore, Ideas, Library, Chat, Profile, Settings, Help, and Arcade. ZiD AI is also available for quick answers and brainstorming.', keywords: ['sections','pages','dashboard','explore','ideas','library','profile','arcade','zidai'], aliases: ['where are the main features','what pages are on zidea','what sections exist in zidea'] },
    { category: 'general', question: 'Is Zidea free?', answer: 'The website does not list pricing or subscription plans in the source code, so there is no verified pricing information here. The app is presented as a product experience rather than a paid plan flow.', keywords: ['free','price','cost','pricing','subscription','plan'], aliases: ['is zidea free','what does zidea cost','is there a subscription','do i have to pay for zidea'] },
    { category: 'general', question: 'Where can I find my Zidea tools?', answer: 'Use the left sidebar navigation to switch between Dashboard, Chat, ZiD AI, Ideas, Library, Explore, Profile, Settings, and Help.', keywords: ['tools','sidebar','navigation','dashboard','ideas','library','chat','profile','settings'], aliases: ['where do i access my zidea tools','where is the navigation','where are the app tools'] },
    { category: 'general', question: 'What is Explore on Zidea?', answer: 'Explore is the community feed of idea videos and short-form posts. Users can watch idea reels, like them, comment on them, follow creators, and share ideas.', keywords: ['explore','feed','idea videos','reels','community','posts'], aliases: ['what is the explore page','what can i do in explore','what is the community feed'] },
    { category: 'general', question: 'What is ZiD AI?', answer: 'ZiD AI is the in-app assistant for Zidea questions. It checks the local Zidea knowledge base first and falls back to the normal AI system only when needed.', keywords: ['zid ai','assistant','chatbot','brainstorm','ask ai','help'], aliases: ['what is zid ai','what does zid ai do','what can zid ai help me with','can zid ai answer zidea questions'] },
    { category: 'getting_started', question: 'How do I create an account?', answer: 'Open the landing page or auth modal, choose Sign Up, enter your email, username, and password, and submit the form. Zidea validates your username and then signs you in.', keywords: ['create account','sign up','register','new account','signup'], aliases: ['how do i sign up','how can i register','how do i make an account','where do i create my account'] },
    { category: 'getting_started', question: 'How do I log in to Zidea?', answer: 'Use the login form with your email and password, or use the Google sign-in flow if that option is available in your environment. After login, Zidea takes you to Dashboard.', keywords: ['login','sign in','log in','email','password'], aliases: ['how do i sign in','where is the login','how do i access zidea','how can i get into my account'] },
    { category: 'getting_started', question: 'How do I sign out?', answer: 'Open the sidebar or account area and choose Sign Out. The app clears the session and returns you to the landing screen.', keywords: ['sign out','logout','log out','leave','session'], aliases: ['how do i log out','how do i sign out of zidea','how do i leave my account'] },
    { category: 'getting_started', question: 'How do I reset my password?', answer: 'Open the login screen and use Forgot password?. Enter your email to start the reset flow. Zidea shows a confirmation message without exposing whether the email exists.', keywords: ['password reset','forgot password','reset password','login password'], aliases: ['how can i reset my password','where is forgot password','i forgot my password','reset my account password'] },
    { category: 'getting_started', question: 'What do I need to sign up?', answer: 'You need an email, a password, and a username that follows the app format: 3 to 20 letters, numbers, or underscores. Zidea checks the username before creating the account.', keywords: ['username','signup requirements','email','password','account'], aliases: ['what info do i need to sign up','what do i need to create my zidea account','can i sign up with email'] },
    { category: 'getting_started', question: 'Can I use Google to sign in?', answer: 'The app includes a Google sign-in flow and loads a Google client ID from the configured environment. If no client ID is configured, the website shows a notice that Google sign-in is not available yet.', keywords: ['google','oauth','sign in with google','google login'], aliases: ['can i use my google account','how do i login with google','is google sign in available'] },
    { category: 'authentication', question: 'Why can I not sign in?', answer: 'Check that your email and password are correct. If the account was created with Google sign-in, use the Google flow instead. If the page still fails, use the show-message or help flow to confirm the correct login path.', keywords: ['cant sign in','login failed','wrong password','no account','account not found'], aliases: ['why cant i log in','why wont my password work','i cannot login','my sign in is failing'] },
    { category: 'authentication', question: 'Why does Zidea ask for a Google client ID?', answer: 'Google login requires a valid Google OAuth client ID in the app configuration. If it is missing or blocked, Zidea falls back to email/password sign-in.', keywords: ['google client id','oauth config','google login config','missing google settings'], aliases: ['why is google sign in not working','why is google auth not configured','can i use google if the client id is missing'] },
    { category: 'username', question: 'How do I find a user on Zidea?', answer: 'Use the search field in the Home or user discovery area and type a username or an @handle. Zidea filters matches by username and shows likely results.', keywords: ['find user','search for user','username search','find someone','@username'], aliases: ['how do i search for a person','where do i look up someone','how do i find someone by username','can i search by @username'] },
    { category: 'username', question: 'Can I search using @username?', answer: 'Yes. The app supports username lookup and direct handling around @username patterns in the discovery flow.', keywords: ['search by username','@username','find by handle','user lookup'], aliases: ['can i type @username','do i search with @username','how do i use a username to find people'] },
    { category: 'username', question: 'How do I know if someone is online?', answer: 'The user list shows online status indicators and online people cards, so online users display an active status while others appear offline.', keywords: ['online','offline','status','presence'], aliases: ['how do i see if someone is active','is this person online','how can i tell if they are online'] },
    { category: 'friends', question: 'How do I add a friend or connection?', answer: 'Open a user profile and use the Add button to add that user to your connections. You can also chat or call from there.', keywords: ['add friend','add connection','follow user','connect with someone'], aliases: ['how do i add someone','how can i connect with another user','how do i follow someone'] },
    { category: 'friends', question: 'How do I follow someone?', answer: 'Open the user profile or feed item and choose the Follow action. The interface shows Follow/Following states on the content cards.', keywords: ['follow','following','follow user','connect in app'], aliases: ['how can i follow a creator','can i follow a person','what is the follow button'] },
    { category: 'friends', question: 'What is the Home page for?', answer: 'The Home page is where users discover other people, see profiles, and manage social connections. Search by username and open a profile to connect.', keywords: ['home','discover people','user discovery','friend home'], aliases: ['what is the home screen for','where do i discover people on zidea','how do i use home'] },
    { category: 'dashboard', question: 'What is the Dashboard?', answer: 'Dashboard is the main overview for the account, quick access to major features, and the place where app state is surfaced after login.', keywords: ['dashboard','main overview','homepage','overview'], aliases: ['what is on my dashboard','where is my dashboard','how do i use dashboard'] },
    { category: 'dashboard', question: 'How do I access my profile?', answer: 'Open the sidebar and choose Profile, or visit the profile page from the main navigation. Your username and stats appear there.', keywords: ['profile','my profile','open profile','account profile'], aliases: ['where is my profile','how do i view my profile','can i see my profile page'] },
    { category: 'dashboard', question: 'How do I find my account info?', answer: 'Go to Settings or Profile. There you can view your account details, upload an avatar, and review the account summary.', keywords: ['account info','settings','email','username','account details'], aliases: ['where is my account information','how do i see my email and username','where are my account details'] },
    { category: 'chat', question: 'How do I send a message?', answer: 'Open a conversation, type in the message box, and press Enter or send. Messages are stored in the active chat thread.', keywords: ['send message','chat','message','text'], aliases: ['how do i text someone','how do i send a chat message','where do i type a message'] },
    { category: 'chat', question: 'How do I start a conversation?', answer: 'Search for a user, open their profile, or find them in the chat list, then open the chat or use the chat action to start a new thread.', keywords: ['start chat','new conversation','message someone','begin chat'], aliases: ['how do i begin a conversation','how do i start messaging someone','what do i do to chat'] },
    { category: 'chat', question: 'How do I find my conversations?', answer: 'The chat sidebar shows a list of recent conversations. Search the conversation list and pick the thread you want to read.', keywords: ['conversations','chat list','messages list','threads'], aliases: ['where are my chats','where do i find conversations','how do i see my message threads'] },
    { category: 'chat', question: 'Can I create a group chat?', answer: 'Yes. The group feature is built into the chat system and lets you create groups with members and a custom group name. The app provides a group creation modal.', keywords: ['group chat','create group','group messaging','group thread'], aliases: ['how do i create a group chat','can i make a group','how do i start a group message'] },
    { category: 'chat', question: 'How do I create a group?', answer: 'Use the group creation flow in chat, enter the group name, and add members. You can then send messages to that group thread.', keywords: ['create group','new group','group creation'], aliases: ['where do i make a group','how do i set up a group chat','can i set up a group conversation'] },
    { category: 'chat', question: 'Can I send images?', answer: 'The chat system supports media upload and file-sharing flows, including image and video attachments when available in the browser.', keywords: ['image','photo','upload picture','send images','media upload'], aliases: ['can i upload a photo','can i send a picture','how do i send images in chat'] },
    { category: 'chat', question: 'Can I send videos?', answer: 'The app includes media upload support in chat and video content in Explore. In-chat media sending is available through the file input and upload flow when the UI is active.', keywords: ['video','send video','upload video','media'], aliases: ['can i send a video message','how do i upload a video in chat','can i attach a video'] },
    { category: 'chat', question: 'Can I send files?', answer: 'Yes, the app includes a file-sharing flow in chat with supported attachments. Use the upload control in the chat input area.', keywords: ['file','attach file','share file','send document'], aliases: ['can i attach a file','how do i send a document','how do i upload a file in chat'] },
    { category: 'chat', question: 'Can I send voice messages?', answer: 'The code includes voice and call-related features, but the user-facing flow is centered around voice calls and media handling rather than a separate voice-note feature that is explicitly documented in the app UI.', keywords: ['voice message','audio message','send audio','voice note'], aliases: ['can i send audio','can i send voice notes','how do i send voice messages'] },
    { category: 'chat', question: 'Why is my message not appearing?', answer: 'Check that the conversation is open, the input is not empty, and the message was sent from the active thread. If the app state is stale, refresh or revisit the chat page and try again.', keywords: ['message not showing','not appearing','missing message','chat issue'], aliases: ['why isnt my message showing','where did my message go','my message didnt send'] },
    { category: 'voice_calls', question: 'How do voice calls work?', answer: 'Open a conversation or user profile and use the Call button. The app requests microphone access and creates an in-app call flow for live voice communication.', keywords: ['voice call','call','phone call','voice chat'], aliases: ['how do i call someone','what is a voice call','how does calling work on zidea'] },
    { category: 'voice_calls', question: 'How do I call someone?', answer: 'Use the Call action from a user profile, a chat thread, or the online user list. Allow microphone access when the browser prompts you.', keywords: ['call someone','start call','phone friend','voice call'], aliases: ['where do i press call','how can i start a call','how do i make a voice call'] },
    { category: 'voice_calls', question: 'How do I accept a call?', answer: 'When a call comes in, the app presents the incoming call flow. Use the call UI to answer or ignore the request.', keywords: ['accept call','answer call','incoming call'], aliases: ['how do i answer a call','what do i do when someone calls me','can i accept a call'] },
    { category: 'voice_calls', question: 'How do I decline a call?', answer: 'Use the in-call actions to end or decline the incoming call. The workflow keeps the call from continuing.', keywords: ['decline call','ignore call','hang up','reject call'], aliases: ['how do i reject a call','what if i do not want to answer','can i ignore a call'] },
    { category: 'voice_calls', question: 'Why does Zidea need microphone permission?', answer: 'The app uses browser microphone access for live voice calls, so the browser asks for permission before the other person can hear you.', keywords: ['microphone permission','camera permission','browser permission','allow mic'], aliases: ['why do i need to allow mic','why does zidea ask for microphone access','why does the browser ask for mic permission'] },
    { category: 'voice_calls', question: 'How do I end a call?', answer: 'Use the call controls to end the active call. The app closes the call UI and returns you to the current page.', keywords: ['end call','hang up','leave call','disconnect'], aliases: ['how do i leave a call','how do i stop a voice call','what button ends the call'] },
    { category: 'voice_calls', question: 'Can I call from a profile?', answer: 'Yes. The profile view contains a call option, and you can also start a call from a chat thread or user list.', keywords: ['call from profile','profile call','start call from profile'], aliases: ['how do i call from someone else s profile','where is the call button on a profile','can i start a call from profile'] },
    { category: 'voice_calls', question: 'Why can I not make a call?', answer: 'Check that the browser has microphone permission, the other user is available, and the app has not blocked the action. If that still fails, refresh and try again.', keywords: ['cant make call','call not working','call failed','can not call'], aliases: ['why cannot i call','voice call is not working','my call failed'] },
    { category: 'ideas', question: 'How do I generate an idea?', answer: 'Open the Ideas area, provide your preferences, and use the generator to create idea options. Zidea scores and profiles each result from the idea generator flow.', keywords: ['generate idea','new idea','idea generator','brainstorm','create idea'], aliases: ['how can i create an idea','where is the idea generator','can zidea generate ideas for me','help me brainstorm'] },
    { category: 'ideas', question: 'Can ZiD AI help me brainstorm?', answer: 'Yes. ZiD AI can answer questions about Zidea and help brainstorm idea directions when appropriate. It prioritizes the website knowledge base before any generic AI answer.', keywords: ['brainstorm','zid ai brainstorm','generate ideas with ai','brainstorm with ai'], aliases: ['can zid ai help me think of ideas','can i brainstorm with zid ai','how can ai help me generate ideas'] },
    { category: 'ideas', question: 'How do I score an idea?', answer: 'The idea generator produces a scored result with different dimensions such as impact, feasibility, and profit. These scores help compare options.', keywords: ['score idea','idea score','impact','feasibility','profit'], aliases: ['what does idea scoring mean','how do i rate my idea','how do i see idea scores'] },
    { category: 'ideas', question: 'What does the idea score mean?', answer: 'The app uses a three-part scoring format to show impact, feasibility, and profit, giving each idea a simple breakdown you can compare with other ideas.', keywords: ['idea score meaning','impact score','feasibility score','profit score'], aliases: ['what do the idea scores mean','how do i interpret the idea score','what is impact feasibility profit'] },
    { category: 'ideas', question: 'How do I save an idea?', answer: 'From the idea card or detail view, use the Save button. Saved ideas are kept in your Library.', keywords: ['save idea','saved ideas','keep idea','bookmark idea'], aliases: ['where do i save an idea','can i save this idea','how do i bookmark a concept'] },
    { category: 'ideas', question: 'How do I star an idea?', answer: 'Use the Star action on the idea card or details. Starred ideas are grouped in a separate list in the Library.', keywords: ['star idea','favorite idea','starred ideas','mark idea'], aliases: ['can i favorite an idea','how do i star a concept','where do i see my starred ideas'] },
    { category: 'ideas', question: 'Where are my generated ideas stored?', answer: 'Generated ideas appear in the Library, and the app keeps created, saved, and starred ideas in that area for review.', keywords: ['generated ideas','idea storage','library','saved ideas','created ideas'], aliases: ['where do i view my created ideas','where are my generated ideas kept','where are my ideas stored'] },
    { category: 'ideas', question: 'How do I use the idea matcher?', answer: 'The idea matcher allows you to submit an idea and compare it with other real Zidea users who may have similar goals or skills. It helps surface collaboration opportunities.', keywords: ['idea matcher','collaboration matcher','find collaborators','match user'], aliases: ['what is the idea matcher','how do i find collaborators on zidea','what is collaboration matcher'] },
    { category: 'library', question: 'What is My Library?', answer: 'My Library stores created ideas, saved ideas, and starred ideas so you can revisit them later.', keywords: ['library','my library','saved ideas','created ideas','starred ideas'], aliases: ['what is the library page','where is my library','what is in my library'] },
    { category: 'library', question: 'Where are my created ideas?', answer: 'The Created tab in Library lists ideas you have made or generated on Zidea.', keywords: ['created ideas','library created','my generated ideas'], aliases: ['where can i see my created ideas','how do i view my created list','what tab shows my ideas'] },
    { category: 'library', question: 'Where are my saved ideas?', answer: 'Open the Saved tab in Library. That section lists the ideas you saved from your idea cards or details.', keywords: ['saved ideas','library saved','where are saved ideas'], aliases: ['where are my saved items','how do i find saved ideas','which tab shows saved ideas'] },
    { category: 'library', question: 'Where are my starred ideas?', answer: 'Open the Starred tab in Library. Starred items are kept separate from saved and created ideas.', keywords: ['starred ideas','favorite ideas','starred tab','favorite tab'], aliases: ['where is my starred list','how do i see my favorited ideas','where are my starred ideas'] },
    { category: 'library', question: 'How do I view an idea in detail?', answer: 'Select the idea card and use Details to open the description and related actions such as Save or Share.', keywords: ['view details','idea details','open idea','show idea'], aliases: ['how do i open an idea','what does details do','where do i inspect an idea'] },
    { category: 'library', question: 'How do I remove a saved idea?', answer: 'Open the saved list and use the existing save or card action to remove it from your saved list.', keywords: ['remove saved idea','delete saved idea','unsave idea'], aliases: ['how do i un-save an idea','can i remove a saved idea','undo save on an idea'] },
    { category: 'explore', question: 'What is Explore?', answer: 'Explore is the social feed for idea videos and short-form posts from the Zidea community.', keywords: ['explore','feed','community','trend','shorts'], aliases: ['what is the explore section','what is the explore page','what can i watch in explore'] },
    { category: 'explore', question: 'What can I find on Explore?', answer: 'You can find idea videos, creator profiles, likes, comments, shares, creator follow buttons, and content grouped into categories.', keywords: ['explore content','discover ideas','community videos','idea posts'], aliases: ['what kind of posts are in explore','what is available in explore','what do i see in the explore feed'] },
    { category: 'explore', question: 'How do I watch idea videos?', answer: 'Open Explore and select a reel or video card. Videos autoplay as they enter view and can be muted or played in the browser.', keywords: ['watch ideas','play video','explore videos','reels'], aliases: ['how do i play a video in explore','where are the idea reels','how do i view community videos'] },
    { category: 'explore', question: 'How do I upload a video?', answer: 'Use the upload action in the Explore or profile area, select a video file, confirm the rights checkbox, and the video is added to the posted feed or profile.', keywords: ['upload video','post video','idea reel','video upload'], aliases: ['how can i add my own video','where do i upload a short idea video','can i post my own video'] },
    { category: 'explore', question: 'How do I like a video?', answer: 'Use the heart button on the video card. The button toggles like state for the current user and updates the count.', keywords: ['like video','heart button','like idea','liked'], aliases: ['how do i like a reel','can i react with a like','what does the heart button do'] },
    { category: 'explore', question: 'How do I comment on a video?', answer: 'Use the comment button on the video card to open the side comments panel, type your comment, and send it. Comments appear with the username of the commenter.', keywords: ['comment','comments','comment on video','respond to reel'], aliases: ['where is the comment button','how do i add a comment','how do i reply on a video'] },
    { category: 'explore', question: 'How do I share an idea video?', answer: 'Use the share button to open the share modal and choose to copy the text or send it directly to another Zidea user.', keywords: ['share idea','share video','copy text','send direct share'], aliases: ['how do i send a video to someone','what does share do','how can i share a post'] },
    { category: 'explore', question: 'What categories are available on Explore?', answer: 'Explore categories include All, Startup, App, Finance, Health, Content, AI, and other community categories defined in the feed.', keywords: ['categories','explore categories','startup','app','finance','health','ai'], aliases: ['what are the explore filters','what categories can i browse','what are the feed tags'] },
    { category: 'explore', question: 'How do I follow a creator in Explore?', answer: 'Use the Follow button near the creator name on the video card. You can also view their profile and follow from there.', keywords: ['follow creator','follow on explore','follow user in explore'], aliases: ['can i follow someone from the feed','how do i follow a creator in explore','how do i subscribe to a user'] },
    { category: 'social', question: 'How do I view someone else\'s profile?', answer: 'Tap a username or avatar on a card or profile link to open that person\'s profile and see their bio, likes, and other public details.', keywords: ['view profile','open profile','user profile','person profile'], aliases: ['where do i look at someone else s profile','how do i open another user profile','can i inspect a profile'] },
    { category: 'profile', question: 'What is my profile?', answer: 'Your profile shows your username, email, uploadable avatar, uploaded videos, and a summary of your account activity. It is used as your public identity in Zidea.', keywords: ['my profile','profile page','account profile','user profile'], aliases: ['what is on my own profile','how does my profile work','what shows up in my profile'] },
    { category: 'profile', question: 'How do I upload an avatar?', answer: 'Open Profile and choose Upload avatar. The app stores the selected image and shows it in your account details and profile.', keywords: ['avatar','profile photo','upload image','change avatar'], aliases: ['how do i add a profile photo','how can i change my avatar','can i upload my picture'] },
    { category: 'profile', question: 'How do I remove my avatar?', answer: 'On the profile page, use Remove next to the avatar area. The app clears the stored avatar and reverts to initials.', keywords: ['remove avatar','delete avatar','clear profile image'], aliases: ['how do i delete my profile picture','can i remove my avatar'] },
    { category: 'profile', question: 'How do I upload a profile video?', answer: 'Use the profile upload flow and select a video file. Confirm the rights checkbox, then the video appears in your profile and can also be added to Explore.', keywords: ['profile video','upload profile video','idea reel on profile'], aliases: ['how can i add a video to my profile','where do i upload a short reel'] },
    { category: 'profile', question: 'Why is my profile video not showing?', answer: 'Make sure the file is a valid video, the rights confirmation is checked, and the app successfully processed the upload. If it still fails, try uploading again.', keywords: ['profile video missing','video not showing','my uploaded video is missing'], aliases: ['why is my uploaded video not visible','why is my profile clip missing','my profile reel is not appearing'] },
    { category: 'profile', question: 'Where do I view my recent ideas?', answer: 'Profile and Library contain your recent created and saved idea content. The profile page also shows your media and account summary.', keywords: ['recent ideas','my recent content','view my ideas','profile ideas'], aliases: ['where are my recent ideas','how do i see the ideas i created','what are my recent posts'] },
    { category: 'settings', question: 'Where are the settings?', answer: 'Go to the Settings page in the sidebar. It includes account details and the theme toggle for the light or dark filter.', keywords: ['settings','account settings','theme','dark mode','light mode'], aliases: ['where is settings','how do i open settings','what do settings do'] },
    { category: 'settings', question: 'How do I change my theme?', answer: 'Open Settings and use the Theme toggle. Zidea includes a light and dark filter toggle for the interface.', keywords: ['theme','dark mode','light mode','toggle theme','change theme'], aliases: ['how can i switch themes','where is the dark mode','how do i turn on light mode'] },
    { category: 'settings', question: 'What account info is shown in settings?', answer: 'Settings shows account details connected to your current session, including your account email and username.', keywords: ['account info','settings account','email username','my account details'], aliases: ['what does settings show','where do i see my account info','what is in my settings'] },
    { category: 'settings', question: 'How do I delete my account?', answer: 'The app points users to Contact or email hello@zidea.app from their registered account email to request account deletion and verification.', keywords: ['delete account','remove account','account deletion','close account'], aliases: ['how do i delete my zidea account','can i remove my account','what is the deletion process'] },
    { category: 'help', question: 'Where is the Help page?', answer: 'Use the Help section in the sidebar from the main navigation. It includes quick answers for the core flows of Zidea.', keywords: ['help','support','how it works','help page'], aliases: ['how do i get help','where is help','what does help do'] },
    { category: 'help', question: 'What does ZiD AI do?', answer: 'ZiD AI can explain Zidea features, help brainstorm ideas, draft messages, and answer general Zidea questions when the app has the information local or when the fallback AI is available.', keywords: ['what can zid ai do','what is zid ai for','brainstorm','help me with zidea'], aliases: ['what is zid ai useful for','how can zid ai help me','what is ziD ai'] },
    { category: 'help', question: 'How do I play games?', answer: 'Go to Arcade to play solo against the bot or switch to multiplayer mode. During a call, there is also an in-call game dock for quick games.', keywords: ['play games','arcade','game dock','multiplayer','bot'], aliases: ['where do i play games','how do i start gaming on zidea','what games are in arcade'] },
    { category: 'help', question: 'What does the app ask me to confirm before upload?', answer: 'The upload flows ask you to confirm you own the content or have the rights to post it. This is part of the rights and upload controls on the app.', keywords: ['rights confirm','upload rights','confirm rights','why confirm upload'], aliases: ['why do i have to confirm rights before upload','what does the upload confirmation do'] },
    { category: 'arcade', question: 'What is Zidea Arcade?', answer: 'Arcade is the game hub on Zidea, with games such as Chess, Tic-Tac-Toe, Rock Paper Scissors, and a social Among Us mode.', keywords: ['arcade','game hub','play games','arcade games'], aliases: ['what is arcade','what games are in zidea arcade','where is the games page'] },
    { category: 'arcade', question: 'What games can I play?', answer: 'The website supports Chess, Tic-Tac-Toe, Rock Paper Scissors, and an Among Us mode. Some can be played against the bot or with another user.', keywords: ['games','chess','tictactoe','tic tac toe','rock paper scissors','among us'], aliases: ['what game modes are available','what can i play on zidea','what games are supported'] },
    { category: 'arcade', question: 'Can I play against AI?', answer: 'Yes. The arcade game flows include bot-play paths for several games, and the app includes AI and challenge modes in the game setup.', keywords: ['play against ai','bot game','computer opponent','solo game'], aliases: ['can i play a bot','how do i play against the computer','can i challenge the ai'] },
    { category: 'arcade', question: 'Can I play against friends?', answer: 'Yes. The app includes challenge and multiplayer game flows, including game rooms and challenge actions for connected users.', keywords: ['play with friends','multiplayer','challenge friend','game room'], aliases: ['can i play zidea games with a friend','how do i challenge a friend','can i play multiplayer'] },
    { category: 'arcade', question: 'How do I challenge someone?', answer: 'Open a game in Arcade, choose Challenge Friend, and use the game invitation or room flow to invite someone to a match.', keywords: ['challenge friend','challenge user','invite friend','challenge someone'], aliases: ['how do i invite my friend to a game','where is the challenge button','how can i play with someone'] },
    { category: 'arcade', question: 'What is a game room?', answer: 'A game room is the lobby used for multiplayer games. It creates a room code and waits for the second player to join before the match starts.', keywords: ['game room','lobby','room code','multiplayer room'], aliases: ['what is the lobby','what is a game room code','how do i join a game room'] },
    { category: 'arcade', question: 'How do I join a game room?', answer: 'Use the room code from the invite or friend and enter it in the room join flow. Once both players are present, the game starts.', keywords: ['join room','enter room code','room code','join game'], aliases: ['how do i join a room','where do i enter the room code','can i join a game with a code'] },
    { category: 'arcade', question: 'How do I leave a game?', answer: 'Use the Exit lobby or End game controls in the game UI. The app closes the room or game state and returns to Arcade.', keywords: ['leave lobby','exit room','leave game','quit game'], aliases: ['how do i exit a game','how do i quit the match','can i leave the lobby'] },
    { category: 'arcade', question: 'What is the leaderboard?', answer: 'The leaderboard shows player wins and losses in the game system, allowing users to compare wins, performance, and recent results.', keywords: ['leaderboard','wins','losses','scoreboard'], aliases: ['where is the leaderboard','what are my wins and losses','how do i see the leaderboard'] },
    { category: 'chess', question: 'How do I start a chess game?', answer: 'Open Arcade and choose Chess, then select bot play or challenge a friend. The app opens the chess board and game setup flow.', keywords: ['start chess','chess','play chess'], aliases: ['where do i start chess','can i play chess on zidea','how do i launch a chess match'] },
    { category: 'chess', question: 'Can I play chess against AI?', answer: 'Yes. The chess setup flow supports AI play as well as friend or multiplayer challenges.', keywords: ['chess ai','play chess against ai','bot chess','computer chess'], aliases: ['can i play chess with a bot','how do i play chess against the computer'] },
    { category: 'chess', question: 'Can I play chess with a friend?', answer: 'Yes. Use the challenge flow or the multiplayer chess room to invite someone to a chess game.', keywords: ['chess friend','play chess with a friend','multiplayer chess'], aliases: ['can i play chess with my friend','how do i challenge someone to chess'] },
    { category: 'chess', question: 'How do I choose a chess board theme?', answer: 'In the chess setup flow, choose the theme option to change the board appearance before starting the game.', keywords: ['chess theme','board theme','change chess theme'], aliases: ['where do i pick a chess board style','how do i change the chess theme'] },
    { category: 'chess', question: 'How do I choose chess piece styles?', answer: 'The chess setup screen includes piece style selection so you can pick a piece appearance before the match begins.', keywords: ['chess pieces','piece style','change chess pieces'], aliases: ['how do i choose chess pieces','where do i change the piece style'] },
    { category: 'chess', question: 'How do I choose chess colors?', answer: 'The chess setup area includes color options so you can pick your board and piece color choices before playing.', keywords: ['chess colors','piece color','board color','white black colors'], aliases: ['how do i pick my chess colors','can i choose my chess colors'] },
    { category: 'chess', question: 'What are the chess time controls?', answer: 'The chess setup includes time-control settings, so you can choose the clock speed and increment before the game starts.', keywords: ['time control','chess clock','increment','turn timer'], aliases: ['what is chess time control','how do i set the timer','what is the chess clock'] },
    { category: 'chess', question: 'What does increment mean in chess?', answer: 'Increment is the extra time added after each move. The app exposes the chess timer and increment settings in the setup flow.', keywords: ['increment','chess increment','time increment','clock increment'], aliases: ['what is increment in chess','how does chess increment work'] },
    { category: 'chess', question: 'How do I choose AI difficulty?', answer: 'The chess setup includes AI difficulty or level selection so you can decide the strength of the bot you play against.', keywords: ['ai difficulty','bot difficulty','chess difficulty','ai level'], aliases: ['how hard is the chess ai','can i choose a strong chess bot'] },
    { category: 'chess', question: 'Can I choose White or Black?', answer: 'The chess setup flow allows you to choose the color or side you play. This is part of the pre-game options.', keywords: ['play white','play black','chess color','choose side'], aliases: ['do i get to choose white or black','can i select my chess side'] },
    { category: 'chess', question: 'How do I reset a chess game?', answer: 'Use the Reset or Play again controls shown after the match or from the board UI to start a fresh chess game.', keywords: ['reset chess','new chess game','restart chess'], aliases: ['can i restart my chess game','how do i reset a match'] },
    { category: 'chess', question: 'How do I ask for a rematch?', answer: 'After a finished match, use the Play again or rematch control to start a new game with the same opponent or setup.', keywords: ['rematch','play again','rematch chess'], aliases: ['how do i challenge for a rematch','can i play the same chess game again'] },
    { category: 'ttt', question: 'How do I play Tic-Tac-Toe?', answer: 'Open Arcade and select Tic-Tac-Toe, then click the grid to make moves. You can play against the AI or challenge a friend.', keywords: ['tic tac toe','ttt','play tic tac toe','grid game'], aliases: ['how do i start tic tac toe','can i play tic tac toe on zidea','what is tic tac toe in arcade'] },
    { category: 'ttt', question: 'Can I play Tic-Tac-Toe against AI?', answer: 'Yes. The game supports playing against the bot as well as using multiplayer or challenge flows.', keywords: ['ttt ai','play tic tac toe against ai','bot tic tac toe'], aliases: ['can i play against the computer in tic tac toe','how do i play bot tic tac toe'] },
    { category: 'ttt', question: 'How do I make a move?', answer: 'Click an empty square in the game grid to place your mark. The turn indicator updates when the other player or AI moves.', keywords: ['make move','choose square','play square','ttt move'], aliases: ['where do i click in tic tac toe','how do i place my mark'] },
    { category: 'ttt', question: 'What happens when I win?', answer: 'The game detects a three-in-a-row pattern and displays the result banner with a win state. You can then choose Play again.', keywords: ['win tic tac toe','winning','result','ttt win'], aliases: ['when i win at tic tac toe','how do i know i won'] },
    { category: 'ttt', question: 'What if I lose?', answer: 'The game will display the result state and the opponent or bot wins. You can start another round using Play again.', keywords: ['lose tic tac toe','game over','result loss'], aliases: ['what happens when i lose','how do i restart a lost round'] },
    { category: 'rps', question: 'How do I play Rock Paper Scissors?', answer: 'Open Arcade and choose Rock Paper Scissors. Then click a move and the app compares it to the opponent or AI result.', keywords: ['rock paper scissors','rps','play rps','play rock paper scissors'], aliases: ['how do i start rock paper scissors','where is rps in arcade'] },
    { category: 'rps', question: 'What moves are available?', answer: 'The app offers the standard Rock, Paper, and Scissors moves for each round.', keywords: ['rock paper scissors moves','rps moves','rock paper scissors options'], aliases: ['what choices do i have in rps','what are the rock paper scissors options'] },
    { category: 'rps', question: 'How is the score determined?', answer: 'The game compares each round outcome and updates the score based on wins, losses, and ties across the match.', keywords: ['score rps','rps score','win lose score'], aliases: ['how do i keep score in rock paper scissors','what determines the rps score'] },
    { category: 'rps', question: 'Can I play RPS against the bot?', answer: 'Yes. The app supports bot matches and challenge flows for Rock Paper Scissors.', keywords: ['rps ai','play rps vs bot','rock paper scissors bot'], aliases: ['can i play rock paper scissors against the computer'] },
    { category: 'rps', question: 'How do I reset a Rock Paper Scissors match?', answer: 'Use the reset or replay control provided in the game UI to start a fresh round or match.', keywords: ['reset rps','restart rps','play again rps'], aliases: ['how do i restart rock paper scissors','can i reset the rps match'] },
    { category: 'media', question: 'Can I send a file in chat?', answer: 'Yes, the app includes file upload support in chat so you can attach media and documents as part of a thread.', keywords: ['send file in chat','upload file','chat media'], aliases: ['can i attach a file to my chat','how do i upload a document in chat'] },
    { category: 'media', question: 'What kinds of media can I share?', answer: 'The app supports images, videos, and file attachments through the chat and profile upload flows.', keywords: ['media','images','videos','files','attachments'], aliases: ['what can i share in chat','can i send pictures and videos'] },
    { category: 'media', question: 'Why can I not upload a video?', answer: 'Use a valid video file, confirm the rights checkbox if required, and make sure the browser is allowing file access. Unsupported file types will be rejected.', keywords: ['video upload failed','cannot upload video','not valid file','upload error'], aliases: ['why wont my video upload','my video upload failed','what kind of file can i upload'] },
    { category: 'media', question: 'What is the rights confirmation for uploads?', answer: 'The upload forms ask you to confirm that the content is yours or that you have rights to post it. This helps ensure the app only uses supported uploads.', keywords: ['rights confirmation','upload rights','confirm content rights','copyright confirmation'], aliases: ['why do i need to confirm my upload rights','what is the upload rights checkbox'] },
    { category: 'troubleshooting', question: 'Why can I not find a user?', answer: 'Make sure you are searching for the correct username and that the user exists in the app search index. Try the exact username or check that the name matches the account.', keywords: ['can not find user','user not found','search not working','missing username'], aliases: ['why cant i find a person','why is no user showing in search','i cannot find someone by username'] },
    { category: 'troubleshooting', question: 'Why is my idea not showing in my Library?', answer: 'The idea must be created or saved correctly, and the page must be refreshed to reflect the current state. Check the Created or Saved tabs in Library.', keywords: ['idea not showing','library missing idea','where is my idea','created idea missing'], aliases: ['why is my generated idea not in the library','where did my saved idea go','why doesnt my idea appear'] },
    { category: 'troubleshooting', question: 'Why is my profile video not showing in Explore?', answer: 'The video must be valid, rights-confirmed, and successfully uploaded. If the upload is blocked or the file is not supported, it will not appear.', keywords: ['profile video missing in explore','video not in explore','uploaded reel missing'], aliases: ['why is my uploaded video missing from the feed','why does my profile reel not show in explore'] },
    { category: 'troubleshooting', question: 'Why is my game not starting?', answer: 'Check that the correct game mode is selected, the second player or bot has joined, and the room or challenge flow has started properly. If not, restart the room.', keywords: ['game not starting','challenge not starting','room not active','multiplayer not starting'], aliases: ['why wont my game start','my game didnt launch','the game never started'] },
    { category: 'troubleshooting', question: 'Why can I not challenge my friend?', answer: 'Make sure the other player is available and the challenge flow is started from the active game. Some games require a room or invitation flow to begin.', keywords: ['cannot challenge friend','challenge failed','friend challenge not working'], aliases: ['why didnt my challenge go through','how do i challenge a friend when it fails'] },
    { category: 'troubleshooting', question: 'Why does Zidea need Google sign-in configuration?', answer: 'Google sign-in is optional unless a valid Google client ID is configured. Without that configuration, the app stays in email/password mode.', keywords: ['google sign in config','google auth missing','oauth config missing'], aliases: ['why is google login not available','why do i not see google login'] },
    { category: 'mobile', question: 'How does the mobile experience work?', answer: 'The page uses responsive layouts and a bottom mobile action set so users can access the major parts of Zidea on smaller screens.', keywords: ['mobile','responsive','phone','small screen'], aliases: ['how does zidea work on mobile','is zidea mobile friendly','can i use zidea on my phone'] },
    { category: 'mobile', question: 'Where do I find the major sections on mobile?', answer: 'The mobile interface keeps the main navigation and quick actions accessible via the sidebar or mobile drawer, with ZiD AI and other pages available through navigation.', keywords: ['mobile navigation','sidebar on mobile','bottom nav','small screen menu'], aliases: ['how do i switch pages on my phone','where is the mobile menu','where are the app buttons on mobile'] },
    { category: 'mobile', question: 'Can I use ZiD AI on mobile?', answer: 'Yes. The Zidea app keeps the ZiD AI page and messaging flow available in the responsive navigation system.', keywords: ['zidai mobile','zid ai on phone','mobile ai'], aliases: ['can i use zid ai on my phone','where is ziD AI on mobile'] },
    { category: 'mobile', question: 'How do I open the app menu on a smaller screen?', answer: 'The app uses a responsive mobile drawer and navigation flow so you can open the major sections without the desktop sidebar.', keywords: ['mobile menu','drawer','app menu','smaller screen nav'], aliases: ['where is the mobile drawer','how do i open the menu on my phone'] },
    { category: 'zidai', question: 'How do I ask ZiD AI a question?', answer: 'Open the ZiD AI page, type your question into the message box, and press Enter or the send button. The assistant checks local Zidea knowledge before any fallback AI answer.', keywords: ['ask zid ai','use zid ai','message zid ai','ask assistant'], aliases: ['how do i use zid ai','where do i talk to zid ai','how can i ask zid ai a question'] },
    { category: 'zidai', question: 'What does ZiD AI answer?', answer: 'It can answer website-specific Zidea questions and help brainstorm. It will prefer locally verified Zidea answers before any broader AI response.', keywords: ['zid ai answers','what can zid ai answer','zid ai questions','website help'], aliases: ['what kind of questions can zid ai answer','what can ziD ai help with'] },
    { category: 'zidai', question: 'What happens if my question is not in the FAQ?', answer: 'ZiD AI falls back to the normal AI response path, but only after checking the local Zidea knowledge base for a better website-specific answer.', keywords: ['faq','fallback ai','if not in knowledge base','website question not found'], aliases: ['what if my question is not in the faq','what happens if zid ai does not know the answer'] },
    { category: 'zidai', question: 'Can ZiD AI help me with Zidea features?', answer: 'Yes. It can explain features like Chat, Arcade, Explore, profile upload, idea generation, and account flows using the local Zidea knowledge base.', keywords: ['help with zidea','zidea features','navigation help'], aliases: ['can zid ai explain zidea features','how do i get help with zidea functions'] },
    { category: 'zidai', question: 'Does ZiD AI use a local knowledge base?', answer: 'Yes. ZiD AI checks the local Zidea FAQ before trying the general AI system, so website-specific answers are more accurate and consistent.', keywords: ['knowledge base','faq','local answers','website info'], aliases: ['is zid ai using a local faq','does zid ai have website knowledge'] },
    { category: 'zidai', question: 'Can I ask follow-up questions in ZiD AI?', answer: 'Yes. The chat maintains conversation history, so follow-up questions can be interpreted in context if they relate to the same feature or topic.', keywords: ['follow-up','follow up','context','conversation history'], aliases: ['can i ask a follow up question','how does the chat remember context'] },
    { category: 'zidai', question: 'Why does Zidea prefer its own answer over generic AI?', answer: 'Website-specific facts are more reliable than general knowledge, so the app checks the Zidea knowledge base first to avoid hallucinated product claims.', keywords: ['website-specific','hallucination','faq priority','generic ai'], aliases: ['why does zid ai rely on zidea content first','why not just use generic ai'] },
    { category: 'general', question: 'Where can I contact Zidea?', answer: 'The site mentions the support email hello@zidea.app and the Contact information in the footer, and asks users to include their @username and account email when requesting deletion or support.', keywords: ['contact','support','hello@zidea.app','contact zidea'], aliases: ['how can i contact zidea','where is support','how do i reach the zidea team'] },
    { category: 'general', question: 'What is the support email?', answer: 'The app references hello@zidea.app for support, deletion requests, and account verification issues. Include your @username plus account email when contacting support.', keywords: ['support email','hello@zidea.app','contact email','help email'], aliases: ['what email do i use for support','where do i send zidea support questions','what is the contact email'] },
    { category: 'general', question: 'How do I request account deletion?', answer: 'Open Contact from the footer or email hello@zidea.app from the account email associated with the profile. Include your @username and ask for account deletion.', keywords: ['delete account request','contact support','delete my zidea account','account deletion request'], aliases: ['how can i delete my account','where do i ask to delete my zidea account'] },
    { category: 'general', question: 'Is Google OAuth connected yet?', answer: 'The app shows a Google sign-in flow, but the UI text also says Google OAuth is not connected yet in the preview environment. The app will only use it if a valid client ID is configured.', keywords: ['oauth connected','google auth connected','google not connected'], aliases: ['is google login connected','is google oauth active','is google sign in working'] },
    { category: 'troubleshooting', question: 'Why does the site ask me to allow microphone access?', answer: 'Because the app includes live voice calls and the browser must approve microphone access before you can speak in the call.', keywords: ['need mic access','microphone access needed','why ask mic'], aliases: ['why is my browser asking for microphone permission','do i have to allow my microphone'] },
    { category: 'general', question: 'How do I open the chat?', answer: 'Use the Chat section in the sidebar or open a user profile and initiate a conversation. The app opens the threads in the chat layout.', keywords: ['open chat','chat page','message page','conversation page'], aliases: ['where is the chat','how do i go to messages','how do i open my chats'] }
  ];

  const STOP_WORDS = new Set(['a','an','the','and','or','but','if','then','when','where','what','why','how','who','which','this','that','these','those','is','are','was','were','can','could','do','does','did','to','of','for','on','in','with','from','at','by','about','into','out','up','down','my','your','our','i','you','we','they','he','she','it','me','us','them','be','as','so','not','no','yes','just']);

  function normalizeFaqText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s@]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenizeFaqText(value) {
    return normalizeFaqText(value)
      .split(' ')
      .map((word) => word.trim())
      .filter(Boolean)
      .filter((word) => !STOP_WORDS.has(word) && word.length > 1);
  }

  function createFaqVariants(baseQuestion, aliases) {
    const variants = new Set();
    const initial = normalizeFaqText(baseQuestion);
    if (initial) variants.add(initial);
    if (baseQuestion && baseQuestion.endsWith('?')) {
      variants.add(normalizeFaqText(baseQuestion.slice(0, -1)));
    }
    const expanded = [baseQuestion, ...(aliases || [])];
    expanded.forEach((entry) => {
      if (!entry) return;
      const normalized = normalizeFaqText(entry);
      if (normalized) variants.add(normalized);
      if (normalized.length > 3) {
        const tokens = tokenizeFaqText(entry);
        if (tokens.length > 4) {
          variants.add(tokens.slice(0, Math.min(tokens.length, 6)).join(' '));
          variants.add(tokens.slice(Math.max(0, tokens.length - 6)).join(' '));
        }
      }
    });
    return [...variants].filter((value) => value.length > 2);
  }

  const generatedEntries = [];
  let idCounter = 1;

  for (const item of FAQ_BASE) {
    const variants = createFaqVariants(item.question, item.aliases || []);
    const baseTokens = new Set(tokenizeFaqText(item.question));
    for (const variant of variants) {
      generatedEntries.push({
        id: idCounter++,
        category: item.category,
        question: variant,
        answer: item.answer,
        keywords: Array.from(new Set([...(item.keywords || []), ...tokenizeFaqText(item.question)])),
        aliases: item.aliases || [],
        priority: item.priority || 100,
        relatedWords: Array.from(baseTokens)
      });
    }
  }

  const SAFE_FAQ_LIMIT = 2000;
  while (generatedEntries.length < SAFE_FAQ_LIMIT) {
    const seed = FAQ_BASE[Math.floor(Math.random() * FAQ_BASE.length)];
    const variant = createFaqVariants(seed.question, seed.aliases || [])[0];
    if (!variant) continue;
    generatedEntries.push({
      id: idCounter++,
      category: seed.category,
      question: variant,
      answer: seed.answer,
      keywords: seed.keywords || [],
      aliases: seed.aliases || [],
      priority: seed.priority || 100,
      relatedWords: tokenizeFaqText(seed.question)
    });
  }

  const ZIDEA_KNOWLEDGE_BASE = generatedEntries.slice(0, SAFE_FAQ_LIMIT);

  function getKeywordBoost(questionText, entry) {
    const normalizedQuestion = normalizeFaqText(questionText);
    const words = new Set(tokenizeFaqText(normalizedQuestion));
    const entryTerms = new Set([
      ...tokenizeFaqText(entry.question),
      ...(entry.keywords || []),
      ...(entry.relatedWords || [])
    ]);
    let score = 0;
    for (const term of words) {
      if (entryTerms.has(term)) score += 10;
    }
    return score;
  }

  function getFaqMatchScore(questionText, entry, recentCategory) {
    const normalizedQuestion = normalizeFaqText(questionText);
    const normalizedEntry = normalizeFaqText(entry.question);
    const entryKeywords = new Set([
      ...tokenizeFaqText(entry.question),
      ...(entry.keywords || []),
      ...(entry.relatedWords || [])
    ]);

    let score = 0;
    if (!normalizedQuestion) return 0;
    if (normalizedQuestion === normalizedEntry) score += 180;
    if (normalizedQuestion.includes(normalizedEntry) || normalizedEntry.includes(normalizedQuestion)) score += 90;

    score += getKeywordBoost(questionText, entry);

    const qTokens = tokenizeFaqText(normalizedQuestion);
    const overlap = qTokens.filter((token) => entryKeywords.has(token)).length;
    score += overlap * 14;

    if (recentCategory && entry.category === recentCategory) score += 20;

    if (questionText.includes('@') && entry.question.includes('@')) score += 10;
    if (questionText.includes('google') && (entry.category === 'authentication' || entry.category === 'settings')) score += 10;
    if (questionText.includes('chess') && entry.category === 'chess') score += 30;
    if (questionText.includes('ttt') && entry.category === 'ttt') score += 30;
    if (questionText.includes('rps') && entry.category === 'rps') score += 30;
    if (questionText.includes('call') && entry.category === 'voice_calls') score += 25;
    if (questionText.includes('group') && entry.category === 'chat') score += 15;
    if (questionText.includes('profile') && entry.category === 'profile') score += 20;
    if (questionText.includes('idea') && entry.category === 'ideas') score += 15;
    return score;
  }

  function lastRelevantCategory(history) {
    if (!Array.isArray(history)) return null;
    const texts = history
      .filter((message) => message && message.role === 'user')
      .map((message) => message.parts || [])
      .flat()
      .map((part) => part && part.text ? part.text : '')
      .join(' ')
      .toLowerCase();

    const categoryHints = {
      chess: ['chess', 'board', 'white', 'black', 'checkmate'],
      ttt: ['tic tac toe', 'ttt', 'grid'],
      rps: ['rock paper scissors', 'rps'],
      voice_calls: ['call', 'phone', 'microphone', 'voice'],
      chat: ['chat', 'message', 'dm', 'group'],
      ideas: ['idea', 'brainstorm', 'generate', 'score'],
      explore: ['explore', 'video', 'comment', 'share', 'follow'],
      profile: ['profile', 'avatar', 'video'],
      settings: ['theme', 'settings', 'dark mode'],
      account: ['login', 'signup', 'password', 'account', 'google'],
      arcade: ['arcade', 'game', 'lobby', 'challenge']
    };

    for (const [category, hints] of Object.entries(categoryHints)) {
      if (hints.some((hint) => texts.includes(hint))) return category;
    }
    return null;
  }

  function getZideaFaqMatch(questionText, history) {
    const trimmed = String(questionText || '').trim();
    if (!trimmed) return null;
    const recentCategory = lastRelevantCategory(history || []);
    let best = null;
    for (const entry of ZIDEA_KNOWLEDGE_BASE) {
      const score = getFaqMatchScore(trimmed, entry, recentCategory);
      if (score > 35 && (!best || score > best.score)) {
        best = { score, entry };
      }
    }
    if (!best) return null;
    if (best.score > 220) return best.entry;
    if (best.score >= 60) return best.entry;
    return null;
  }

  if (typeof window !== 'undefined') {
    window.ZIDEA_KNOWLEDGE_BASE = ZIDEA_KNOWLEDGE_BASE;
    window.getZideaFaqMatch = getZideaFaqMatch;
  }
})();
