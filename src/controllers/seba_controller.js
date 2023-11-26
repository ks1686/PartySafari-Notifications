// MongoDB client module
const {MongoClient} = require('mongodb');

require("dotenv").config();

// Function to setup database connection
async function initiateDBConnection(response){
    // MongoDB connection logic
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASSWORD}@atlascluster.bvzvel0.mongodb.net/?retryWrites=true&w=majority`;
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

// Funciton to add party to cart (POST /shopping_cart?mk={party_id}?user_id={user_id})
async function addPartyToCart(request, response, party_id, user_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    let body = '';

    request.on('data', function(data) {
        body += data;
    });
    request.on('end', async function(){
        try{
            // Getting User's role
            const user_role = await client.db('test_db').collection('registered_user_profile').findOne({"user_id": user_id}, {"role": 1, "_id" : 0}).role;
            
            // If user is a party host, they cannot add to cart
            if (user_role == false){
                response.writeHead(403);
                response.end("Access Denied");
                return;
            }
 
            // Cart Collection
            const cartCollection = client.db('test_db').collection('shopping_cart');
        
            // User's current cart
            const current_cart = await cartCollection.findOne({ "user_id": user_id });

            // Finding price of party
            const party_details = await client.db('test_db').collection('party_listings').findOne({"party_id": party_id});
            const price_of_party = party_details.admission_fee;

            // If user does not have a cart
            if (current_cart === null){
                
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
                // Response Code: Created
                response.writeHead(201);
                // Return new cart in Response Message
                response.end(`${party_details.name} added to cart`);
            }
            // If user already has a cart
            else{

                // Checking if party is already in cart
                if (current_cart.parties.includes(party_id)){
                    // Setting header as plain text
                    response.setHeader('Content-Type', "text/plain")
                    // Response Code: Conflict
                    response.writeHead(409);
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
                    // Response Code: Created
                    response.writeHead(201);
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

// Function to delete party from cart (DELETE /shopping_cart?rm={party_id}?user_id={user_id})
async function deletePartyFromCart(request, response, party_id, user_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    let body = '';

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', async function(data){
        try{
            // Cart Collection
            const cartCollection = client.db('test_db').collection('shopping_cart');

            // User's current cart
            const current_cart = await cartCollection.findOne({ "user_id": user_id });

            // Getting party details
            const party_details = await client.db('test_db').collection('party_listings').findOne({"party_id": party_id});
            
            if (current_cart && current_cart.parties.includes(party_id)){
                // Updating User's cart
                const updated_cart_length = current_cart.cart_size - 1;
                if (updated_cart_length < 0){
                    updated_cart_length = 0;
                }

                // Finding price of party and updating cart total price
                const price_of_party = party_details.admission_fee;
                const updated_cart_total_price = current_cart.total_price - price_of_party;
                if (updated_cart_total_price < 0){
                    updated_cart_total_price = 0; 
                }
                await cartCollection.updateOne({ "user_id": user_id }, {$pull: {"parties": party_id}, $set: {"cart_size": updated_cart_length, "total_price": updated_cart_total_price}});

                const updated_user_cart = await cartCollection.findOne({ "user_id": user_id });

                // Setting header as JSON
                response.setHeader("Content-Type", "application/json")
                // Response Code: OK
                response.writeHead(200);
                // Return new cart in Response Message
                response.end(JSON.stringify(updated_user_cart));
            }
            else{
                // Response Code: Not Found
                response.writeHead(404);
                // Return a message indicating that the party is not in the cart
                response.end(`${party_details.name} is not in cart`);
            }
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

// Function to get all parties in user's cart (GET /shopping_cart?user_id={user_id})
async function getUserCart(request, response, user_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    let body = '';

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', async function(){
        try{
            // Getting User's role
            const user_role = await client.db('test_db').collection('registered_user_profile').findOne({"user_id": user_id}, {"role": 1, "_id" : 0}).role;
            
            // If user is a party host, they cannot access cart
            if (user_role === false){
                response.writeHead(403);
                response.end("Access Denied");
                return;
            }

            // Cart Collection
            const cartCollection = client.db('test_db').collection('shopping_cart');

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
                    const party_details = await client.db('test_db').collection('party_listings').findOne({"party_id": parties[i]});
                    const host_information = await client.db('test_db').collection('party_host_information').findOne({"host_id": party_details.host_id});
                    
                    let party = {
                        "party_id": party_details.party_id,
                        "party_name": party_details.name,
                        "host_name": host_information.name,
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

// Function to create new transaction/checkout (POST /transactions?mk={transaction_id})
async function createTransaction(request, response, party_id, user_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    let body = '';

    request.on('data', function(data) {
        body += data;
    });
    request.on('end', async function(){
        try{
            // Getting party details
            const party_details = await client.db('test_db').collection('party_listings').findOne({"party_id": party_id});
            // Getting attendance list of party
            const attendance_list = await client.db('test_db').collection('attendance_list').findOne({'party_id': party_id});
            
            // Checking if party is full
            if (attendance_list.attendees.length === party_details.maximum_capacity){
                response.writeHead(200);
                response.end("Party is at maximum capacity! Cannot purchase ticket");
                return;
            }

            // 15 minute timer for user to complete transaction
            setTimeout(async () => {
                console.log("Time is up! Transaction automatically cancelled")
                await client.db('test_db').collection('transactions').deleteOne({'transaction_id': new_transaction.transaction_id}); 
                return;
            }, 900000);

            // Getting transaction data collection
            const transactions_collection = client.db('test_db').collection('transactions');

            // Getting price of party (discounted or not)
            let price_of_party = 0;
            const discounted_parties = await client.db('test_db').collection('discounted_parties').findOne({"party_id": party_id});
            if (discounted_parties !== null){
                price_of_party = discounted_parties.discounted_price;
            } else {
                price_of_party = party_details.admission_fee;
            }

            // Inserting new transaction document into transaction data collection
            const new_transaction = {
                "transaction_id": crypto.randomUUID(),
                "user_id": user_id,
                "host_id": party_details.host_id,
                "party_id": party_id,
                "total": price_of_party
            };
            await transactions_collection.insertOne(new_transaction);

            // Getting party host information
            const host_information = await client.db('test_db').collection('party_host_information').findOne({"host_id": party_details.host_id});

            // Creating order summary to be shown to user
            const order_summary = {
                "transaction_id": new_transaction.transaction_id,
                "party_name": party_details.name,
                "host_name": host_information.name,
                "total": price_of_party
            };

            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(order_summary));

        } catch (error){
            // Response Code: Bad Request
            response.writeHead(400);
            // Response Message
            response.end("Bad Request");

        }
    });
}

// Function to process payment and checkout (POST /create-checkout-session)
async function processPayment(request, response){
    let body = '';
    let session;

    request.on('data', function(data) {
        body += data;
    });
    request.on('end', async function(){
        try{
            const client = await initiateDBConnection();
            const transaction_id = JSON.parse(body).transaction_id;
            const transaction = await client.db('test_db').collection('transactions').findOne({'transaction_id': transaction_id});
            const party_details = await client.db('test_db').collection('party_listings').findOne({'party_id': transaction.party_id});
            const party_name = party_details.name;
            const transaction_price = transaction.total * 100;
            
            // PAYMENT PROCESSING LOGIC USING STRIPE API
            const stripe = require('stripe')(process.env.STRIPE_KEY);

            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: party_name,
                        }, 
                        unit_amount: transaction_price,
                    },
                    quantity: 1
                }],
                success_url: `${process.env.SERVER_URL}/success.html`,
                cancel_url: `${process.env.SERVER_URL}/checkout.html`
            })

            await checkoutConfirmation(response, transaction_id);
            await addPurchaseHistory(response, transaction_id);
            await addToAttendanceList(response, transaction_id);

            response.writeHead(201);
            response.end({ url: session.url });

        } catch (error){
            // Response Message
            response.end(JSON.stringify({ url: session.url }));
        } 
    })
}

// Function to add user to party attendance list
async function addToAttendanceList(response, transaction_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    try{
        // Transaction collection
        const transaction_details = await client.db('test_db').collection('transactions').findOne({'transaction_id': transaction_id});
        // Getting user_id
        const user_id = transaction_details.user_id;
        // attendance list collection
        const attendance_list_collection = client.db('test_db').collection('attendance_list');
        // Updating party's attendance list
        await attendance_list_collection.updateOne({ 'party_id': transaction_details.party_id }, { $push: { 'attendees': user_id } });

    } catch (error){
        console.log(error);
    } finally {
        await client.close();
    }
}

// Function to add transaction to User's purchase history
async function addPurchaseHistory(response, transaction_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    try{
        // Transaction collection
        const transaction_details = await client.db('test_db').collection('transactions').findOne({'transaction_id': transaction_id});
        // Getting user_id
        const user_id = transaction_details.user_id;

        // User Purchase History collection
        const purchase_history = client.db('test_db').collection('user_purchase_history');

        // Getting user purchase history
        const user_purchase_history = await purchase_history.findOne({"user_id": user_id});

        // If user does not have a purchase history
        if (user_purchase_history === null){

            const new_purchase_history = {
                "user_id": user_id,
                "transactions": [transaction_id]
            }

            await purchase_history.insertOne(new_purchase_history);

        } else{
            // Updating User's purchase history
            await purchase_history.updateOne({ 'user_id': user_id }, { $push: { 'transactions': transaction_id } });
        }
    } catch (error){
        console.log(error);
    } finally {
        await client.close();
    }
}

// Function to send confirmation email and qrcode
async function checkoutConfirmation(response, transaction_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    try {
        // Getting transaction details
    
        // Connecting to collections
        const transaction_details = await client.db('test_db').collection('transactions').findOne({'transaction_id': transaction_id});
        const party_details = await client.db('test_db').collection('party_listings').findOne({"party_id": transaction_details.party_id});
        const host_information = await client.db('test_db').collection('party_host_information').findOne({"host_id": party_details.host_id});
        const user_information = await client.db('test_db').collection('registered_user_profile').findOne({"user_id": transaction_details.user_id});
    
        // Getting information from collection to send to users
        const user_email = user_information.email_address;
        const host_name = host_information.name;
        const party_name = party_details.name;
        const total = transaction_details.total;
    
        // using Twilio SendGrid's v3 Node.js Library
        const sendgridMail = require('@sendgrid/mail');
        sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
    
        // Modules
        const qr = require('qrcode');
        const fs = require('fs')
    
        // order summary message
        const orderSummary = `Order Summary:
        Transaction ID: ${transaction_id}
        Party Name: ${party_name}
        Host Name: ${host_name}
        Total: ${total}`;
    
        // Create QR Code
        qr.toFile('qrcode.png', `${party_name} ticket`, {
            errorCorrectionLevel: 'H'
        }, function(err) {
            if (err) {
                console.error('Error generating QR code:', err);
                return;
            }

            // Email body
            const msg = {
                to: user_email,
                from: 'partysafariofficial@gmail.com', 
                subject: 'Payment Confirmation & QR Code',
                text: orderSummary,
                attachments: [
                    {
                        content: fs.readFileSync('qrcode.png', 'base64'),
                        filename: 'qrcode.png',
                        type: 'image/png', 
                        disposition: 'attachment', 
                    }
                ]
            };

            // Sending email
            sendgridMail
                .send(msg)
                .catch((error) => {
                    console.error('Error sending email:', error);
                });
        });
    } catch (error){
        console.error(error);

    }
} 

// Function to cancel transaction (DELETE /transactions?rm={transaction_id})
async function cancelTransaction(request, response, transaction_id){
    // Connecting to database
    const client = await initiateDBConnection(response);
    try {
        // Getting transaction
        const transaction_collection = client.db('test_db').collection('transactions');
        const transaction = await transaction_collection.findOne({'transaction_id': transaction_id});

        // If transaction exists
        if (transaction){
            // Deleting transaction document
            await transaction_collection.deleteOne({'transaction_id': transaction_id});
            response.writeHead(200);
            response.end("Transaction cancelled");
        }
        else {
            response.writeHead(404);
            response.end("Transaction not found");
        }
    } catch (error){
        // Response Code: Bad Request
        response.writeHead(400);
        // Response Message
        response.end("Bad Request");
    } finally {
        await client.close();
    }
}

// Function to get user's transaction history (GET /transactions?user_id={user_id})
async function getTransactionHistory(request, response, user_id){
    // Connecting to database
    const client = await initiateDBConnection(response);

    try{
        // Getting necessary collections/ information
        const purchase_history_collection = client.db('test_db').collection('user_purchase_history');
        const transaction_collection = client.db('test_db').collection('transactions');
        const parties_collection = client.db('test_db').collection('party_listings');
        const party_host_collection = client.db('test_db').collection('party_host_information');
        const user_history = await purchase_history_collection.findOne( {"user_id": user_id} );
        const transaction_array = user_history.transactions;

        // Getting user's transaction history
        let history = [];
        for (let i = 0; i < transaction_array.length; i++){
            const transaction = transaction_array[i];
            const transaction_details = await transaction_collection.findOne( {"transaction_id": transaction} );
            const party_details = await parties_collection.findOne( {"party_id": transaction_details.party_id} );
            const host_details = await party_host_collection.findOne( {"host_id": transaction_details.host_id} );

            let entry = {
                "transaction_id": transaction_array[i],
                "party_name": party_details.name,
                "host_name": host_details.name,
                "price": transaction_details.total
            };
            history.push(entry);
        }

        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(history));

    } catch(err){
        console.error(err);
        // Response Code: Bad Request
        response.writeHead(400);
        // Response Message
        response.end("Bad Request");
    } finally{
        await client.close();
    }  
}

// Function to get all the promoted parties (GET /promotions)
async function getPromotedParties(request, response){
    // Connecting to database
    const client = await initiateDBConnection(response);

    try{
        // Getting necessary collections/ information
        const promoted_parties_collection = client.db('test_db').collection('promoted_parties');
        const cursor = promoted_parties_collection.find();
        const documents = await cursor.toArray();
        const parties_collection = client.db('test_db').collection('party_listings');
        const party_host_collection = client.db('test_db').collection('party_host_information');

        let parties = [];
        // Iterating over the cursor
        for (const document of documents){
            const party_id = document.party_id;
            const party_details = await parties_collection.findOne( {"party_id": party_id} );
            const host_id = party_details.host_id;
            const host_details = await party_host_collection.findOne( {"host_id": host_id} );

            let entry = {
                "party_name": party_details.name,
                "host_name": host_details.name,
                "party_description": party_details.description
            };
            parties.push(entry);            
        }

        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(parties));

    } catch(err){
        // Response Code: Bad Request
        response.writeHead(400);
        // Response Message
        response.end("Bad Request");

    } finally{
        await client.close();
    }
}

module.exports = {
    initiateDBConnection, 
    addPartyToCart, 
    deletePartyFromCart,
    getUserCart,
    createTransaction, 
    processPayment, 
    addToAttendanceList, 
    addPurchaseHistory, 
    checkoutConfirmation, 
    cancelTransaction, 
    getTransactionHistory,
    getPromotedParties
};