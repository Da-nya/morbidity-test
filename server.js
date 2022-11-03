const db_config = require('./db_config');

const http = require('http');
const fs = require('fs');

const mysql = require('mysql');
const conn = mysql.createConnection(db_config.mysql_settings);
conn.connect(err =>{
    if (err){
        console.log(err.message);
        return
    }
    console.log('Успешное поключение к БД mysql.');
});
conn.query('SELECT territory.name as t_name, hospital.name as h_name, disease.name as d_name, patients, issued from hospital JOIN statistics ON hospital_id = hospital.id JOIN disease ON disease.id = disease_id JOIN territory ON territory.id = terr_id;', (err, res)=>{
    console.log(res.length);
})
const server = http.createServer();
server.on('request', (request, response)=>{
    function sendFile(type){
        let path = request.url.slice(1);
        let file = fs.readFileSync(path, "utf8");

        response.writeHead(200, {'Content-Type': type});
        response.end(file);
    }
    switch(request.url){
        case '/':
            let index = fs.readFileSync("index.html", "utf8");
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(index);
            break;
        case '/css/style.css':
            sendFile('text/css');
            break;
        case '/js/script.js':
            sendFile('text/plain');
            break;
        default:
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end('404 File Not Found');
    }
});

server.listen(8080, ()=>{console.log('Server works at localhost:8080')});