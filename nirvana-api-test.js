var nirvanaAPI = require('./nirvana-api.js');
var conf = require('./conf.js');

nirvanaAPI.authenticate(conf.username,conf.password,function(response){
    nirvanaAPI.getData(response.token,null,function(data){
        console.log(data);
    });
});