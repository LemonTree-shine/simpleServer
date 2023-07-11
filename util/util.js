var fs = require("fs");


var currentPath = process.cwd();
var route = require("../route/route.js");
// const formidable = require('formidable');
// var multiparty = require('multiparty');

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
        "Last-Modified":state.ctime.getTime()
    });
    res.end(content);
}

exports.doAsFile = function (req,res,URL){
    var state = fs.statSync(currentPath+URL);
    var fileContent = fs.readFileSync(currentPath+URL);

    res.setHeader("Cache-Control",'max-age=0');
    res.setHeader("Last-Modified",state.ctime.getTime());

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