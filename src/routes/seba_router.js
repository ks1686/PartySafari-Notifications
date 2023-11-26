// http module
const http = require('http');
// url module
const url = require('url');

require("dotenv").config();
const controller = require('../controllers/seba_controller.js');

// Regular Expression to match shopping cart requests
const regExpCart = new RegExp('^\/shopping_cart.*');
// Regular Expression to match transaction requests
const regExpTransaction = new RegExp('^\/transactions.*');
// Regular Expression to match promotions requests
const regExpPromotions = new RegExp('^\/promotions.*')

// Function to get query params from cart requests
function getQueryParamsForCart(url, request){

    if (request == "POST"){
        // Regex
        const request_regex = new RegExp(/(?:mk=([^&]*)&user_id=([^&]*)|user_id=([^&]*)&mk=([^&]*))/);
        const match = url.match(request_regex);

        // If there is a match
        if (match !== null && match[1] !== undefined && match[2] !== undefined && match[1] !== "" && match[2] !== ""){
            const party_id = match[1];
            const user_id = match[2];
            return {party_id, user_id};
        }
        else if (match !== null && match[3] !== undefined && match[4] !== undefined && match[3] !== "" && match[4] !== ""){
            const party_id = match[4];
            const user_id = match[3];
            return {party_id, user_id};
        }
        else{
            return null;
        }

    } else if (request == "DELETE"){
        // Regex
        const request_regex = new RegExp(/(?:rm=([^&]*)&user_id=([^&]*)|user_id=([^&]*)&rm=([^&]*))/);
        const match = url.match(request_regex);

        // If there is a match
        if (match !== null && match[1] !== undefined && match[2] !== undefined && match[1] !== "" && match[2] !== ""){
            const party_id = match[1];
            const user_id = match[2];
            return {party_id, user_id};
        }
        else if (match !== null && match[3] !== undefined && match[4] !== undefined && match[3] !== "" && match[4] !== ""){
            const party_id = match[4];
            const user_id = match[3];
            return {party_id, user_id};
        }
        else{
            return null;
        }
    }
    else if (request == "GET"){
        // Regex
        const request_regex = new RegExp(/\/shopping_cart\?user_id=([^&]*)/);
        const match = url.match(request_regex);

        // If there is a match
        if (match !== null && match[1] !== undefined && match[1] !== ""){
            const user_id = match[1];
            return user_id;
        }
        else{
            return null;
        }
    }
}

// Function to get query params from transaction requests
function getQueryParamsForTransaction(url, request){

    if (request == "POST"){
        // Regex
        const request_regex = new RegExp(/(?:mk=([^&]*)&user_id=([^&]*)|user_id=([^&]*)&mk=([^&]*))/);
        const match = url.match(request_regex);

        // If there is a match
        if (match !== null && match[1] !== undefined && match[2] !== undefined && match[1] !== "" && match[2] !== ""){
            const party_id = match[1];
            const user_id = match[2];
            return {party_id, user_id};
        }
        else if (match !== null && match[3] !== undefined && match[4] !== undefined && match[3] !== "" && match[4] !== ""){
            const party_id = match[4];
            const user_id = match[3];
            return {party_id, user_id};
        }
        else{
            return null;
        }

    }
    else if (request == "GET"){
        // Regex
        const request_regex = new RegExp(/\/transactions\?user_id=([^&]*)/);
        const match = url.match(request_regex);

        // If there is a match
        if (match !== null && match[1] !== undefined && match[1] !== ""){
            const user_id = match[1];
            return user_id;
        }
        else{
            return null;
        }
    }
}

