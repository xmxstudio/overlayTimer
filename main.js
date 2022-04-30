const $ = document.querySelector.bind(document);

const options = {
	rootElement: '#timer',
	googleFont: 'https://fonts.googleapis.com/css2?family=Lato&display=swap',
	commandPrefix: 't',
	allowVIP: false,
	allowMod: false,
	allowAny: true,
	showUpDownArrow: true,
	countUpOrDown: 'down',
	showAscDesc: true,
	countdownSoundFile: 'https://bigsoundbank.com/UPLOAD/mp3/0479.mp3',
	countdownCompleteSoundFile: 'https://soundbible.com/grab.php?id=1258&type=mp3',
	opacity: 0.8
}
const t = new Timer(options);
document.addEventListener('prefixUpdated', newPrefix => {
	t.commandPrefix = newPrefix.detail;
})

const client = new tmi.Client({ channels: ['xmetrix'] });
client.connect();
client.on('connected', () => { console.log('connected to twitch'); });
parseMessage = function (channel, tags, message, self) {
if (message.indexOf(t.commandPrefix) != 0) return;
	let rx = new RegExp(`^${t.commandPrefix}\\s+(.*)`, 'gm');
	let x = rx.exec(message)[1].split(' ');
	let cmd = x.shift();
	let args = x.filter(x => x);
	let isVIPuser = tags.badges?.vip == true ? true : false;
	let chatObj = { username: tags.username, isMod: tags.mod, isVip: isVIPuser, cmd: cmd, args: args }
	t[chatObj.cmd](chatObj.args);
}
client.on('message', parseMessage);