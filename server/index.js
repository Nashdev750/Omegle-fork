const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')
const axios =  require('axios')

const io = new Server(server,{
    cors:{
        origin:'*',
    }
});


app.use(cors())

const PORT = process.env.PORT || 8000


app.get('/',(req,res)=>{
    res.status(404).send();
})

io.on('connection',(socket)=>{
    socket.emit('me',socket.id)
    axios.get('https://omegleapi.closjob.com/api/join/'+socket.id)
    .then(data=>{})
    .catch(err=>{})

    socket.on('isConnected', async function(id, ackFn) {
        const sockets = (await io.fetchSockets()).map(socket => socket.id);
        ackFn(sockets.includes(id));
    });
    socket.on('total', async function(id, ackFn) {
        const sockets = (await io.fetchSockets()).map(socket => socket.id);
        ackFn(sockets);
    });

    socket.on('disconnect',()=>{
        axios.get('https://omegleapi.closjob.com/api/leave/'+socket.id)
        .then(data=>{})
        .catch(err=>{})
        socket.broadcast.emit("callended",{id:socket.id})
    })

    socket.on('calluser',({userToCall,signalData,from,name})=>{
      io.to(userToCall).emit("calluser",{signal:signalData,from,name})
    })
    
    socket.on('answercall',(data)=>{
        io.to(data.to).emit('callaccepted', data.signal)
    })
    
    socket.on('message',(data)=>{
        io.to(data.to).emit('message', data)
    })

})

server.listen(PORT,()=>{
    console.log('app running on port on:', PORT)
})