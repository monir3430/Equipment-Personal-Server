const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
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

      // get data from mongodb of reviews-------------------

    app.get('/reviews', async(req, res)=>{
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    // post data to mongodb of tools----------------------
    app.post('/tools', async(req, res)=>{
      console.log(req.body)
      const addTool = req.body;
      const result =await productCollection.insertOne(addTool)
      res.send(result);
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