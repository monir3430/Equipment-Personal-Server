const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()
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

      app.get('/tools', async(req, res)=>{
        const query = {};
        const cursor = productCollection.find(query);
        const tools = await cursor.toArray();
        res.send(tools);
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

//display specific product---------------
  app.get('/tools/:id', async(req, res) =>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result= await productCollection.findOne(query);
    res.send(result);
  })

  //   // post data to mongodb of tools----------------------
  //   app.post('/tools', async(req, res)=>{
  //     console.log(req.body)
  //     const addTool = req.body;
  //     const result =await productCollection.insertOne(addTool)
  //     res.send(result);
  // })

  // // put data in mdb of user profile-----------------------
 
  // app.put('/profile/:id', async(req, res)=>{
  //   const id= req.params.id;
  //   const updateProfile = req.body;
  //   const filter = {_id: ObjectId(id)};
  //   const options = { upsert: true };
  //   const updateProfileDoc = {
  //       $set: {
  //          name: updateProfile.name,
  //          email: updateProfile.email,
  //          education: updateProfile.education,
  //          address: updateProfile.address,
  //          mobile: updateProfile.mobile,
  //          linkedIn: updateProfile.linkedIn,
           
           
  //       }
  //   };
  //   const result = await profileCollection.updateOne(filter, updateProfileDoc, options );
  //   res.send(result);


  //   })

//   app.post('/profile', async(req, res)=>{
//     console.log(req.body)
//     const profile = req.body;
//     const result =await profileCollection.insertOne(profile)
//     res.send(result);
// })


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