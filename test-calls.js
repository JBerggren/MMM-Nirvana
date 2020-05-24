const conf = require('./conf');
const https = require('https')

login(conf.username,conf.password,function(token){
    console.log("Login. Got token: " + token);
})

function login(username,password, callback){
    var token = "";
    postToLogin(`method=auth.new&u=${username}&p=${password}`,function(success,dataString){
        console.log(`After login. Ok:'${success}', data: '${dataString}'`);
        if(success){
            var data = JSON.parse(dataString);
            if(data.results){
                for(var i=0;i<data.results.length;i++){
                    if(data.results[i].auth){
                        token = data.results[i].auth.token;
                        break;
                    }
                }
            }
        }
        callback(token);
    });
    
}

function postToLogin(dataString, callback) {
    var options = {
        hostname: 'focus.nirvanahq.com',
        port: 443,
        path: '',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': dataString.length
        }
    };

    var reqId = uuidv4();
    options.path = `/api/?api=rest&requestid=${reqId}&clienttime=${Date.now()/1000}&authtoken=&appid=mmm-nirvana&appversion=001`;
    console.info(`Calling ${options.path} with data ${dataString}`);
    
    const req = https.request(options, res => {
        res.on('data', d => {
            callback(true,d);
        })
    })
    req.on('error', error => {
        callback(false,error);
    })
    req.write(dataString)
    req.end()
}

//https://stackoverflow.com/a/2117523
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
