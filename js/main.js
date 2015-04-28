
/* 
See https://trello.com/docs for a list of available API URLs
The API development board is at https://trello.com/api
*/

var arrayCards = [];
var tree = null;
var currentNode = null;
var nextNode = null;
var HaveOrdenedList = false;
var board_ID = null;
var list_ID = null;

var $j = jQuery.noConflict();

$j(document).ready(function(){

	$j('.loggedIn').hide();
	var getBoards = function (){
		updateLoggedIn();
		$j("#boardList").empty();
		Trello.members.get("me", function(member){
		    $j(".fullName").text(member.fullName);
		
		    var $boardList = $j('<ul class="nav nav-list">').text("Loading Boards...").appendTo("#boardList");

		    // Output a list of all of the boards that the member 
		    ///boards/DmeWGl98
		    Trello.get("members/me/boards", {filter: "open"}, function(boards) {
		        $boardList.empty();
		        var output = '<li class="nav-header">Open Boards:</li>';
		        // output += '<li><a data-board-id = "'+boards.id+'" href="#">'+boards.name+'</a></li>';
		        $j.each(boards, function(ix, board) {
		        	output += '<li><a data-board-id = "'+board.id+'" href="#">'+board.name+'</a></li>';
		        }); 
		        $boardList.html(output);
		        //attach behaviours
		        $j('a', $boardList).click( function(){
	               var id = $j(this).data('board-id');
	               $boardList.find('li').removeClass('active');
	               $j(this).parent().addClass('active');
	               // Get all cards of a Board by its ID
	               Trello.boards.get(id, {lists: "open", cards: "visible"}, displayBoard);
	               return false;
		        });
		    });
		});
	}

	var displayBoard = function(board){	
		output = "<h1>"+board.name+"</h1>";
		output += "<h3>Select the Higher Task</h3>";	
		arrayCards = [];
		board_ID = board.id;
		$j.each(board.lists, function (i){
			var idList = this.id;
			if(this.name == "Ordened List"){
				HaveOrdenedList = true;
				list_ID = this.id;
			}
			//output += "<h3>"+this.name+'</h3><div class="span12 card">';
			$j.each(board.cards, function(i){
				if (this.idList == idList){
					arrayCards.push({id:this.id , name:this.name ,description:this.desc });
				}
			});
			//output += "</div>";
		});
		if(!HaveOrdenedList){
			Trello.post("lists", { name: "Ordened List", idBoard: board_ID });
			Trello.boards.get(board_ID, {lists: "open", cards: "visible"}, function(board_){
				$j.each(board_.lists, function (i){
					if(this.name == "Ordened List"){
						HaveOrdenedList = true;
						list_ID = this.id;
					}
				});
			});
		}
		$j('#output').html(output);
		startPriorization();
	}

	var startPriorization = function(){
		if(arrayCards.length >= 2){
			tree = new AVLTree(arrayCards[0], 'attr');
			arrayCards.shift();
			currentNode = tree;
			nextNode = new AVLTree(arrayCards[0], 'attr');
			arrayCards.shift();
			var output = '<div class="span12"><h5>Activity to priorize: '+nextNode.node.name+'</h4></div>';
			output += '<div class="span12"><div class="span6 lowerNode"><strong><p>'+currentNode.node.name+'</p></strong><p>'+currentNode.node.description+'</p></div>';
			output += '<div class="span6 higherNode"><strong><p>'+nextNode.node.name+'</p></strong><p>'+nextNode.node.description+'</p></div></div>';
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

	$j(document.body).on('click', '.lowerNode', function(e){
		var output = null;
		if (currentNode.left != null){
			currentNode = currentNode.left;
			output = '<div class="span12"><h5>Activity to priorize: '+nextNode.node.name+'</h4></div>';
			output += '<div class="span12"><div class="span6 lowerNode"><strong><p>'+currentNode.node.name+'</p></strong><p>'+currentNode.node.description+'</p></strong></div>';
			output += '<div class="span6 higherNode"><strong><p>'+nextNode.node.name+'</p></strong><p>'+nextNode.node.description+'</p></strong></div></div>';
			$j('#cardsView').html(output);
		}else{
			currentNode.addLeft(nextNode);
			currentNode = tree;
			nextNode = null;
			if(arrayCards.length > 0){
				nextNode = new AVLTree(arrayCards[0], 'attr');
				arrayCards.shift();
				output = '<div class="span12"><h5>Activity to priorize: '+nextNode.node.name+'</h4></div>';
				output += '<div class="span12"><div class="span6 lowerNode"><strong><p>'+currentNode.node.name+'</p></strong><p>'+currentNode.node.description+'</p></strong></div>';
				output += '<div class="span6 higherNode"><strong><p>'+nextNode.node.name+'</p></strong><p>'+nextNode.node.description+'</p></strong></div></div>';
				$j('#cardsView').html(output);
			}
		}
		if(nextNode == null){
			arrayCards = tree.buildArray();
			output = '<div class="span12"><strong><p>Priorization Finished!</p></strong></div>';
			$j('#cardsView').html(output);
			postCards();
		}
	});

	$j(document.body).on('click', '.higherNode', function(e){
		var output = null;
		if (currentNode.right != null){
			currentNode = currentNode.right;
			output = '<div class="span12"><h5>Activity to priorize: '+nextNode.node.name+'</h4></div>';
			output += '<div class="span12"><div class="span6 lowerNode"><strong><p>'+currentNode.node.name+'</p></strong><p>'+currentNode.node.description+'</p></strong></div>';
			output += '<div class="span6 higherNode"><strong><p>'+nextNode.node.name+'</p></strong><p>'+nextNode.node.description+'</p></strong></div></div>';
			$j('#cardsView').html(output);
		}else{
			currentNode.addRight(nextNode);
			currentNode = tree;
			nextNode = null;
			if(arrayCards.length > 0){
				nextNode = new AVLTree(arrayCards[0], 'attr');
				arrayCards.shift();
				output = '<div class="span12"><h5>Activity to priorize: '+nextNode.node.name+'</h4></div>';
				output += '<div class="span12"><div class="span6 lowerNode"><strong><p>'+currentNode.node.name+'</p></strong><p>'+currentNode.node.description+'</p></strong></div>';
				output += '<div class="span6 higherNode"><strong><p>'+nextNode.node.name+'</p></strong><p>'+nextNode.node.description+'</p></strong></div></div>';
				$j('#cardsView').html(output);
			}
		}
		if(nextNode == null){
			arrayCards = tree.buildArray();
			output = '<div class="span12"><strong><p>Priorization Finished!</p></strong></div>';
			$j('#cardsView').html(output);
			postCards();
		}
	});
	    
	var postCards = function() {
		if(list_ID && arrayCards.length > 0){
			Trello.put("cards/"+(arrayCards[0])[0].id,{ idList: list_ID, pos: "top"}, function(){
				arrayCards.shift();
				postCards();
			});
		}
	};

	$j("#disconnect").click(logout);

	/**
	 * All actions that can be executed are in thi API Reference
	 *                      https://trello.com/docs/api/index.html
	 * @returns {undefined}
	 */
	var otherActions = function() {
	      updateLoggedIn();       
	      //Trello.post("cards/idCard/actions/comments", { text: "Modificando datos desde php" });
	      //Trello.put("cards/IdCard/",{ idList: "idListaNueva"});		   
	       
	      // Put a comment to some idCard by idCard
	      Trello.post("cards/54073cc73cefcb77d1f1309d/actions/comments", { text: "Modificando datos desde API javascript" });
	      
	      // Move a card by its ID to other List
	      Trello.put("cards/54078053605b33754c5e54c7/",{ idList: "54073bf6ac6c8854779543a9"});		   

	      //PUT /1/cards/[card id or shortlink]/idList
	};

});

