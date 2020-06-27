const $ = sel => document.querySelector(sel);
const board = [];
const position = { x: 0, y: 0 };
let boardDimensions;

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

	const colIndex = board.push([]) - 1;

	for (let rowIndex = 0; rowIndex < len; rowIndex++) {
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
	boardDimensions = { width, height };

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
			if (x < boardDimensions.width - 1) {
				position.x++;
			}
			break;
		case 'ArrowDown':
		case 's':
		case 'S':
			if (y < boardDimensions.height - 1) {
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
