/* MMM-Nirvana
 *
 * By Jonatan Berggren - https://github.com/jberggren
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var nirvanaAPI = require('./nirvana-api.js');

module.exports = NodeHelper.create({

    socketNotificationReceived: function (notification, payload) {
        if (notification === "INIT") {
            this.username = payload.username;
            this.password = payload.password;
            this.numberOfTasks = payload.numberOfTasks;
            this.log("Got settings:" + JSON.stringify(payload));
            this.getTasks();
            return;
        }
    },

    getTasks: function () {
        var me = this;
        me.log("Getting tasks");
        try{
            nirvanaAPI.authenticate(this.username, this.password, function (response) {
                me.log("Got token " + JSON.stringify(response));
                if(response.error){
                    me.error(response.error);
                    return;
                }
                nirvanaAPI.getData(response.token, null, function (data) {
                    me.log("Got data", JSON.stringify(data));
                    var tasks = data.tasks;
                    if(tasks && tasks.length > this.numberOfTasks){
                        tasks = tasks.slice(0, this.numberOfTasks - 1);
                    }
                    me.sendSocketNotification("TASK_DATA", tasks);
                });
            });
        }catch(err) {
            me.log("Something went wrong getting tasks");
            me.log(err.toString());
        }
      
    },
    error:function(data){
        this.sendSocketNotification("ERROR", data);
    },

    log:function(data){
        this.sendSocketNotification("LOG", data);
    }
});