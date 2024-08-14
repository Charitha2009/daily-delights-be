const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors'); // Import cors package
const app = express();
const bodyParser = require('body-parser');
// import Stripe from 'stripe'
const stripe = require('stripe')('sk_test_51Pg7EiRwFwvMOgq4ms1xk6auiDqha7m4G4tPPs0GOIqcniJ7BrW6Vv8IaXhCJjHOVtoJMZuZI1MJldAbd7v7oBuK00TQy9iVew');
const Transaction = require('./models/Transaction');
const Order = require('./models/Order');

// Connect Database
connectDB();
const endpointSecret = 'whsec_1bfd61fbe84e1328ba946587fac6bc43015966a9bd5ac37546c4d08193d07229';
// Init Middleware
app.use(express.json({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

app.get('/', (req, res) => res.send('API Running'));

// Enable CORS
app.use(cors()); // Allow all origins

// Route to create checkout session
// app.post('/api/create-checkout-session', async (req, res) => {
//     const { cart } = req.body;

//     const lineItems = cart.map(item => ({
//         price_data: {
//             currency: 'usd',
//             product_data: {
//                 name: item.name,
//                 description: item.description,
//                 images: [`http://localhost:4000/uploads/${item.image}`],
//             },
//             unit_amount: Math.round(item.price * 100), // Ensure this is an integer
//         },
//         quantity: item.quantity,
//     }));

//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: lineItems,
//             mode: 'payment',
//             success_url: 'http://localhost:3000/success',
//             cancel_url: 'http://localhost:3000/cancel',
//         });
//         res.json({ id: session.id });
//     } catch (error) {
//         console.error('Error creating checkout session:', error);
//         res.status(500).json({ error: 'Failed to create checkout session' });
//     }
// });

// Route to create checkout session
// app.post('/api/create-checkout-session', async (req, res) => {
//     const { cart, userId } = req.body;
//     c

//     const lineItems = cart.map(item => ({
//         price_data: {
//             currency: 'usd',
//             product_data: {
//                 name: item.name,
//                 description: item.description,
//                 images: [`http://localhost:4000/uploads/${item.image}`],
//             },
//             unit_amount: Math.round(item.price * 100), // Ensure this is an integer
//         },
//         quantity: item.quantity,
//     }));

//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: lineItems,
//             mode: 'payment',
//             success_url: 'http://localhost:3000/success',
//             cancel_url: 'http://localhost:3000/cancel',
//         });

//         // Save transaction details to the database
//         const transaction = new Transaction({
//             userId: userId,
//             sessionId: session.id,
//             amount: session.amount_total,
//             currency: session.currency,
//             status: 'pending',
//         });
//         await transaction.save();

//         res.json({ id: session.id });
//     } catch (error) {
//         console.error('Error creating checkout session:', error);
//         res.status(500).json({ error: 'Failed to create checkout session' });
//     }
// });
// Route to create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
    const { cart, userId } = req.body;

    const lineItems = cart.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                description: item.description,
                images: [`http://localhost:4000/uploads/${item.image}`],
            },
            unit_amount: Math.round(item.price * 100), // Ensure this is an integer
        },
        quantity: item.quantity,
    }));

    // Calculate delivery date (next day)
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
        });

        // Save transaction details to the database
        const transaction = new Transaction({
            userId: userId,
            sessionId: session.id,
            amount: session.amount_total,
            currency: session.currency,
            status: 'pending',
        });
        await transaction.save();

        // Save order details to the database
        const order = new Order({
            userId: userId,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            })),
            deliveryDate: nextDay, // Set delivery date to the next day
            status: 'Confirmed',
            transaction: {
                sessionId: session.id,
                amount: session.amount_total,
                currency: session.currency,
                paymentStatus: 'pending'
            }
        });
        await order.save();

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});


// Webhook endpoint
app.post('/webhook', (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            // Update the transaction status in the database
            Transaction.findOneAndUpdate(
                { sessionId: session.id },
                { status: 'completed' },
                { new: true },
                (err, doc) => {
                    if (err) {
                        console.error('Error updating transaction status:', err);
                    } else {
                        console.log('Transaction status updated:', doc);
                    }
                }
            );
            break;
        // Handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.sendStatus(200);
});




// Define Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/dashboard'));
app.use('/api/fruits', require('./routes/fruits'));
app.use('/api/vegetables', require('./routes/vegetables'));
app.use('/api/snacks', require('./routes/snacks'));
app.use('/api/pulses', require('./routes/pulses'));
app.use('/api/nuts', require('./routes/nuts'));
app.use('/api/dairyProducts', require('./routes/dairyProducts'));
app.use('/api/meats', require('./routes/meats'));
app.use('/api/items', require('./routes/search'));
app.use('/api/orders', require('./routes/orders'));
// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
