const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("mongodb").ObjectID;

require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghmig.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;





const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('drivers'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("server is working properly")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("car-rent").collection("car-collect");
  const testimonialsCollection = client.db("testimonials").collection("testimonialTable");
  const servicesCollection = client.db("serivesDB").collection("service");

  const driverCollection = client.db('driversPortal').collection('drivers');


  // perform actions on the collection object
  console.log('db is connected');
  
  
//start processing api
    app.post("/addService",(req,res)=>{
        const service=req.body;
        console.log('info',service);
        servicesCollection.insertOne(service)
        .then(result=>{
            res.send(result.insertedCount>0)
        })
    })
    app.get('/services',(req,res)=>{
        servicesCollection.find({})
        .toArray((err,items)=>{
            res.send(items)
            console.log('db connected ',items);
        })
    })

    app.get('/service/:id',(req,res)=>{
        const serviceId=ObjectID(req.params.id)
        console.log('id ',serviceId);
        servicesCollection.find(serviceId)
        .toArray((err,items)=>{
            res.send(items)
            console.log('get the id with service');
        })
    })
app.delete('/deleteService/:id',(req,res)=>{
    const id=ObjectID(req.params.id)
    servicesCollection.findOneAndDelete({_id:id})
    .then((err,result)=>{
        res.send(result.insertedCount>0)
    })
})

// start review

app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const country = req.body.country;
    const review = req.body.review;
    const newImg = file.data;
    console.log('driver info ',file,name,country,review,newImg);
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    testimonialsCollection.insertOne({ name, country,review,image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})

app.get('/reviews', (req, res) => {
    testimonialsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
                console.log(documents);
            })
});






// app.post('/addReview',(req,res)=>{
//     const review=req.body;
//     appointmentCollection.insertOne(review)
//     .then(result=>{
//         res.send(result.insertedCount>0)
//     })
// })
// app.get('/reviews',(req,res)=>{
//     appointmentCollection.find()
//     .toArray((err,items)=>{
//         res.send(items)
//         console.log('db is connected ');
//     })
// })



    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log('testing or ',appointment)
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        driverCollection.find({ email: email })
            .toArray((err, drivers) => {
                const filter = { date: date.date }
                if (drivers.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, date.date, drivers, documents)
                        res.send(documents);
                    })
            })
    })

    app.post('/addADriver', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        console.log('driver info ',file,name,email,newImg);
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        driverCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/drivers', (req, res) => {
        driverCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
                console.log(documents);
            })
    });

    app.post('/isDriver', (req, res) => {
        const email = req.body.email;
        console.log('driver email ',req.body);
        driverCollection.find({ email: email })
            .toArray((err, drivers) => {
                res.send(drivers.length > 0);
            })
    })

});







// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//     const appointmentCollection = client.db('car-rent').collection('car-collect');
//     const driverCollection = client.db(`${process.env.DB_NAME_2}`).collection(`${process.env.DB_TABLE_2}`);

//     app.post('/addAppointment', (req, res) => {
//         const appointment = req.body;
//         console.log('testing or ',appointment)
        
//         appointmentCollection.insertOne(appointment)
//             .then(result => {
//                 res.send(result.insertedCount > 0)
//             })
//     });

//     app.get('/appointments', (req, res) => {
//         appointmentCollection.find({})
//             .toArray((err, documents) => {
//                 res.send(documents);
//             })
//     })

//     app.post('/appointmentsByDate', (req, res) => {
//         const date = req.body;
//         const email = req.body.email;
//         driverCollection.find({ email: email })
//             .toArray((err, drivers) => {
//                 const filter = { date: date.date }
//                 if (drivers.length === 0) {
//                     filter.email = email;
//                 }
//                 appointmentCollection.find(filter)
//                     .toArray((err, documents) => {
//                         console.log(email, date.date, drivers, documents)
//                         res.send(documents);
//                     })
//             })
//     })

//     app.post('/addADriver', (req, res) => {
//         const file = req.files.file;
//         const name = req.body.name;
//         const email = req.body.email;
//         const newImg = file.data;
//         const encImg = newImg.toString('base64');

//         var image = {
//             contentType: file.mimetype,
//             size: file.size,
//             img: Buffer.from(encImg, 'base64')
//         };

//         driverCollection.insertOne({ name, email, image })
//             .then(result => {
//                 res.send(result.insertedCount > 0);
//             })
//     })

//     app.get('/drivers', (req, res) => {
//         driverCollection.find({})
//             .toArray((err, documents) => {
//                 res.send(documents);
//             })
//     });

//     app.post('/isDriver', (req, res) => {
//         const email = req.body.email;
//         driverCollection.find({ email: email })
//             .toArray((err, drivers) => {
//                 res.send(drivers.length > 0);
//             })
//     })

// });


app.listen(process.env.PORT || port)