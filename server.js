//name,image,level and add-to-favorite button
//require
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

//main variables
const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL)

//uses
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

//lestining on port 
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listining on port ${PORT}`);

        })
})

//===================(the routs)===================\\
app.get('/',homeHanler)
app.get('/addToFavourate',addToFavourateHandler )
app.get('/addTofav' , addTofavHandler)
app.get('/details/:digi_id' ,detailsHandler )
app.put('/update/:update_id' ,updateHandler )
app.delete('/delete/:delete_id' ,deleteHandler )
//===================(the routs handlers)===================\\

//******************** */
function homeHanler (req,res){
   let url = `https://digimon-api.herokuapp.com/api/digimon`;
   superagent.get(url)
   .then(data=>{
       let digiArray = data.body.map(val=>{
           return new Digimons(val)
       })
       res.render('./index' , {data : digiArray})
   })
}

function Digimons(val){
    this.name = val.name;
    this.img_url = val.img;
    this.level = val.level
}
// ***********************************

function addToFavourateHandler (req,res){
    //collect
    let {name , img_url , level} = req.query
    //insert
    let sql = `INSERT INTO digi2 (name , img_url , level) VALUES ($1,$2,$3);`;
    let safeValues = [name , img_url , level];
    //redirect
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect('/addTofav')
    })
}
// ******************************
function addTofavHandler (req,res){
    let sql = `SELECT * FROM digi2;`;
    client.query(sql)
    .then(result=>{
        res.render('./pages/favorite' , {data : result.rows})
    })
}

// ***************************
function detailsHandler (req,res){
    //collect param 
    let param = req.params.digi_id;
    //select wjere id = param value
    let sql = `SELECT * FROM digi2 WHERE id = $1;`;
    let safeValue = [param]
    //render to detail page
    client.query(sql,safeValue)
    .then(result=>{
        res.render('./pages/detail' , {data : result.rows[0]})
    })
}

// **************************
function updateHandler (req,res){
    //collect param value 
    let param = req.params.update_id;
    //collect updated data
    let {name , img_url , level} = req.body
    //update
    let sql = `UPDATE digi2 SET name=$1,img_url=$2,level=$3 WHERE id =$4;`;
    let safeValues = [name , img_url , level,param];
    //redirect to the same page
    client.query(sql,safeValues)
    .then(()=>{
        res.redirect(`/details/${param}`)
    })
}

// ****************************

function deleteHandler (req,res){
    //collect param 
    let param = req.params.delete_id;
    let sql = `DELETE FROM digi2 WHERE id = $1;`;
    let safeValue = [param];
    client.query(sql,safeValue)
    .then(()=>{
        res.redirect('/addTofav')
    })
}
//error handlers

function notFoundHandler(req, res) {
    res.status(404).send('page not found')
}
function errorHandler(error, req, res) {
    res.status(500).send(error)
}