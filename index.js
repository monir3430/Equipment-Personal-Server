const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.57qhu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
      await client.connect();
      const productCollection = client.db('equipments').collection('tools');
      const reviewCollection = client.db('equipments').collection('reviews');
      const orderCollection = client.db('equipments').collection('orders');
      const profileCollection = client.db('equipments').collection('profile');
      const userCollection = client.db('equipments').collection('users');
      const paymentCollection = client.db('equipments').collection('payment');

      app.get('/tools', async(req, res)=>{
        const query = {};
        const cursor = productCollection.find(query);
        const tools = await cursor.toArray();
        res.send(tools);
      })


      //for admin role--------------------------------------------------
      app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({ admin: isAdmin })
      })

       // post data to MongoDB of Reviews------------------------------

       app.post('/reviews', async(req, res)=>{
        console.log(req.body)
        const review = req.body;
        const result =await reviewCollection.insertOne(review)
        res.send(result);
    })
       app.post('/orders', async(req, res)=>{
        console.log(req.body)
        const order = req.body;
        const result =await orderCollection.insertOne(order)
        res.send(result);
    })

      // get data from mongodb of reviews-------------------

    app.get('/reviews', async(req, res)=>{
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    // all order load for my order/Admin see all order client side-------------

    app.get('/orders', async(req, res)=>{ 
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    })


    // get data from mongodb of order for payment by id-----------------------

    app.get('/orders/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const orders = await orderCollection.findOne(query);
      res.send(orders);
    })


//display specific product---------------
  app.get('/tools/:id', async(req, res) =>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result= await productCollection.findOne(query);
    res.send(result);
  })

    // post data to mongodb of tools by admin user----------------------
    app.post('/tools', async(req, res)=>{
      console.log(req.body)
      const addTool = req.body;
      const result =await productCollection.insertOne(addTool)
      res.send(result);
  })

// user email to data base-------------------------------------------
  app.put('/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updateUserDoc = {
      $set: user,
    };
    const result = await userCollection.updateOne(filter, updateUserDoc , options);
    const token = jwt.sign({ email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({result,token});
    
  });

  // user Admin field---------------------------------------------------
  app.put('/user/admin/:email', async (req, res) => {
    const email = req.params.email; 
    const filter = { email: email };
    const updateUserDoc = {
      $set: {role:'admin'},
    };
    const result = await userCollection.updateOne(filter, updateUserDoc);
    res.send(result);
    
  });


app.put('/profile/:email', async (req, res) => {
  const email = req.params.email;
  const profile = req.body;
  const filter = { email: email };
  const options = { upsert: true };
  const updateProfileDoc = {
    $set: profile,
  };
  const result = await profileCollection .updateOne(filter, updateProfileDoc , options);
  res.send({result});
});


// Load all users for admin side------------------------------


app.get('/users', async(req, res)=>{ 
  const query = {};
  const cursor = userCollection.find(query);
  const user = await cursor.toArray();
  res.send(user);
})

// Data delete from mongodb by admin user--------------------------
app.delete('/tools/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const result  = await productCollection.deleteOne(query);
  res.send(result);
})

// data delete from My Order by user--------------------------------
app.delete('/orders/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const result  = await orderCollection.deleteOne(query);
  res.send(result);
})

// user delete from mongodb-----------------------------------------

app.delete('/users/:id', async(req, res)=>{
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const result  = await userCollection.deleteOne(query);
  res.send(result);
})


// for Payment------------------------------------------------------
app.post('/create-payment-intent', async(req, res) =>{
  const order = req.body;
  const totalCost = order.totalCost;
  const amount = totalCost*100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount : amount,
    currency: 'usd',
    payment_method_types:['card']
  });
  res.send({clientSecret: paymentIntent.client_secret})
});


//Payment success PATCH----------------------------------------------
app.patch('/orders/:id', async(req, res) =>{
  const id  = req.params.id;
  const payment = req.body;
  const filter = {_id: ObjectId(id)};
  const updatedDoc = {
    $set: {
      paid: true, 
      transactionId: payment.transactionId
    }
  }

  const result = await paymentCollection.insertOne(payment);
  const updatedOrders = await orderCollection.updateOne(filter, updatedDoc);
  res.send(updatedOrders);
})

    }
    finally{

    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Equipment Personal')
})

app.listen(port, () => {
  console.log(`Equipment Business app listening on port ${port}`)
})