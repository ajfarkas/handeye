const $ = sel => document.querySelector(sel);

let BONES_NUM = 1;

const board = [];
const spacing = 50;
let pad = null;

const boardXY = {
	width: Math.floor(window.innerWidth / spacing),
	height: Math.floor(window.innerHeight / spacing),
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
			else if (rand < 82 && BONES_NUM) {
				BONES_NUM--;
				cl = cl.replace('-', ' bone');
			}
			else cl += 'shoots';
		}
		board[rowIndex].push(cl.split(/-|\s/));
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
	console.log('table creation done');
	return body;
};

export {$, createTableBody, board, boardXY };
