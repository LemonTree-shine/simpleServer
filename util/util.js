var fs = require("fs");


var currentPath = process.cwd();
var route = require("../route/route.js");
const formidable = require('formidable');
var multiparty = require('multiparty');

exports.currentPath = currentPath;

//处理是文件夹类型
exports.doAsDirectory = function (req,res,URL){
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

exports.doAsFile = function (req,res,URL){
    var state = fs.statSync(currentPath+URL);
    var fileContent = fs.readFileSync(currentPath+URL);

    res.setHeader("Cache-Control",'max-age=0');
    res.setHeader("Last-Modified",state.ctime);

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

exports.postMethod = function(req,res){
    if(req.headers['content-type'].indexOf("multipart/form-data")!==-1){
        var form = new multiparty.Form({
            uploadDir: "tmp",
            encoding:'utf-8'
          });

        form.parse(req, (err, fields, files) => {
            route[req.url](req,res);
        });
        
    }else{
        let chunk = [];
        req.on('data',function(data){
            chunk = chunk.concat(data);
        });
        req.on('end',function(){
            let resultData = chunk.toString();
            req.body = JSON.parse(resultData||'{}');
            route[req.url](req,res); 
        });
        
    }
    
}