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
        case '/getDefault':
            Promise.all([getAllFO(), getLastDate()]).then(results => {
                const id = Object.keys(results[0])[0];
                const month = String(results[1][0].date).slice(4, 6);
                filterDB(id, month).then(table => {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    result = {fo: results[0], fo_id: id, month: month, table: table};
                    response.end(JSON.stringify(result));
                });
            });
            break;
        default:
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end('404 File Not Found');
    }
});

// функция для синхронной работы с БД
function SQLquery(query = ''){
    return new Promise(resolve =>{
        conn.query(query, (err, res) => {
            if (err){
                console.log('SQL ERROR -- ' + err.message);
            }
            resolve(res);
        })
    })
}

// возвращает объект вида id => [name, степень иерархии]
async function calculateHierarchy(){
    const territories = await SQLquery('SELECT * FROM territory');
    let result = {};
    for(let terr of territories){
        count = 0;
        let parent = terr;
        do {
            if (result[parent.parent_id]){
                count = result[parent.parent_id][1] + 1;
                break;
            }
            parent = await SQLquery('SELECT * FROM territory WHERE id = ' + parent.parent_id);
            count +=1;
        } while (parent.length > 0)
        result[terr.id] = [terr.name, count];
    }
    return result;
}

// возвращает объект вида id => имя ФО
async function getAllFO(){
    const terr = await calculateHierarchy();
    let res = {};
    for(key in terr){
        if (terr[key][1] == 2){
            res[key] = terr[key][0];
        }
    }
    return res;
}
async function getLastDate(){
    return await SQLquery('SELECT MAX(date) as date FROM statistics');
}

async function filterDB(id_fo, month){
    month = String(month);
    if (month.length < 2){
        month = '0' + month;
    }
    let query = 'SELECT territory.name as t_name, hospital.name as h_name, disease.name as d_name, patients, issued from hospital JOIN statistics ON hospital_id = hospital.id JOIN disease ON disease.id = disease_id JOIN territory ON territory.id = terr_id';
    query += ' WHERE territory.parent_id = ' + id_fo + ' AND date REGEXP \'[0123456789]{4}' + month + '[0123456789]{2}\'';
    return SQLquery(query);
}
server.listen(8080, ()=>{console.log('Server works at localhost:8080')});