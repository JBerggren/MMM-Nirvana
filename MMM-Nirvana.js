/* MMM-Nirvana
 *
 * By Jonatan Berggren - https://github.com/jberggren
 * MIT Licensed.
 */

Module.register("MMM-Nirvana", {
    defaults: {
        debug:true,
        username: '',
        password: '',
        numberOfTasks: 5,
        /* Filter by setting tag, project or state. 
        State is  INBOX: 0,
        NEXT: 1,
        WAITING: 2,
        SCHEDULED: 3,
        SOMEDAY: 4,
        LATER: 5,
        TRASHED: 6,
        LOGGED: 7,
        DELETED: 8,
        RECURRING: 9,
        ACTIVE_PROJECT: 11*/

        tag:null,
        project:null,
        state:null
    },

    start: function () {
        this.sendSocketNotification("INIT", {username:this.config.username,password:this.config.password,debug:this.config.debug});
    },

    filterAndSortTasks:function(tasks){
        if(this.config.tag){
            tasks = tasks.filter(x=>{return x.tags.indexOf("," + this.config.tag + ",") != -1;});
        }
        if(this.config.project){
            tasks = tasks.filter(x=>{return x.project && x.project.name == this.config.project;});
        }
        if(this.config.state){
            tasks = tasks.tasks.filter(x=>x.state == this.config.state);
        }
        tasks= tasks.sort((a,b)=>{
            if(a.project == b.project){
                return a.seq-b.seq;
            }
            if(!a.project){
                return -1;
            }
            if(!b.project){
                return 1;
            }
            return a.project.name.localeCompare(b.project.name);
        });
        
        return tasks.slice(0,this.config.numberOfTasks-1);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification == "TASK_DATA") {
            this.tasks = this.filterAndSortTasks(payload);
            this.updateDom();
        }else if(notification == "ERROR"){
            this.error = payload;
            console.error(payload);
            this.updateDom();
        }
            else{
            console.info("Msg from node_module",payload);
        }
    },

    getDom: function () {
        var wrapperEl = this.createElement("nir-wrapper");
        if(this.error){
            wrapperEl.innerText = "ERROR:" + this.error;
        }
        else if (this.tasks == null) {
            wrapperEl.innerHTML = this.translate("LOADING");
        } else {
            for (var i = 0; i < this.tasks.length; i++) {
                var taskEl = this.createElement("nir-task");
                var taskTitleEl = this.createElement("nir-title");
                taskTitleEl.innerHTML = this.tasks[i].name;
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