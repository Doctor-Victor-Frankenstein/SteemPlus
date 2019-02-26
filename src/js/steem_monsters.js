var token_steem_monster = null;
var retrySteemMonster = 0;
var isSteemit = null;
var isBusy = null;
var myUsernameSteemMonster=null;
var urlSteemMonster = null;
var pageUsernameSteemMonster = null;
let amountSM,memoSM;
var steemMonsterPacks = {
	"booster_pack" : {
		"name": "Booster Pack",
		"image": "beta_booster_pack",
		"usdPrice": 2
	}
};

var steemMonsterStarterPack = {
	"starter_pack": {
		"name": "Starter Pack",
		"image": "beta_starter_set",
		"usdPrice": 10
	}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.to === 'steem_monsters' && request.order === 'start' && token_steem_monster == null) {
		token_steem_monster = request.token;
		isSteemit = request.data.steemit;
		isBusy = request.data.busy;
		myUsernameSteemMonster = request.data.user;
		retrySteemMonster = 0;
		startSteemMonsterTab();
	} else if (request.to === 'steem_monsters' && request.order === 'click' && token_steem_monster == request.token) {
		console.log('click');
		isSteemit = request.data.steemit;
		isBusy = request.data.busy;
		myUsernameSteemMonster = request.data.user;
		retrySteemMonster = 0;
		startSteemMonsterTab();
	}
});


function startSteemMonsterTab() {
	if(retrySteemMonster > 20) return;

	if(regexBlogSteemit.test(window.location.href)) {
		if($('.UserProfile__top-nav').length === 0)
		{
			setTimeout(function() {
                retrySteemMonster++;
                startSteemMonsterTab();
            }, 1000);
		}
		else
		{
			pageUsernameSteemMonster = window.SteemPlus.Utils.getPageAccountName();
			console.log(pageUsernameSteemMonster, myUsernameSteemMonster);
			if(pageUsernameSteemMonster === myUsernameSteemMonster)
			{
				window.SteemPlus.Tabs.createTab({
					id: 'steem_monsters',
					title: 'Steem Monsters',
					enabled: true,
					createTab: createSteemMonsterTab,
					newButton: true
				});
				if (window.location.href.includes('#steem_monsters'))
					window.SteemPlus.Tabs.showTab('steem_monsters');
			}
			else{
				console.log('delete tab');
				$('.menu-steem_monsters-tab-li').eq(0).remove();
			}
		}
	}
}

