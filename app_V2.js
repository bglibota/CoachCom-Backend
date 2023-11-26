// const express = require('express');     //Loading express module
import express from 'express';
const app = express();                  //Objekt 'app' koji reprezentira "aplikaciju", sadrži različite korisne funk.

import crypto from 'crypto';


//Importing functions from the db.js file
import {
    checkIfUsernameIsAvailable,
    getASpecificUser,
    createANewClient,
    createANewTrainer,
    checkUsernameForLogin,
    checkUserRole
} from './db_V2.js';


//Defining for the app to use JSON (since this is a JSON API)
app.use(express.json())





//--------------------------------------------------------------------------------------
//-- RESTful API -- Registration -- ####################################################
//--------------------------------------------------------------------------------------

app.post("/API_V2/users/register/client", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "username",
            "password",
            "first_name",
            "last_name",
            "e_mail",
            "date_of_birth",
            "phone_number",
            "place_of_residence",
            "sex",
            "biography",
            "profile_picture_path",
            "biography_video_path"
        ];

        // Checks if all expected object elements are present in body of the request
        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);      //@IvanGiljević - Try to understand more clearely later...

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            username,
            password,
            first_name,
            last_name,
            e_mail,
            date_of_birth,
            phone_number,
            place_of_residence,
            sex,
            biography,
            profile_picture_path,
            biography_video_path
        } = req.body;

        //##### - TO DO - Server side data filtering (against SQL I and XSS attacks) (@MMatijević?)

        if (!await checkIfUsernameIsAvailable(username)) {
            res.status(409).json(
                {
                    success: false,
                    message: "Chosen username already taken!",
                    data: []
                }
            )
        } else {

            const userSalt = crypto.randomBytes(16).toString('hex') //Generates hex data that is store in 16 bytess
            const safePassword = crypto.createHash('sha256').update(password + userSalt).digest('hex');

            const newClient = await createANewClient(
                username,
                safePassword,
                userSalt,
                first_name,
                last_name,
                e_mail,
                date_of_birth,
                phone_number,
                place_of_residence,
                sex,
                biography,
                profile_picture_path,
                biography_video_path,
                password
            )

            res.status(201).json(
                {
                    success: true,
                    message: "New client " + username + " created!",
                    data: [newClient]
                }
            )
        }

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/users/register/client - Error registering new client",
                data: [error]
            }
        )
    }
});



app.post("/API_V2/users/register/trainer", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "username",
            "password",
            "first_name",
            "last_name",
            "e_mail",
            "date_of_birth",
            "phone_number",
            "place_of_residence",
            "sex",
            "biography",
            "profile_picture_path",
            "documentation_directory_path",
            "biography_video_path"
        ];

        // Checks if all expected object elements are present in body of the request
        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);      //@IvanGiljević - Try to understand more clearely later...

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            username,
            password,
            first_name,
            last_name,
            e_mail,
            date_of_birth,
            phone_number,
            place_of_residence,
            sex,
            biography,
            profile_picture_path,
            documentation_directory_path,
            biography_video_path
        } = req.body;

        //##### - TO DO - Server side data filtering (against SQL I and XSS attacks) (@MMatijević?)

        if (!await checkIfUsernameIsAvailable(username)) {
            res.status(409).json(
                {
                    success: false,
                    message: "Chosen username already taken!",
                    data: []
                }
            )
        } else {

            const userSalt = crypto.randomBytes(16).toString('hex') //Generates hex data that is store in 16 bytess
            const safePassword = crypto.createHash('sha256').update(password + userSalt).digest('hex');

            const newTrainer = await createANewTrainer(
                username,
                safePassword,
                userSalt,
                first_name,
                last_name,
                e_mail,
                date_of_birth,
                phone_number,
                place_of_residence,
                sex,
                biography,
                profile_picture_path,
                documentation_directory_path,
                biography_video_path,
                password
            )

            res.status(201).json(
                {
                    success: true,
                    message: "New trainer " + username + " created!",
                    data: [newTrainer]
                }
            )
        }

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/users/register/trainer - Error registering new trainer",
                data: [error]
            }
        )
    }
});
//--------------------------------------------------------------------------------------
//-- RESTful API -- Registration -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------




//--------------------------------------------------------------------------------------
//-- RESTful API -- Login -- ###########################################################
//--------------------------------------------------------------------------------------

app.post("/API_V2/users/login", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "insertedUsername",
            "insertedPassword"
        ];

        // Checks if all expected object elements are present in body of the request
        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);      //@IvanGiljević - Try to understand more clearely later...

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            insertedUsername,
            insertedPassword
        } = req.body;

        const searchedUser = await checkUsernameForLogin(insertedUsername)
        
        if (searchedUser[0] == null) {       //queryResult[0]
            res.status(404).json(
                {
                    success: false,
                    message: "User with given username doesn't exist!",
                    data: []
                }
            )
        } else {

            const hashUserSaltedInsertedPassword = crypto.createHash('sha256').update(insertedPassword + searchedUser[0].salt).digest('hex')

            if (searchedUser[0].password != hashUserSaltedInsertedPassword) {
                //######### TO DO - Increment number_of_login_attempts
                res.status(401).json(
                    {
                        success: false,
                        message: "User's password incorrect!",
                        data: []
                    }
                )
            } else {
                //######### TO DO - set number_of_login_attempts to 0 AND set last_login_time
                const userRole = await checkUserRole(insertedUsername)
                const roleName = userRole[0].name
                res.status(200).json(
                    {
                        success: true,
                        message: "Successful login!",
                        data: roleName                        //MYB send JWT token in future ?@MMatijević?
                    }
                )
            }
        }

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/users/login - Error checking credentials",
                data: [error]
            }
        )
    }
});

//--------------------------------------------------------------------------------------
//-- RESTful API -- Login -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------


//Error handling...
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Error - Something broke!')
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running and listening on port ${port} ...`)
});