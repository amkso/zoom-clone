import express from "express";
import http from "http";
import WebSocket from "ws";
import livereloadMiddleware from "connect-livereload";
import livereload from "livereload";

const liveServer = livereload.createServer({
    exts: ["js", "pug", "css"],
    delay: 1000,
});

const app = express();

liveServer.watch(__dirname);
app.use(livereloadMiddleware());

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000/');

const server = http.createServer(app);

const wss = new WebSocket.Server({server});

const sockets = [];

wss.on("connection", (socket) =>{
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from Browser"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        message.payload = message.payload.toString('utf-8');
        message.type = message.type.toString('utf-8');
        switch(message.type){
            case "new_message":
                sockets.forEach(aSocket => 
                    aSocket.send(`${socket.nickname}: ${message.payload}`)
                );
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});

server.listen(3000, handleListen);