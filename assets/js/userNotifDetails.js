var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var userID = urlParams.get("user_id");

//Get the user's notifications
const userNotifDetails = getNotifDetails(userID);

userNotifDetails.then((data) => {
  loadNotifDetails(data);
});

function loadNotifDetails(data) {
  //Get the user notification parameters (enabled, disabled, etc)
}
