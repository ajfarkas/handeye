const $ = sel => document.querySelector(sel);
const board = [];
const position = { x: 7, y: 6 };
const boardXY = {width: 15, height: 13};

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

/* Character Positioning */
const activateSpace = () => {
	const old = $('.space.active');
	if (old) {
		old.classList.remove('active');
	}
	$(`[data-pos="${position.x},${position.y}"]`).classList.add('active');
}

const moveChar = e => {
	if (!keyLocking()) return;
	const {x, y} = position
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
	}
	
	activateSpace();
};

/* Gamepad API */
const gamepads = navigator.getGamepads;
window.addEventListener('gamepadconnected', e => {
	window.pad = gamepads[e.gamepad.index];
})

/* Key bindings */
window.addEventListener('keydown', moveChar);
window.addEventListener('keyup', releaseKey);

// place the starting position
activateSpace();
