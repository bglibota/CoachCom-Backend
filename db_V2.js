import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

import { generateRandomString } from './functions.js';


//--------------------------------------------------------------------------------------
//-- RESTful API -- Registration -- ####################################################
//--------------------------------------------------------------------------------------

export async function checkIfUsernameIsAvailable(insertedUsername) {
    const [queryResult] = await pool.query(
        `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [insertedUsername]
    );

    if (queryResult[0] == null) {
        return true     //username available
    } else {
        return false
    }
}
// console.log(await checkIfUsernameIsAvailable("kkk"))

export async function getASpecificUser(userId) {
    const [queryResult] = await pool.query(
        `
        SELECT * 
        FROM users
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
    );
    return queryResult[0]   // [0] First element of an array
}

export async function createANewClient(
    userName, safePassword, salt, firstName, lastName, eMail, dateOfBirth, phoneNumber, placeOfResidence, sex, biography,
    profilePicturePath,
    biographyVideoPath, rawPassword
) {
    const userTypeId = 2;
    const activationCode = generateRandomString(8);
    const profileStatus = true;
    const numberOfLoginAttempts = 0;
    const lastLoginTime = null;

    const currentDateTime = new Date();

    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

    const currentDateTimeFormattedForSQL = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const registrationDate = currentDateTimeFormattedForSQL;

    const queryResult = await pool.query(
        `
        INSERT INTO users 
        (
            username, password, salt, first_name, last_name, e_mail, date_of_birth, phone_number, place_of_residence, sex, biography, 
            registration_date, last_login_time, number_of_login_attempts, activation_code, profile_picture_path, 
            profile_status, biography_video_path, user_type_id, raw_password
        )
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userName, safePassword, salt, firstName, lastName, eMail, dateOfBirth, phoneNumber, placeOfResidence, sex, biography,
            registrationDate, lastLoginTime, numberOfLoginAttempts, activationCode, profilePicturePath,
            profileStatus, biographyVideoPath, userTypeId, rawPassword
        ]
    );

    const newClientId = queryResult[0].insertId;  //-- [0] must be defined here (to net get undefined) since you removed them at the start of the function...

    return getASpecificUser(newClientId)
}

export async function createANewTrainer(
    userName, safePassword, salt, firstName, lastName, eMail, dateOfBirth, phoneNumber, placeOfResidence, sex, biography,
    profilePicturePath, documentationDirectoryPath,
    biographyVideoPath, rawPassword
) {
    const userTypeId = 1;
    const activationCode = generateRandomString(8);
    const profileStatus = true;
    const numberOfLoginAttempts = 0;
    const lastLoginTime = null;

    const currentDateTime = new Date();

    const year = currentDateTime.getFullYear();
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

    const currentDateTimeFormattedForSQL = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const registrationDate = currentDateTimeFormattedForSQL;

    const queryResult = await pool.query(
        `
        INSERT INTO users 
        (username, password, salt, first_name, last_name, e_mail, date_of_birth, phone_number, place_of_residence, sex, biography, 
            registration_date, last_login_time, number_of_login_attempts, activation_code, profile_picture_path, documentation_directory_path, 
            profile_status, biography_video_path, user_type_id, raw_password)
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userName, safePassword, salt, firstName, lastName, eMail, dateOfBirth, phoneNumber, placeOfResidence, sex, biography,
            registrationDate, lastLoginTime, numberOfLoginAttempts, activationCode, profilePicturePath, documentationDirectoryPath,
            profileStatus, biographyVideoPath, userTypeId, rawPassword
        ]
    );

    const newTrainerId = queryResult[0].insertId;  //-- [0] must be defined here (to net get undefined) since you removed them at the start of the function...

    return getASpecificUser(newTrainerId)
}

//If needed - Formated version for pleasent croatian viewing...
// console.log(new Date().toLocaleString('hr-HR', { timeZone: 'Europe/Zagreb', hour12: false }))

//--------------------------------------------------------------------------------------
//-- RESTful API -- Registration -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------



//--------------------------------------------------------------------------------------
//-- RESTful API -- Login -- ###########################################################
//--------------------------------------------------------------------------------------

export async function checkUsernameForLogin(insertedUsername) {
    
    const [queryResult] = await pool.query(
        `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [insertedUsername]
    );

    return queryResult
}

export async function checkUserRole(insertedUsername) {
    const [queryResult] = await pool.query(
        `
        SELECT user_types.name
        FROM users
        JOIN user_types ON users.user_type_id = user_types.user_type_id
        WHERE users.username = ?
        LIMIT 1
        `,
        [insertedUsername]
    );
   

    return queryResult
}

export async function getUserData(user_id) {
    
    const [queryResult] = await pool.query(
        `
        SELECT *
        FROM users
        WHERE user_id = ?
        LIMIT 1
        `,
        [user_id]
    );

    return queryResult
}

export async function getUserMeasurements(user_id) {
    
    const [queryResult] = await pool.query(
        `
        SELECT *
        FROM physical_measurements
        WHERE user_id = ?
        `,
        [user_id]
    );

    return queryResult
}

export async function getTargetUserMeasurements(user_id) {
    
    const [queryResult] = await pool.query(
        `
        SELECT *
        FROM target_measurements
        WHERE user_id = ?
        `,
        [user_id]
    );

    return queryResult
}

// console.log(await checkUsernameForLogin("nherci", "niki123"))

//--------------------------------------------------------------------------------------
//-- RESTful API -- Login -- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//--------------------------------------------------------------------------------------


