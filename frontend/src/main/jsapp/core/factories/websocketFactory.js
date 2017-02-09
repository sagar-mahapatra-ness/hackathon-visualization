(function () {
   

     function websocketfectory($q) {
        "ngInject";

        var socket = null;
        var stompClient = null;
        return {
            connect: function () {
                socket = new SockJS('/gs-guide-websocket');
                stompClient = Stomp.over(socket);
                var deferred = $q.defer();
                stompClient.connect({}, function (frame) {
                    console.log('Connected: ' + frame);
                    deferred.resolve(frame);
                    
                });
                return deferred.promise;
            },
            disconnect:function(){
              if (stompClient !== null) {
                 stompClient.disconnect();
               }
            },
            sendData:function(topic,data){
                 stompClient.send(topic, {}, JSON.stringify(data));
            },
            subscribToTheTopic:function(topic, callBack){
              var deferred = $q.defer();
              stompClient.subscribe(topic, function (data) {
                 console.log(" subscribToTheTopic 3 ");
                 //console.dir(data.body); 
                 var temp = JSON.parse(data.body);
                 console.log(" subscribToTheTopic 4 ");
                 callBack.call(null, temp);
                 //deferred.resolve(temp);

              });
              return deferred.promise;
            }     
      };
    }

 angular.module('shieldxApp').factory('websocketfectory', websocketfectory);

})();
