/* MMM-Nirvana
 *
 * By Jonatan Berggren - https://github.com/jberggren
 * MIT Licensed.
 */

const https = require('https');

var nirvanaAPI = {
    authenticate: function (username, password, callback) {
        var me = this;
        me.executeLoginRequest(username, password, function (success, dataString) {
            try {
                if (success) {
                    var token = me.parseLoginResult(dataString);
                    if (token != null) {
                        callback(token);
                        return;
                    }
                }
            } catch (er) {
            }
            callback({ error: 'AUTH_FAILED' });
        });
    },
    getData: function (token, since, callback) {
        var me = this;
        var error = null;
        me.executeDataRequest(token, function (success, dataString) {
            try {
                if (success) {
                    var data = me.parseDataResult(dataString);
                    try {
                        callback(data);
                    } catch (e) {
                        callback({ error: 'GETDATA_CALLBACK_FAILED', success: success, data: dataString });
                    }
                } else {
                    callback({ error: 'GETDATA_FAILED', success: success, data: dataString });
                }
            } catch (er) {
                callback({ error: 'GETDATA_ERR', success: success, data: dataString, err: er });
            }

        }, since);
    },

    parseLoginResult: function (dataString) {
        var data = JSON.parse(dataString);
        if (data.results) {
            for (var i = 0; i < data.results.length; i++) {
                if (data.results[i].auth) {
                    return { token: data.results[i].auth.token, expires: data.results[i].auth.expires*1000 };
                }
            }
        }
        return null;
    },

    parseDataResult: function (dataString) {
        var tasks = [];
        var projects = [];

        var data = JSON.parse(dataString);
        if (data.results) {
            for (var i = 0; i < data.results.length; i++) {
                if (data.results[i].task) {
                    var task = data.results[i].task;
                    var myTask = task;
                    if (task.type == this.TASK_TYPE.TASK) {
                        tasks.push(myTask);
                    } else if (task.type == this.TASK_TYPE.PROJECT) {
                        projects.push(myTask);
                    }
                }

            }
            //setup parent projekt and project childs
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].parentid != "") {
                    tasks[i].project = projects.find(x => x.id == tasks[i].parentid);
                }
            }
        }
        return { tasks: tasks, projects: projects };
    },

    executeDataRequest: function (token, callback, since) {
        var options = {
            hostname: 'focus.nirvanahq.com',
            port: 443,
            path: '',
            method: 'GET'
        };

        var reqId = this.uuidv4();
        if (!since) {
            since = new Date();
            since.setDate(since.getDate() - 30); //Limit to things updated latest month
        }
        
        options.path = `/api/?api=rest&method=everything&requestid=${reqId}&since=${Math.floor(since.valueOf() / 1000)}&clienttime=${Math.floor(Date.now() / 1000)}&authtoken=${token}&appid=mmm-nirvana&appversion=001`;
        const req = https.request(options, res => {
            var body = '';
            res.on('data', d => {
                body += d;
            });
            res.on('end', () => {
                callback(true, body);
            });
        });
        req.on('error', error => {
            callback(false, error);
        });
        req.end();
    },

    executeLoginRequest: function (username, password, callback) {
        var dataString = `method=auth.new&u=${username}&p=${password}`;
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

        var reqId = this.uuidv4();
        options.path = `/api/?api=rest&requestid=${reqId}&clienttime=${Date.now() / 1000}&authtoken=&appid=mmm-nirvana&appversion=001`;
        //console.info(`Calling ${options.path} with data ${dataString}`);

        const req = https.request(options, res => {
            var body = '';
            res.on('data', d => {
                body += d;
            });
            res.on('end', d => {
                callback(true, body);
            });
        });
        req.on('error', error => {
            callback(false, error);
        });
        req.write(dataString);
        req.end();
    },


    TASK_STATE: {
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
    },
    TASK_TYPE: {
        TASK: 0,
        PROJECT: 1
    },

    //https://stackoverflow.com/a/2117523
    uuidv4: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

module.exports = nirvanaAPI;