/*
 *  A* solver for N Puzzle.  Fine tune, abstract strategy.
 *
 */

var MOVE = {}
MOVE.NONE = 0;
MOVE.LEFT = 1;
MOVE.RIGHT = 2;
MOVE.UP = 3;
MOVE.DOWN = 4;

var STEP_COST = 1;

var visited = [];
visited.count=0;

var frontier = [];
frontier.count=0;

var gScore = [];
var fScore = [];
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
   visited = [];
   visited.count=0;
   frontier = [];
   frontier.count=0;
   found=false;
   gScore = [];
   fScore = [];
   solution = new Array();
}

// lowest f_score node in frontier
// later priority queue, now inefficient
// VERY inefficient...
function getLowestFrontierNode() {
   var lowest;
   for(var x in frontier) {
      var n = frontier[x];
      var score = fScore[n.toString()];
      if(typeof n.action !== 'undefined' && (!lowest || fScore[n] < fScore[lowest]))
         lowest = n;
   }
   if(!lowest) alert('problem getting lowest...');
   return lowest;
}

function solveAStar(rootNode) {
   var _root = rootNode.toString();

   frontier[_root] = rootNode;
   frontier.count++;

   gScore[_root] = 0;
   fScore[_root] = gScore[_root] + h(rootNode);

   var currentNode;
   while(frontier.count > 0) {
      console.log('iteration: ' + ++stackCount);
      currentNode = getLowestFrontierNode(); 
      debugger;
      //if(currentNode.toString() == goalNode.toString()) return path(currentNode, []); 
      if(currentNode.toString() == CHEAT) return path(currentNode, []); 

      delete frontier[currentNode.toString()];
      frontier.count--;
      visited[currentNode.toString()] = currentNode;
      visited.count++;

      var children = getChildNodes(currentNode);
      for(var x in children) {
         var child = children[x], _child = child.toString();
         if(visited[child]) continue;
         var cost = gScore[currentNode.toString()] + STEP_COST;

         if(!frontier[_child] || 
               (gScore[_child] && cost < gScore[_child])) {
            child.parent = currentNode; 
            gScore[_child] = cost;
            fScore[_child] = gScore[child] + h(child);
            if(!frontier[_child]) {
               frontier[_child] = child;
               frontier.count++;
            }
         }
      } // end for
   }

   return []; // search failed
}

// because delete does not reindex
function hasNodes(arr) {
   if(arr.length < 1) return false;
   var a=false;
   for(var x; x<arr.length; x++) if(arr[x]) a=true;
   return a;
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
   console.log('setting affected to: '+state.affected);

   // swap values
   state[affected[0]][affected[1]] = 0;
   state['blank'] = [affected[0], affected[1]];

   console.log('setting what was : '+state[blankPos[0]][blankPos[1]]+' to '+state.affected);
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
