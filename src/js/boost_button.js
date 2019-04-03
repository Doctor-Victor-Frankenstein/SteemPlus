var token_boost_button = null;
var aut = null;
var modal = null;

var urlBooster = null;
var matchBooster = null;
var categoryBooster = null;
var authorBooster = null;
var permlinkBooster = null;
var loading = null;
var normalList = 1;

var isSteemit = null;
var isBusy = null;
var globalVar = null;
var postFloatingBarEnabled = null;

var retryCountBoostButton = 0;
var market = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    if (request.to == 'boost_button') {
        aut = request.data.user;
        retryCountBoostButton = 0;
        isSteemit = request.data.steemit;
        isBusy = request.data.busy;
        postFloatingBarEnabled = request.data.post_floating_bar;
        globalVar = request.data.global;
        if (request.order === 'start' && token_boost_button == null) {
            token_boost_button = request.token;
            addPostBoostButton();
            market = request.data.market;
        }

        if (request.order === 'click') {
            token_boost_button = request.token;
            postFloatingBarEnabled = request.data.post_floating_bar;
            addPostBoostButton();
        }
    }
});


function createMinnowBoosterTransferUI() {
    var link = '';
    if (isSteemit) link = window.location.origin + '/' + categoryBooster + '/@' + authorBooster + '/' + permlinkBooster;
    else if (isBusy) link = window.location.origin + '/@' + authorBooster + '/' + permlinkBooster;

    if (modal === null) {
        if (isSteemit) {
            modal = $('<div role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">\
          <div class="reveal-overlay fade in" style="display: block;"></div>\
            <div class="reveal fade in" role="document" tabindex="-1" style="display: block; min-height: 200px;">\
              <button class="close-button" type="button">\
                <span aria-hidden="true" class="">×</span>\
              </button>\
            </div>\
          </div>');

            modal.find('.close-button').on('click', function() {
                modal.remove();
            });
            modal.find('.reveal-overlay').on('click', function() {
                modal.remove();
            });
        } else if (isBusy) {
            modal = $('<div id="myModal" class="modal-busy">\
          <div class="modal-content-busy">\
            <span class="close-busy">&times;</span>\
          </div>\
        </div>');

            modal.find('.close-busy').on('click', function() {
                modal.remove();
            });
            window.onclick = function(event) {
                if (event.target == modal[0]) {
                    modal.remove();
                }
            }
        }
    }


    loading = $(window.SteemPlus.Utils.getLoadingHtml({
        center: true
    }));
    modal.find('.reveal').append(loading);

    var missingAsync = 4;
    var alreadyBoosted = false;
    var accountInfo = null;
    var globalInfo = null;
    var minnowboosterAccount = null;

    var asyncDone = function() {
        missingAsync--;
        if (missingAsync !== 0) {
            return;
        }

        var min = parseFloat(globalInfo.min_upvote);
        var max = Math.min(
            parseFloat(globalInfo.daily_limit)*(normalList?1:2) - parseFloat(accountInfo.user_daily_usage),
            parseFloat(globalInfo.weekly_limit) - parseFloat(accountInfo.user_weekly_usage)
        );

        var multiplier = parseFloat(globalInfo.full_strength);

        var transferUI;

        var accountInfoUI = '<div class="column small-12">\
        <strong>About the author: <a href="/@' + authorBooster + '" target="_blank" rel="noopener">@' + authorBooster + '</a></strong><br>\
        <small>Daily Limit: ' + parseFloat(accountInfo.user_daily_usage).toFixed(2) + ' / ' + (parseFloat(globalInfo.daily_limit)*(normalList?1:2)).toFixed(2) + ' SBD</small> <br>\
      </div>';

        if (!globalInfo.post_voting_enabled) {

            transferUI = $('<div id="modalContent">\
          <div id="modalTitle" class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a></h3>\
          </div>\
          <div>\
            <div class="row">\
              <div class="column small-12">\
              The boost functionality is provided by <a href="/@steem-plus" target="_blank" rel="noopener">@steem-plus</a>\
              with the support of the <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> team.\
              We don\'t have access to your private key, and the payment is made through SteemConnect.\
              <br>\
              </div>\
            </div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column small-12" style="color: red;">\
              This service is currently not available, try later.\
              <br>\
              </div>\
            </div>\
          </div>\
        </div>');

        } else if (min > max) {

            transferUI = $('<div id="modalContent">\
          <div id="modalTitle" class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a></h3>\
          </div>\
          <div>\
            <div class="row">\
              <div class="column small-12">\
              The boost functionality is provided by <a href="/@steem-plus" target="_blank" rel="noopener">@steem-plus</a>\
              with the support of the <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> team.\
              We don\'t have access to your private key, and the payment is made through SteemConnect.\
              <br>\
              </div>\
            </div>\
            <br>\
            <div class="row">' + accountInfoUI + '</div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column small-12" style="color: red;">\
              The author\'s daily or weekly limit has been reached. You can\'t boost this post.\
              <br>\
              </div>\
            </div>\
          </div>\
        </div>');

        } else {
            // can boost!

            transferUI = $('<div id="modalContent">\
          <div id="modalTitle" class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a></h3>\
          </div>\
          <form lpformnum="4">\
            <div>\
              <div class="row">\
                <div class="column small-12">\
                The boost functionality is provided by <a href="/@steem-plus" target="_blank" rel="noopener">@steem-plus</a>\
                with the support of the <a href="/@minnowbooster" target="_blank" rel="noopener">@minnowbooster</a> team.\
                We don\'t have access to your private key, and the payment is made through SteemConnect.\
                <br>\
                <br>\
                Earn passive income from MinnowBooster by <a target="_blank" href="https://www.minnowbooster.com/vote-selling/?ref=1082760">selling your votes.</a>\
                </div>\
              </div>\
              <br>\
              <div class="row">' + accountInfoUI + '</div>\
              <br>\
              <br>\
              <div class="row charttest">\
                <canvas id="boost-button-chart" class="boost-button-chart"></canvas>\
              </div>\
              <br>\
              <br>\
            </div>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">To</div>\
              <div class="column small-10">\
                <div class="input-group" style="margin-bottom: 1.25rem;">\
                  <span class="input-group-label">@</span>\
                  <input type="text" class="input-group-field" disabled="" value="minnowbooster" placeholder="Send to account" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" name="to" value="">\
                </div>\
                <p></p>\
              </div>\
            </div>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">Amount</div>\
              <div class="column small-10">\
                <div class="input-group" style="margin-bottom: 5px;">\
                  <input type="text" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
                  <span class="input-group-label" style="padding-left: 0px; padding-right: 0px;">\
                    <select name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">\
                      <option value="SBD" selected>SBD</option>\
                    </select>\
                  </span>\
                </div>\
                <div class="amount-error">\
                  <small>Min: ' + min.toFixed(3) + ' SBD - Max: <span class="maxAvailableAmount"></span> SBD</small>\
                </div>\
                <div class="amount-upvote">\
                </div>\
              </div>\
            </div>\
            <br>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">Memo</div>\
              <div class="column small-10">\
                <input type="text" placeholder="Memo" name="memo" disabled="" value="" autocomplete="on" autocorrect="off" autocapitalize="off" spellcheck="false">\
              </div>\
            </div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column">\
                <span>\
                <button type="submit" disabled="" class="Action button">Submit</button>\
                </span>\
              </div>\
            </div>\
          </form>\
        </div>');

            transferUI.find('input[name="memo"]').val(link);
            transferUI.find('input[name="amount"]').val(min);

            if (transferUI.find('.boost-button-chart').length > 0) {
                $.ajax({
                    type: "GET",
                    beforeSend: function(xhttp) {
                        xhttp.setRequestHeader("Content-type", "application/json");
                        xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
                    },
                    url: 'https://www.minnowbooster.net/limit/chart',
                    success: function(json) {

                        var minnowData = [];
                        var endNullValue = true;
                        var maxVote = 0;
                        var maxNbVote = 0;
                        json = json[normalList].data;
                        for (var i = json.length - 1; i >= 0; i--) {
                            if (endNullValue) {
                                if (json[i][1] === 0)
                                    endNullValue = true;
                                else {
                                    maxVote = json[i][0];
                                    endNullValue = false;
                                    minnowData.unshift({
                                        x: json[i][0],
                                        y: json[i][1]
                                    });

                                    if (json[i][1] > maxNbVote) maxNbVote = json[i][1];
                                }
                            } else {
                                if (json[i][1] > maxNbVote) maxNbVote = json[i][1];
                                minnowData.unshift({
                                    x: json[i][0],
                                    y: json[i][1]
                                });
                            }
                        }

                        var maxAvailableAmount = Math.min(
                            parseFloat(globalInfo.daily_limit)*(normalList?1:2) - parseFloat(accountInfo.user_daily_usage),
                            parseFloat(maxVote)
                        );

                        $('.maxAvailableAmount').append(maxAvailableAmount);

                        var ctx = transferUI.find('.boost-button-chart')[0].getContext('2d');
                        var myChart = new Chart(ctx, {
                            type: 'scatter',
                            display: false,
                            data: {
                                datasets: [{
                                    display: false,
                                    showLine: true,
                                    lineTension: 0,
                                    fill: true,
                                    label: '# of vote available per vote value',
                                    data: minnowData,
                                    backgroundColor: '#4ba2f2'
                                }]
                            },
                            options: {
                                tooltips: {
                                    callbacks: {

                                        title: function() {
                                            return 'Available';
                                        },
                                        label: function(tooltipItem, data) {
                                            return ' ' + tooltipItem.yLabel + ' votes at ' + tooltipItem.xLabel + ' SBD available';
                                        }
                                    }
                                },
                                elements: {
                                    point: {
                                        radius: 3,
                                        pointStyle: 'circle',
                                        hoverRadius: 4,
                                        backgroundColor: '#144aff'
                                    }
                                },
                                display: false,
                                scales: {
                                    yAxes: [{
                                        gridLines: {
                                            display: true
                                        },
                                        scaleLabel: {
                                            labelString: '# Vote Available',
                                            display: true
                                        },
                                        type: 'logarithmic',
                                        ticks: {
                                            callback: function(tick, index, ticks) {
                                                return tick.toLocaleString()
                                            },
                                            min: 0,
                                            max: maxNbVote
                                        },
                                        afterBuildTicks: function(yValues) {
                                            yValues.ticks = [];
                                            var i = 1;
                                            yValues.ticks.push(i);
                                            while (i < maxNbVote) {
                                                i = i * 10;
                                                yValues.ticks.push(i);
                                            }
                                        }
                                    }],
                                    xAxes: [{
                                        gridLines: {
                                            display: false
                                        },
                                        scaleLabel: {
                                            labelString: 'Vote Value',
                                            display: true
                                        },
                                        type: 'logarithmic',
                                        ticks: {
                                            maxRotation: 75,
                                            callback: function(tick, index, ticks) {
                                                if (index % 2 === 1 || index === ticks.length - 1 || index === 0)
                                                    return tick.toLocaleString()
                                            }
                                        }
                                    }]
                                }
                            }
                        });
                    },
                    error: function(msg) {
                        alert(msg);
                    }
                });
            }



            var validate = function() {
                var amount = transferUI.find('input[name="amount"]').val();
                var error = true;
                amount = amount && parseFloat(amount);
                if (typeof amount === 'number' && min <= amount && max >= amount) {
                    error = false;
                }
                if (error) {
                    transferUI.find('.amount-error').css('color', 'red');
                    transferUI.find('button[type="submit"]').attr('disabled', 'disabled');
                    transferUI.find('.amount-upvote').html('');
                } else {
                    transferUI.find('.amount-error').css('color', '#333');
                    transferUI.find('button[type="submit"]').attr('disabled', null);
                    var upvote = amount * multiplier;
                    transferUI.find('.amount-upvote').html('<small>You will receive an upvote worth ~' + upvote.toFixed(2) + '$</small>');
                }
                return !error;
            };

            transferUI.find('input').on('input', function() {
                validate();
            });

            transferUI.find('form').on('submit', function(e) {
                e.preventDefault();
                if (!validate()) {
                    return;
                }
                var to = transferUI.find('input[name="to"]').val();
                var amount = transferUI.find('input[name="amount"]').val() + ' ' + transferUI.find('select[name="asset"]').val();
                var memo = transferUI.find('input[name="memo"]').val();
                if(!connect.connect||connect.method=="sc2"){ //Use SteemConnect
                  console.log("sc2");
                  scTransfer();
                }
                else // Use Keychain for transfer
                  steem_keychain.requestTransfer(connect.user,to,parseFloat(amount.split(" ")[0]).toFixed(3),"steemplus "+memo,amount.split(" ")[1],function(result){
                    if(!result.success) {
                      scTransfer();
                    }
                  },false);
                function scTransfer(){
                  var url = 'https://v2.steemconnect.com/sign/transfer?to=' + encodeURIComponent(to) + '&amount=' + encodeURIComponent(amount) + '&memo=' + encodeURIComponent("steemplus " + memo);
                  window.open(url, '_blank');
                }
            });

            validate();

        }

        loading.remove();
        if (isSteemit) {
            modal.find('.reveal').append(transferUI);
            $('#modalTitle').after($('<div class="row">\
          <div class="column small-2" style="padding-top: 5px;">To</div>\
          <div class="column small-10">\
            <div class="input-group" style="margin-bottom: 1.25rem;">\
              <span class="input-group-label">@</span>\
              <select id="selectBooster" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;" autofocus>\
                <option value="MinnowBooster" selected>MinnowBooster</option>\
                <option value="PostPromoter">PostPromoter</option>\
              </select>\
            </div>\
            <p></p>\
          </div>\
        </div>'));
        } else if (isBusy) {
            modal.find('.modal-content-busy').append(transferUI);
            $('#modalTitle').after($('<div class="row">\
          <div class="column small-2" style="padding-top: 5px;">To</div>\
          <div class="column small-10">\
            <div class="input-group" style="margin-bottom: 1.25rem;">\
              <span class="input-group-label">@</span>\
              <select id="selectBooster" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;" autofocus>\
                <option value="MinnowBooster" selected>MinnowBooster</option>\
                <option value="PostPromoter">PostPromoter</option>\
              </select>\
            </div>\
            <p></p>\
          </div>\
        </div>'));
        }


        $('#selectBooster').unbind('change').on('change', function() {
            changeUIBooster(this.value);
        });

        if (isBusy) {
            $('input').each(function() {
                $(this).eq(0).addClass('input-busy');
            });

            $('#selectBooster').each(function() {
                $(this).eq(0).addClass('select-busy');
            });


        }
    };

    $('body').append(modal);

    $.ajax({
        type: "GET",
        beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: 'https://www.minnowbooster.net/api/global',
        success: function(json) {
            globalInfo = json;
            Object.keys(json).forEach(function(key) {
                globalInfo[key.replace('=', '')] = globalInfo[key];
            });
            asyncDone();
        },
        error: function(msg) {
            alert(msg.responseJSON.error);
        }
    });

    $.ajax({
        type: "GET",
        beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: 'https://www.minnowbooster.net/users/' + authorBooster + '/json',
        success: function(json) {
            accountInfo = json;
            normalList = json.whitelisted ? 0 : 1;
            asyncDone();
        },
        error: function(msg) {
            alert(msg.responseJSON.error);
        }
    });

    $.ajax({
        type: "GET",
        beforeSend: function(xhttp) {
            xhttp.setRequestHeader("Content-type", "application/json");
            xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
        },
        url: 'https://www.minnowbooster.net/api/posts/' + authorBooster + '/' + permlinkBooster + '/' + authorBooster,
        success: function(json) {
            if (json.extract) {
                alreadyBoosted = {
                    from: json.extract.sender && json.extract.sender.name || 'unknown',
                    amount: json.extract.sbd,
                    upvote: json.extract.value
                };
            }
            asyncDone();
        },
        error: function(msg) {
            alert(msg.responseJSON.error);
        }
    });

    window.SteemPlus.Utils.getAccounts(['minnowbooster'], function(err, result) {
        if (result) {
            minnowboosterAccount = result[0];
            asyncDone()
        }
    });

};



function addPostBoostButton() {
    if (isSteemit) {
        if (regexPostSteemit.test(window.location.href) && retryCountBoostButton < 20) {
            var promoteButton = $('.Promote__button');
            var boostButton = $('.smi-boost-button');

            if (promoteButton.length && !boostButton.length) {

                boostButton = $('<button class="smi-boost-button float-right button hollow tiny">Boost</button>');

                promoteButton.before(boostButton);
                promoteButton.addClass('smi-promote-button');

                boostButton.on('click', function() {
                    modal = null;
                    urlBooster = window.location.pathname;
                    matchBooster = urlBooster.match(/^\/([^\/]*)\/@([^\/]*)\/(.*)$/);
                    categoryBooster = matchBooster[1];
                    authorBooster = matchBooster[2];
                    permlinkBooster = matchBooster[3];
                    createMinnowBoosterTransferUI();
                });

            } else {
                retryCountBoostButton++;
                timeoutBoostButton = setTimeout(function() {
                    addPostBoostButton();
                }, 1000);
            }
        }
    } else if (isBusy) {
        if (regexPostBusy.test(window.location.href) && !window.location.href.includes("#") && retryCountBoostButton < 20) {
            if (postFloatingBarEnabled)
                if ($('.smi-post-footer').length === 0) setTimeout(addPostBoostButton, 1000);

            var boostButton = $('.boost-link');
            if (!boostButton.length) {


                boostButton = $('<li class="PopoverMenuItem boost-link"><a role="presentation"><i class="iconfont icon-flashlight_fill"></i><span>Boost</span></a></li>');

                boostButton.on('click', function() {
                    $(boostButton).parent().parent().parent().parent().parent().parent().parent().addClass('ant-popover-hidden');
                    modal = null;
                    urlBooster = window.location.href;
                    matchBooster = urlBooster.match(/^.*\/@([^\/]*)\/(.*)$/);
                    authorBooster = matchBooster[1];
                    permlinkBooster = matchBooster[2];
                    createMinnowBoosterTransferUI();
                    $('#myModal').show();

                });

                $('.Buttons__post-menu').click(function() {
                    setTimeout(function() {
                        $('.PopoverMenu').each(function() {
                            if ($(this).find('.boost-link').length === 0) {
                                $('.PopoverMenu').append(boostButton);
                            }
                        });
                    }, 500);
                });

                $('.StoryFull__header__more').click(function() {
                    setTimeout(function() {
                        $('.PopoverMenu').each(function() {
                            if ($(this).find('.boost-link').length === 0) {
                                $('.PopoverMenu').append(boostButton);
                            }
                        });
                    }, 500);
                });


            } else {
                retryCountBoostButton++;
                timeoutBoostButton = setTimeout(function() {
                    addPostBoostButton();
                }, 1000);
            }
        }
    }

}

function changeUIBooster(value) {
    $('#modalContent').remove();
    if (value === 'MinnowBooster') createMinnowBoosterTransferUI();
    else if (value === 'PostPromoter') createPostPromoterTransferUI();
}

async function createPostPromoterTransferUI() {

  console.log("Create");
  var classModalLocation = '';
  if(isSteemit) classModalLocation = '.reveal';
  else if(isBusy) classModalLocation = '.modal-content-busy';
    var transferUI = $('\
    <div id="modalContent">\
      <div id="modalTitle" class="row">\
        <h3 class="column">Boost with <a href="/@postpromoter" target="_blank" rel="noopener">@postpromoter</a></h3>\
      </div>\
    </div>');
    modal.find(classModalLocation).append(transferUI);

    $('#modalTitle').after($('\
        <div class="row">\
          <div class="column small-2" style="padding-top: 5px;">To</div>\
            <div class="column small-10">\
              <div class="input-group" style="margin-bottom: 1.25rem;">\
                <span class="input-group-label">@</span>\
                <select id="selectBooster" name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">\
                  <option value="MinnowBooster">MinnowBooster</option>\
                  <option value="PostPromoter" selected>PostPromoter</option>\
                </select>\
              </div>\
              <p></p>\
            </div>\
          </div>\
        </div>\
        <div class="bootstrap-wrapper">\
          <div class="container">\
          <h3>PostPromoter information</h3><br>\
            <div id="postPromoterInformation" class="row">\
            </div>\
          </div>\
        </div>\
        <br>\
        <br>\
        <div class="row">\
          <div class="input-group" style="margin-bottom: 5px;">\
            <input id="amountPostPromoter" type="number" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
            <span class="input-group-label" style="padding-left: 0px; padding-right: 0px; min-width: 5rem; height: inherit; border: none; text-align:center;" >\
              <select id="currency" name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">\
                <option value="SBD" selected>SBD</option>\
                <option value="STEEM" selected>STEEM</option>\
              </select>\
            </span>\
          </div>\
          <button id="submitPostPromoter" type="submit" disabled="" class="Action button">Submit</button>\
        </div>'));
        const result=  await steem.api.getAccountsAsync(['postpromoter']);
        console.log(result);
        const account=result[0];
        var vp= await window.SteemPlus.Utils.getVotingPowerPerAccount(account);
        var timeBeforeVote=window.SteemPlus.Utils.getTimeBeforeFull(vp*100);

        console.log(vp,timeBeforeVote);
        $('#postPromoterInformation').html("<div><strong>Min / Max Post age:</strong> 20 mins / 3.5 days</div><div><strong>Time before vote: </strong>"+timeBeforeVote+"</div><br><div><strong>Expected upvote</strong> (+/- 10%): <span id='expected_vote'></span></div>");
        $('#expected_vote').html("$0");

    $('#selectBooster').unbind('change').on('change', function() {
        changeUIBooster(this.value);
    });

    $('#submitPostPromoter').unbind('click').click(function() {
        var amountPP = null;
        console.log(connect);
        if (!$('#amountPostPromoter').eq(0).val().includes('.'))
            amountPP = $('#amountPostPromoter').eq(0).val() + '.000';
        else
            amountPP = $('#amountPostPromoter').eq(0).val();
        if(!connect.connect||connect.method=="sc2"){ //Use SteemConnect
          console.log("sc2");
          scTransfer();
        }
        else //Use Keychain for Transfer
          steem_keychain.requestTransfer(connect.user,"postpromoter",parseFloat(amountPP).toFixed(3),"steemplus " + window.location.href,$('#currency option:selected').eq(0).val() ,function(result){
            if(!result.success) {
              scTransfer();
            }
          },false);
        function scTransfer(){
          console.log("sc");
          var url = 'https://v2.steemconnect.com/sign/transfer?to=' + encodeURIComponent('postpromoter') + '&amount=' + encodeURIComponent(parseFloat(amountPP).toFixed(3) + ' ' + $('#currency option:selected').eq(0).val()) + '&memo=' + encodeURIComponent("steemplus " + window.location.href);
          window.open(url, '_blank');
        }
    });

    $("#currency").on('change', function() {
        estimateVote(account);
    });

    $('#amountPostPromoter').on('input', function(e) {
        if ($('#amountPostPromoter')[0].value.length > 0) {
            $('#submitPostPromoter').attr('disabled', false);
            estimateVote(account);
        } else
            $('#submitPostPromoter').attr('disabled', true);
    });

    if (isBusy) {
        $('input').each(function() {
            $(this).eq(0).addClass('input-busy');
        });

        $('#selectBooster').each(function() {
            $(this).eq(0).addClass('select-busy');
        });
    }
}

function estimateVote(account){
  var bid_amount=$('#amountPostPromoter')[0].value;
  var vote_value=window.SteemPlus.Utils.getVotingDollarsPerAccount(100, account, globalVar.rewardBalance, globalVar.recentClaims, globalVar.steemPrice, globalVar.votePowerReserveRate,true);
  var vote_value_usd=vote_value*market.priceSBD/2+vote_value/2;
  var bid_value= bid_amount * ($("#currency option:selected").val()=="STEEM"?market.priceSteem:market.priceSBD) / (vote_value_usd*0.75) * vote_value;
  $('#expected_vote').html("$"+(bid_value*0.9).toFixed(3)+" ~ $"+(bid_value*1.1).toFixed(3));

}
/*function createSmartSteemTransferUI(){

  loading = $(window.SteemPlus.Utils.getLoadingHtml({
    center: true
  }));

  var classModalLocation = '';
  if(isSteemit) classModalLocation = '.reveal';
  else if(isBusy) classModalLocation = '.modal-content-busy';

  modal.find(classModalLocation).append(loading);

  var transferUI = $('\
    <div id="modalContent">\
      <div id="modalTitle" class="row">\
        <h3 class="column">Boost with <a href="/@smartmarket" target="_blank" rel="noopener">@smartmarket</a></h3>\
      </div>\
    </div>');

  $.ajax({
    type: "GET",
    beforeSend: function(xhttp) {
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("X-Parse-Application-Id", chrome.runtime.id);
    },
    url: 'https://smartsteem.com/api/general',
    success: function(result) {
      loading.remove();

      modal.find(classModalLocation).append(transferUI);
      $('#modalTitle').after($('\
        <div class="row">\
          <div class="column small-2" style="padding-top: 5px;">To</div>\
            <div class="column small-10">\
              <div class="input-group" style="margin-bottom: 1.25rem;">\
                <span class="input-group-label">@</span>\
                <select id="selectBooster" name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">\
                  <option value="MinnowBooster">MinnowBooster</option>\
                  <option value="SmartSteem" selected>SmartMarket (SmartSteem instant vote)</option>\
                </select>\
              </div>\
              <p></p>\
            </div>\
          </div>\
        </div>\
        <div class="bootstrap-wrapper">\
          <div class="container">\
          <i style="color:red;">Important : @Smartmarket is the vote buying account of @smartsteem</i><br>\
          <strong>Information SmartSteem</strong><br>\
            <div id="smartSteemInformation" class="row">\
            </div>\
          </div>\
        </div>\
        <br>\
        <br>\
        <div class="row">\
          <div class="input-group" style="margin-bottom: 5px;">\
            <input id="amountSmartSteem" type="number" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
            <span class="input-group-label" style="padding-left: 0px; padding-right: 0px; min-width: 5rem; height: inherit; border: none; text-align:center;" >\
              <select id="currency" name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">\
                <option value="SBD" selected>SBD</option>\
                <option value="STEEM" selected>STEEM</option>\
              </select>\
            </span>\
          </div>\
          <button id="submitSmartSteem" type="submit" disabled="" class="Action button">Submit</button>\
        </div>'));

      $('#selectBooster').unbind('change').on('change', function(){
        changeUIBooster(this.value);
      });

      $('#submitSmartSteem').unbind('click').click(function(){
        var valueSentSmartSteem = null;
        if(!$('#amountSmartSteem')[0].value.includes('.'))
          valueSentSmartSteem = $('#amountSmartSteem')[0].value + '.000';
        else
          valueSentSmartSteem = $('#amountSmartSteem')[0].value;

        var requestSmartSteem = 'https://v2.steemconnect.com/sign/transfer?to=' + encodeURIComponent('smartmarket') + '&amount=' + encodeURIComponent(parseFloat(valueSentSmartSteem).toFixed(3) + ' ' + $('#currency')[0].value) + '&memo=' + encodeURIComponent(window.location.href);
        var win = window.open(requestSmartSteem, '_blank');
          if (win) {
              //Browser has allowed it to be opened
              win.focus();
          } else {
              //Browser has blocked it
              alert('Please allow popups for this website');
          }
      });

      $('#amountSmartSteem').on('input',function(e){
        if($('#amountSmartSteem')[0].value.length > 0)
          $('#submitSmartSteem').attr('disabled', false);
        else
          $('#submitSmartSteem').attr('disabled', true);
      });


      $('#smartSteemInformation').append('<div class="col-5">Unrestricted value :</div><div class="col-7">' + parseInt(result.total_unrestricted).toFixed(2) + ' $</div>');
      $('#smartSteemInformation').append('<div class="col-5">1 star vote value :</div><div class="col-7">' + parseInt(result.total_one).toFixed(2) + ' $</div>');
      $('#smartSteemInformation').append('<div class="col-5">2 stars vote value :</div><div class="col-7">' + parseInt(result.total_two).toFixed(2) + ' $</div>');
      $('#smartSteemInformation').append('<div class="col-5">3 stars vote value :</div><div class="col-7">' + parseInt(result.total_three).toFixed(2) + ' $</div>');

      if(isBusy)
      {
        $('input').each(function(){
          $(this).eq(0).addClass('input-busy');
        });

        $('#selectBooster').each(function(){
          $(this).eq(0).addClass('select-busy');
        });
      }

    },
    error: function(msg) {
      $('#smartSteemInformation').append('<small style="color:red;">' + msg.responseJSON.error + '</small>');
      loading.remove();
    }
  });

}*/
