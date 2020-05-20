const rp = require('request-promise');
const fs = require('fs');

// this gets all the data from the channel as json
// and puts them in data/

function getUrl(latest, count){

  rp.post('https://slack.com/api/channels.history', {
    form: {
      token: 'xxxx-XXXXX-XXXXX', 
      channel: 'XXXXXX',
      latest: latest
    }
  }).then(
     function(data){
       fs.writeFileSync("data/file_"+count+".json", data)
       count = count + 1          
       json = JSON.parse(data)
       console.log(json["has_more"]);
       last_one = json.messages[json.messages.length-1]
       if(json["has_more"]){
         console.log("count is "+count+" and getting more")
         setTimeout(function () {
           getUrl(last_one["ts"], count);
         }, 2000)
       }
     }
  )

}

getUrl(null, 0)
