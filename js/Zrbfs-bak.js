/*
 *  RBFS solver for N Puzzle.  Fine tune, abstract strategy.
 *
 */

var MOVE = {}
MOVE.NONE = 0;
MOVE.LEFT = 1;
MOVE.RIGHT = 2;
MOVE.UP = 3;
MOVE.DOWN = 4;

var STEP_COST = 1;
var INFINITY = Number.POSITIVE_INFINITY
var SUCCESS = true;
var FAILURE = false;

/* Needed?
var visited = [];
visited.count=0;

var frontier = [];
frontier.count=0;
*/

//var gScore = [];
//var fScore = [];
var found = false;
var actions = [MOVE.DOWN, MOVE.LEFT, MOVE.RIGHT, MOVE.UP];

var solution = new Array();

   // No idea if this is correct
function path(cur) {
   if(cur.parent) {
      path(cur.parent);
      solution.push(cur);
   } solution.push(cur);
}

function resetValues() {
//   visited = [];
//   visited.count=0;
//   frontier = [];
//   frontier.count=0;
   found=false;
//   gScore = [];
//   fScore = [];
   solution = new Array();
}

function solveRBFS(rootNode) {
   var solution = RBFS(rootNode, INFINITY, 0);
   if(solution[0]) return path(solution[1]);
}

// Consider that successors may be a global array.
// Recursion limit?  This isn't looking good for chrome
function RBFS(currentNode, f_limit, gCost) {
   console.log(++stackCount);
   if(currentNode.toString() == CHEAT) return [SUCCESS, currentNode];
   var children = getChildNodes(currentNode);
   if(children.length <= 0) return [FAILURE, INFINITY];
   for(var x in children) {
      var child = children[x];
      child.parent = currentNode;
      // Should I re-use the external list?
      child.g = gCost +1;
      // Update f with value from previou search if any.  How?  External list?
      child.f = Math.max(child.g+h(child), gCost); // what?  How could g be less than node.f (gCost) ?
   }
   var lowest, alternative;
   do {
      lowest = getLowestForRBFS(children);
      alternative = getAltForRBFS(children, lowest);
      if(lowest.f > f_limit) return [FAILURE, lowest.f];
      var result = RBFS(lowest, Math.min(f_limit, alternative.f), gCost+1); // now should equal the cost I intended (g for th next node)
      // TODO var result = RBFS(lowest, Math.min(f_limit, alternative.f), lowest.f); // this value changes, no longer valid. 
      // due to the code below, the recursive call above passes in lowest.f when it wants the depth+1, or that node's
      // original f.  Since it changes, we're determing which child to open by comparing with itself, if it has been
      // previously opened.  We absolutely must use recursive depth above.
      lowest.f = result[1];
      if(result[0]) return result;
   } while(!found);
}

// verify this is needed, possibly modify A*
function getLowestForRBFS(successors) {
   var lowest;
   for(var x in successors) {
      var n = successors[x];
      if(typeof n.action !== 'undefined' && (!lowest || n.f < lowest.f)) 
         lowest = n;
   }
   if(!lowest) alert('problem getting lowest...');
   return lowest;
}

function getAltForRBFS(successors, bestSoFar) {
   var lowest;
   for(var x in successors) {
      var n = successors[x];
      if(n !== bestSoFar &&
            (typeof n.action !== 'undefined' && (!lowest || n.f < lowest.f)) )
         lowest = n;
   }
   return lowest || bestSoFar;
}


// Will not return state, etc.  To be appended later
function node(action, state) {
   var n = {};
   if(action != undefined && action !== null) {
      n.action = action;
      switch(action) {
         case MOVE.LEFT:
            n.back = MOVE.RIGHT;
            break;
         case MOVE.RIGHT:
            n.back = MOVE.LEFT;
            break;
         case MOVE.UP:
            n.back = MOVE.DOWN;
            break;
         case MOVE.DOWN:
            n.back = MOVE.UP;
            break;
         default:
            n.back = MOVE.NONE;
      }
   }
   if(typeof state !== undefined && state !== null) {
      if(typeof state == 'string') {
         var vals = state.split('-'); 
         if(vals.length == SIZE*SIZE) {
            var m = new Array(SIZE), _ct = 0;
            for(var i=0; i<SIZE; i++) {
               m[i] = [];
               for(var j=0; j<SIZE; j++) {
                  if(vals[ct] == 0) m['blank'] = [i,j];
                  m[i][j] = vals[ct];
                  ct++
               }
            }
         }
      } else if(state[0].length == SIZE) { // should be a matrix
         n.state = state;
      }
   }
   n.toString = function() {
      var s = '';
      for(var i=0; i<this.state.length; i++) 
         for(var j=0; j<this.state[i].length; j++)
            s += s.length > 0 ? '-'+this.state[i][j] : this.state[i][j];
      return s;
   }
   return n;
}

// assume legal move
// could speed this up if provided a deep copy
function getBoardState(current, action) {
   var state = new Array(SIZE);

   // copy state
   for(var i=0; i<SIZE; i++) {
      state[i] = [];
      for(var j=0; j<SIZE; j++) 
         state[i][j] = current.state[i][j];
   }

   var affected;
   var blankPos = current.state['blank'];
   if(action == MOVE.LEFT) affected = [blankPos[0], blankPos[1]-1];
   else if(action == MOVE.RIGHT) affected = [blankPos[0], blankPos[1]+1];
   else if(action == MOVE.UP) affected = [blankPos[0]-1, blankPos[1]];
   else if(action == MOVE.DOWN) affected = [blankPos[0]+1, blankPos[1]];
   else alert('INVALID ACTION ENCOUNTERED');

   state.affected = state[affected[0]][affected[1]];
   //console.log('setting affected to: '+state.affected);

   // swap values
   state[affected[0]][affected[1]] = 0;
   state['blank'] = [affected[0], affected[1]];

   //console.log('setting what was : '+state[blankPos[0]][blankPos[1]]+' to '+state.affected);
   state[blankPos[0]][blankPos[1]] = state.affected;
   return state;
}

function getChildNodes(nodeObj) {
   children = [];
   var _blank = nodeObj.state['blank'];
   for(var x in actions) 
      if(actions[x] !== nodeObj.back) {
         var action = actions[x];
         if((action == MOVE.LEFT && _blank[1] > 0)||
               (action == MOVE.RIGHT && _blank[1] < SIZE-1) ||
               (action == MOVE.UP && _blank[0] > 0) ||
               (action == MOVE.DOWN && _blank[0] < SIZE-1)) 
            children.push(node(action, getBoardState(nodeObj, action)));
      }
   return children;
}

// estimated proximity to goal.  0 is end state.
function h(candidate) {
   var cost = 0;
   for(var i=0; i<SIZE; i++) 
      for(j=0; j<SIZE; j++) {
         pieceVal = candidate.state[i][j];
         cost += Math.abs(goalPositions[pieceVal][0]-i);
         cost += Math.abs(goalPositions[pieceVal][1]-j);
      }
   return cost;
}
