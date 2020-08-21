// Canvas script
const html = document.querySelector('html');
const canvas = document.getElementById('recording');
const img = document.getElementById('image');
const ctx = canvas.getContext('2d');
const imageCells = [];
let width = 16;
let height = 16;
let color = '#000';
let dropperActive = false;

const draw = ev => {
	const { target } = ev;
	if (target.tagName !== 'TD') return;
	const { coords } = target.dataset;
	const [x, y] = coords.split(',');

	target.style.backgroundColor = color;
	if (color === 'transparent') {
		ctx.clearRect(x,y,1,1);
	} else {
		ctx.fillStyle = color;
		ctx.fillRect(x,y,1,1);
	}
	img.src = canvas.toDataURL();
}
// Create table
const table = document.getElementById('drawing-table');
const tbody = document.getElementById('drawing');
const createTable = (w, h) => {
	// clear previous table
	tbody.innerHTML = '';
	table.style.width = `${w * 20 + 1}px`;
	for (let y = 0; y < h; y++) {
		const row = document.createElement('tr');
		for (let x = 0; x < w; x++) {
			const cell = document.createElement('td');
			cell.dataset.coords = `${x},${y}`;
			row.appendChild(cell);
			imageCells.push(cell);
		}
		tbody.appendChild(row);
	}
	// update canvas
	canvas.width = width;
	canvas.height = height;
};
createTable(width,height);
// click to draw
tbody.addEventListener('click', draw);
// drag and draw
tbody.addEventListener('mousedown', () => {
	imageCells.forEach(cell => {
		cell.addEventListener('mouseenter', draw);
	});
});
const removeMouseEnter = () => {
	imageCells.forEach(cell => {
		cell.removeEventListener('mouseenter', draw);
	});
};
tbody.addEventListener('mouseup', removeMouseEnter);
tbody.addEventListener('mouseleave', removeMouseEnter);

// Choose color
const picker = document.getElementById('color-picker');
const colorText = document.getElementById('color-text');
const colorChip = document.getElementById('color-chip');
const alphaBtn = document.querySelector('.alpha-btn');
const dropper = document.getElementById('dropper');

const convertColorValue = colorVal => {
	if (colorVal.match('rgb')) {
		const nums = colorVal
			.replace(/rgba?\((([0-9]{1,3},?\s?){3,4})\)/, '$1')
			.split(/,\s?/g);
		if (nums[3] === 0) colorVal = '';
		else {
			const hex = nums.map(n => parseInt(n).toString(16).padStart(2, '0'));
			colorVal = `#${hex.join('')}`;
		}
	} else if (colorVal.match(/^#[0-9a-fA-F]{3}$/)) {
		const nums = colorVal.replace('#', '')
			.split('')
			.map(n => ''+n+n);
		colorVal = `#${nums.join('')}`;
	} else if (!colorVal) {
		colorVal = 'transparent';
	}
	return colorVal;
}
// update color from input
const changeColor = ev => {
	const target = ev.currentTarget;
	let { value } = target;

	if (!value.match(/\W/)) {
		colorChip.style.backgroundColor = value;
		value = getComputedStyle(colorChip).backgroundColor;
	}

	color = convertColorValue(value);
	picker.value = color || '#ffffff';
	colorText.value = color;
	cancelDropper();
};

picker.addEventListener('change', changeColor);
colorText.addEventListener('change', changeColor);
// set color to transparent
const useAlpha0 = () => {
	color = 'transparent';
	picker.value = '#ffffff';
	colorText.value = 'transparent';
}
alphaBtn.addEventListener('click', useAlpha0);
// update color by selecting coordinate
const dropperColor = ev => {
	const { target } = ev;
	// get color and prevent target update
	if (target !== tbody) {
		cancelDropper();
		const bgColor = convertColorValue(target.style.backgroundColor);
		if (bgColor) {
			color = bgColor;
			picker.value = bgColor;
		} else {
			useAlpha0();
		}
		
	}
}
dropper.addEventListener('click', () => {
	dropperActive = true;
	dropper.classList.add('isActive');
	tbody.removeEventListener('click', draw);
	tbody.addEventListener('click', dropperColor);
});

const cancelDropper = () => {
	if (dropperActive) {
		dropperActive = false;
		dropper.classList.remove('isActive');
		tbody.removeEventListener('click', dropperColor);
		tbody.addEventListener('click', draw);
	}
};

const uploader = document.getElementById('upload');
const imgXInput = document.getElementById('img-x');
const imgYInput = document.getElementById('img-y');
const reader = new FileReader();
// use reader file data to draw to img/canvas
reader.onloadend = () => {
	const { result } = reader;
	const x = parseInt(imgXInput.value) || 0;
	const y = parseInt(imgYInput.value) || 0;
	// draw to translate to canvas
	img.src = result;
	ctx.drawImage(img,x,y,width,height,0,0,width,height);
	// draw at appropriate crop
	img.src = canvas.toDataURL();
	const imgData = ctx.getImageData(0,0,width,height).data;
	const pixels = imgData.join(',')
		.match(/(\d+,?){1,4}/g)
		.map(pix => (
			'rgba('+
			pix.replace(/,$/, '').split(',')
				.map((c, ci) =>  ci === 3 ? c / 255 : c)
				.join(',')+
			')'
		));
	pixels.forEach((p, pi) => {
		imageCells[pi].style.backgroundColor = p;
	});
};
uploader.addEventListener('change', ev => {
	const file = uploader.files[0];
	// trigger read
	if (file) {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		reader.readAsDataURL(file);
	}
});

/* Artboard Setup */
// Dark Mode
const darkBtn = document.getElementById('darkmode');
if (localStorage.darkmode === 'true') {
	darkBtn.checked = true;
	html.classList.add('dark');
}
darkBtn.addEventListener('change', ev => {
	const { currentTarget } = ev;
	if (currentTarget.checked) {
		html.classList.add('dark');
		return localStorage.darkmode = true;
	}
	html.classList.remove('dark');
	return delete localStorage.darkmode;
});
// Resize Artboard
const boardW = document.getElementById('board-w');
const boardH = document.getElementById('board-h');
const resizeBtn = document.getElementById('board-btn');

resizeBtn.addEventListener('click', () => {
	const w = parseInt(boardW.value);
	const h = parseInt(boardH.value);
	width = w;
	height = h;

	createTable(w, h);
});

