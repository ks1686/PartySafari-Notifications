// NodeJS modules
// Necessary methods: add to cart, delete item from cart, edit cart sections/labels
// MongoDB client module
const { MongoClient} = require('mongodb');
// http module
const http = require('http');
// module to query string
const querystr = require('querystring');

// Port
const port = (process.env.PORT || 8000);

// Regular Expression to match cart requests
const regExpCart = new RegExp('^\/cart.*');

// Function to setup database connection
async function initiateDBConnection(){

        // MongoDB connection logic
        const uri = "mongodb+srv://sebastian:partysafari@atlascluster.3edqt6a.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri);

        try {
            await client.connect(); 

        } catch (err){
            console.error(err);

        } finally{
            await client.close()
        }
        // Returning client to use
        return client
}

// Funciton to add party to cart
function addPartyToCart(request, reponse, user_id, body){
    
    let resMsg = {};
    const client = initiateDBConnection();
    let body = '';

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function(){
        try{
            // party_id is the primary key 
            parsed = JSON.parse(body);
            

        }

    })
}

function applicationServer(request, reponse){
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

    if (request.method == "GET"){

    }
    else if (request.method == "POST"){

    } 
    else if (request.method == "PATCH"){
        // Add Party to cart
        try{
            if (regExpCart.test(request.url)) {

                addPartyToCart(request, reponse);
                done = true;
            }
        }
        catch (ex){
        }

    }
    else if (request.method == "DELETE"){

    }
};

// Starting the web server to wait for client HTTP requests
const webServer = http.createServer(applicationServer);
webServer.listen(port);
