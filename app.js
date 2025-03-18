const express = require('express');
const app = express();
const path = require("path")
const http = require("http")

const socketio = require("socket.io")


const server = http.createServer(app)

const io = socketio(server, {
    cors: {
      origin: "*",  // Allow connections from any origin
      methods: ["GET", "POST"]
    }
  });

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))

io.on("connection",function(socket){
    socket.on("send-location",(data)=>{
        io.emit("receive-location",{id:socket.id, ...data})
    })
    socket.on("user-disconnect",()=>{
        io.emit("User Disconnected",socket.id);
    }) 

    socket.on("add-marker", (data) => {
        io.emit("new-marker", { id: socket.id, ...data });
    });
})

app.get("/",function(req,res){
    res.render("index");
})

const PORT = process.env.PORT || 3000;  // Use Vercel-assigned port
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});