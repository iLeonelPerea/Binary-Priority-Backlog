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
				var output = '<div data-alert class="alert-box success radius">Successul logged.<a href="#" class="close">&times;</a></div>';
				$j('#alerts').html(output);
				$j(document).foundation('alert', 'reflow');
				setTimeout(function () {
					$j(".alert-box a.close").trigger("click.fndtn.alert");
				}, 4000);
		    $j("#userName").text("Welcome "+member.fullName);
		    displayBoards();
		});
		$j('.off-canvas-wrap').foundation('offcanvas', 'show', 'move-right');
		$j(document).foundation('offcanvas', 'reflow');
	}

	var displayBoards = function(){
		// Output a list of all of the boards that the member
	    Trello.get("members/me/boards", {filter: "open"}, function(boards) {
				$j("#displayBoards").html('<li><label id="loadingBoards">Select a Board</label></li>');
	        $j.each(boards, function(ix, board) {
						var output = '<li class="has-submenu"><a class="selectedBoard" data-board-id="'+board.id+'">'+board.name+'</a><ul class="left-submenu"><li id="testtest" class="back"><a href="#">Back</a></li>';
						Trello.boards.get(board.id, {lists: "open", cards: "visible"}, function(board){
							output += '<li><label id="loadingBoards">Select a List</label></li>';
							$j.each(board.lists, function (i){
								output += '<li><a class="selectedList" data-reveal-id="myModal" data-board-id="'+board.id+'" data-list-id="'+this.id+'" data-list-name="'+this.name+'" href="#">'+this.name+'</a></li>';
							});
							output += '</ul>';
							$j("#displayBoards").append(output);
						});
	        });
	    });
	}

	$j(document.body).on('click', '.selectedBoard', function(e){
		$j("aside").animate({ scrollTop: 0 });
	});

	$j(document.body).on('click', '#startPriorization', function(e){
		var $postAttribute = $j('input:text[name="postAttribute"]').val();
		var $postQuestion = $j('input:text[name="postQuestion"]').val();
		if ($postAttribute == "") {
			$j("#errorAttribute").show("slow");
		}else{
			$j("#errorAttribute").hide("slow");
		}
		if ($postQuestion == "") {
			$j("#errorQuestion").show("slow");
		}else{
			$j("#errorQuestion").hide("slow");
		}
		if($postAttribute != "" && postQuestion != ""){
			list_ID = $j(this).data('list-id');
			list_NAME = $j(this).data('list-name');
			board_ID = $j(this).data('board-id');
			Trello.lists.get(list_ID, {cards: "open"}, function(list){
				var output = "<h3>List selelected: "+list.name+"</h3>";
				output += "<h4>"+$postQuestion+"</h4>";
				$j('#message').html(output);
				arrayCards = [];
				$j.each(list.cards, function (i){
					arrayCards.push(this);
				});
				Trello.post("lists", { name: list_NAME+" Ordened by: "+$postAttribute, idBoard: board_ID }, function(list_){
					list_ID = list_.id;
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
					$j('#modalConfiguration').foundation('reveal', 'close');
				});
			});
		}
	});

	$j(document.body).on('click', '.selectedList', function(e){
		$j('.off-canvas-wrap').foundation('offcanvas', 'hide', 'move-right');
		list_ID = $j(this).data('list-id');
		list_NAME = $j(this).data('list-name');
		board_ID = $j(this).data('board-id');
		var output = '<h2 id="modalConfiguration">Awesome. Prepare for proritization.</h2><br />';
		output += '<form id="configuration">';
		output += '<div class="row">';
		output += '<div class="large-6 columns">';
		output += '<div class="row collapse prefix-radius">';
		output += '<div class="small-3 columns">';
		output += '<span class="prefix">Prioritized By</span>';
		output += '</div>';
		output += '<div class="small-9 columns">';
		output += '<input type="text" name="postAttribute" placeholder="Attribute..." style="margin:0" pattern="[A-Za-z]" required>';
		output += '<small id="errorAttribute" class="error">Invalid Attribute</small>';
		output += '</div>';
		output += '</div>';
		output += '</div>';
		output += '<div class="large-6 columns">';
		output += '<div class="row collapse postfix-raius">';
		output += '<div class="small-8 columns">';
		output += '<input type="text" name="postQuestion" placeholder="Question..." style="margin:0" required>';
		output += '<small id="errorQuestion" class="error">Invalid Question</small>';
		output += '</div>';
		output += '<div class="small-4 columns">';
		output += '<span class="postfix">Question to Ask?</span>';
		output += '</div>';
		output += '</div><br /><br />';
		output += '</div>';
		output += '<div class="small-9 medium-6 large-4 small-centered medium-centered large-centered columns"><a id="startPriorization" href="#" data-board-id="'+board_ID+'" data-list-id="'+list_ID+'" data-list-name="'+list_NAME+'" class="button success large round">Start Priorization</a></div>';
		output += '</div>';
		output += '</form>';
		output += '<a class="close-reveal-modal" aria-label="Close">&#215;</a>';
		$j('#myModal').html(output);
		$j("#errorAttribute").hide();
		$j("#errorQuestion").hide();
	});



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
			var output = '<div data-alert class="alert-box success radius">Cards Prioritized.<a href="#" class="close">&times;</a></div>';
			$j('#alerts').html(output);
			$j(document).foundation('alert', 'reflow');
			setTimeout(function () {
				$j(".alert-box a.close").trigger("click.fndtn.alert");
			}, 4000);
		}
	});

	$j(document.body).on('click', '.right-click', function(e){
		var output = null;
		if (currentNode.right != null){
			$j(".left-click").hide("slow",function(){
				currentNode = currentNode.right;
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
			var output = '<div data-alert class="alert-box success radius">Cards Prioritized.<a href="#" class="close">&times;</a></div>';
			$j('#alerts').html(output);
			$j(document).foundation('alert', 'reflow');
			setTimeout(function () {
				$j(".alert-box a.close").trigger("click.fndtn.alert");
			}, 4000);
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
		}else{
			displayBoards();
			output += '<small class="error">Invalid entry</small>';
		}
	};

	$j("#disconnect").click(logout);
});
