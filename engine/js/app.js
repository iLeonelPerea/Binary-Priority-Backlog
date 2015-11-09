Foundation.utils.S(document).foundation({
   joyride: {
      cookieMonster: true,
      cookieName: 'JoyRide',
      cookieDomain: true,
      cookie_expires: 5
   },
	 offcanvas : {
    open_method: 'move',
    close_on_click : true
  }
 }).ready(function(){
	
	var arrayCards = [];
 	var tree = null;
 	var currentNode = null;
 	var nextNode = null;
 	var HaveOrdenedList = null;
 	var board_ID = null;
 	var list_ID = null;
 	var list_NAME = null;
	
	var boardsObject = [];
	
	Foundation.utils.S(document).foundation('joyride', 'reflow');
	
	Foundation.utils.S('.loggedIn').hide();
	var getBoards = function (){
		updateLoggedIn();
		Foundation.utils.S("#off-canvas-menu-title").text("Loading Boards...");
		Foundation.utils.S('.off-canvas-wrap').foundation('offcanvas', 'show', 'move-right');
		Trello.members.get("me", function(member){
				var output = '<div data-alert class="alert-box success radius">Successul logged.<a href="#" class="close">&times;</a></div>';
				Foundation.utils.S('#alerts').html(output);
				Foundation.utils.S(document).foundation('alert', 'reflow');
				setTimeout(function () {
					Foundation.utils.S(".alert-box a.close").trigger("click.fndtn.alert");
				}, 4000);
		    Foundation.utils.S("#userName").text("Welcome "+member.fullName);
		    displayBoards();
		});
	}

	var displayBoards = function(){
		// Output a list of all of the boards that the member
		Trello.get("members/me/boards", {filter: "open"}, function(arrBoards) {
			$.each(arrBoards, function(board_index, board) {
				Trello.boards.get(board.id, {lists: "open", cards: "visible"}, function(board_object){
					boardsObject.push(board_object);
					if(arrBoards.length == boardsObject.length){
						var output = '<li><label id="off-canvas-menu-title">Select a Board</label></li>';
						$.each(boardsObject, function(board_index, boardObject){
							output += '<li class="has-submenu"><a class="selectedBoard" data-board-id="'+boardObject.id+'" href="#">'+boardObject.name+'</a>'
												+'<ul class="left-submenu">'
													+'<li id="testtest" class="back"><a href="#">Back</a></li>'
													+'<li><label id="off-canvas-menu-title">Select a List</label></li>';
							$.each(boardObject.lists, function (list_index, listObject){
								output += '<li><a class="selectedList" data-reveal-id="myModal" data-board-id="'+boardObject.id+'" data-list-id="'+listObject.id+'" data-list-name="'+listObject.name+'" href="#">'+listObject.name+'</a></li>';
							});
							output += '</ul>'
											+'</li>';
						});
						Foundation.utils.S("#displayBoards").html(output);
						Foundation.utils.S(document).foundation('offcanvas', 'reflow');
					}
				});
			});
		});
	}

	Foundation.utils.S(document.body).on('click', '.selectedBoard', function(e){
		Foundation.utils.S(".main-section").animate({ scrollTop: 0 });
		Foundation.utils.S(".left-off-canvas-menu").animate({ scrollTop: 0 });
	});

	Foundation.utils.S(document.body).on('click', '#startPriorization', function(e){
		var $postAttribute = Foundation.utils.S('input:text[name="postAttribute"]').val();
		var $postQuestion = Foundation.utils.S('input:text[name="postQuestion"]').val();
		if ($postAttribute == "") {
			Foundation.utils.S("#errorAttribute").show("slow");
		}else{
			Foundation.utils.S("#errorAttribute").hide("slow");
		}
		if ($postQuestion == "") {
			Foundation.utils.S("#errorQuestion").show("slow");
		}else{
			Foundation.utils.S("#errorQuestion").hide("slow");
		}
		if($postAttribute != "" && $postQuestion != ""){
			list_ID = Foundation.utils.S(this).data('list-id');
			list_NAME = Foundation.utils.S(this).data('list-name');
			board_ID = Foundation.utils.S(this).data('board-id');
			Trello.lists.get(list_ID, {cards: "open"}, function(list){
				var output = "<h3>List selelected: "+list.name+"</h3>";
				output += "<h4>"+$postQuestion+"</h4>";
				Foundation.utils.S('#message').html(output);
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
						Foundation.utils.S('#cardsView').html(output);
					}
					Foundation.utils.S('#modalConfiguration').foundation('reveal', 'close');
				});
			});
		}
	});

	Foundation.utils.S(document.body).on('click', '.selectedList', function(e){
		Foundation.utils.S('.off-canvas-wrap').foundation('offcanvas', 'hide', 'move-right');
		list_ID = Foundation.utils.S(this).data('list-id');
		list_NAME = Foundation.utils.S(this).data('list-name');
		board_ID = Foundation.utils.S(this).data('board-id');
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
		Foundation.utils.S('#myModal').html(output);
		Foundation.utils.S("#errorAttribute").hide();
		Foundation.utils.S("#errorQuestion").hide();
	});

