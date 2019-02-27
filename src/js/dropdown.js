chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.to === 'drop' && request.order === 'click')
        startDropdown(request.data.market);
});


function startDropdown(market_d) {
  if($('span.DropdownMenu > ul.VerticalMenu').eq(0).parent().hasClass("show"))
      $(".dropdown-content").css("visibility","hidden");

    if ($('.market-item').length > 0)
        return;

    setTimeout(function() {
        if ($('span.DropdownMenu > ul.VerticalMenu').length !== 0) {
            var i = 0;
            var li = document.createElement('li');
            var li2 = document.createElement('li');
            var xhttp = new XMLHttpRequest();

            li.innerHTML = '<a class="market-item" href="/market"><span class="Icon " style="display: inline-block; width: 1.12rem; height: 1.12rem;"><img src="' + chrome.extension.getURL("src/img/steemblack.svg") + '"/></span>Market</a>';

            if ($('span.DropdownMenu > ul.VerticalMenu > .title').length !== 0) {
                var divSlider = $('<div class="my-slider" style="display:none;">\
                            <ul>\
                              <li class="price-item"><a href="/market">1 STEEM = ' + Math.round(market_d.SBDperSteem * 1000) / 1000 + ' SBD</a></li>\
                              <li class="price-item"><a href="https://bittrex.com/Market/Index?MarketName=BTC-steem">1 STEEM = ' + Math.round(market_d.priceSteem * 1000) / 1000 + '$</a></li>\
                              <li class="price-item"><a href="https://bittrex.com/Market/Index?MarketName=BTC-sbd">1 SBD = ' + Math.round(market_d.priceSBD * 1000) / 1000 + '$</a></li>\
                            </ul>\
                          </div>');

                $('span.DropdownMenu > ul.VerticalMenu').append(li);
                $(li2).append(divSlider);
                $('span.DropdownMenu > ul.VerticalMenu').append(li2);
                $(function() {
                    $('.my-slider').unslider({
                        keys: true,
                        autoplay: true,
                        nav: false,
                        arrows: false
                    });
                    $('.my-slider').show();
                });
                $(li).parent().css('width', '15rem');
            }
        }
    }, 200);
}
