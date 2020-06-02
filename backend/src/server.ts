import  express from "express";

const app = express();

app.get('/users', (request, response) => {
    console.log("Funcionou");

    response.json(["Hello", 
"Darkness"]);
} );

app.listen(3333);