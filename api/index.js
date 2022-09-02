const express = require('express')
const mysql = require('mysql')
const app = express()
const cors = require('cors')

app.use(cors({
    origin: '*'
  }));
  
const port = process.env.PORT || 5000

const pool  = mysql.createPool({
    connectionLimit:10,
    host:'localhost',
    user:'root',
    password:'',
    database:'omegle'
})

// configs
app.use(express.json());



// routes
app.get('/api/getids',(req,res)=>{
    let sql = 'SELECT uid FROM `users` WHERE `status`=1'
    pool.getConnection((err,connection)=>{
        if(err) return res.send({status:500,data:[]})
        connection.query(sql,(err,rows)=>{
          if(err) return res.send({status:500,data:[]}) 
          return  res.send({status:200,data:rows}) 
        })
    })
})

app.get('/api/join/:id',(req,res)=>{
    let id = req.params.id
    let sql = 'INSERT INTO `users`(`uid`) VALUES (?)'
    pool.getConnection((err,connection)=>{
        if(err) return res.send({status:500,data:[]})
        connection.query(sql,[id],(err,rows)=>{
          if(err) return res.send({status:500,data:[]}) 
          return  res.send({status:200,data:rows}) 
        })
    })
    
})

app.get('/api/leave/:id',(req,res)=>{
    let id = req.params.id
    let sql = 'DELETE FROM `users` WHERE `uid` = ?'
    pool.getConnection((err,connection)=>{
        if(err) return res.send({status:500,data:[]})
        connection.query(sql,[id],(err,rows)=>{
          if(err) return res.send({status:500,data:[]}) 
          return  res.send({status:200,data:rows}) 
        })
    })
    
})

app.get('/api/call/:id',(req,res)=>{
    let id = req.params.id
    let sql = 'UPDATE `users` SET `status`=1 WHERE `uid` =?'
    pool.getConnection((err,connection)=>{
        if(err) return res.send({status:500,data:[]})
        connection.query(sql,[id],(err,rows)=>{
          if(err) return res.send({status:500,data:[]}) 
          return  res.send({status:200,data:rows}) 
        })
    })
    
})



app.listen(port,()=>console.log('listening on port '+port))