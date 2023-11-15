//- Importing of dotenv library
import dotenv from 'dotenv';
dotenv.config();



import mysql from 'mysql2'
//"hardcoded" Pool - Collection of connection to the database
// const pool = mysql.createPool({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'root',
//     database: 'coachcom_db_v1'
// }).promise()
//.promise() will allow us to use promise ver of mysql api instead of using callback functions

//Pool with environment variables - better in case when running the app on other environments
//Gets it's values from the file called '.env'
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()




//-- Gives data and apperently metadata...
// const queryResult = await pool.query("SELECT * FROM korisnici");

//-- Gives only the first bracket -> actual data from the query...
//-- This is called destructuring assignment
// const [queryResult] = await pool.query("SELECT * FROM korisnici");

//A better way of doing previous...
//export - defines that the function can be used in a diffrent file
export async function getUsers() {
    const [queryResult] = await pool.query("SELECT * FROM korisnici");
    return queryResult
}

// const users = await getUsers();

// console.log(users);
// console.log("-------------------------------");



//??-- Zar nebi trebali provlačiti ove vrijednosti kroz funkcije kao specialhtmlchars() ili tak nes da se sustav obrani protiv XSS i SQLInjection napada
//--For multiline query use '`' (Alt Gr + 7)
//--This "Methodolgy" of writing query's is called prepared statement (Radio na WebDiP-u)
export async function getSpecificUser(userId) {
    const [queryResult] = await pool.query(
        `
        SELECT * 
        FROM korisnici
        WHERE id_korisnika = ?
        `,
        [userId]
    );
    return queryResult
}

// const specificUser = await getSpecificUser(3);
// console.log(specificUser);
// console.log(specificUser[0]);   //--Better - Practically gets the same data but this time not as an array (with 1 object) but first object from that array... 
// console.log("-------------------------------");




//--Seeing that this is an INSERT statment you sometimes MYB want to get all the data possible (metadata) by removing [] on 'queryResult' - Reminder: '[queryResult]' gives you only data...
export async function createNewUser(userName, usersPasswordUnhashed) {
    const queryResult = await pool.query(
        `
        INSERT INTO korisnici (korisnicko_ime, lozinka_unhashed)
        VALUES (?, ?)
        `,
        [userName, usersPasswordUnhashed]
    );

    const newUserId = queryResult[0].insertId;  //-- [0] must be defined here (to net get undefined) since you removed them at the start of the function...

    //--Gives all available data
    // return queryResult       

    //--Gives specificly defined data as an object ({})
    // return {
    //     id: newUserId,
    //     att_UserName: userName,    //You don't need to define the name of the attribute of the object... But if you want this is how it is done...
    //     usersPasswordUnhashed   //An example when not defining the name of the attribute... 
    // }

    //--Gives all the data that is on the DB after inseration
    //--This is usefule when you have some values that are defined by defult from the DB side and you want to load them back in the code...
    return getSpecificUser(newUserId)
}

// const createQueryResult = await createNewUser("Test", "test");

// console.log("New user inserted!");   //--Better - Practically gets the same data but this time not as an array (with 1 object) but first object from that array...
// console.log(createQueryResult);
// console.log(createQueryResult[0].insertId);                                    //Gives Error of undefined since it is commented...
// console.log("New user inserted with ID " + createQueryResult[0].insertId);     //                  -||-

// console.log(createQueryResult);

// console.log("-------------------------------");