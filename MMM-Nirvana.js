/* MMM-Nirvana
 *
 * By Jonatan Berggren - https://github.com/jberggren
 * MIT Licensed.
 */

Module.register("MMM-Nirvana", {
    defaults: {
        username: '',
        password: '',
        numberOfTasks: 5
    },

    start: function () {
        this.sendSocketNotification("INIT", {
            username: this.config.username,
            password: this.config.password,
            numberOfTasks: this.config.numberOfTasks
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification == "TASK_DATA") {
            this.tasks = payload;
            this.updateDom();
        }else{
            console.info("Msg from node_module",payload);
        }
    },

    getDom: function () {
        var wrapperEl = this.createElement("nir-wrapper");
        if (this.tasks == null) {
            wrapperEl.innerHTML = this.translate("LOADING");
        } else {
            for (var i = 0; i < this.tasks.length; i++) {
                var taskEl = this.createElement("nir-task");
                var taskTitleEl = this.createElement("nir-title");
                taskTitleEl.innerHTML = this.tasks[i].title;
                taskEl.appendChild(taskTitleEl);
                wrapperEl.appendChild(taskEl);
            }
        }
        return wrapperEl;
    },

    createElement: function (className) {
        var el = document.createElement("div");
        el.className = className;
        return el;
    }
});