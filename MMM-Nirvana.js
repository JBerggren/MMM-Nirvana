  
/* global Log, Module, moment */

/* MMM-Nirvana
 *
 * By Jonatan Berggren - https://github.com/jberggren
 * MIT Licensed.
 */
Module.register("mmm-nirvana", {
    defaults:{
        username:'',
        password:'',
        numberOfTasks:5
    },

    getDom: function(){
        var wrapper = document.createElement("div");
        wrapper.innerText =this.translate("LOADING");
    }
});