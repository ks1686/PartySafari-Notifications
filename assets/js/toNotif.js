function toNotif(targetElement) {
  //Get the user ID from the URL
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var userID = urlParams.get("user_id");

  //Redirect to notification management dashboard
  window.location.href = `http://localhost:3000/notifications?user_id=${userID}`;
}
