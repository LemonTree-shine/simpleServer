#!/usr/bin/env node

var http = require("http");
var fs = require("fs");
var https = require("https");

//获取https证书
var privateKey  = fs.readFileSync(__dirname+'/sslFile/private.pem', 'utf8');
var certificate = fs.readFileSync(__dirname+'/sslFile/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

//var currentPath = __dirname;
var currentPath = process.cwd();

var httpServer = http.createServer();

var httpsServer = https.createServer(credentials);

httpServer.on("request",function(req,res){
    app(req,res);
});

httpsServer.on("request",function(req,res){
    app(req,res);
});

function app(req,res){
    var URL = decodeURIComponent(req.url);
    if(URL==="/favicon.ico"){
        res.end();
        return
    }else{
        var state = fs.lstatSync(currentPath+URL);
        //判断是否走缓存
        if(req.headers["if-modified-since"]&&req.headers["if-modified-since"]==state.ctime){
            res.writeHead(304,"Not Modified");
            res.end();
        }else{
            //判断是否是文件夹
            if(state.isDirectory()){
                doAsDirectory(req,res);
            }else{
                doAsFile(req,res);
            }
        }
        
    } 
}

function doAsDirectory(req,res){
    var URL = decodeURIComponent(req.url);
    var dirList = fs.readdirSync(currentPath+URL);
    var state = fs.statSync(currentPath+URL);
    //拼接列表字符串
    var content = "";
    dirList.forEach((list)=>{
        var href = URL==="/"?URL.replace(/^\/{1}/,"")+"/"+list:URL+"/"+list;
        content += `<div><a href=${href}>${list}</a></div>`
    });
    
    res.writeHead(200,{
        "content-type":"text/html;charset=UTF8",
        "Cache-Control": 'max-age=0',
        "Last-Modified":state.ctime
    });
    res.end(content);
}

function doAsFile(req,res){
    var URL = decodeURIComponent(req.url);
    var state = fs.statSync(currentPath+URL);
    var fileContent = fs.readFileSync(currentPath+URL);

    res.setHeader("Cache-Control",'max-age=0');
    res.setHeader("Last-Modified",state.ctime);
    console.log(res)
    fileType(URL,res);

    res.end(fileContent);
    return;
}


//判断文件类型
function fileType(url,res){
    if(/\.html$/.test(url)){
        res.setHeader("content-type","text/html;charset=UTF8");
    }else if(/(\.js)$/.test(url)){
        res.setHeader("content-type","text/javascript;charset=UTF8"); 
    }else if(/(\.css)$/.test(url)){
        res.setHeader("content-type","text/css"); 
    }else if(/(\.png)$/.test(url)){
        res.setHeader("content-type","image/png"); 
    }else{
        res.setHeader("content-type","text/plain; charset=utf-8"); 
    }
}


//http服务
httpServer.listen("8888",function(){
    console.log("http run at 8888");
});

//https服务
httpsServer.listen("9999",function(){
    console.log("https run at 9999")
});





