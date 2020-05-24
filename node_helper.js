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
            this.config = payload;
            this.username = payload.username;
            this.password = payload.password;
            this.debug = payload.debug;
            this.log("Got settings:" + JSON.stringify(payload));
            if(!this.username || !this.password){
                this.error("No username or password set");
            }
            this.getTasks();
            return;
        }
    },

    getTasks: function () {
        var me = this;
        if (me.debug) {
            me.log("Getting tasks");
        }

        try {
            nirvanaAPI.authenticate(this.username, this.password, function (response) {
                if (me.debug) {
                    me.log("Got token " + JSON.stringify(response));
                }
                if (response.error) {
                    me.error(response.error);
                    return;
                }
                nirvanaAPI.getData(response.token, null, function (data) {
                    if (me.debug) {
                        me.log("Got data");
                    }
                    if (data.error) {
                        me.error(data.error);
                        return;
                    }
                    me.sendSocketNotification("TASK_DATA", data.tasks);
                });
            });
        } catch (err) {
            me.log("Something went wrong getting tasks");
            me.log(err.toString());
        }

    },
    error: function (data) {
        this.sendSocketNotification("ERROR", data);
    },

    log: function (data) {
        this.sendSocketNotification("LOG", data);
    }
});