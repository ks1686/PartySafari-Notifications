function createTwitterShareButton(targetDiv) {
  //Get the party id from the URL
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var id = urlParams.get("party_id");

  //Get the URL of the current page
  var url = window.location.href; //Not currently used; refers to local url at the moment

  // Load Twitter widgets.js
  var twitterScript = document.createElement("script");
  twitterScript.async = true;
  twitterScript.src = "https://platform.twitter.com/widgets.js";
  twitterScript.charset = "utf-8";
  targetDiv.appendChild(twitterScript);

  var twitterShareButton = document.createElement("a");
  twitterShareButton.href = "https://twitter.com/share?ref_src=twsrc%5Etfw";
  twitterShareButton.className = "twitter-share-button";
  twitterShareButton.setAttribute("data-text", "Come to this sick party!");
  twitterShareButton.setAttribute(
    "data-url",
    "https://partysafari.com/party_listings?partyid=" + id
  ); //Potentially just use URL of current page
  twitterShareButton.setAttribute("data-lang", "en");
  twitterShareButton.setAttribute("data-show-count", "false");
  twitterShareButton.textContent = "Tweet";

  targetDiv.appendChild(twitterShareButton);
}
