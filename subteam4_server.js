// Necessary methods: Create transaction/ checkout, process transaction, cancel transaction
// Need to use Stripe and/or PayPal API for checkout and payment processing

// MongoDB client module
const {MongoClient, UUID} = require('mongodb');
// http module
const http = require('http');

// Port
const host = 'localhost';
const port = (process.env.PORT || 8000);

// Regular Expression to match shopping cart requests
const regExpCart = new RegExp('^\/shopping_cart.*');
// Regular Expression to match transaction requests
const regExpTransaction = new RegExp('^\/transactions.*')

// Function to setup database connection
async function initiateDBConnection(response){

        // MongoDB connection logic
        const uri = "mongodb+srv://sebastian:partysafari@atlascluster.3edqt6a.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri);

        try {
            await client.connect(); 
            // Returning client to use
            return client;

        } catch (err){
            // Response Code: Service Unavailable
            response.writeHead(503);
            // Response Message
            response.end("Database not available");
            return null;
        }

}

// Funciton to add party to cart
async function addPartyToCart(request, response, party_id, user_id){
    // Connecting to database
    const client = await initiateDBConnection();
    let body = '';

    request.on('data', function(data) {
        body += data;
    });
    request.on('end', async function(){
        try{
            // Getting User's role
            const user_role = await client.db('PartySafari').collection('registered_user_profile').findOne({"user_id": user_id}, {"role": 1, "_id" : 0}).role;
            
            // If user is a party host, they cannot add to cart
            if (user_role == false){
                response.writeHead(403);
                response.end("Access Denied");
                return;
            }
 
            // Cart Collection
            const cartCollection = client.db('PartySafari').collection('shopping_cart');
        
            // User's current cart
            const current_cart = await cartCollection.findOne({ "user_id": user_id });

            // Finding price of party
            const party_details = await client.db('PartySafari').collection('party_listings').findOne({"party_id": party_id});
            const price_of_party = party_details.admission_fee;

            // If user does not have a cart
            if (current_cart == null){
                
                // Creating new cart for user
                const newCart = {
                    "user_id": user_id,
                    "cart_id": crypto.randomUUID(),
                    "parties": [party_id],
                    "cart_size": 1,
                    "total_price": price_of_party,
                };
                
                // Adding cart document to collection
                await cartCollection.insertOne(newCart); 

                // Setting header as JSON
                response.setHeader("Content-Type", "text/plain")
                // Response Code: OK
                response.writeHead(200);
                // Return new cart in Response Message
                response.end(`${party_details.name} added to cart`);
            }
            // If user already has a cart
            else{

                // Checking if party is already in cart
                if (current_cart.parties.includes(party_id)){
                    // Setting header as plain text
                    response.setHeader('Content-Type', "text/plain")
                    // Response Code: OK
                    response.writeHead(200);
                    // Response Message
                    response.end(`${party_details.name} already in cart`);
                }
                // If party is not already in cart, then add it
                else{
                    // Updating party array
                    current_cart.parties.push(party_id);
                    // Updating total price of cart
                    current_cart.total_price += price_of_party;
                    // Updating size of cart
                    current_cart.cart_size = current_cart.parties.length;

                    // Updating user cart
                    await cartCollection.replaceOne({ "user_id": user_id }, current_cart);

                    // Setting header as JSON
                    response.setHeader("Content-Type", "text/plain")
                    // Response Code: OK
                    response.writeHead(200);
                    // Return new cart in Response Message
                    response.end(`${party_details.name} added to cart`); 
                    }
            }
        } catch {
            // Response Code: Bad Request
            response.writeHead(400);
            // Response Message
            response.end("Bad Request");

        } finally{
            await client.close();
        }
    })
}

