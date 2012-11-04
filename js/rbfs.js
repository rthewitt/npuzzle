/*
 * Recursive Best First Search
 * with Manhattan Distance heuristic
 * 
 *  -Ryan Hewitt
 */

function solveRBFS(rootNode) {
   var solution = RBFS(rootNode, INFINITY, 0);
   if(solution[0]) return path(solution[1]);
}

// Consider that successors may be a global array.
// Recursion limit?  This isn't looking good for chrome
function RBFS(currentNode, f_limit, gCost) {
   console.log(++stackCount);
   if(currentNode.toString() == CHEAT) {
      found = true; // may be used externally
      return [SUCCESS, currentNode];
   }
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
