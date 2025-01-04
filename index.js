require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const libraryCollection = database.collection('books');
        const borrowedBooksCollection = database.collection(('borrows'))

        // Library collection post, get, put, patch, delete 
        app.post('/add-book', async (req, res) => {
            const newBook = req.body;
            const result = await libraryCollection.insertOne(newBook);
            res.send(result)
        });

        app.get('/all-books', async (req, res) => {
            const result = await libraryCollection.find().toArray();
            res.send(result);
        })

        app.get('/category/:category', async (req, res) => {
            const category = req.params.category
            const query = { category: category }
            const result = await libraryCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/book-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            console.log(query)
            const result = await libraryCollection.findOne(query);
            console.log(result)
            res.send(result)
        })

        app.put('/update-book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateBook = req.body;
            const book = {
                $set: {
                    name: updateBook.name,
                    author: updateBook.author,
                    category: updateBook.category,
                    rating: updateBook.rating,
                    image: updateBook.image,
                }
            }
            const result = await libraryCollection.updateOne(query, book, options);
            res.send(result)
        })

        // Borrow collection post, get, put, patch, delete 
        app.post('/add-borrow-book', async (req, res) => {
            const borrowBook = req.body;
            const result = await borrowedBooksCollection.insertOne(borrowBook);
            res.send(result)
        })

        app.get('/borrowed-books', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email : userEmail }
            console.log(query)
            const result = await borrowedBooksCollection.find(query).toArray();
            console.log(result)
            res.send(result)
        })

        app.delete('/borrowed-books/:id', async (req, res) => {
            const id =   req.params.id;
            const query = { _id : new ObjectId(id) };
            const result = await borrowedBooksCollection.deleteOne(query);
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