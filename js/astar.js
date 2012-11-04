/*
 * A* search algorithm
 * using Manhattan Distance heuristic
 * 
 * -Ryan Hewitt
 */

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
