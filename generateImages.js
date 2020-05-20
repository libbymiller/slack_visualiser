var fs = require('fs');
const { loadImage, registerFont, createCanvas } = require('canvas');

// this generates a series of images based on who was talking in a 30 min interval
// using their slack avatars
// puts them in /images
// later you can join them into a video using ffmpeg (see README)

var people_list = []
var people = {}
var people_index = {}


async function generate_images(arr, filename){
      //console.log(filename);
      //console.log(arr);

      //I chose these for a reasonable sized video
      var w = 854
      var h = 480
      var img_s = 72;
      var start_w = (w/2) - img_s*4;
      var start_h = 10;
      var images_across = 8;

      const canvas = createCanvas(w, h);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      var row = 0;
      var col = 0;
      for(a in arr){
       var person = arr[a];
       try{
        if(person){
          var index = person["index"];
          const myimg = await loadImage(person["avatar"]);

          col = index%images_across; 
          row = parseInt(index/images_across);

          ctx.drawImage(myimg, start_w+img_s*col, start_h+img_s*row);
        }
       } catch (err){
         console.log(err);
       }
      }
      fs.writeFileSync(filename, canvas.toBuffer());
}

//read in all the files in reverse order
//find the total number of unique images in order (oldest first)
//store image and position

var person_index = 0;
for (var i=40; i>=0; i--){
  var filename = "data/file_"+i+".json";
  console.log(filename);
  var f = fs.readFileSync(filename);
  var obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
  arr = obj.messages.reverse()

  for(m in arr){
    message = obj.messages[m];
    if(message["user_profile"]){
      var rn = message["user_profile"]["real_name"];
      var avatar = message["user_profile"]["image_72"];
      var dn = message["user_profile"]["display_name"];
      var person = {real_name: rn, avatar: avatar, name: dn };
      if(people[dn]==null){
        people[dn] = person;
        people_index[dn] = person_index;
        var person = {real_name: rn, avatar: avatar, name: dn , index: person_index};
        people_list.push(person);
        person_index = person_index + 1;
      }
    }
  }
}

//console.log(people_list.length);

//do a test print of all people
generate_images(people_list, "images/allpeople.png")

//now do the real thing
//find people in 30 minute blocks and keep them in an array

var ts_start = 0;
var list_of_arrays = [];
var count_files = 0;

//I checked that there were 41 files in my case. could be done better!

for (var i=40; i>=0; i--){
  var count2 = 0;
  var tmp_people_index = {}
  var five_min_arr = [];
  var filename = "data/file_"+i+".json";
  console.log(filename);
  var f = fs.readFileSync(filename);
  var obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
  arr = obj.messages.reverse()
  for(m in arr){
    message = obj.messages[m];
    if(count2 == 0 ){
      ts_start = message["ts"]
    }else{
      z  = message["ts"]
      if(z - ts_start > (30*60)){ // 30 minutes
        console.log("ok 30 mins\n\n");
        list_of_arrays.push(five_min_arr)
        ts_start = z
        five_min_arr = [];
        tmp_people_index = {};
      }else{
        if(m == arr.length-1){ // run out of messages in this file
          console.log("ok run out\n\n");
          list_of_arrays.push(five_min_arr)
          ts_start = z
          five_min_arr = [];
          tmp_people_index = {};
        }
      }
    }
    if(message["user_profile"]){

      var rn = message["user_profile"]["real_name"];
      var avatar = message["user_profile"]["image_72"];
      var dn = message["user_profile"]["display_name"];
      var index = people_index[dn];
      var person = {real_name: rn, avatar: avatar, name: dn , index: index};
      if(tmp_people_index[dn]==null){
        tmp_people_index[dn]= person;
        five_min_arr.push(person);
      }
    }
    console.log(five_min_arr.length);
    count2 = count2 + 1
  }
}

//finally print to images

console.log(list_of_arrays.length)

for (l in list_of_arrays){

  var arr = list_of_arrays[l];
  var fn = l.toString().padStart(5, "0"); //pads filename, needed for ffmpeg later
  console.log("printing "+fn);
  generate_images(arr, "images/images_"+fn+".png") 
  
}

