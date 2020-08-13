// Canvas script
const canvas = document.getElementById('recording');
const smImg = document.getElementById('pixelart');
const bigImg = document.getElementById('image');
const ctx = canvas.getContext('2d');
let color = '#000';
let dropperActive = false;

const draw = ev => {
	const { target } = ev;
	if (target.tagName !== 'TD') return;
	const { coords } = target.dataset;
	const [x, y] = coords.split(',');

	target.style.backgroundColor = color;
	if (color === '') {
		ctx.clearRect(x,y,1,1);
	} else {
		ctx.fillStyle = color;
		ctx.fillRect(x,y,1,1);
	}
	smImg.src = canvas.toDataURL();
	bigImg.src = canvas.toDataURL();
}
// Create table
const table = document.getElementById('drawing');
for (let y = 0; y < 16; y++) {
	const row = document.createElement('tr');
	for (let x = 0; x < 16; x++) {
		const cell = document.createElement('td');
		cell.dataset.coords = `${x},${y}`;
		row.appendChild(cell);
	}
	table.appendChild(row);
}
table.addEventListener('click', draw);

// Choose color
const picker = document.getElementById('color-picker');
const hexColor = document.getElementById('color-text');
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
	} else if (!colorVal || colorVal === 'transparent') {
		colorVal = '';
	}
	return colorVal;
}
// update color from input
const changeColor = ev => {
	const target = ev.currentTarget;
	const { value } = target;

	color = convertColorValue(value);
	picker.value = color || '#ffffff';
	cancelDropper();
};

picker.addEventListener('change', changeColor);
hexColor.addEventListener('change', changeColor);
// update color by selecting coordinate
const dropperColor = ev => {
	const { target } = ev;
	// get color and prevent target update
	if (target !== table) {
		cancelDropper();
		const bgColor = convertColorValue(target.style.backgroundColor);
		color = bgColor || 'transparent';
		picker.value = bgColor || '#ffffff';
	}
}
dropper.addEventListener('click', () => {
	dropperActive = true;
	dropper.classList.add('isActive');
	table.removeEventListener('click', draw);
	table.addEventListener('click', dropperColor);
});

const cancelDropper = () => {
	if (dropperActive) {
		dropperActive = false;
		dropper.classList.remove('isActive');
		table.removeEventListener('click', dropperColor);
		table.addEventListener('click', draw);
	}
};
