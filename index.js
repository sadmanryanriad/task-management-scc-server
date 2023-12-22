const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ni8nft9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // MongoDB collections
    const taskCollections = client.db("task-management").collection("tasks");

    // store task data
    app.post('/tasks', async(req,res)=>{
        const task = req.body;
        console.log(task);
        const result = await taskCollections.insertOne(task);
        res.send(result);
    })
    // get all task data
    app.get('/tasks', async(req,res)=>{
        const email = req.query.email;

        if (email) {
          const result = await taskCollections.find({ email: email }).toArray();
          res.send(result);
        } else {
          const result = await taskCollections.find().toArray();
          res.send(result);
        }
    })
    // delete task
    app.delete('/tasks/:id', async(req,res)=>{
        const id = req.params.id;
        const result = await taskCollections.deleteOne({_id: new ObjectId(id)});
        res.send(result);
    })
    //patch task status
    app.patch('/tasks', async(req,res)=>{
        const id = req.query.id;
        const status = req.query.status;
        const filter = {_id: new ObjectId(id)};
        const updatedDoc = {
          $set: {
            status: status
          }
        }
        const result = await taskCollections.updateOne(filter,updatedDoc);
        res.send(result);
      })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
