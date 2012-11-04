var SIZE = 3;
var stackCount = 0;
var startState = [7,2,4,5,0,6,8,3,1];
var goalState;
var goalPositions = new Array(SIZE);
//var CHEAT = '0-1-2-3-4-5-6-7-8';
var CHEAT = '1-2-3-4-5-6-7-8-0';
var gameBoard;
var statusBar;
var pieces = new Array(SIZE);
var SLOT_SIZE=48;
var board = new Array(SIZE);
var sliding = false;

// Could make this a node, CHEAT is string.
// allow user to choose end-state
function establishGoal() {
   /*
      goalState = [
      [0,1,2],
      [3,4,5],
      [6,7,8]];
      */
    goalState = [
      [1,2,3],
      [4,5,6],
      [7,8,0]];
   for(var i=0; i<SIZE; i++) {
      for(var j=0; j<SIZE; j++)
         goalPositions[goalState[i][j]] = [i,j];
   }
}

function getNodeFromBoard() {
   var state = new Array(SIZE);
   for(var i=0; i<SIZE; i++) {
      state[i] = [];
      for(var j=0; j<SIZE; j++) {
         state[i][j] = parseInt(board[i][j].attr('id').split('-')[1]);
         if(state[i][j] === 0) state['blank'] = [i,j];
      }
   }
   return node(MOVE.NONE, state);
}

/* 
 * algorithm will be swapped here, use parens pattern in js solver.js 
 * also consider something like bootstrap or require or what have you
 */
function solvePuzzle(algo) {
  var rootNode = getNodeFromBoard();
  var algorithm;
  var statusBar;
  var codeDiv;
  switch(algo) {
     case 'RBFS':
        algorithm = solveRBFS;
        statusBar = jQuery('#RBFS-status');
        codeDiv = jQuery('#hidden-algo-2');
        break;
     case 'A*':
        algorithm = solveAStar;
        statusBar = jQuery('#A-status');
        codeDiv = jQuery('#hidden-algo-1');
        break;
  }

  editor.setValue(codeDiv.text());
  editor.clearSelection();
  editor.navigateTo(0,0);

  statusBar.removeClass('ready');
  statusBar.addClass('working');

  resetValues(); // make value resets self contained
  setTimeout(function() {
    algorithm(rootNode);
    statusBar.removeClass('working');
    statusBar.addClass('solved');
    illustrate();
        }, 1000);
}

// Solution globally set for now
function illustrate() {
   for(var x=0; x<solution.length-1; x++) {
      var theFun = function(bb){
         var base = bb;
         var next = bb+1;
         return function() {
            var blank = solution[next].state['blank'];
            var id = solution[base].state[blank[0]][blank[1]];
            pieces[id].click();
         }
      }
      var funny = theFun(x);
      setTimeout(funny, x*310);
   }
}

function setupBoard(config) {
   var n=0;
   for(var i=0; i<SIZE; i++)  {
      board[i] = [];
      for(var j=0; j<SIZE; j++) {
         var img = config[n] == 0 ? '_.gif' : ''+config[n]+'.jpg';
         var el = jQuery('<img src="img/'+img+'"/>');
         el.offset({top: i*SLOT_SIZE, left: j*SLOT_SIZE});
         el.attr('id', 'piece-'+config[n]);
         el.addClass('game-piece');
         el.click(function() {
             if(sliding) return;
             var me = jQuery(this);
             var myLoc = getBoardPos(me);
             var blankLoc = getBoardPos(pieces[0]);
             if(!isLegal(myLoc, blankLoc)) return;
             var myPos = me.position();
             var blankPos = pieces[0].position();
             pieces[0].css('top', myPos.top);
             pieces[0].css('left', myPos.left);
             sliding = true;
             board[blankLoc[0]][blankLoc[1]] = me;
             board[myLoc[0]][myLoc[1]] = pieces[0];
             me.animate({top: blankPos.top, left:blankPos.left}, 300, function() {sliding=false;});
            });
         pieces[config[n]] = el;
         board[i][j] = el;
         el.appendTo(gameBoard);
         n++;
      }
   }
}

function getBoardPos(piece) {
   for(var i=0; i<SIZE; i++) 
      for(var j=0; j<SIZE; j++)
         if(board[i][j] == piece ||
               board[i][j][0].id == piece[0].id) return [i, j];
}

function isLegal(thisLoc, _blank) {
   var blankLoc = _blank || getBoardPos(pieces[0]);
   return (Math.abs(blankLoc[0]-thisLoc[0]) == 1 && blankLoc[1]==thisLoc[1]) ||
      (blankLoc[0] == thisLoc[0] && Math.abs(blankLoc[1]-thisLoc[1]) == 1);
}
