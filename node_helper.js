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
            if (!this.username || !this.password) {
                this.error("No username or password set");
            }
            this.getTasks();
            return;
        }
    },

    getToken: function (callback) {
        var me = this;
        nirvanaAPI.authenticate(this.username, this.password, function (response) {
            if (me.debug) {
                me.log("Got token " + JSON.stringify(response));
            }
            if (response.error) {
                me.error(response.error);
                return;
            }
            me.token = response;
        });
    },

    getTasks: function () {
        var me = this;
        var time = new Date();
        if(me.lastUpdate > time.setMinutes(time.getMinutes()-1)){
            me.sendTaskList(); //Send the one we have
            return;
        }

        if (!me.token || me.token.expires < Date.now) {
            me.getToken(me.getTasks);
            return;
        }

        try {
            nirvanaAPI.getData(me.token.token, me.lastUpdate, function (data) {
                if (me.debug) {
                    me.log("Got data");
                }
                if (data.error) {
                    me.error(data.error);
                    return;
                }
                me.updateTaskList(data.tasks);
            });
        } catch (err) {
            me.log("Something went wrong getting tasks");
            me.log(err.toString());
        }
    },
    updateTaskList:function(newTasks){
        if(!this.tasks){
            this.tasks = newTasks;
        }else{ 
            for(var i=0;i<newTasks.length;i++){
                var oldItemIndex = this.tasks.findIndex(x=>x.id == newTasks[i].id);
                if(oldItemIndex){
                    this.tasks[oldItemIndex] = newTasks[i];
                }else{
                    this.tasks.push(newTasks[i]);
                }
            }
        }
        this.sendTaskList();
    },
    sendTaskList:function(){
        this.sendSocketNotification("TASK_DATA", this.tasks);
    },
    error: function (data) {
        this.sendSocketNotification("ERROR", data);
    },

    log: function (data) {
        this.sendSocketNotification("LOG", data);
    }
});