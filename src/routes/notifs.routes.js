const http = require("http"); //import http module
const url = require("url"); //import url module
const controller = require("../controllers/notifs.controller.js"); //import controller module
const path = require("path"); //import path module
require("dotenv").config(); //import dotenv module

//function to get/pass query params for notifications
function getQueryParamsForNotifs(url, request) {
  //GET request
  if (request == "GET") {
    //get notif; url contains: /api/notifications/getNotif/?notif_id=notif_id
    if (url.includes("/getNotif")) {
      //regex to isolate notif_id
      const request_regex = new RegExp(
        /\/api\/notifications\/getNotif\/?\?notif_id=([^&]*)/
      );
      const match = url.match(request_regex);

      //check if there is a match
      if (match !== null && match[1] !== undefined && match[1] !== "") {
        const notif_id = match[1];
        return notif_id;
      } else {
        //no match found
        return null;
      }
    }
    //send notif thru email; url contains: /api/notifications/sendNotif/?notif_id=notif_id
    else if (url.includes("/sendNotif")) {
      //regex to isolate notif_id
      const request_regex = new RegExp(
        /\/api\/notifications\/sendNotif\/?\?notif_id=([^&]*)/
      );
      const match = url.match(request_regex);

      //check if there is a match
      if (match !== null && match[1] !== undefined && match[1] !== "") {
        const notif_id = match[1];
        return notif_id;
      } else {
        //no match found
        return null;
      }
    }
  }

  //POST request
  //create notif; body contains notif_text, URL contains: /api/notifications/createNotif?user_id={user_id}&host_id={host_id}
  else if (request == "POST" && url.includes("/createNotif")) {
    //Regex user_id, host_id, and notif_id
    const request_regex = new RegExp(
      /\/api\/notifications\/createNotif\/?\?user_id=([^&]*)&host_id=([^&]*)/
    );
    const match = url.match(request_regex);

    //If there is a match
    if (
      match !== null &&
      match[1] !== undefined &&
      match[1] !== "" &&
      match[2] !== undefined &&
      match[2] !== ""
    ) {
      const user_id = match[1];
      const host_id = match[2];
      return { user_id: user_id, host_id: host_id };
    } else {
      return null;
    }
  }

// PUT request to update notification; body contains notif_text, URL contains: /api/notifications/updateNotif?notif_id={notif_id}
else if (request === "PUT" && url.includes("/updateNotif")) {
  // Regex to isolate notif_id
  const request_regex = new RegExp(
    /\/api\/notifications\/updateNotif\/?\?notif_id=([^&]*)/
  );
  const match = url.match(request_regex);

  // Check if there is a match
  if (match !== null && match[1] !== undefined && match[1] !== "") {
    const notif_id = match[1];
    return notif_id;
  } else {
    // No match found
    return null;
  }
}
// ELSE IF for flipping notifications global boolean; URL contains: /api/notifications/flipNotificationsGlobal?user_id={user_id}
else if (request === "PUT" && url.includes("/flipNotificationsGlobal")) {
  // Regex to isolate user_id
  const request_regex = new RegExp(
    /\/api\/notifications\/flipNotificationsGlobal\/?\?user_id=([^&]*)/
  );
  const match = url.match(request_regex);

  // Check if there is a match
  if (match !== null && match[1] !== undefined && match[1] !== "") {
    const user_id = match[1];
    return user_id;
  } else {
    // No match found
    return null;
  }
}


  //DELETE request
  //delete notif; URL contains: /api/notifications/deleteNotif/?notif_id={notif_id}
  else if (request == "DELETE" && url.includes("/deleteNotif")) {
    //regex to isolate notif_id
    const request_regex = new RegExp(
      /\/api\/notifications\/deleteNotif\/?\?notif_id=([^&]*)/
    );
    const match = url.match(request_regex);

    //check if there is a match
    if (match !== null && match[1] !== undefined && match[1] !== "") {
      const notif_id = match[1];
      return notif_id;
    } else {
      //no match found
      return null;
    }
  }
}