// Function used to create the tab content
// @parameter rewardTab : graphical element tab
function createSteemMonsterTab(steemMonsterTab) {

	steemMonsterTab.html('<div class="feed-layout container">\
		<div class="row">\
			<div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_SteemMonsterTab column layout-list">\
				<article class="articles">\
					<div class="SteemMonster" style="display: none;">\
						<h1 class="articles__h1" style="margin-bottom:20px">\
							Buy Steem Monsters packs\
							</h1>\
						<hr class="articles__hr"/>\
						<div class="bootstrap-wrapper">\
							<h6 id="steemMonster-information-message"></h6>\
							<div class="container container-steem-monster">\
								<div id= "disclaimer_steem_monster">\
									Earn SteemPlus Points (SPP) for each Steem Monsters pack you buy from SteemPlus. <br> If you don\'t have an account on Steem Monsters yet, follow <a href="https://steemmonsters.com/?ref=steemplus-pay" target="_blank">this link</a> to do so, you will automatically get SPP for all your future purchases.\
								</div>\
								<div class="row">\
									<div class="col-6 column form_buy_pack">\
										<div class="input-group" style="margin-bottom: 1.25rem;">\
											<select id="select_pack" style="min-width: 5rem; height: inherit; background-color: transparent;" autofocus>\
											</select>\
										</div>\
										<div class="input-group" style="margin-bottom: 1.25rem;">\
											<span class="input-group-label" >Quantity</span>\
											<input type="number" id="quantity_pack" name="quantity" value="1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="" min="1" step="1">\
										</div>\
										<div class="input-group" style="margin-bottom: 1.25rem;">\
											<span class="input-group-label" >Currency</span>\
											<select id="select_currency" style="min-width: 5rem; height: inherit; background-color: transparent;" autofocus>\
												<option value="SBD" selected>SBD</option>\
												<option value="STEEM" selected>STEEM</option>\
											</select>\
										</div>\
										<div class="input-group" style="margin-bottom: 1.25rem;">\
											<h5>Total : <span class="total_transaction"></span></h5>\
										</div>\
										<div class="input-group" style="margin-bottom: 1.25rem;">\
											<button class="button-steemit purchase-pack">Purchase</button>\
										</div>\
									</div>\
									<div class="col-6 column image_pack_div">\
										<img id="image_pack" src="" />\
									</div>\
								</div>\
							</div>\
						</div>\
					</div>\
					<center class="SteemMonsterTabLoading">\
						<div class="LoadingIndicator circle">\
							<div></div>\
						</div>\
					</center>\
				</article>\
			</div>\
		</div></div>');

	$.ajax({
		type: "GET",
		beforeSend: function(xhttp) {
			xhttp.setRequestHeader("Content-type", "application/json");
			xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
		},
		url: `https://steemmonsters.com/players/login?name=${pageUsernameSteemMonster}`,
		success: function(response) {
			console.log(response);
			if(response.starter_pack_purchase){
				Object.keys(steemMonsterPacks).map(function(packType, index) {
					var packInfo = steemMonsterPacks[packType];
					$('#select_pack').append(`<option value="${packType}" ${index === 0 ? 'selected' : ''}>${packInfo.name} - ${packInfo.usdPrice} USD</option>`);
					$('#image_pack').attr('src', `https://s3.amazonaws.com/steemmonsters/website/card_packs/${packInfo.image}.png`)
				});
				amountSM=response.payment;
				memoSM=response.uid;
				urlSteemMonster = `https://v2.steemconnect.com/sign/transfer?from=${pageUsernameSteemMonster}&to=steemmonsters&amount=${response.payment}&memo=${response.uid}`;
				$('.total_transaction').text(response.payment);

			}
			else {
				Object.keys(steemMonsterStarterPack).map(function(packType, index) {
					var packInfo = steemMonsterStarterPack[packType];
					$('#select_pack').append(`<option value="${packType}" ${index === 0 ? 'selected' : ''}>${packInfo.name} - ${packInfo.usdPrice} USD</option>`);
					$('#image_pack').attr('src', `https://s3.amazonaws.com/steemmonsters/website/card_packs/${packInfo.image}.png`)
				});
				amountSM=response.payment;
				memoSM=response.uid;
				urlSteemMonster = `https://v2.steemconnect.com/sign/transfer?from=${pageUsernameSteemMonster}&to=steemmonsters&amount=${response.payment}&memo=${response.uid}`;
				$('.total_transaction').text(response.payment);
			}
			sendRequestToSteemMonster();
			$('.SteemMonsterTabLoading').hide();
			$('.SteemMonster').show();

		},
		error: function(msg) {
			console.log(msg);
		}
	});

	$('#quantity_pack').on("input propertychange", function(){
		if($('#quantity_pack').val()>32767)
			$('#quantity_pack').val(32767);
		sendRequestToSteemMonster();
	});

	$('#select_currency').change(function(){
		sendRequestToSteemMonster();
	});

	$('.purchase-pack').click(function(){
		if(!connect||connect.method=="sc2"){  // Request transfer via SC2
			window.open(urlSteemMonster, '_blank');
		else // Request transfer via Keychain
			steem_keychain.requestTransfer(connect.user,"steemmonster",amountSM.split(" ")[0],memoSM,amountSM.split(" ")[1],function(result){
				if(result.success)
					alert("Purchase succesful! Check your new packs on steemmonsters.com");
				else
					alert("Something went wrong! Please try again later!");
			},true);
	});
}

function sendRequestToSteemMonster()
{
	$.ajax({
		type: "GET",
		beforeSend: function(xhttp) {
			xhttp.setRequestHeader("Content-type", "application/json");
			xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
		},
		url: `https://steemmonsters.com/purchases/start?player=${pageUsernameSteemMonster}&type=${$('#select_pack').val()}&qty=${$('#quantity_pack').val()}&currency=${$('#select_currency').val()}&orig_currency=${$('#select_currency').val()}&merchant=steemplus-pay`,
		success: function(response) {
			console.log(response);
			amountSM=response.payment;
			memoSM=response.uid;
			urlSteemMonster = `https://v2.steemconnect.com/sign/transfer?from=${pageUsernameSteemMonster}&to=steemmonsters&amount=${response.payment}&memo=${response.uid}`;
			$('.total_transaction').text(response.payment);
			$('.SteemMonsterTabLoading').hide();
			$('.SteemMonster').show();

		},
		error: function(msg) {
			console.log(msg);
		}
	});
}
