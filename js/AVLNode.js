/**
 * @author   redcrow
 * @link     http://na5cent.blogspot.com/2013/06/avl-tree-javascript.html
 * @create   25/06/2013
 */
var AVLNode = function(item) {
    var item_ = item || null;
    var left_ = null;
    var right_ = null;
    var height_ = 0;
 
    this.getItem = function() {
        return item_;
    };
 
    this.getLeft = function() {
        return left_;
    };
 
    this.setLeft = function(node) {
        left_ = node;
    };
 
    this.getRight = function() {
        return right_;
    };
 
    this.setRight = function(node) {
        right_ = node;
    };
 
    this.getHeight = function() {
        return height_;
    };
 
    this.size = function(node) {
        if (node === null) {
            return 0;
        } else {
            return size(node.getLeft()) + size(node.getRight()) + 1;
        }
    };
 
    this.preorderPrint = function(padding) {
        padding = padding || '';
        padding = '--' + padding;
 
        console.log(padding + item_);
 
        if (left_ !== null) {
            left_.preorderPrint(padding);
        }
 
        if (right_ !== null) {
            right_.preorderPrint(padding);
        }
    };
 
    this.inorderPrint = function(padding) {
        padding = padding || '';
        padding = '--' + padding;
 
        if (left_ !== null) {
            left_.inorderPrint(padding);
        }
 
        console.log(padding + item_);
 
        if (right_ !== null) {
            right_.inorderPrint(padding);
        }
    };
 
    this.postorderPrint = function(padding) {
        padding = padding || '';
        padding = '--' + padding;
 
        if (left_ !== null) {
            left_.postorderPrint(padding);
        }
 
        if (right_ !== null) {
            right_.postorderPrint(padding);
        }
 
        console.log(padding + item_);
    };
};