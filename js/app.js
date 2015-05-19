// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation({

});

/*
See https://trello.com/docs for a list of available API URLs
The API development board is at https://trello.com/api
*/

var arrayCards = [];
var tree = null;
var currentNode = null;
var nextNode = null;
var HaveOrdenedList = null;
var board_ID = null;
var list_ID = null;
var list_NAME = null;

var $j = jQuery.noConflict();

$j(document).ready(function(){

	$j('.loggedIn').hide();
	var getBoards = function (){
		updateLoggedIn();
		$j("#loadingBoards").text("Loading Boards...");
		Trello.members.get("me", function(member){
		    $j("#userName").text("Welcome "+member.fullName);
		    displayBoards();
		});
		$j('.off-canvas-wrap').foundation('offcanvas', 'show', 'move-right');
	}

	var displayBoards = function(){
		// Output a list of all of the boards that the member

	    Trello.get("members/me/boards", {filter: "open"}, function(boards) {
				$j("#displayBoards").html('<li><label id="loadingBoards">Select a Board</label></li>');
					//var output = '<li><label id="loadingBoards">Select a Board</label></li>';
	        $j.each(boards, function(ix, board) {
						var output = '<li class="has-submenu"><a data-board-id="'+board.id+'" href="#">'+board.name+'</a><ul class="left-submenu"><li class="back"><a href="#">Back</a></li>';
						Trello.boards.get(board.id, {lists: "open", cards: "visible"}, function(board){
							output += '<li><label id="loadingBoards">Select a List</label></li>';
							$j.each(board.lists, function (i){
								output += '<li><a class="selectedList" data-board-id="'+board.id+'" data-list-id="'+this.id+'" data-list-name="'+this.name+'" href="#">'+this.name+'</a></li>';
							});
							output += '</ul>';
							$j("#displayBoards").append(output);
						});
	        });
	    });
	}

	$j(document.body).on('click', '.selectedList', function(e){
		list_ID = $j(this).data('list-id');
		list_NAME = $j(this).data('list-name');
		board_ID = $j(this).data('board-id');
		Trello.lists.get(list_ID, {cards: "open"}, function(list){
			var output = "<h1>"+list.name+"</h1>";
			output += "<h3>Select the Higher Task</h3>";
			arrayCards = [];
			$j.each(list.cards, function (i){
				arrayCards.push(this);
			});
			Trello.post("lists", { name: list_NAME+" Ordened", idBoard: board_ID }, function(list_){
				list_ID = list_.id;
				$j('#output').html(output);
				startPriorization();
			});
		});
	});

	var startPriorization = function(){
		if(arrayCards.length >= 2){
			tree = new AVLTree(arrayCards[0], 'attr');
			arrayCards.shift();
			currentNode = tree;
			nextNode = new AVLTree(arrayCards[0], 'attr');
			arrayCards.shift();
			var output = '<h6>Activity to priorize: '+nextNode.node.name+'</h6>';
			output += '<div class="small-6 medium-6 large-6 columns left-click"><div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div></div>';
			output += '<div class="small-6 medium-6 large-6 columns right-click"><div class="panel callout radius" data-equalizer-watch><p>'+nextNode.node.name+'</p></div></div>';
			$j('#cardsView').html(output);
		}
	}

	var updateLoggedIn = function() {
	    var isLoggedIn = Trello.authorized();
	    if (isLoggedIn){
	    	$j(".loggedIn").show();
	    	$j(".loggedOut").hide();
	    } else {
	    	console.log('not logged in');
	    	$j(".loggedIn").hide();
	    	$j(".loggedOut").show();
	    }
	};

	var getDateStamp = function(){
		var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		return year+'-'+month+'-'+day;
	};

	var logout = function() {
	    Trello.deauthorize();
	    updateLoggedIn();
	};

	Trello.authorize({
	    interactive:false,
	    success: getBoards
	});

	$j("#connectLink")
	.click(function(){
	    Trello.authorize({
	        type: "popup",
	        success: getBoards,
	        expiration:"never",
	        scope:{write:true,read:true},
	        name: 'AVL-Priorization'
	    })
	});

	$j("#showLink").on('click', function(){
		console.log('show link clicked');
		Trello.authorize({
		    interactive:false,
		    success: getBoards
		});
	});

	$j(document.body).on('click', '.left-click', function(e){
		var output = null;
		if (currentNode.left != null){
			$j(".left-click").hide("slow",function(){
				currentNode = currentNode.left;
				output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
				$j('.left-click').html(output);
				$j(".left-click").show("slow");
			});
		}else{
			currentNode.addRight(nextNode);
			currentNode = tree;
			nextNode = null;
			if(arrayCards.length > 0){
				nextNode = new AVLTree(arrayCards[0], 'attr');
				arrayCards.shift();
				$j(".left-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
					$j('.left-click').html(output);
					$j(".left-click").show("slow");
				});
				$j(".right-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+nextNode.node.name+'</p></div>';
					$j('.right-click').html(output);
					$j(".right-click").show("slow");
				});
			}
		}
		if(nextNode == null){
			arrayCards = tree.buildArray();
			output = '<h6>Activity to priorize: Priorization Finished!</h6>';
			$j('#cardsView').html(output);
			postCards();
		}
	});

	$j(document.body).on('click', '.right-click', function(e){
		var output = null;
		if (currentNode.right != null){
			$j(".right-click").hide("slow",function(){
				currentNode = currentNode.right;
				output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
				$j('.right-click').html(output);
				$j(".right-click").show("slow");
			});
		}else{
			currentNode.addLeft(nextNode);
			currentNode = tree;
			nextNode = null;
			if(arrayCards.length > 0){
				nextNode = new AVLTree(arrayCards[0], 'attr');
				arrayCards.shift();
				$j(".left-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
					$j('.left-click').html(output);
					$j(".left-click").show("slow");
				});
				$j(".right-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+nextNode.node.name+'</p></div>';
					$j('.right-click').html(output);
					$j(".right-click").show("slow");
				});
			}
		}
		if(nextNode == null){
			arrayCards = tree.buildArray();
			output = '<h6>Activity to priorize: Priorization Finished!</h6>';
			$j('#cardsView').html(output);
			postCards();
		}
	});

	var postCards = function() {
		if(list_ID && arrayCards.length > 0){
			(arrayCards[0])[0].idList = list_ID;
			(arrayCards[0])[0].pos = null;
			Trello.post("cards/",(arrayCards[0])[0], function(){
				arrayCards.shift();
				postCards();
			});
		}
	};

	$j("#disconnect").click(logout);
});
