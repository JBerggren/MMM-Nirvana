/* MMM-Nirvana
 *
 * By Jonatan Berggren - https://github.com/jberggren
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var nirvanaAPI = require('./nirvana-api');


module.exports = NodeHelper.create({
    socketNotificationReceived: function (notification, payload) {
        if (notification === "INIT") {
            this.username = payload.username;
            this.password = payload.password;
            this.numberOfTasks = payload.numberOfTasks;
            this.getTasks();
            return;
        }
    },

    getTasks: function () {
        var me = this;
        nirvanaAPI.authenticate(this.username, this.password, function (token) {
            nirvanaAPI.getData(token, null, function (data) {
                var tasks = data.tasks.slice(0, this.numberOfTasks - 1);
                me.sendSocketNotification("TASK_DATA", tasks);
            });
        });
    }

});