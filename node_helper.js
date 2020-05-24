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
            nirvanaAPI.authenticate(this.username, this.password, function (token) {
                me.log("Got token " + token);
                nirvanaAPI.getData(token, null, function (data) {
                    me.log("Got data", JSON.stringify(data));
                    var tasks = data.tasks.slice(0, this.numberOfTasks - 1);
                    me.sendSocketNotification("TASK_DATA", tasks);
                });
            });
        }catch(err) {
            me.log("Something went wrong getting tasks");
            me.log(err.toString());
        }
      
    },

    log:function(data){
        this.sendSocketNotification("LOG", data);
    }
});