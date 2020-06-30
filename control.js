const $ = sel => document.querySelector(sel);
const board = [];
const spacing = 50;
let pad = null;
let started = false;

const boardXY = {
	width: Math.floor(window.innerWidth / spacing),
	height: Math.floor(window.innerHeight / spacing),
};
const position = {
	x: Math.floor(boardXY.width / 2),
	y: Math.floor(boardXY.height / 2)
};


const touch = (kind, classlist, attr) => {
	const el = document.createElement(kind);
	el.className = classlist;
	if (typeof attr === 'object') {
		Object.entries(attr).forEach(([a, v]) => {
			try {
				el.setAttribute(a, v);
			} catch(err) {
				console.error('touch setAttr err: ', err);
			}
		});
	}

	return el;
};

/* Board Creation */
const createRow = (len, height) => {
	const row = touch('div', 'row');
	const classbase = 'grass-'
	let cell;

	const rowIndex = board.push([]) - 1;

	for (let colIndex = 0; colIndex < len; colIndex++) {
		// set background tile
		let cl = classbase;
		if (rowIndex === 0) cl += 'n';
		else if (rowIndex === height -1) cl += 's';
		if (colIndex === 0) cl += 'w';
		else if (colIndex === len - 1) cl += 'e';
		if (cl === classbase) {
			const rand = Math.random() * 100;
			if (rand < 8) cl = 'flower';
			else if (rand < 80) cl = cl.replace('-', '');
			else cl += 'shoots';
		}
		// create cell
		cell = touch('div', `space ${cl}`, {
			'data-pos': `${colIndex},${rowIndex}`
		});
		row.appendChild(cell);
	}

	return row;
};
// create the board element
const createTableBody = (size = [boardXY.width, boardXY.height]) => {
	const body = touch ('div', 'board-area');
	const [width, height] = size;

	for (let i = 0; i < height; i++) {
		body.appendChild(createRow(width, height));
	}

	return body;
};

// lay out the board
$('#board').appendChild(createTableBody());

/* Deal with keyboard/controller */
let keypress = false;
const keyLocking = () => {
	if (keypress) return false;
	return (keypress = true);
}
const releaseKey = () => {
	keypress = false;
}

/* Audio */
const music = $('#music');
const sfx = $('#sfx');
music.volume = 0.5;
sfx.volume = 1;

/* Character Positioning */
const activateSpace = () => {
	const old = $('.space.active');
	if (old) {
		old.classList.remove('active');
	}
	$(`[data-pos="${position.x},${position.y}"]`).classList.add('active');
}

const startActivated = () => {
	if (!started) {
		started = true;
		music.src = './assets/1BITTopDownMusics-Adventure.wav';
	} else if (music.paused) {
		music.play();
	} else {
		music.pause();
	}
	$('#start').classList.toggle('disabled');
};

const moveChar = e => {
	if (!keyLocking()) return;
	const {x, y} = position;
	switch (e.key) {
		case 'ArrowUp':
		case 'w':
		case 'W':
			if (y) {
				position.y--;
			}
			break;
		case 'ArrowRight':
		case 'd':
		case 'D':
			if (x < boardXY.width - 1) {
				position.x++;
			}
			break;
		case 'ArrowDown':
		case 's':
		case 'S':
			if (y < boardXY.height - 1) {
				position.y++;
			}
			break;
		case 'ArrowLeft':
		case 'a':
		case 'A':
			if (x) {
				position.x--;
			}
			break;
		case 'z':
				sfx.setAttribute('src', './assets/Jump03.wav')
				break;
		case 'Enter':
			startActivated();
			return;
	}
	
	activateSpace();
};

/* Gamepad API */
const padMap = {
	'a': 0,
	'b': 1,
	'x': 2,
	'y': 3,
	'lb': 4,
	'rb': 5,
	'lstick': 6,
	'rstick': 7,
	'start': 8,
	'select': 9,
	'on': 10,
	'up': 11,
	'down': 12,
	'left': 13,
	'right': 14,
}
const stickMap = {
	'lx': 0,
	'ly': 1,
	'ltrigger': 2,
	'rx': 3,
	'ry': 4,
	'rtrigger': 5
}
let animId;
let nav = false;

const pressedButton = () => {
	pad = navigator.getGamepads()[padIndex];
	let btn = null;
	Object.entries(padMap).some(([name, id]) => {
		if (pad.buttons[id].pressed) {
			btn = name;
			return true;
		}
	});
	return btn;
}
const movedStick = () => {
	pad = navigator.getGamepads()[padIndex];
	let command = null;
	const { lx, ly } = stickMap;
	const dirStickMap = { lx, ly };
	Object.entries(dirStickMap).some(([name, id]) => {
		const val = pad.axes[id];
		switch (`${name},${val}`) {
			case 'lx,-1':
				command = 'left';
				break;
			case 'lx,1':
				command = 'right';
				break;
			case 'ly,-1':
				command = 'up';
				break;
			case 'ly,1':
				command = 'down';
				break;
		}
		return Math.abs(val) === 1;
	});
	return command;
}

const checkPadInput = (timer) => {
	if (!pad) {
		return cancelAnimationFrame(animId);
	}
	const {x, y} = position;
	const btn = pressedButton() || movedStick();
	const {axes} = pad;

	// zero out d-pad
	if (!nav) {
		switch(btn) {
			case 'start':
				startActivated();
				nav = true;
				break;
			case 'up':
				if (y) {
					position.y--;
					nav = true;
				}
				break;
			case 'right':
				if (x < boardXY.width - 1) {
					position.x++;
					nav = true;
				}
				break;
			case 'down':
				if (y < boardXY.height - 1) {
					position.y++;
					nav = true;
				}
				break;
			case 'left':
				if (x) {
					position.x--;
					nav = true;
				}
				break;
			case 'a':
				sfx.setAttribute('src', './assets/Jump03.wav')
				break;
		}
	} else if (!btn) {
		nav = false;
	}
	if (nav) {
		activateSpace();
	}

	animId = requestAnimationFrame(checkPadInput);
}

window.addEventListener('gamepadconnected', e => {
	padIndex = e.gamepad.index;
	pad = navigator.getGamepads()[padIndex];
	window.requestAnimationFrame(checkPadInput);
});
window.addEventListener('gamepaddisconnected', e => {
	pad = null;
	$('#start').classList.remove('disabled');
});

/* Key bindings */
window.addEventListener('keydown', moveChar);
window.addEventListener('keyup', releaseKey);

// place the starting position
activateSpace();
