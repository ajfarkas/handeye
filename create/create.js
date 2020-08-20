// Canvas script
const canvas = document.getElementById('recording');
const img = document.getElementById('image');
const ctx = canvas.getContext('2d');
const imageCells = [];
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
const table = document.getElementById('drawing');
for (let y = 0; y < 16; y++) {
	const row = document.createElement('tr');
	for (let x = 0; x < 16; x++) {
		const cell = document.createElement('td');
		cell.dataset.coords = `${x},${y}`;
		row.appendChild(cell);
		imageCells.push(cell);
	}
	table.appendChild(row);
}
// click to draw
table.addEventListener('click', draw);
// drag and draw
table.addEventListener('mousedown', () => {
	imageCells.forEach(cell => {
		cell.addEventListener('mouseenter', draw);
	});
});
const removeMouseEnter = () => {
	imageCells.forEach(cell => {
		cell.removeEventListener('mouseenter', draw);
	});
};
table.addEventListener('mouseup', removeMouseEnter);
table.addEventListener('mouseleave', removeMouseEnter);

// Choose color
const picker = document.getElementById('color-picker');
const hexColor = document.getElementById('color-text');
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
	const { value } = target;

	color = convertColorValue(value);
	picker.value = color || '#ffffff';
	hexColor.value = color;
	cancelDropper();
};

picker.addEventListener('change', changeColor);
hexColor.addEventListener('change', changeColor);
// set color to transparent
const useAlpha0 = () => {
	color = 'transparent';
	picker.value = '#ffffff';
	hexColor.value = 'transparent';
}
alphaBtn.addEventListener('click', useAlpha0);
// update color by selecting coordinate
const dropperColor = ev => {
	const { target } = ev;
	// get color and prevent target update
	if (target !== table) {
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

const uploader = document.getElementById('upload');
const imgXInput = document.getElementById('img-x');
const imgYInput = document.getElementById('img-y');
const reader = new FileReader();
// use reader file data to draw to img/canvas
reader.onloadend = () => {
	const { result } = reader;
	const x = imgXInput.value || 0;
	const y = imgYInput.value || 0;
	// draw to translate to canvas
	img.src = result;
	ctx.clearRect(0,0,16,16);
	ctx.drawImage(img,x,y,16,16,0,0,16,16);
	// draw at appropriate crop
	img.src = canvas.toDataURL();
	const imgData = ctx.getImageData(0,0,16,16).data;
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
	})
}
uploader.addEventListener('change', ev => {
	const file = uploader.files[0];
	// trigger read
	if (file) reader.readAsDataURL(file);
})