// Function to handle requests
function applicationServer(request, response){
    let done = false
    const parsedUrl = url.parse(request.url, true);
    const pathName = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Requests

    // GET Request
    if (request.method == "GET"){
        // GET user's cart
        try{
            // If request is /shopping_cart
            if (regExpCart.test(request.url)) {
                // Getting query params
                const params = getQueryParamsForCart(request.url, request.method);
                // Checking if params is null
                if (params === null){
                    // Response Code: Bad Request
                    response.writeHead(400);
                    // Response Message
                    response.end("Bad Request. Query parameter is empty or invalid.");
                    done = true;
                } else {
                    const user_id = params;
                    // Calling function to get user cart
                    controller.getUserCart(request, response, user_id);
                    done = true;
                }
            }
            // If request is /promotions
            else if (regExpPromotions.test(request.url)){
                controller.getPromotedParties(request, response);
                done = true;
            }
            // If request is /transactions
            else if (regExpTransaction.test(request.url)){
                const user_id = getQueryParamsForTransaction(request.url, request.method);
                // Checking if user_id is null
                if (user_id == null){
                    // Response Code: Bad Request
                    response.writeHead(400);
                    // Response Message
                    response.end("Bad Request. Query parameter is empty or invalid.");
                    done = true;
                } else {
                    // Calling function to get user transaction history
                    controller.getTransactionHistory(request, response, user_id);
                    done = true;
                }
            }
        }
        catch (ex){
            // Response Code: Bad Request
            response.writeHead(400);
            // Response Message
            response.end("Bad Request");
            done = true;
        }
    }

    // POST Request
    else if (request.method == "PATCH"){

    } 

    // PATCH Request
    else if (request.method == "POST"){
        // Add Party to cart
        try{
            // If request is /shopping_cart
            if (regExpCart.test(request.url)) {
                // Getting query params
                const params = getQueryParamsForCart(request.url, request.method);
                // Checking if params is null
                if (params === null){
                    // Response Code: Bad Request
                    response.writeHead(400);
                    // Response Message
                    response.end("Bad Request. One or more query parameters are empty or invalid.");
                    done = true;
                } else {
                    const party_id = params.party_id;
                    const user_id = params.user_id;
                    // Calling function to add party to cart
                    controller.addPartyToCart(request, response, party_id, user_id);
                    done = true;
                }
            }
            else if (request.url == '/create-checkout-session'){
                // Calling function to process payment
                controller.processPayment(request, response);
                done = true;
            }
            // If request is /transactions
            else if (regExpTransaction.test(request.url)){
                if (query.mk && query.user_id){
                    // Getting query params
                    const params = getQueryParamsForTransaction(request.url, request.method);
                    // Checking if params is null
                    if (params === null){
                        // Response Code: Bad Request
                        response.writeHead(400);
                        // Response Message
                        response.end("Bad Request. One or more query parameters are empty or invalid.");
                        done = true;
                    } else {
                        const party_id = params.party_id;
                        const user_id = params.user_id;
                        // Calling function to create transaction
                        controller.createTransaction(request, response, party_id, user_id);
                        done = true;
                    }
                }
                else{
                    // Response Code: Bad Request
                    response.writeHead(400);
                    // Response Message
                    response.end("Bad Request. One or more query parameters are empty or invalid.");
                    done = true;
                }
            }
        }
        catch (ex){
            // Response Code: Bad Request
            response.writeHead(400);
            // Response Message
            response.end("Bad Request");
            done = true;
        }
    }

    // DELETE Request
    else if (request.method == "DELETE"){
        // Delete party from cart
        try{
            // If request is /shopping_cart
            if (regExpCart.test(request.url)) {
                // Getting query params
                const params = getQueryParamsForCart(request.url, request.method);
                // Checking if params is null
                if (params === null){
                    // Response Code: Bad Request
                    response.writeHead(400);
                    // Response Message
                    response.end("Bad Request. One or more query parameters are empty or invalid.");
                    done = true;
                } else {
                    const party_id = params.party_id;
                    const user_id = params.user_id;
                    // Calling function to add party to cart
                    controller.deletePartyFromCart(request, response, party_id, user_id);
                    done = true;
                }
            }
            else if (regExpTransaction.test(request.url)){
                try{
                    if (query.rm){
                        const transaction_id = query.rm;
                        controller.cancelTransaction(request, response, transaction_id);
                        done = true;
                    } else{
                        // Response Code: Bad Request
                        response.writeHead(400);
                        // Response Message
                        response.end("Bad Request. One or more query parameters are empty or invalid.");
                        done = true;
                    }
                } catch (error){
                    // Response Code: Bad Request
                    response.writeHead(400);
                    // Response Message
                    response.end("Bad Request");
                    done = true;
                }
            }
        }
        catch (ex){
            // Response Code: Bad Request
            response.writeHead(400);
            // Response Message
            response.end("Bad Request");
        }
    }

    if(done == false) {
        response.writeHead(404),
        response.end("Not Found");
    }

};

module.exports = {
    applicationServer
};