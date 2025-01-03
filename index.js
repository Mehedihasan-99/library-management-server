require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// MiddleWare 
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zs4np.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const database = client.db('libraryDB');
        const libraryCollection = database.collection('books')


        app.post('/add-book', async (req, res) => {
            const newBook = req.body;
            console.log(newBook)
            const result = await libraryCollection.insertOne(newBook);
            console.log(result)
            res.send(result)
        });

        app.get('/all-books', async (req, res) => {
            const result = await libraryCollection.find().toArray(); 
            res.send(result);
        })

        app.get('/category/:category', async(req, res) => {
            const category = req.params.category
            const query = {category : category}
            const result = await libraryCollection.find(query).toArray()
            res.send(result)
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Library Management System Server is open")
})

app.listen(port, () => {
    console.log(`library management server is running port is ${port}`)
})