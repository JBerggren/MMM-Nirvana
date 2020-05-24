const conf = require('./conf');
const https = require('https')
/* Info from https://github.com/mikesimons/nibbana/wiki/NirvanaHQ-API 
Task data
parentid: Parent project UUID
seq: order
tags: tags
*/

const TASK_STATE = {
    INBOX: 0,
    NEXT: 1,
    WAITING: 2,
    SCHEDULED: 3,
    SOMEDAY: 4,
    LATER: 5,
    TRASHED: 6,
    LOGGED: 7,
    DELETED: 8,
    RECURRING: 9,
    ACTIVE_PROJECT: 11
};

const TASK_TYPE = {
    TASK: 0,
    PROJECT: 1
};

login(conf.username, conf.password, function (token) {
    console.log("Login. Got token: " + token);
    getTasks(token, function (tasks) {
        console.log(`Final result`,tasks);
    });
})

function getTasks(token, callback) {
    makeDataRequest(token, function (sucess, dataString) {
       // console.log(`makeDataRequest ok:${sucess}, data: '${data}'`)
        var tasks = [];
        var projects = [];
        if (sucess) {
            var data = JSON.parse(dataString);
            if (data.results) {
                for (var i = 0; i < data.results.length; i++) {
                    if (data.results[i].task) {
                        var task = data.results[i].task;
                        var myTask = { id: task.id, name: task.name,state:task.state }; //Get data we care about
                        if (task.type == TASK_TYPE.TASK) {
                            tasks.push(myTask)
                        } else if (task.type == TASK_TYPE.PROJECT) {
                            projects.push(myTask);
                        }
                    }
                }
            }
        }
        callback({ tasks: tasks, projects: projects });
    });
}


function makeDataRequest(token, callback) {
    var options = {
        hostname: 'focus.nirvanahq.com',
        port: 443,
        path: '',
        method: 'GET'
    };

    var reqId = uuidv4();
    var since = new Date();
    since.setDate(since.getDate() - 30); //Limit to things updated latest month
    options.path = `/api/?api=rest&method=everything&requestid=${reqId}&since=${since.valueOf() / 1000}&clienttime=${Date.now() / 1000}&authtoken=${token}&appid=mmm-nirvana&appversion=001`;

    const req = https.request(options, res => {
        var body ='';
        res.on('data', d => {
            body += d;
        });
        res.on('end', ()=>{
            callback(true,body);
        });
    })
    req.on('error', error => {
        callback(false, error);
    })
    req.end()
}

function login(username, password, callback) {
    var token = "";
    postToLogin(`method=auth.new&u=${username}&p=${password}`, function (success, dataString) {
        if (success) {
            var data = JSON.parse(dataString);
            if (data.results) {
                for (var i = 0; i < data.results.length; i++) {
                    if (data.results[i].auth) {
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
    options.path = `/api/?api=rest&requestid=${reqId}&clienttime=${Date.now() / 1000}&authtoken=&appid=mmm-nirvana&appversion=001`;
    //console.info(`Calling ${options.path} with data ${dataString}`);

    const req = https.request(options, res => {
        res.on('data', d => {
            callback(true, d);
        })
    })
    req.on('error', error => {
        callback(false, error);
    })
    req.write(dataString)
    req.end()
}

//https://stackoverflow.com/a/2117523
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
