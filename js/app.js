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
							output += '<li class="has-submenu"><a class="selectBoard" data-board-id="'+boardObject.id+'" href="#">'+boardObject.name+'</a>'
												+'<ul class="left-submenu">'
													+'<li id="testtest" class="back"><a href="#">Back</a></li>'
													+'<li><label data-reveal-id="myModal" class="selectAHP" data-board-id="'+boardObject.id+'" id="off-canvas-menu-title">Proced with AHP over BPL prioritized lists</label></li>';
													//+'<li><label id="off-canvas-menu-title">Select List to be prioritized in BPL</label></li>';
							$.each(boardObject.lists, function (list_index, listObject){
								output += '<li><a class="selectList" data-reveal-id="myModal" data-board-id="'+boardObject.id+'" data-list-id="'+listObject.id+'" data-list-name="'+listObject.name+'" href="#">'+listObject.name+'</a></li>';
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

	Foundation.utils.S(document.body).on('click', '.selectBoard', function(e){
		Foundation.utils.S(".main-section").animate({ scrollTop: 0 });
		Foundation.utils.S(".left-off-canvas-menu").animate({ scrollTop: 0 });
	});
	
	Foundation.utils.S(document.body).on('click', '.selectAHP', function(e){
		Foundation.utils.S('.off-canvas-wrap').foundation('offcanvas', 'hide', 'move-right');
		board_ID = Foundation.utils.S(this).data('board-id');
		var output = '<h2 id="modalAHPConfiguration">Well done. Prepare for AHP proritization.</h2><br />'+
		'<form id="configuration">'+
			'<div class="row">'+
				'<div class="large-12 columns">'+
					'<div class="row collapse prefix-radius">'+
						'<div class="small-5 columns">'+
							'<span class="prefix">The question should support a pairwise comparison</span>'+
						'</div>'+
						'<div class="small-7 columns">'+
							'<input type="text" name="postQuestion" placeholder="Question..." style="margin:0" pattern="[A-Za-z]" required>'+
							'<small id="errorQuestion" class="error">Invalid Question</small>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</div><br /><br />'+
			'<div class="row">'+
				'<div class="large-12 columns">'+
					'<table id="optionsList"></table>'+
					'<label>Enter the options below, and then click the add button below. Each option should be on a separate line.</label><br />'+
					'<textarea rows="10" id="multiOptionText" placeholder="put the hierarchy AHP structure"></textarea><br />'+
					'<div class="small-9 medium-6 large-4 columns"><a id="addMultiOptions" href="#" class="button success round">Add +</a></div>'+
				'</div>'+
			'</div>'+
			'<div class="row">'+
				'<div class="small-9 medium-6 large-4 small-centered medium-centered large-centered columns"><a id="startAHPPriorization" href="#" data-board-id="'+board_ID+'" data-list-id="'+list_ID+'" data-list-name="'+list_NAME+'" class="button success large round">Start Priorization</a></div>'+
			'</div>'+
		'</form>'+
		'<a class="close-reveal-modal" aria-label="Close">&#215;</a>';
		Foundation.utils.S('#myModal').html(output);
		Foundation.utils.S("#errorQuestion").hide();
	});
	
	Foundation.utils.S(document.body).on('click', '.selectList', function(e){
		Foundation.utils.S('.off-canvas-wrap').foundation('offcanvas', 'hide', 'move-right');
		list_ID = Foundation.utils.S(this).data('list-id');
		list_NAME = Foundation.utils.S(this).data('list-name');
		board_ID = Foundation.utils.S(this).data('board-id');
		var output = '<h2 id="modalBPLConfiguration">Awesome. Prepare for BPL proritization.</h2><br />';
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
		output += '</div>';
		output += '<div class="row">';
		output += '<div class="small-9 medium-6 large-4 small-centered medium-centered large-centered columns"><a id="startBPLPriorization" href="#" data-board-id="'+board_ID+'" data-list-id="'+list_ID+'" data-list-name="'+list_NAME+'" class="button success large round">Start Priorization</a></div>';
		output += '</div>';
		output += '</form>';
		output += '<a class="close-reveal-modal" aria-label="Close">&#215;</a>';
		Foundation.utils.S('#myModal').html(output);
		Foundation.utils.S("#errorAttribute").hide();
		Foundation.utils.S("#errorQuestion").hide();
	});
	
	Foundation.utils.S(document.body).on('click', '#startBPLPriorization', function(e){
		var $postAttribute = Foundation.utils.S("input[name='postAttribute']").val();
		var $postQuestion = Foundation.utils.S("input[name='postQuestion']").val();
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
			$.each(list.cards, function (i){
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
					Foundation.utils.S('#modalBPLConfiguration').foundation('reveal', 'close');
				});
			});
		}
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
	        name: 'Binary BPB'
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
	
	var displayHelper = {};
	
	/** purpose: initialize the poll */
	displayHelper.initializePoll = function(){
		// bind events
		Foundation.utils.S(document.body).on('click', '#addMultiOptions', function(){
			displayHelper.addMultiOptionsToList();
		});
		Foundation.utils.S('.startPoll').click(function(){
			displayHelper.startPoll();
		});
		Foundation.utils.S('.stopPoll').click(function(){
			displayHelper.stopPoll();
		});
		Foundation.utils.S('.changePoll').click(function(){
			displayHelper.stopPoll();
		});
		// add an option to the list when the user selects the enter key
		Foundation.utils.S("#optionText").keypress(function (e) {  
	         if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {  
	         		// take an action
							displayHelper.addOptionToList();
	         }  
	     }); 
	     // hide the poll results container because there are not any results yet
	     Foundation.utils.S('#pollResults').hide();
	};

	/** purpose: add multiple options to the option list using the strings in
	 * the textarea: #multiOptionText */
	displayHelper.addMultiOptionsToList = function(){
		// split the options from the textarea
		var factors = Foundation.utils.S('#multiOptionText').val();
		var factorArray = factors.split('\n');
		$.each(factorArray, function(index){
			factorArray[index] = displayHelper._getSubFactors(this);
		});
		
		// add each option
		$.each(factorArray, function(){
			displayHelper._addFactor(this);
		});
		// clear the textarea
		Foundation.utils.S('#multiOptionText').val('');

	};
	
	displayHelper._getSubFactors = function(string){
		var subFactor = [];
		if(string.indexOf(':') != -1){
				
		}
			factorLvl1Array[index] = string.replace(':', '');
		var factorLvl2Array = factorLvl1Array[index].split(',');
		$.each(factorLvl1Array, function(index){
			
		}
	};

	/** purpose: add an option to the option list
	 * @param String option the option text */
	displayHelper._addFactor = function(option){
		option.trim();
		if(option.length > 0){
			$('<tr class="new"><td class="index"></td><td class="option">' + option + '</td><td><a href="#" class="removeParent">[x]</a></td></tr>').appendTo('#optionsList').hide().fadeIn('slow');	
			// clear the option text
			displayHelper._resetOptionInputText();		
			// bind the remove event to the delete button
			displayHelper._bindRemoveEvents();
			// update the table index. This will renumber the table rows.
			//displayHelper._updateTableIndex();
		}
	};

	/** purpose: clear the text in the input: #optionText */
	displayHelper._resetOptionInputText = function(){
		Foundation.utils.S('#optionText').val('');
	};

	/** purpose: reset the poll using the values in the Object poll as the new poll values
	 * @param Object poll an object with the question and options for the poll */
	displayHelper._resetPoll = function(poll){
		// remove the existing poll options
		Foundation.utils.S('#optionsList').empty();
		// set the poll question
		Foundation.utils.S('.questionTextInput').val(poll.question);
		// set the poll options
		$.each(poll.options, function(i,n){
			console.log(Foundation.utils.S(this));
			displayHelper._addFactor(n);
		});
		// stop the poll
		displayHelper.stopPoll();
	};

	/** purpose: bind a remove event to the remove link for an option */
	displayHelper._bindRemoveEvents = function(){
		Foundation.utils.S('#optionsList tr.new .removeParent').click(function(){
			Foundation.utils.S(this).parent().parent().remove();
			//displayHelper._updateTableIndex();
		});
		Foundation.utils.S('#optionsList tr.new').removeClass('new');
	};
			
	/** purpose: function to stop a poll. This function is bound to a button. */
	displayHelper.stopPoll = function(){
		// hide the stop poll button container
		Foundation.utils.S('.stopPoll').hide();
		// hide the poll questions container
		Foundation.utils.S('.changePoll, #pollQuestions').hide();
		// show hidden containers for setup
		Foundation.utils.S('.newOption, .removeParent, .startPoll, .setup').show('slow');
		// show the existing poll results
		Foundation.utils.S('#pollResults').show();
	};

	/** purpose: function to change a poll. This allows the user to change the poll values.
	 * This function is bound to a button. */
	displayHelper.changePoll = function(){
		// hide the stop poll button container
		Foundation.utils.S('.stopPoll').hide();
		//show the change poll container
		Foundation.utils.S('.changePoll').show();
		// show the existing poll results
		Foundation.utils.S('#pollResults').show();
	};

	/** purpose: function to start a poll. This function is bound to a button. */
	displayHelper.startPoll = function(){
		if(Foundation.utils.S('#optionsList .option').size() > 1){
			// hide the setup container
			Foundation.utils.S('.setup').hide();
			// display the stop poll button
			Foundation.utils.S('.stopPoll').show();
			// hide the existing poll results
			Foundation.utils.S('#pollResults').hide();
			// hide set up containers
			Foundation.utils.S('.newOption, .removeParent, .startPoll').hide();
			var pollSettings = {};
			pollSettings.optionArray = [];
			pollSettings.questionText = Foundation.utils.S('.questionTextInput').val();
			// extract the options
			var optionArray = [];
			Foundation.utils.S('#optionsList .option').each(function(i, n){
				pollSettings.optionArray[pollSettings.optionArray.length] = Foundation.utils.S(this).text();
			});
			//pollSettings.voteType = Foundation.utils.S("input[name='votingType']:checked").val();
	    pollSettings.voteType = "detailedVoting";
			// start the poll
			ahp.startPoll(pollSettings);
		}
	};

	/** purpose: update the option list index */
	displayHelper._updateTableIndex = function(){
		Foundation.utils.S('#optionsList .index').each(function(index){
			Foundation.utils.S(this).html('<strong>factor ' + (index+1) + ': </strong>');
		});
	};
	
	displayHelper.initializePoll();
});
