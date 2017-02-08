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
            subscribToTheTopic:function(topic){
              var deferred = $q.defer();
              stompClient.subscribe(topic, function (data) {
                 console.log(" subscribToTheTopic 2 ");
                 console.dir(data.body); 
                 deferred.resolve(JSON.parse(data.body));
              });
              return deferred.promise;
            }     
      };
    }

 angular.module('shieldxApp').factory('websocketfectory', websocketfectory);

})();
