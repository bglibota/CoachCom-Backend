// const express = require('express');     //Loading express module
import express from 'express';
const app = express();                  //Objekt 'app' koji reprezentira "aplikaciju", sadrži različite korisne funk.


//Importing functions from the db.js file
import { getUsers, getSpecificUser, createNewUser } from './template_db.js';


//Defining for the app to use JSON (since this is a JSON API)
app.use(express.json())



//?- await - The use of await indicates that this function returns a Promise, and it waits for the Promise to resolve before moving on to the next line.
//-- req - request
//-- res - response
//-- 2.arg - async callback function
app.get("/users", async (req, res) => {
    const users = await getUsers()
    res.send(users)
})




app.get("/users/:id", async (req, res) => {
    const userId = req.params.id      //-- req.params.id - value of dynammic(?True?) parametar id
    const [specificUser] = await getSpecificUser(userId)        //Added [] to specificUser so the responds gives an object instead of an array with 1 object inside...
    res.send(specificUser)
})

app.post("/users", async (req, res) => {
    const { userName, usersPasswordUnhashed } = req.body        //This defines that if specified attributes are defined in the POST Req
    const newUser = await createNewUser(userName, usersPasswordUnhashed)
    res.status(201).send(newUser)
})




//Error handling...
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Error - Something broke!')
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running and listening on port ${port} ...`)
});