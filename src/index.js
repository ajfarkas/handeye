import { $, createTableBody } from './create.js';
import { activateSpace } from './control.js';
import { NPC } from './npc.js'

// lay out the board
$('#board').appendChild(createTableBody());
// place the starting position
activateSpace();
new NPC();
