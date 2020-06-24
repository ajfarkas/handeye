const $ = sel => document.querySelector(sel);
const board = [];
const position = { x: 0, y: 0 };

const touch = (kind, classlist, attr) => {
	const el = document.createElement(kind);
	el.classList.add(classlist);
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
const createRow = len => {
	const row = touch('div', 'row');
	let cell;

	const rowIndex = board.push([]) - 1;

	for (let colIndex = 0; colIndex < len; colIndex++) {
		cell = touch('div', 'space', {
			'tabindex': 1,
			'data-pos': `${rowIndex},${colIndex}`
		});
		row.appendChild(cell);
	}

	return row;
};

const createTableBody = size => {
	const body = touch ('div', 'board-area');
	const [width, height] = size;

	for (let i = 0; i < height; i++) {
		body.appendChild(createRow(width));
	}

	return body;
};

// lay out the board
$('#board').appendChild(createTableBody([5, 5]));

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
const moveChar = e => {
	if (!keyLocking()) return;
	switch (e.key) {
		case 'ArrowUp':
		case 'w':
		case 'W':
			// move up
			break;
		case 'ArrowRight':
		case 'd':
		case 'D':
			// move right
			break;
		case 'ArrowDown':
		case 's':
		case 'S':
			// move down
			break;
		case 'ArrowLeft':
		case 'a':
		case 'A':
			// move left
			break;
	}
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
$(`[data-pos="${position.x},${position.y}"]`).classList.add('active');
