/**
 * @author   redcrow
 * @link     http://na5cent.blogspot.com/2013/06/avl-tree-javascript.html
 * @create   25/06/2013
 */
var tree = new AVLTree();
var data = [8, 12, 14, 18, 20, 21, 23, 33, 48, 50, 52, 60, 80, 100, 23, 50, 59, 50, 40, 30, 20, -2, 40, 30];
 
for (var i = 0; i < data.length; i++) {
    tree.insertNode(data[i]);
}
//tree.printAVLTree();
//console.log('root => ' + tree.getRoot().getItem());
var parent = document.getElementsByTagName('body')[0];
 
walkTree(tree.getRoot(), parent, 255);
//console.log('tree height => '+ tree.height(tree.getRoot()));
 
 
function walkTree(node, parent, color) {
    var element = document.createElement('div');
    element.setAttribute('style', 'background-color : rgb(' + color + ',' + color + ',' + color + ')');
    element.setAttribute('class', 'tree-node');
 
    var item = document.createElement('center');
    color = color - 10;
 
    if (node !== null) {
        item.innerHTML = node.getItem();
        element.appendChild(item);
        parent.appendChild(element);
 
        walkTree(node.getLeft(), element, color);
        walkTree(node.getRight(), element, color);
    } else {
        item.innerHTML = 'null';
        element.appendChild(item);
        parent.appendChild(element);
    }
}