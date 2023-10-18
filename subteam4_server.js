// NodeJS modules

// Necessary methods: add to cart, delete item from cart, edit cart sections/labels, get all parties in cart

// MongoDB client module
const { MongoClient} = require('mongodb');
// http module
const http = require('http');
// module to query string
const querystr = require('querystring');
// UUID module to create IDs
const uuid = require('uuid');

// Port
const port = (process.env.PORT || 8000);

// Regular Expression to match cart requests
const regExpCart = new RegExp('^\/shopping_cart.*');

// Function to setup database connection
async function initiateDBConnection(){

        // MongoDB connection logic
        const uri = "mongodb+srv://sebastian:partysafari@atlascluster.3edqt6a.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri);

        try {
            await client.connect(); 

        } catch (err){
            console.error(err);
        } finally {
            client.close();
        }
        // Returning client to use
        return client
}

// IDK what this does
function setHeader(resMsg){
    if (!resMsg.headers || resMsg.headers === null) {
        resMsg.headers = {};
      }
      if (!resMsg.headers["Content-Type"]) {
        resMsg.headers["Content-Type"] = "application/json";
      }

}

// Funciton to add party to cart
async function addPartyToCart(request, response){
    let resMsg = {};
    const client = await initiateDBConnection();
    let body = '';

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', async function(){
        try{
            
            // party_id is the primary key 
            const parsed = JSON.parse(body);
            
            // Cart Collection
            const cartCollection = client.db('PartySafari').collection('shopping_cart');
            console.log(cartCollection);

            // User's current cart
            const current_cart = await cartCollection.findOne({ 'user_id': parsed.user_id });
            
            let total_price = await client.db('PartySafari').collection('party_listings').findOne({"party_id": parsed.party_id}).admission_fee;
            // If user does not have a cart
            if (!current_cart){
                // Finding price of party
                const newCart = {
                    user_id: parsed.user_id,
                    cart_id: uuid.v5(),
                    parties: [parsed.party_id],
                    cart_size: 1,
                    total_price: total_price,
                }
                // Adding cart document to collection
                await cartCollection.insertOne(newCart); 

                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(newCart));
            }
            else{
                current_cart.parties.push(parsed.party_id);
                current_cart.total_price += total_price;
                current_cart.cart_size = current_cart.parties.length;

                await cartCollection.replaceOne({ user_id: parsed.user_id }, current_cart);

            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(current_cart));
            }
            resMsg.code = 500;
            resMsg.message = "Server Error";
        } finally{
            await client.close();
        }
        return resMsg
    })
}

// Function to get all parties in cart
async function getAllPartiesInCart(request, response, body){
    let resMsg = {};
    const client = await initiateDBConnection();

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', async function(){
        try{
            // party_id is the primary key 
            parsed = JSON.parse(body);
            const cartCollection = client.db('Party Safari').collection('cart');
            
        
        } catch(err){
            
        }
    })
}

function applicationServer(request, response){
    let done = false, resMsg = {};

    // Parsing the URL in the request
    let urlParts = [];
    let segments = request.url.split('/');

    for (let i = 0; i < segments.length; i++ ){
        // Checking for trailing "/" or double "//"
        if (segments[i] !== ""){
            urlParts.push(segments[i]);
        }
    }
    console.log(urlParts);

    // Requests

    // GET Request
    if (request.method == "GET"){
        // Get all parties in cart
        try{
            if (regExpCart.test(request.url)) {

                getAllPartiesInCart(request, response);
                done = true;
            }
        }
        catch (ex){
        }
    }

    // POST Request
    else if (request.method == "POST"){

    } 
    // PATCH Request
    else if (request.method == "PATCH"){
        // Add Party to cart
        try{
            if (regExpCart.test(request.url)) {
                addPartyToCart(request, response);
                done = true;
            }
        }
        catch (ex){
        }

    }
    // DELETE Request
    else if (request.method == "DELETE"){

    }

    if(done == false) {
        resMsg.code = 404;
        resMsg.body = "Not Found";
        setHeader(resMsg)
        response.writeHead(404, resMsg.hdrs),
        response.end(resMsg.body);
      }

};

// Starting the web server to wait for client HTTP requests
const server = http.createServer(applicationServer);
server.listen(port);
