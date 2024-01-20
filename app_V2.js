
import express from 'express';
import bodyParser from 'body-parser';
const app = express();                  

app.use(bodyParser.json({ limit: '10mb' }));

import crypto from 'crypto';



import {
    checkIfUsernameIsAvailable,
    getASpecificUser,
    createANewClient,
    createANewTrainer,
    checkUsernameForLogin,
    checkUserRole,
    getUserData,
    getPhysicalMeasurements,
    getTargetUserMeasurements,
    checkIfExerciseExists,
    createANewExercise,
    getSpecificExerciseData,
    updateExercise,
    deleteExercise,
    createANewPersonalizedProgram,
    getSpecificPerosnalizedProgramData,
    createANewCustomizedDay,
    getSpecificCustomizedDayData,
    createPhysicalMeasurements,
    updateTargetMeasurements,
    updateClientPersonalInformation,
    newPassword,
    createMealPlan,
    getPlanWeight,
    getExerciseData,
    createWeightLossPlan,
    createWeightLossPlanExercises
} from './db_V2.js';


app.use(express.json())


app.post("/api/users/register/client", async (req, res) => {

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

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body); 

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


        if (!await checkIfUsernameIsAvailable(username)) {
            res.status(409).json(
                {
                    success: false,
                    message: "Chosen username already taken!",
                    data: []
                }
            )
        } else {

            const userSalt = crypto.randomBytes(16).toString('hex')
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
                message: "Error - /api/users/register/client - Error registering new client",
                data: [error]
            }
        )
    }
});



app.post("/api/users/register/trainer", async (req, res) => {

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

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);      

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


        if (!await checkIfUsernameIsAvailable(username)) {
            res.status(409).json(
                {
                    success: false,
                    message: "Chosen username already taken!",
                    data: []
                }
            )
        } else {

            const userSalt = crypto.randomBytes(16).toString('hex') 
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
                message: "Error - /api/users/register/trainer - Error registering new trainer",
                data: [error]
            }
        )
    }
});


app.post("/api/users/login", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "insertedUsername",
            "insertedPassword"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);      

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

        if (searchedUser[0] == null) {     
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
                res.status(401).json(
                    {
                        success: false,
                        message: "User's password incorrect!",
                        data: []
                    }
                )
            } else {
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
                        }                     
                    }
                )
            }
        }

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/users/login - Error checking credentials (user login)",
                data: [error]
            }
        )
    }
});



app.post("/api/exercises/create", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "user_id",
            "name",
            "description",
            "category",
            "difficulty_level",
            "video_guide_url",
            "step_by_step_instructions",
            "muscle_group",
            "secondary_muscle_group"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);     

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            user_id,
            name,
            description,
            category,
            difficulty_level,
            video_guide_url,
            step_by_step_instructions,
            muscle_group,
            secondary_muscle_group
        } = req.body;


        if (!await checkIfExerciseExists(name)) {
            res.status(409).json(
                {
                    success: false,
                    message: "Exercise with the same name already exists! ",
                    data: []
                }
            )
        } else {

            const newExercise = await createANewExercise(
                user_id,
                name,
                description,
                category,
                difficulty_level,
                video_guide_url,
                step_by_step_instructions,
                muscle_group,
                secondary_muscle_group
            )

            res.status(201).json(
                {
                    success: true,
                    message: "New exercise '" + name + "' created!",
                    data: [newExercise]
                }
            )
        }

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/exercises/create - Error creating a new exercise",
                data: [error]
            }
        )
    }
});

app.get("/api/exercises/read", async (req, res) => {

    try {

        const { exercise_id } = req.query;

        const exerciseData = await getSpecificExerciseData(exercise_id)

        res.status(200).json(
            {
                success: true,
                message: "Successful retrieval of exercise data",
                data: [exerciseData]
            }
        )


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/exercises/read - Error checking exercise data",
                data: [error]
            }
        )
    }
});


app.put("/api/exercises/update", async (req, res) => {
    try {
        const { exercise_id } = req.query;

        if (!exercise_id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request. Exercise ID is required for updating an exercise.',
                data: []
            });
        }

        const existingExercise = await getSpecificExerciseData(exercise_id);
        if (!existingExercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found. Cannot update.',
                data: []
            });
        }

        const expectedJSONObjectElements = [
            "user_id",
            "name",
            "description",
            "category",
            "difficulty_level",
            "video_guide_url",
            "step_by_step_instructions",
            "muscle_group",
            "secondary_muscle_group"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);    

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            user_id,
            name,
            description,
            category,
            difficulty_level,
            video_guide_url,
            step_by_step_instructions,
            muscle_group,
            secondary_muscle_group
        } = req.body;


        const updatedExercise = await updateExercise(exercise_id, req.body);

        res.status(200).json({
            success: true,
            message: 'Exercise updated successfully.',
            data: [updatedExercise]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error - /api/exercises/update - Error updating exercise',
            data: [error]
        });
    }
});


