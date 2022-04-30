const l = what => console.log(Object.keys(what)[0], what[Object.keys(what)[0]]);

class Timer {
	constructor(options) {
		this.commandPrefix = options.commandPrefix || '!';
		this.googleFont = options.googleFont || 'https://fonts.googleapis.com/css2?family=Coda+Caption:wght@800&display=swap'
		this.fontFamily = /family=([^&|:]*)/.exec(this.googleFont)[1].replace("+", " "); //might need to be adjusted based on font input uri
		this.allowAny = options.allowAny || false; //change to make sure it defaults properly using ternary opreator instead
		this.allowVIP = options.allowVIP || false;
		this.allowMod = options.allowMod || true;
		this.showUpDownArrow = options.showUpDownArrow || true;
		this.countUpOrDown = options.countUpOrDown || 'down';
		this.timerInt = ''; //interval id for the setInterval loop which handles the actual ticking of the clock
		this.isRunning = false;
		this.rootElement = document.querySelector(options.rootElement);
		this.rootElement.style.opacity = 0;
		this.ticks = 0;
		this.totalTicks = 300000;
		this.goal = new Date(300000).toISOString().substr(14, 5);
		this.helpInfo = '';
		this.showAscDesc = options.showAscDesc ? true : false;
		this.countdownCompleteSoundFile = options.countdownCompleteSoundFile;
		this.countdownSoundFile = options.countdownSoundFile;
		this.rootElementOpacity = options.opacity || 1;
		this.loadFont();
		this.#domStuff();
		// this.mainHelpInfo();
	}
	about() {
		this.help(args['about']);
	}
	add(args) {
		this.set(args, true);
	}
	clear() {
		if (this.isRunning) return;
		this.ticks = 0;
		this.totalTicks = 0;
		this.goal = '';
		this.render();
	}
	#domStuff() {
		this.labelElement = Object.assign(document.createElement('div'), { id: 'timerLabel', className: '', innerHTML: '' });
		this.fa = Object.assign(document.createElement('i'), { id: 'stopwatch', className: 'fa-solid fa-stopwatch' });
		this.info = Object.assign(document.createElement('div'), { id: 'info', style: `font-family: ${this.fontFamily}`, innerHTML: `${this.currentTime || ''}` });
		this.ascdesc = Object.assign(document.createElement('i'), { id: 'ascdesc', className: 'ssmaller fa-solid ', style: this.showAscDesc ? '' : 'display:none', innerHTML: this.goal });
		this.timerhelp = Object.assign(document.createElement('div'), { id: 'timerhelp', innerHTML: `${this.helpInfo}` });
		this.rootElement.append(this.fa, this.info, this.ascdesc, this.timerhelp, this.labelElement);
		this.rootElement.style.fontFamily = this.fontFamily; //set it "#app" wide1
		var audio = document.createElement('audio');
		audio.style.display = 'block';
		audio.src = this.countdownCompleteSoundFile;
		audio.autoplay = false;
		this.audio = audio;
		var a2 = document.createElement('audio');
		a2.style.display = 'block';
		a2.src = this.countdownSoundFile;
		a2.autoplay = false;
		this.a2 = a2;
		document.body.appendChild(audio);
	}
	elapsed() {
		this.countUpOrDown = 'up';
		this.render();
	}
	#finished() {
		this.isRunning = false;
		clearInterval(this.timerInt);
		this.ticks = 0;
		let body = document.querySelector('body');
		body.classList.remove('bodyflash');
		body.classList.add('bodyflash');
		setTimeout(function () {
			body.classList.remove('bodyflash');
		}, 5000);
	}
	help(args) {
		switch (args[0]) {
			case "start":
				this.helpInfo = "starts the timer, accepts a time string or starts a default 5 minute if omitted";
				break;
			case "stop":
				this.helpInfo = "this stops the timer, keeping the current count where it is";
				break;
			case "reset":
				this.helpInfo = "restarts  the timer, changing nothing else.";
				break;
			case "clear":
				this.helpInfo = "stops the timer, clears the timer goal. full reset!";
				break;
			case "add":
				this.helpInfo = `lets you extend the timer goal. <br/><br/>e.g.,  <span style='color: #0591e3'>${this.commandPrefix}</span> add 5m20s`;
				break;
			case "subtract":
				this.helpInfo = `lets you decrease the timer goal. <br/><br/>e.g., <span style='color: #0591e3'>${this.commandPrefix}</span> subtract 5m20s`;
				break;
			case "remove":
				this.helpInfo = `lets you decrease the timer goal. <br/><br/>e.g., <span style='color: #0591e3'>${this.commandPrefix}</span> subtract 5m20s`;
				break;
			case "about":
				this.helpInfo = "timer overlay created by twitch.tv/<span style='color: #0591e3'>xmetrix</span>";
				break;
			default:
				this.helpInfo = this.mainHelpInfo();
		}
		this.rootElement.style.opacity = 1;
		this.timerhelp.classList.add('showHelp');
		setTimeout(function () {
			this.timerhelp.classList.remove('showHelp');
		}, 10000)
		console.log('help should have shown the shit');
		this.render();
	}
	hide() {
		this.hideRootElement = true;
		this.render();	
	}
	mainHelpInfo() {
		return `<h3>Timer Commands</h3>
		<p>The chat command prefix is: <span style='color: #0591e3'>${this.commandPrefix}</span></p>
		<ul>
		<li>start - starts a timer with default 5:00 or accepts time string 1h5m2s</li>
		<li>stop - stops timer and keeps all values</li>
		<li>reset - resets timer to keeping target time</li>
		<li>clear -  completely resets timer</li>
		<li>add   - allows you to add timestring 1h25m5s</li>
		<li>subtract/remove  - allows you to subtract timestring 70m</li>
		<li>remaining - toggles the display to time remaining</li>
		<li>elapsed - toggles the display to time elapsed</li>
		</ul>
		<p>Type <strong>help command</strong> for specific help with that command</p>`;
	}
	label(args) {
		this.labelInfo = args.join(' ').replace("<", "&lt;");
	}
	loadFont() {
		let s = document.createElement('style');
		let head = document.head || document.getElementsByTagName("head")[0];
		head.appendChild(s);
		s.type = 'text/css';
		if (s.styleSheet) {
			s.styleSheet.cssText = `@import url('${this.googleFont}');`;
		} else {
			s.appendChild(document.createTextNode(`@import url('${this.googleFont}');`));
		}
	}
	prefix(args) {
		document.dispatchEvent(new CustomEvent('prefixUpdated', { detail: args[0] }));
		this.commandPrefix == args[0];
	}
	processCommand(chatObj){

	}
	refresh() {
		//save current settings to localstorage, and retreive them on constructor
		location.reload();
	}
	remaining() {
		this.countUpOrDown = 'down';
		this.render();
	}
	remove(args) {
		this.set(args, false, true);
	}
	render() {  
		let { start, end } = (this.totalTicks - this.ticks >= 3600000) ? { start: 11, end: 8 } : { start: 14, end: 5 };
		this.currentTime = new Date(this.countUpOrDown == "up" ? this.ticks : this.totalTicks - this.ticks).toISOString().substr(start, end);
		if (this.isRunning) { this.fa.classList.add('timerG'); this.fa.classList.remove('timerR'); } else { this.fa.classList.remove('timerG'); this.fa.classList.add('timerR'); }
		this.info.innerHTML = this.currentTime || '';
		this.labelElement.innerHTML = this.labelInfo || '';
		this.ascdesc.className = `smaller fa-solid fa-arrow-${this.countUpOrDown}`;
		this.ascdesc.innerHTML = this.goal;
		this.timerhelp.innerHTML = this.helpInfo;
		
		if(this.hideRootElement){
			this.rootElement.style.opacity = 0;
			return;	
		}
		
		this.rootElement.style.opacity = this.rootElementOpacity;

	}
	reset() {
		this.ticks = 0;
		this.render();
	}
	set(args, add = false, subtract = false) { //timer set 1m
		let timestring = args.join('').toLowerCase();
		let ms = { h: 3600000, m: 60000, s: 1000 };
		let totalUserStringTicks = parseInt([...timestring.matchAll(/(\d{0,})(h|m|s)/g)].reduce((p, c) => p + c[1] * ms[c[2]], 0));
		if (add) {
			this.totalTicks += Math.min(86399000, totalUserStringTicks);
			this.totalTicks = Math.min(86399000, this.totalTicks);
			this.goal = new Date((this.totalTicks)).toISOString().substr(11, 8);
			this.render();
			return;
		}
		if (subtract) {
			let ticksToRemove = totalUserStringTicks;
			if (this.totalTicks >= ticksToRemove) {
				this.totalTicks -= ticksToRemove;
			}
			this.goal = new Date((this.totalTicks)).toISOString().substr(11, 8);
			this.render();
			return;
		}
		this.totalTicks = Math.min(86399000, totalUserStringTicks);
		this.goal = new Date((this.totalTicks)).toISOString().substr(11, 8);
		console.log('this is args', args, args[0], this.totalTicks);
		if (args[1] == 'up' || args[1] == 'u') { this.countUpOrDown = 'up'; }
		if (args[1] == 'down' || args[1] == 'd') { this.countUpOrDown = 'down'; }
		this.render();
	}
	show(args) {
		if (args[0] && /[^0-9\.]/.test(args[0])) return;
		this.rootElementOpacity =  args[0] || 1;
		this.hideRootElement = false;
		
	}
	start(args) {
		console.log('start');
		if (this.isRunning) return;
		if (args.length) this.set(args);
		clearInterval(this.timerInt);
		this.render();
		this.timerInt = setInterval(() => { this.tick(); }, 1000);
		this.isRunning = true;
	}
	stop() {
		clearInterval(this.timerInt);
		this.isRunning = false;
		this.render();
	}
	subtract(args) {
		this.set(args, false, true);
	}
	tick() {
		this.ticks += 1000;
		this.render();
		if (this.totalTicks - this.ticks == 5000) {
			this.audio.play();
		}
		if (this.ticks == this.totalTicks) {
			this.#finished();
			this.a2.play();
		}
	}
}