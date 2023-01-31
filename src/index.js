import { $, createTableBody } from './create.js';
import { activateSpace } from './control.js';

// lay out the board
$('#board').appendChild(createTableBody());
// place the starting position
activateSpace(null, true);