// Function to handle requests
function applicationServer(request, response) {
  let done = false; //boolean to check if request is done
  const parsedUrl = url.parse(request.url, true); //parse url
  const pathName = parsedUrl.pathname; //get pathname

  //!Routing for notifications API

  //GET request; get notif or send notif
  if (request.method == "GET") {
    try {
      //if get notif; url contains: /api/notifications/getNotif/?notif_id=notif_id
      if (pathName.includes("/getNotif")) {
        //get params
        const notif_id = getQueryParamsForNotifs(request.url, request.method);

        //check if params are valid
        if (notif_id === null) {
          response.writeHead(400); //Response Code: Bad Request
          response.end(
            "Bad Request. One or more query parameters are empty or invalid."
          ); //Response Message
          done = true; //request is done
        } else {
          //Calling function to get notification
          controller.getNotif(request, response, notif_id); //get notif
          done = true; //request is done
        }
      }

      //if send notif; url contains: /api/notifications/sendNotif/?notif_id=notif_id
      else if (pathName.includes("/sendNotif")) {
        //get params
        const notif_id = getQueryParamsForNotifs(request.url, request.method);

        //check if params are valid
        if (notif_id === null) {
          response.writeHead(400); //Response Code: Bad Request
          response.end(
            "Bad Request. One or more query parameters are empty or invalid."
          ); //Response Message
          done = true; //request is done
        } else {
          //Calling function to send notification
          controller.sendNotif(request, response, notif_id); //send notif
          done = true; //request is done
        }
      }
    } catch (error) {
      response.writeHead(400); //Response Code: Bad Request
      response.end("Bad Request"); //Response Message
      done = true; //request is done
    }
  }

  //POST request; create notif
  else if (request.method == "POST") {
    try {
      //if create notif
      if (pathName.includes("/createNotif")) {
        //get params
        const params = getQueryParamsForNotifs(request.url, request.method);
        //check if params are valid
        if (params === null) {
          response.writeHead(400); //Response Code: Bad Request
          response.end(
            "Bad Request. One or more query parameters are empty or invalid."
          ); //Response Message
          done = true; //request is done
        } else {
          const user_id = params.user_id; //user_id
          const host_id = params.host_id; //host_id
          // Calling function to add party to cart
          controller.createNotif(request, response, user_id, host_id); //create notif
          done = true; //request is done
        }
      }
    } catch (ex) {
      response.writeHead(400); //Response Code: Bad Request
      response.end("Bad Request"); //Response Message
      done = true; //request is done
    }
  }

 // PUT request; update notif
else if (request.method === "PUT") {
  try {
    // If updating notif
    if (pathName.includes("/updateNotif")) {
      // Get params
      const notif_id = getQueryParamsForNotifs(request.url, request.method);
      // Check if params are valid
      if (notif_id === null) {
        response.writeHead(400); // Response Code: Bad Request
        response.end("Bad Request. One or more query parameters are empty or invalid."); // Response Message
        done = true; // Request is done
      } else {
        controller.updateNotif(request, response, notif_id); // Update notif
        done = true; // Request is done
      }
    }
    // If flipping notifications global boolean
    else if (pathName.includes("/flipNotificationsGlobal")) {
      // Get params
      const user_id = getQueryParamsForNotifs(request.url, request.method);
      // Check if params are valid
      if (user_id === null) {
        response.writeHead(400); // Response Code: Bad Request
        response.end("Bad Request. One or more query parameters are empty or invalid."); // Response Message
        done = true; // Request is done
      } else {
        controller.flipNotificationsGlobal(request, response, user_id); // Flip notifications global
        done = true; // Request is done
      }
    }
  } catch (ex) {
    response.writeHead(400); // Response Code: Bad Request
    response.end("Bad Request"); // Response Message
    done = true; // Request is done
  }
}


  //DELETE request; delete notif
  else if (request.method == "DELETE") {
    try {
      //if delete notif
      if (pathName.includes("/deleteNotif")) {
        // Getting query params
        const notif_id = getQueryParamsForNotifs(request.url, request.method);
        // Checking if params is null
        if (notif_id === null) {
          // Response Code: Bad Request
          response.writeHead(400);
          // Response Message
          response.end(
            "Bad Request. One or more query parameters are empty or invalid."
          );
          done = true;
        } else {
          // Calling function to add notification
          controller.deleteNotif(request, response, notif_id);
          done = true;
        }
      }
    } catch (ex) {
      // Response Code: Bad Request
      response.writeHead(400);
      // Response Message
      response.end("Bad Request");
    }
  }

  if (done == false) {
    response.writeHead(404), response.end("Not Found; check regex");
  }
}

module.exports = {
  applicationServer,
};
