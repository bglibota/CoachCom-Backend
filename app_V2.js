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
    checkUserRole,
    getUserData,
    getUserMeasurements,
    getTargetUserMeasurements,
    createANewPersonalizedProgram,
    getSpecificPerosnalizedProgramData
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
            "picture",
            "video"
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
            picture,
            video
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
                picture,
                video,
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
            "picture",
            "documentation_directory_path",
            "video"
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
            picture,
            documentation_directory_path,
            video
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
                picture,
                documentation_directory_path,
                video,
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
                const user_id = searchedUser[0].user_id
                const roleName = userRole[0].name
                res.status(200).json(
                    {
                        success: true,
                        message: "Successful login!",
                        data: {
                            user_id: user_id,
                            role: roleName
                        }                      //MYB send JWT token in future ?@MMatijević?
                    }
                )
            }
        }

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/users/login - Error checking credentials (user login)",
                data: [error]
            }
        )
    }
});

//--------------------------------------------------------------------------------------
//-- RESTful API -- Login -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------



//--------------------------------------------------------------------------------------
//-- RESTful API -- NOT SORTED IMPLEMENTATIONS -- ######################################
//--------------------------------------------------------------------------------------

//Implemented by R.Gladoic
app.get("/API_V2/users/user", async (req, res) => {

    try {

        const { user_id } = req.query;

        const user = await getUserData(user_id)

        res.status(200).json(
            {
                success: true,
                message: "Successful retrieval of user data",
                data: user[0]
            }
        )


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/users/user - Error retrieving user data",
                data: [error]
            }
        )
    }
});

//Implemented by R.Gladoic
app.get("/API_V2/users/user/measurements", async (req, res) => {

    try {

        const { user_id } = req.query;

        const measurements = await getUserMeasurements(user_id)
        const target_measurements = await getTargetUserMeasurements(user_id)

        res.status(200).json(
            {
                success: true,
                message: "Successful retrieval of measurements data",
                data: {
                    target_measurements: target_measurements,
                    physical_measurements: measurements
                }
            }
        )


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/users/user/measurements - Not Defined by the creator*",
                data: [error]
            }
        )
    }
});

//--------------------------------------------------------------------------------------
//-- RESTful API -- NOT SORTED IMPLEMENTATIONS -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------
//-- RESTful API -- Personalized training programs -- ##################################
//--------------------------------------------------------------------------------------

app.post("/API_V2/personalized_program", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "trainer_id",
            "client_id",
            "beginning_date",
            "end_date",
            "overall_objective",
            "additional_information"
        ];

        // Checks if all expected object elements are present in body of the request
        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            trainer_id,
            client_id,
            beginning_date,
            end_date,
            overall_objective,
            additional_information
        } = req.body;

        const newPersonalizedProgram = await createANewPersonalizedProgram(
            trainer_id,
            client_id,
            beginning_date,
            end_date,
            overall_objective,
            additional_information
        )

        res.status(201).json(
            {
                success: true,
                message: "New personalized program successfuly created by trainer (user_id = " + trainer_id + ") for client (user_id = " + client_id + ")",
                data: [newPersonalizedProgram]
            }
        )

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/personalized_program - Error creating personalized programs",
                data: [error]
            }
        )
    }
});

app.get("/API_V2/personalized_program", async (req, res) => {

    try {

        const { personalized_program_id } = req.query;

        const personalizedProgramData = await getSpecificPerosnalizedProgramData(personalized_program_id)

        res.status(200).json(
            {
                success: true,
                message: "Successful retrieval of user data",
                data: [personalizedProgramData]
            }
        )

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /API_V2/personalized_program - Error creating personalized programs",
                data: [error]
            }
        )
    }
});

//--------------------------------------------------------------------------------------
//-- RESTful API -- Personalized training programs -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------
//-- RESTful API -- Error handling and server listening -- #############################
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

//--------------------------------------------------------------------------------------
//-- RESTful API -- Error handling and server listening -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------



//--------------------------------------------------------------------------------------
//-- RESTful API -- Implementation part -- #############################################
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------
//-- RESTful API -- Implementation part -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------