app.delete("/api/exercises/delete", async (req, res) => {
    try {
        const { exercise_id } = req.query;

        if (!exercise_id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request. Exercise ID is required for deleting an exercise.',
                data: []
            });
        }

        const existingExercise = await getSpecificExerciseData(exercise_id);
        if (!existingExercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found. Cannot delete.',
                data: []
            });
        }

        const queryResult = await deleteExercise(exercise_id)
        res.status(200).json({
            success: true,
            message: 'Exercise deleted successfully.',
            data: [queryResult]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error - /api/exercises/delete - Error deleting exercise',
            data: [error]
        });
    }
});



app.post("/api/personalized_program", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "trainer_id",
            "client_id",
            "beginning_date",
            "end_date",
            "overall_objective",
            "additional_information"
        ];

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
                message: "Error - /api/personalized_program - Error creating personalized program",
                data: [error]
            }
        )
    }
});

app.get("/api/personalized_program", async (req, res) => {

    try {

        const { personalized_program_id } = req.query;

        const personalizedProgramData = await getSpecificPerosnalizedProgramData(personalized_program_id)

        if (personalizedProgramData == null) 
        {
            res.status(404).json(
                {
                    success: false,
                    message: "Personalized program wih the given id doesn't exist!",
                    data: [personalizedProgramData]
                }
            )
        } else {
            res.status(200).json(
                {
                    success: true,
                    message: "Successful retrieval of specific personalized program data",
                    data: [personalizedProgramData]
                }
            )
        }


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/personalized_program - Error getting data for a specific personalized programs",
                data: [error]
            }
        )
    }
});


app.post("/api/customized_days", async (req, res) => {
    try {

        const expectedJSONObjectElements = [
            "personalized_program_id",
            "notes"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            personalized_program_id,
            notes
        } = req.body;

        const newCustomizedDay = await createANewCustomizedDay(
            personalized_program_id,
            notes
        )

        res.status(201).json(
            {
                success: true,
                message: "New customized day created (customized_day_id = " + newCustomizedDay.customized_day_id + ")",
                data: [newCustomizedDay]
            }
        )

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/customized_days - Error creating customized day",
                data: [error]
            }
        )
    }

});

app.get("/api/customized_days", async (req, res) => {

    try {

        const { customized_day_id } = req.query;

        const customizedDayData = await getSpecificCustomizedDayData(customized_day_id)

        if (customizedDayData == null) 
        {
            res.status(404).json(
                {
                    success: false,
                    message: "Customized day wih the given id doesn't exist!",
                    data: [customizedDayData]
                }
            )
        } else {
            res.status(200).json(
                {
                    success: true,
                    message: "Successful retrieval of specific customized day data",
                    data: [customizedDayData]
                }
            )
        }


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/customized_days - Error getting data for a specific customized day",
                data: [error]
            }
        )
    }
});


app.get("/api/users/user", async (req, res) => {

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
                message: "Error - /api/users/user - Error retrieving user data",
                data: [error]
            }
        )
    }
});

app.get("/api/users/user/measurements", async (req, res) => {

    try {

        const { user_id } = req.query;

        const physical_measurements = await getPhysicalMeasurements(user_id)
        const target_measurements = await getTargetUserMeasurements(user_id)

        res.status(200).json(
            {
                success: true,
                message: "Successful retrieval of measurements data",
                data: {
                    target_measurements: target_measurements,
                    physical_measurements: physical_measurements
                }
            }
        )


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/users/user/measurements ",
                data: [error]
            }
        )
    }
});

app.post("/api/users/user/measurements/physical/create", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "user_id",
            "weight",
            "waist_circumference",
            "chest_circumference",
            "arm_circumference",
            "leg_circumference",
            "hip_circumference"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);      

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            user_id,
            weight,
            waist_circumference,
            chest_circumference,
            arm_circumference,
            leg_circumference,
            hip_circumference
        } = req.body;

        await createPhysicalMeasurements(
            user_id,
            weight,
            waist_circumference,
            chest_circumference,
            arm_circumference,
            leg_circumference,
            hip_circumference                
        )

        res.status(200).json(
            {
                success: true,
                message: "New physical measurements were successfully added!",
                data: []
            }
        )
        

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/users/user/measurements/physical/create - Error creating a new measurements",
                data: [error]
            }
        )
    }
});

app.put("/api/users/user/measurements/target/update", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "user_id",
            "height",
            "target_weight",
            "target_waist_circumference",
            "target_chest_circumference",
            "target_arm_circumference",
            "target_leg_circumference",
            "target_hip_circumference"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);    

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            user_id,
            height,
            target_weight,
            target_waist_circumference,
            target_chest_circumference,
            target_arm_circumference,
            target_leg_circumference,
            target_hip_circumference
        } = req.body;

        await updateTargetMeasurements(
            user_id,
            height,
            target_weight,
            target_waist_circumference,
            target_chest_circumference,
            target_arm_circumference,
            target_leg_circumference,
            target_hip_circumference                
        )

        res.status(200).json(
            {
                success: true,
                message: "The target measurement was successfully changed!",
                data: []
            }
        )
        

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/users/user/measurements/target/update - Error when changing target measurements",
                data: [error]
            }
        )
    }
});

