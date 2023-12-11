function createFacebookShareButton(targetDiv) {
  //Get the party id from the URL
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var id = urlParams.get("party_id");

  //Get the URL of the current page
  var url = window.location.href; //Not currently used; refers to local url at the moment

  // Initialize the Facebook SDK
  window.fbAsyncInit = function () {
    FB.init({
      appId: "your-app-id", // Replace with your actual Facebook App ID
      xfbml: true,
      version: "v18.0",
    });
  };

  // Load Facebook SDK
  var facebookSdkScript = document.createElement("script");
  facebookSdkScript.id = "party_id";
  facebookSdkScript.async = true;
  facebookSdkScript.defer = true;
  facebookSdkScript.crossorigin = "anonymous";
  facebookSdkScript.src = "https://connect.facebook.net/en_US/sdk.js";
  targetDiv.appendChild(facebookSdkScript);

  //Create Facebook URL
  let fbURL = `https://partysafari.com/party_listings?partyid=` + id; //Potentially just use URL of current page

  //Create Facebook Share Button
  const fbButton = document.createElement("a");
  fbButton.setAttribute("class", "fb-share-button");
  fbButton.setAttribute("data-href", fbURL);
  fbButton.setAttribute("data-layout", "button");
  fbButton.setAttribute("data-size", "large");
  fbButton.setAttribute("data-mobile-iframe", "true");
  document.body.appendChild(fbButton);

  targetDiv.appendChild(fbButton);
}
