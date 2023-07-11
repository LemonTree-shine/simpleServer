#!/usr/bin/env node

var http = require("http");
var fs = require("fs");
var https = require("https");
let { doAsDirectory,doAsFile,currentPath } = require("./util/util.js");


//获取https证书
var privateKey  = fs.readFileSync(__dirname+'/sslFile/private.pem', 'utf8');
var certificate = fs.readFileSync(__dirname+'/sslFile/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};


var httpServer = http.createServer();

var httpsServer = https.createServer(credentials);

httpServer.on("request",function(req,res){
    try {
        app(req,res);
    } catch (error) {
        console.log(error);
    }
    
});

httpsServer.on("request",function(req,res){
    try {
        app(req,res);
    } catch (error) {
        console.log(error);
    }
});

function app(req,res){
    getMethod(req,res);
}

function getMethod(req,res){
    var URL = decodeURIComponent(req.url).split("?")[0];
    if(URL==="/favicon.ico"){
        res.end();
        return
    }else{
        var state = fs.lstatSync(currentPath+URL);
        //判断是否走缓存
        if(req.headers["if-modified-since"]&&req.headers["if-modified-since"]==state.ctime.getTime()){
            res.writeHead(304,"Not Modified");
            res.end();
        }else{
            //判断是否是文件夹
            if(state.isDirectory()){
                doAsDirectory(req,res,URL);
            }else{
                doAsFile(req,res,URL);
            }
        }
        
    } 
}

var port = process.argv[2];
//http服务
httpServer.listen(port||"8888",function(){
    console.log(`http run at ${port||"8888"}`);
});

//https服务
// httpsServer.listen("9999",function(){
//     console.log("https run at 9999")
// });