app.patch("/api/users/user/client/update", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "user_id",
            "first_name",
            "last_name",
            "e_mail",
            "date_of_birth",
            "phone_number",
            "place_of_residence",
            "sex"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);    

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            user_id,
            first_name,
            last_name,
            e_mail,
            date_of_birth,
            phone_number,
            place_of_residence,
            sex
        } = req.body;

        await updateClientPersonalInformation(
            user_id,
            first_name,
            last_name,
            e_mail,
            date_of_birth,
            phone_number,
            place_of_residence,
            sex                
        )

        res.status(200).json(
            {
                success: true,
                message: "Personal information has been successfully changed!",
                data: []
            }
        )
        

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/users/user/client/update - Error when changing personal information",
                data: [error]
            }
        )
    }
});

app.patch("/api/users/user/password", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "user_id",
            "current_password",
            "new_password"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);    

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            user_id,
            current_password,
            new_password
        } = req.body;

        const user = await getUserData(user_id)

        const hashUserSaltedInsertedPassword = crypto.createHash('sha256').update(current_password + user[0].salt).digest('hex')

        if (user[0].password != hashUserSaltedInsertedPassword) {

            res.status(401).json(
                {
                    success: false,
                    message: "User's password incorrect!",
                    data: []
                }
            )
        } else {
                    
            const userSalt = crypto.randomBytes(16).toString('hex') 
            const safePassword = crypto.createHash('sha256').update(new_password + userSalt).digest('hex')

            await newPassword(user_id, safePassword, userSalt, new_password) 

            res.status(200).json(
                {
                    success: true,
                    message: "Password has been successfully changed!",
                    data: []                      
                }
            )
        }        

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/users/user/password - Error when changing password",
                data: [error]
            }
        )
    }
});

app.post("/api/meal_plan/create", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "user_id",
            "day",
            "breakfast",
            "morning_snack",
            "lunch",
            "afternoon_snack",
            "dinner"
        ];

        const emptyFields = expectedJSONObjectElements.filter(field => req.body[field] === '');      

        if (emptyFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some fields are empty.",
                data: []
            });
        }

        const {
            user_id,
            day,
            breakfast_picture,
            breakfast,
            morning_snack_picture,
            morning_snack,
            lunch_picture,
            lunch,
            afternoon_snack_picture,
            afternoon_snack,
            dinner_picture,
            dinner
        } = req.body;

        await createMealPlan(
            user_id,
            day,
            breakfast_picture,
            breakfast,
            morning_snack_picture,
            morning_snack,
            lunch_picture,
            lunch,
            afternoon_snack_picture,
            afternoon_snack,
            dinner_picture,
            dinner               
        )

        res.status(200).json(
            {
                success: true,
                message: "New meal plan successfully added!",
                data: []
            }
        )
        

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/meal_plan/create - Error creating a new meal plan",
                data: [error]
            }
        )
    }
});

app.get("/api/plan_weight", async (req, res) => {

    try {

        const plan_weight = await getPlanWeight()

        res.status(200).json(
            {
                success: true,
                message: "Successful retrieval of plan weight data",
                data: plan_weight
            }
        )


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/plan_weight - Error retrieving plan weight data",
                data: [error]
            }
        )
    }
});


app.get("/api/exercises", async (req, res) => {

    try {

        const { user_id } = req.query;

        const exercises = await getExerciseData(user_id)

        if(exercises && exercises.length > 0){

            res.status(200).json(
                {
                    success: true,
                    message: "Successful retrieval of exercise data",
                    data: exercises
                }
            )
        }else{

            res.status(404).json(
                {
                    success: false,
                    message: "Exercises don't exist!",
                    data: []
                }
            )

        }


    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/exercises - Error checking exercise data",
                data: [error]
            }
        )
    }
});

app.post("/api/weight_loss_plan/create", async (req, res) => {

    try {

        const expectedJSONObjectElements = [
            "user_id",
            "name",
            "description",
            "start_date",
            "end_date",
            "plan_weight_id",
            "exercises"
        ];

        const hasAllExpectedObjectElements = expectedJSONObjectElements.every(field => field in req.body);      

        if (!hasAllExpectedObjectElements) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Missing or unexpected object elements!',
                data: []
            });
        }

        const {
            user_id,
            name,
            description,
            start_date,
            end_date,
            plan_weight_id,
            exercises
        } = req.body;

        if(user_id == null || name == null || description == null || start_date == null || end_date == null || plan_weight_id == null || exercises.length == 0){

            return res.status(409).json({
                success: false,
                message: 'Some fields are empty.',
                data: []
            });
        }

        const weight_loss_plan_id = await createWeightLossPlan(
            user_id,
            name,
            description,
            start_date,
            end_date,
            plan_weight_id
        )

        await createWeightLossPlanExercises(weight_loss_plan_id, exercises)

        res.status(200).json(
            {
                success: true,
                message: "New weight loss plan successfully added!",
                data: []
            }
        )
        

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "Error - /api/weight_loss_plan/create - Error creating a new weight loss plan",
                data: [error]
            }
        )
    }
});



app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Error - Something broke!')
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running and listening on port ${port} ...`)
});
