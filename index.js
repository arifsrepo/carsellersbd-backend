const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
var MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.c1ygv.mongodb.net:27017,cluster0-shard-00-01.c1ygv.mongodb.net:27017,cluster0-shard-00-02.c1ygv.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-10o2xl-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function server() {
    try{
        await client.connect();
        const database = client.db('Cars_DB');                         // Database Name
        const productsCollection = database.collection('Products');    
        const rateingsCollections = database.collection('review');
        const ordersCollection = database.collection('Orders');
        const userCollection = database.collection('Users')
        console.log('DB Connected')

        app.get('/products', async (req, res) => {
          const cursor = productsCollection.find({})
          const products = await cursor.toArray()
          res.json(products)
        })

        app.get('/allorders', async (req, res) => {
          const cursor = ordersCollection.find({})
          const products = await cursor.toArray()
          res.json(products)
        })

        app.get('/products/:id', async(req, res) => {
          const carid = req.params.id;
          const query = {_id:ObjectId(carid)}
          const cursor = await productsCollection.findOne(query)
          res.json(cursor)
        })
        
        app.get('/review', async(req, res) => {
          const cursor = rateingsCollections.find({})
          const review = await cursor.toArray()
          res.json(review)
        })

        app.post('/review', async(req, res) =>{
          const review = req.body;
          console.log(review)
          const result = await rateingsCollections.insertOne(review);
          res.json(result)
        })

        app.post('/orders', async(req, res) =>{
          const newPackages = req.body;
          console.log(newPackages)
          const result = await ordersCollection.insertOne(newPackages);
          res.json(result)
        })

        app.post('/newproducts', async(req, res) =>{
          const newPackages = req.body;
          console.log(newPackages)
          const result = await productsCollection.insertOne(newPackages);
          res.json(result)
        })

        app.get('/orders/myorder', async(req, res) => {
          const search = {email:req.query.email};
          const cursor = ordersCollection.find(search);
          const result = await cursor.toArray()
          res.json(result)
        })

        app.delete('/orders/myorder/:name', async(req, res) => {
          const productName = req.params.name;
          const query = {name:productName}
          const cursor = await ordersCollection.deleteOne(query)
          console.log(cursor)
          res.json(cursor)
        })

        app.delete('/admin/products/:name', async(req, res) => {
          const productName = req.params.name;
          const query = {name:productName}
          const cursor = await productsCollection.deleteOne(query)
          console.log(cursor)
          res.json(cursor)
        })

        app.post('/users', async(req, res) => {
          const newUser = req.body;
          const result = await userCollection.insertOne(newUser);
          res.json(result);
        })

        app.put('/users', async(req, res) => {
          const user = req.body;
          const filter = {user}
          console.log(filter)
          const option = {upsert:true}
          const updateDoc = {$set: user}
          const result = await userCollection.updateOne(filter, updateDoc, option)
          res.json(result)
        })

        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          console.log(user)
          const filter = {email:user.email}
          const updateDoc = {$set: {role:'admin'}}
          const result = await userCollection.updateOne(filter, updateDoc)
          res.json(result)
        })

        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = {email:email};
          const user = await userCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
            isAdmin = true;
          }
          res.json({admin:isAdmin})
        })

    }
    finally{
        // await client.close();
    }
}

server().catch(console.dir)

app.get('/', (req, res) => {
  res.send(`API Rinning On Port : ${port}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})