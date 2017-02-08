(function() {
    var SystemInformationWidget = function() {
        return {
            getDrillDownQueryData: function() {
                return "";
            },
            getQueryData: function(intervalRef) {
                var query = "manage/systeminfo";
                return query;
            },
            getDataMassageObject: function(data) {
                return {
                    getAlertData: function() {
                        var dateObj = new Date(data.systemUptime);

                        var hour = (dateObj.getHours() < 10) ? ('0' + dateObj.getHours()) : dateObj.getHours();
                        var min = (dateObj.getMinutes() < 10) ? ('0' + dateObj.getMinutes()) : dateObj.getMinutes();
                        data.time = hour + ":" + min;
                        //var sec = (dateObj.getSeconds() < 10) ? ('0' + dateObj.getSeconds()) : dateObj.getSeconds();
                        //data.time = hour + ":" + min + ":" + sec;
                        /*var cuDate = new Date();
                        var date = cuDate.getDate();
                        var year = cuDate.getFullYear();
                        var month = cuDate.getMonth();
                        hour = (cuDate.getHours() < 10) ? ('0' + cuDate.getHours()) : cuDate.getHours();
                        min = (cuDate.getMinutes() < 10) ? ('0' + cuDate.getMinutes()) : cuDate.getMinutes();*/
                        /*cuDate.getMinutes();*/
                        //sec = (cuDate.getSeconds() < 10) ? ('0' + cuDate.getSeconds()) : cuDate.getSeconds();
                        /*cuDate.getSeconds();*/
                        //MM/dd/yyyy HH:mm:ss
                        /*data.currectDate = month + "/" + date + "/" + year;
                        data.currentTime = hour + ":" + min + ":" + sec;*/
                        return data;
                    },
                    getStackedAreaData: function() {

                        return chartData;
                    },

                };
            },
            massageDrillDowndata: function(data) {
                return "";
            }
        };
    };

    angular.module('shieldxApp').factory(WidgetName.SystemInformation + "Factory", SystemInformationWidget);
})();