// Function to delete party from cart
async function deletePartyFromCart(request, response, party_id, user_id){
    const client = await initiateDBConnection();
    let body = '';

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', async function(data){
        try{
            // Cart Collection
            const cartCollection = client.db('PartySafari').collection('shopping_cart');

            // User's current cart
            const current_cart = await cartCollection.findOne({ "user_id": user_id });

            // Updating User's cart
            const updated_cart_length = current_cart.cart_size - 1;
            if (updated_cart_length < 0){
                updated_cart_length = 0;
            }

            // Finding price of party and updating cart total price
            const party_details = await client.db('PartySafari').collection('party_listings').findOne({"party_id": party_id});
            const price_of_party = party_details.admission_fee;
            const updated_cart_total_price = current_cart.total_price - price_of_party;
            if (updated_cart_total_price < 0){
                updated_cart_total_price = 0; 
            }
            await cartCollection.updateOne({ "user_id": user_id }, {$pull: {"parties": party_id}, $set: {"cart_size": updated_cart_length, "total_price": updated_cart_total_price}});

            const updated_user_cart = await cartCollection.findOne({ "user_id": user_id });

            // Setting header as JSON
            response.setHeader("Content-Type", "text/plain")
            // Response Code: OK
            response.writeHead(200);
            // Return new cart in Response Message
            response.end(`${party_details.name} removed from cart`);

        } catch{
            // Response Code: Bad Request
            response.writeHead(400);
            // Response Message
            response.end("Bad Request");

        } finally {
            await client.close();
        }

    })

}

// Function to get all parties in user's cart
async function getUserCart(request, response, user_id){
    let resMsg = {};
    const client = await initiateDBConnection();

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', async function(){
        try{
            // Getting User's role
            const user_role = await client.db('PartySafari').collection('registered_user_profile').findOne({"user_id": user_id}, {"role": 1, "_id" : 0}).role;
            
            // If user is a party host, they cannot access cart
            if (user_role === false){
                response.writeHead(403);
                response.end("Access Denied");
                return;
            }

            // Cart Collection
            const cartCollection = client.db('PartySafari').collection('shopping_cart');

            // User's current cart document
            const current_cart = await cartCollection.findOne({ "user_id": user_id });

            
            // If user does not have a cart
            if (current_cart == null){
                const user_cart = {
                    "user_id": user_id,
                    "cart_items": [],
                    "cart_total_price": 0.00
                };

                response.writeHead(200, {'Content-Type': 'application/json'});  
                response.end(JSON.stringify(user_cart));
            }
            // If user does have a cart
            else{
                let cart_total_price = 0;
                let cart_items = [];

                const parties = current_cart.parties;

                for (let i = 0; i < parties.length; i++){
                    const party_details = await client.db('PartySafari').collection('party_listings').findOne({"party_id": parties[i]});
                    let party = {
                        "party_id": party_details.party_id,
                        "party_name": party_details.name,
                        "party_price": party_details.admission_fee
                    };
                    cart_items.push(party);
                    cart_total_price += party_details.admission_fee
                }

                const user_cart = {
                    "user_id": user_id,
                    "cart_items": cart_items,
                    "cart_total_price": cart_total_price
                };
                
                response.writeHead(200, {'Content-Type': 'application/json'});     
                response.end(JSON.stringify(user_cart));
            }
        
        } catch(err){
            // Response Code: Bad Request
            response.writeHead(400);
            // Response Message
            response.end("Bad Request");
        } finally{
            await client.close();
        }
    })
}

// Function to get the party_id from the Request 
function getQueryParamsFromRequest(url, request){

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

// Function to handle requests
function applicationServer(request, response){
    let done = false

    // Requests

    // GET Request
    if (request.method == "GET"){
        // GET user's cart
        try{
            // If request is /shopping_cart
            if (regExpCart.test(request.url)) {
                // Getting query params
                const params = getQueryParamsFromRequest(request.url, request.method);
                // Checking if params is null
                if (params === null){
                    // Response Code: Bad Request
                    response.writeHead(400);
                    // Response Message
                    response.end("Bad Request. Query parameter is empty or invalid.");
                    done = true;
                } else {
                    const user_id = params;
                    // Calling function to add party to cart
                    getUserCart(request, response, user_id);
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
                const params = getQueryParamsFromRequest(request.url, request.method);
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
                    addPartyToCart(request, response, party_id, user_id);
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
                const params = getQueryParamsFromRequest(request.url, request.method);
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
                    deletePartyFromCart(request, response, party_id, user_id);
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

// Creating server
const server = http.createServer(applicationServer);
// Listening at port 8000
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
