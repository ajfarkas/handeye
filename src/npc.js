import { $, boardXY } from './create.js';
import { position as playerPos } from './control.js';

const DOG_COLORS = [ 'brown', 'white', 'pink' ];

export const NPCs = [];

export const setRandomPos = () => {
	const pos = {
		x: Math.floor(Math.random() * boardXY.width),
		y: Math.floor(Math.random() * boardXY.height)
	}
	if (pos.x === playerPos.x && pos.y === playerPos.y) {
		return setRandomPos();
	}
	return pos;
};

export class NPC {
	#x;
	#y;
	#color;
	constructor(pos, customColor) {
		if (typeof pos !== 'object') {
			pos = setRandomPos();
		}
		const color = DOG_COLORS[
			Math.floor(Math.random() * (DOG_COLORS.length))
		];
		this.#color = customColor || color;
		this.position = pos;

		NPCs.push(this);
	}

	activateSpace({x, y}) {
		console.log('activating space', x, y);
		const space = $(`[data-pos="${x},${y}"]`);
		if (space.classList.contains('active')) {
			throw new Error(
				'Player is occupying that space'
			);
		}
		space.classList.add('npc', `${this.#color}-dog`);
		return true;
	}

	set position({x, y}) {
		try {
			this.activateSpace({x, y});
		} catch (err) {
			console.warn(err);
			return {x: this.#x, y: this.#y};
		}
		this.#x = x;
		this.#y = y;

		return { x: this.#x, y: this.#y };
	}

	get position() {
		return { x: this.#x, y: this.#y };
	}
}

export default NPC;
