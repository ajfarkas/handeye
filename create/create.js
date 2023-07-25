// Canvas script
const html = document.querySelector('html');
const canvas = document.getElementById('recording');
const img = document.getElementById('image');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const imageCells = [];
let width = 16;
let height = 16;
let color = '#000';
let dropperActive = false;
// artboard resizing
const boardW = document.getElementById('board-w');
const boardH = document.getElementById('board-h');
const resizeBtn = document.getElementById('board-btn');
// set default artboard from localstorage
if (localStorage.board) {
	const board = JSON.parse(localStorage.board);
	width = parseInt(board.width);
	height = parseInt(board.height);
}
boardW.value = width;
boardH.value = height;

const draw = ev => {
	const { target } = ev;
	if (dropperActive || target.tagName !== 'TD') return;
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
	imageCells.splice(0);
	img.src = '';
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
	// update img
	img.width = 8 * width;
	img.height = 8 * height;
};
createTable(width,height);
// click/drag and draw
tbody.addEventListener('mousedown', ev => {
	draw(ev);
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
html.addEventListener('mouseleave', removeMouseEnter);

// Choose color
const picker = document.getElementById('color-picker');
const colorText = document.getElementById('color-text');
const colorChip = document.getElementById('color-chip');
const alphaBtn = document.querySelector('.alpha-btn');
const dropper = document.getElementById('dropper');

const convertColorValue = colorVal => {
	if (colorVal.match('rgb')) {
		const nums = colorVal
			.replace(/rgba?\((([0-9\.]+,?\s?){3,4})\)/, '$1')
			.split(/,\s?/g);
		if (nums[3] === 0) colorVal = '';
		else {
			const hex = nums.map(n => parseInt(n).toString(16).padStart(2, '0'));
			colorVal = `#${hex.slice(0,3).join('')}`;
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

	hexColor = convertColorValue(value);
	color = value.match('rgba') ? value : hexColor;
	picker.value = hexColor || '#ffffff';
	colorText.value = color;
	cancelDropper();
	if (picker.value !== hexColor && picker.value !== '#ffffff') {
		alert('that\'s not a valid color');
	}
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
const resize = document.getElementById('resize');
const reuploader = document.getElementById('re-upload');
const imgXInput = document.getElementById('img-x');
const imgYInput = document.getElementById('img-y');
const reader = new FileReader();

const resizeValues = tempImg => {
	const { width: imgW, height: imgH } = tempImg;

	return {
		askRatio: width / height,
		imgW,
		imgH,
		imgRatio: imgW / imgH,
		widthRatio: width / imgW,
		heightRatio: height / imgH
	};
};
// use reader file data to draw to img/canvas
reader.onloadend = () => {
	const { result } = reader;
	const x = parseInt(imgXInput.value) || 0;
	const y = parseInt(imgYInput.value) || 0;
	// draw to translate to canvas
	const tempImg = new Image();
	tempImg.onload = () => {
		tempImg.onload = null;
		let sWidth = width;
		let sHeight = height;
		let dx = 0;
		let dy = 0;

		switch (resize.value) {
			case 'none':
				break;
			case 'fill': {
				const {askRatio, imgW, imgH, imgRatio, widthRatio, heightRatio} =
					resizeValues(tempImg);

				if (widthRatio === heightRatio) {
					sWidth = imgW;
					sHeight = imgH;
				} else if (widthRatio < heightRatio) {
					sWidth = imgH * askRatio;
					sHeight = imgH;
				} else if (widthRatio > heightRatio) {
					sWidth = imgW;
					sHeight = imgW / askRatio;
				}
				break;
			}
			case 'contain': {
				const {askRatio, imgW, imgH, imgRatio, widthRatio, heightRatio} =
					resizeValues(tempImg);

				if (widthRatio === heightRatio) {
					sWidth = imgW;
					sHeight = imgH;
				} else if (widthRatio < heightRatio) {
					sWidth = imgW;
					sHeight = imgH * imgRatio;
					const heightRatio = imgH / sHeight;
					const emptyPixels = height - (height * heightRatio);
					dy = emptyPixels / 2;
				} else if (widthRatio > heightRatio) {
					sWidth = imgW / imgRatio;
					sHeight = imgH;
					const widthRatio = imgW / sWidth;
					const emptyPixels = width - (width * widthRatio);
					dx = emptyPixels / 2;
				}
				break;
			}
		}
		ctx.drawImage(tempImg,x,y,sWidth,sHeight,dx,dy,width,height);
		// draw at appropriate crop
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
		img.src = canvas.toDataURL();
	}
	tempImg.src = result;
};
const useUploadedFile = ev => {
	const file = uploader.files[0];
	// trigger read
	if (file) {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		reader.readAsDataURL(file);
	}
};
uploader.addEventListener('change', useUploadedFile);
reuploader.addEventListener('click', useUploadedFile);

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
resizeBtn.addEventListener('click', () => {
	const w = parseInt(boardW.value);
	const h = parseInt(boardH.value);
	width = w;
	height = h;
	localStorage.board = JSON.stringify({ width: w, height: h });

	createTable(w, h);
});

