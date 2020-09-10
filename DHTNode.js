var sensor = require("node-dht-sensor");
const fs = require("fs")

const getTemps = async ()=>{
  let vals = {}
  const read = await sensor.read(22, 4, (err, temperature, humidity)=>{
  if(err){
    console.log(err)
  }
  vals.temp = ""+ (temperature*1.8+32).toFixed(2)
  vals.humi = ""+ humidity.toFixed(2);
  const date = new Date(Date.now())
  console.log(date)
  console.log(vals)
  
});
}

setInterval(getTemps,1000);