Foundation.utils.S(document.body).on('click', '.left-click', function(e){
		var output = null;
		if (currentNode.left != null){
			Foundation.utils.S(".left-click").hide("slow",function(){
				currentNode = currentNode.left;
				output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
				Foundation.utils.S('.left-click').html(output);
				Foundation.utils.S(".left-click").show("slow");
			});
		}else{
			currentNode.addLeft(nextNode);
			currentNode = tree;
			nextNode = null;
			if(arrayCards.length > 0){
				nextNode = new AVLTree(arrayCards[0], 'attr');
				arrayCards.shift();
				Foundation.utils.S(".left-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
					Foundation.utils.S('.left-click').html(output);
					Foundation.utils.S(".left-click").show("slow");
				});
				Foundation.utils.S(".right-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+nextNode.node.name+'</p></div>';
					Foundation.utils.S('.right-click').html(output);
					Foundation.utils.S(".right-click").show("slow");
				});
			}
		}
		if(nextNode == null){
			arrayCards = tree.buildArray();
			output = '<h6>Activity to priorize: Priorization Finished!</h6>';
			Foundation.utils.S('#cardsView').html(output);
			postCards();
			var output = '<div data-alert class="alert-box success radius">Cards Prioritized.<a href="#" class="close">&times;</a></div>';
			Foundation.utils.S('#alerts').html(output);
			Foundation.utils.S(document).foundation('alert', 'reflow');
			setTimeout(function () {
				Foundation.utils.S(".alert-box a.close").trigger("click.fndtn.alert");
			}, 4000);
		}
	});

	Foundation.utils.S(document.body).on('click', '.right-click', function(e){
		var output = null;
		if (currentNode.right != null){
			Foundation.utils.S(".left-click").hide("slow",function(){
				currentNode = currentNode.right;
				output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
				Foundation.utils.S('.left-click').html(output);
				Foundation.utils.S(".left-click").show("slow");
			});
		}else{
			currentNode.addRight(nextNode);
			currentNode = tree;
			nextNode = null;
			if(arrayCards.length > 0){
				nextNode = new AVLTree(arrayCards[0], 'attr');
				arrayCards.shift();
				Foundation.utils.S(".left-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+currentNode.node.name+'</p></div>';
					Foundation.utils.S('.left-click').html(output);
					Foundation.utils.S(".left-click").show("slow");
				});
				Foundation.utils.S(".right-click").hide("slow",function(){
					output = '<div class="panel callout radius" data-equalizer-watch><p>'+nextNode.node.name+'</p></div>';
					Foundation.utils.S('.right-click').html(output);
					Foundation.utils.S(".right-click").show("slow");
				});
			}
		}
		if(nextNode == null){
			arrayCards = tree.buildArray();
			output = '<h6>Activity to priorize: Priorization Finished!</h6>';
			Foundation.utils.S('#cardsView').html(output);
			postCards();
			var output = '<div data-alert class="alert-box success radius">Cards Prioritized.<a href="#" class="close">&times;</a></div>';
			Foundation.utils.S('#alerts').html(output);
			Foundation.utils.S(document).foundation('alert', 'reflow');
			setTimeout(function () {
				Foundation.utils.S(".alert-box a.close").trigger("click.fndtn.alert");
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
		}
	};

	var updateLoggedIn = function() {
	    var isLoggedIn = Trello.authorized();
	    if (isLoggedIn){
	    	Foundation.utils.S(".loggedIn").show();
	    	Foundation.utils.S(".loggedOut").hide();
	    } else {
	    	console.log('not logged in');
	    	Foundation.utils.S(".loggedIn").hide();
	    	Foundation.utils.S(".loggedOut").show();
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
			type: "popup",
			success: getBoards,
			expiration:"never",
			scope:{
				write:true,
				read:true},
			name: 'AVL-Priorization'
	});

	Foundation.utils.S("#connectLink")
	.click(function(){
	    Trello.authorize({
	        type: "popup",
	        success: getBoards,
	        expiration:"never",
	        scope:{
						write:true,
						read:true},
	        name: 'AVL-Priorization'
	    })
	});

	Foundation.utils.S("#showLink").on('click', function(){
		console.log('show link clicked');
		Trello.authorize({
		    interactive:false,
		    success: getBoards
		});
	});

	Foundation.utils.S("#disconnect").click(logout);
});
