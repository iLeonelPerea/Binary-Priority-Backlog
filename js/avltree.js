// AVLTree ///////////////////////////////////////////////////////////////////
//   This file is originally from the Concentré XML project (version 0.2.1)
//   Licensed under GPL and LGPL
//
//   Modified by iLeonelPerea.

// Pass in the attribute you want to use for comparing
function AVLTree(n, attr) {
    this.init(n, attr);
}

AVLTree.prototype.init = function(n, attr) {
    this.attr = attr;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.node = n;
    this.depth = 1;
    this.elements = [n];
};

AVLTree.prototype.balance = function() {
    var ldepth = this.left  == null ? 0 : this.left.depth;
    var rdepth = this.right == null ? 0 : this.right.depth;

    if (ldepth > rdepth + 1) {
        // LR or LL rotation
        var lldepth = this.left.left  == null ? 0 : this.left.left.depth;
        var lrdepth = this.left.right == null ? 0 : this.left.right.depth;

        if (lldepth < lrdepth) {
            // LR rotation consists of a RR rotation of the left child
            this.left.rotateRR();
            // plus a LL rotation of this node, which happens anyway
        }
        this.rotateLL();
    } else if (ldepth + 1 < rdepth) {
        // RR or RL rorarion
        var rrdepth = this.right.right == null ? 0 : this.right.right.depth;
        var rldepth = this.right.left  == null ? 0 : this.right.left.depth;

        if (rldepth > rrdepth) {
            // RR rotation consists of a LL rotation of the right child
            this.right.rotateLL();
            // plus a RR rotation of this node, which happens anyway
        }
        this.rotateRR();
    }
    if(this.parent){
        this.parent.balance();
    }
};

AVLTree.prototype.rotateLL = function() {
    // the left side is too long => rotate from the left (_not_ leftwards)
    var nodeBefore = this.node;
    var elementsBefore = this.elements;
    var rightBefore = this.right;
    this.node = this.left.node;
    this.elements = this.left.elements;
    this.right = this.left;
    this.left = this.left.left;
    this.right.left = this.right.right;
    this.right.right = rightBefore;
    this.right.node = nodeBefore;
    this.right.elements = elementsBefore;
    this.right.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.rotateRR = function() {
    // the right side is too long => rotate from the right (_not_ rightwards)
    var nodeBefore = this.node;
    var elementsBefore = this.elements;
    var leftBefore = this.left;
    this.node = this.right.node;
    this.elements = this.right.elements;
    this.left = this.right;
    this.right = this.right.right;
    this.left.right = this.left.left;
    this.left.left = leftBefore;
    this.left.node = nodeBefore;
    this.left.elements = elementsBefore;
    this.left.updateInNewLocation();
    this.updateInNewLocation();
};

AVLTree.prototype.updateInNewLocation = function() {
    this.getDepth();
};

AVLTree.prototype.getDepth = function() {
    this.depth = this.node == null ? 0 : 1;
    if (this.left != null) {
        this.depth = this.left.depth + 1;
    }
    if (this.right != null && this.depth <= this.right.depth) {
        this.depth = this.right.depth + 1;
    }
    if(this.parent){
        this.parent.getDepth();
    }
};

AVLTree.prototype.addLeft = function(n)  {
    this.left = n;
    this.left.parent = this;
    this.left.getDepth();
    this.balance();
};

AVLTree.prototype.addRight = function(n)  {
    this.right = n;
    this.right.parent = this;
    this.getDepth();
    this.balance();
};

// Given the beginning of a value, return the elements if there's a match
AVLTree.prototype.findBest = function(value) {
    var substr = this.node[this.attr].substr(0, value.length).toLowerCase();
    var value = value.toLowerCase();

    if (value < substr) {
      if (this.left != null) {
        return this.left.findBest(value);
      }
      return [];
    }
    else if (value > substr) {
      if (this.right != null) {
        return this.right.findBest(value);
      }
      return [];
    }
    return this.elements;
}

AVLTree.prototype.preorderPrint = function() {
    console.log(this.node.name);

    if (this.left) {
        this.left.preorderPrint();
    }
 
    if (this.right) {
        this.right.preorderPrint();
    }
};

AVLTree.prototype.inorderPrint = function(padding) {
    if (this.left) {
        this.left.preorderPrint();
    }

    console.log(this.node.name);
 
    if (this.right) {
        this.right.preorderPrint();
    }
};
 
AVLTree.prototype.postorderPrint = function(padding) {
    if (this.left) {
        this.left.preorderPrint();
    }

    if (this.right) {
        this.right.preorderPrint();
    }

    console.log(this.node.name);
};

AVLTree.prototype.treeAdd = function() {
  var sum = 0;
  if (this.left) {
    sum+= this.left.treeAdd();
  }
  for (var i = 0, len = this.elements.length; i<len; ++i) {
    sum+=this.elements[i][this.attr];
  }
  if (this.right) {
    sum+= this.right.treeAdd();
  }
  return sum;
}

AVLTree.prototype.cachedArray = null;
AVLTree.prototype.cachedArrayIsDirty = true;
AVLTree.prototype.buildArray = function() {
  var array = [];
  if (this.left) {
    array = array.concat(this.left.toArray());
  }

  array = this.elements;

  if (this.right) {
    array = array.concat(this.right.toArray());
  }

  return array;
};

AVLTree.prototype.toArray = function() {
  if (!this.cachedArrayIsDirty) {
    return this.cachedArray;
  }
  this.cachedArray = this.buildArray();
  this.cachedArrayIsDirty = false;
  return this.cachedArray;
}

//Variables
var numNodes = 10;
var previous = 0;

// Generated a sortedish list
function rand() {
  var delta = Math.random();
  if (Math.random() > 0.8)
    delta*=-1;
  previous+=delta;
  return previous;
}

// AVLTreeCachedArray
// var i;
// var v = rand();
// var tree = new AVLTree({attr:v}, 'attr');
// for (i = 0; i < numNodes; ++i) {
//   tree.add({attr: rand()});
// }

// var tree = new AVLTree({attr:10}, 'attr');
// var nodeSandia = new AVLTree({attr:5}, 'attr');
// var nodeMelon = new AVLTree({attr:7}, 'attr');
// tree.addLeft(nodeSandia);
// nodeSandia.addRight(nodeMelon);

