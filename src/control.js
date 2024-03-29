import { $, board, boardXY } from './create.js';
import NPC from './npc.js';

let started = false;

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

const NPCs = [];
const actions = [
	'active',
	'dance',
	'jump'
];
const actionNames = [
	'danceC',
	'jump'
];
/* Character Positioning */
const position = {
	x: Math.floor(boardXY.width / 2),
	y: Math.floor(boardXY.height / 2)
};
const carry = [];
const activateSpace = (className, initial) => {
	const old = $('.space.active');
	const list = ['active'];
	const {x, y} = position;
	const space = $(`[data-pos="${x},${y}"]`);
	const boneIndex = board[y][x].indexOf('bone');
	const boneEl = $('.has-bone');

	if (old) {
		old.classList.remove(...actions);
	}
	if (className) list.push(className);
	else if (boneIndex > -1) {
		console.log('you found the bone!');
		carry.push('bone');
		board[y][x].splice(boneIndex, 1);
		space.classList.remove('bone');
	}
	if (carry.indexOf('bone') > -1) {
		if (boneEl) boneEl.classList.remove('has-bone');
		list.push('has-bone');
	}

	space.classList.add(...list);
	// Try to allow multiple events on a single space
	const clearAnimation =  ev => {
		if (actionNames.indexOf(ev.animationName) > -1) {
			space.removeEventListener('animationend', clearAnimation);
			space.classList.remove(...actions.slice(1));
		}
	};
	space.addEventListener('animationend', clearAnimation);

	if (initial) NPCs.push(new NPC());
}

const dropBone = () => {
	const {x, y} = position;
	const space = $(`[data-pos="${x},${y}"]`);
	const carryBoneIndex = carry.indexOf('bone');

	console.log('dropping the bone');
	// add bone to grass
	space.classList.add('bone');
	board[y][x].push('bone');
	// remove bone from dog
	if (carryBoneIndex > -1) {
		carry.splice(carryBoneIndex, 1);
	}
	space.classList.remove('has-bone');
};

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
	const oldPosition = { ...position };
	const {x, y} = position;
	let spaceClass = undefined;
	let skipNav = false;

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
		case 'Shift':
			sfx.setAttribute('src', './assets/Jump03.wav');
			spaceClass = 'jump';
			break;
		case ' ':
			spaceClass = 'dance';
			break;
		case 'y':
		case 'Y':
			dropBone(e);
			skipNav = true;
			break;
		case 'Enter':
			startActivated();
			return;
	}
	
	NPCs.some(char => {
		const charPos = char.position;
		if (position.x === charPos.x && position.y === charPos.y) {
			Object.assign(position, oldPosition);
		}
	});
	if (!skipNav) activateSpace(spaceClass);
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
let pressing = false;

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
	let spaceClass = undefined;

	// if not continuous press, do stuff
	if (!pressing) {
		pressing = true;
		nav = true;
		switch(btn) {
			case 'start':
				startActivated();
				break;
			case 'up':
				if (y) {
					position.y--;
				}
				break;
			case 'right':
				if (x < boardXY.width - 1) {
					position.x++;
				}
				break;
			case 'down':
				if (y < boardXY.height - 1) {
					position.y++;
				}
				break;
			case 'left':
				if (x) {
					position.x--;
				}
				break;
			case 'a':
				sfx.setAttribute('src', './assets/Jump03.wav');
				spaceClass = 'jump';
				break;
			case 'b':
				spaceClass = 'dance';
				break;
			case 'y':
				dropBone();
			default:
				pressing = false;
				nav = false;
		}
	} else if (!btn) {
		pressing = false;
	}
	if (nav) {
		nav = false;
		activateSpace(spaceClass);
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

export { activateSpace, position };
