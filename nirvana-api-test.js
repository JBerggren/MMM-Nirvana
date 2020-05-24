var nirvanaAPI = require('./nirvana-api.js');
var conf = require('./conf.js');

nirvanaAPI.authenticate(conf.username,conf.password,function(response){
    nirvanaAPI.getData(response.token,null,function(data){
        if(data.error){
            console.error(data.error,data.sucess,data.err);
        }else{
            console.info("OK", data.tasks.length,data.projects.length);
            console.info("Next tasks", data.tasks.filter(x=>{ return x.state ==nirvanaAPI.TASK_STATE.NEXT}).length);
        }
    });
});