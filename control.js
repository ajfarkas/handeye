const $ = sel => document.querySelector(sel);

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

	for (let i = 0; i < len; i++) {
		cell = touch('div', 'space', {'tabindex': 1});
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
$('#board').appendChild(createTableBody([5, 4]));

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
	console.log(e.key);
};

window.addEventListener('keydown', moveChar);
window.addEventListener('keyup', releaseKey);
// place the starting position
$('.space').focus();
