var sensor = require("node-dht-sensor");


const getTemps = async ()=>{
  let vals = {}
  const read = await sensor.read(22, 4, (err, temperature, humidity)=>{
  if(err){
    console.log(err)
  }
  vals.temp = temperature*1.8+32
  vals.humi = humidity;
  return vals
});
}

setInterval(()=>{
  
  },1000);
