from datetime import datetime
from datetime import timedelta
import urllib,string,time,requests,json,pprint,random,pytz
now = datetime.now(pytz.timezone('UTC')).strftime('%Y-%m-%d')

def timeStamp(order=None):
    dt = datetime.now()
    sec_since_epoch = time.mktime(dt.timetuple())+dt.microsecond/1000000.0
    if order == "micro":
        epochTime=int(sec_since_epoch * 1000000)        # convert the time to microSeconds
    else:
        epochTime = int(sec_since_epoch * 1000)  # convert the time to milliSeconds
    return epochTime

typeList = ["gold","silver","economical","heighflyer"]
areaList = ["MH","GU","MP","AP","WB"]
regionMHList = ["mumbai","rathnagiri","pune"]
while True:
    time.sleep(2)
    data = {
            'widgetype':'seven',
            'transactionid': random.randint(1,1000000),
            'type':random.choice(typeList),
            'area':random.choice(areaList),
            'value':random.randint(100,1000000),
            'region':random.choice(regionMHList),
            'time' : timeStamp("micro")
    }
    data_json = json.dumps(data)
    headers = {'Content-type': 'application/json'}
    r = requests.post("http://localhost:8080/event",data=data_json, headers=headers)
    print("data sent")
