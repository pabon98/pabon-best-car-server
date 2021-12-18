const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lzm3u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri)
async function run(){
  try{
    await client.connect()
    // console.log('Database connected successfully')
    const database = client.db("car_shop")
    const carCollection = database.collection("cars")
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("review")
    const usersCollection = database.collection('users');
    
    //Get cars API
    app.get('/cars', async(req,res)=>{
    const cursor = carCollection.find({})
    const cars = await cursor.toArray()
    res.send(cars)
    
    })
    //Get orders API
    app.get('/myOrders/:email', async(req,res)=>{
      const email = req.params.email
      const query = {email:email}
      const cursor = await orderCollection.find(query)
      const myOrders = await cursor.toArray()
      res.send(myOrders)

    })
    // GET API (get all orders)
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    //Get single car
    app.get("/cars/:id", async(req,res)=>{
      const id = req.params.id
      const query = {_id: ObjectId(id)};
      const car = await carCollection.findOne(query)
      res.json(car)
    })
    // GET API (get orders by email)
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = await orderCollection.find(query);
      const myOrders = await cursor.toArray();
      res.send(myOrders);
    });
     //GET Review API
     app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });
    //POST API
    app.post('/purchase', async(req,res)=>{
      const orderDetails = req.body
      const result = await orderCollection.insertOne(orderDetails)
      res.send(result)

    })
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(users);
      console.log(result);
      res.json(result);
    });
    app.post("/addUserInfo", async (req, res) => {
      console.log("req.body");
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });
    // POST API(add a new car)
    app.post("/cars", async (req, res) => {
      const car = req.body;
      // console.log("hit the post api", car);
      const result = await carCollection.insertOne(car);
      console.log(result);
      console.log(car);
      res.json(result);
    });

    //  make admin

    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await usersCollection.find(filter).toArray();
      if (result) {
        const documents = await usersCollection.updateOne(filter, {
          $set: { role: "admin" },
        });
        console.log(documents);
      }
    
    });

    // check admin or not
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      // console.log(result);
      res.send(result);
    });

    app.put("/users/admin", async(req,res)=>{
      const user = req.body
      console.log('put', user)
      const filter = {email: user.email}
      const updateDoc = {$set:{role: 'admin'}}
      const result = await carCollection.updateOne(filter,updateDoc)
      res.json(result)
    })

    // POST API(add a new review)
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    
    // DELETE order by id API
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
    // DELETE API (delete product by id)
    app.delete('/deleteProduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.json(result);
  })
    // UPDATE API
    app.put("/approve/:id", async (req, res) => {
      const id = req.params.id;
      const approvedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: approvedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

  }
  finally{
    // await client.close()
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Cars Portal!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})