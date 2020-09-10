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
  const dateForText = `${date.getFullYear()} ${date.getMonth() +1} ${date.getDate()} ${date.getHours()} ${date.getMinutes()} T`
  console.log(date)
  console.log(vals)
  
  fs.appendFile(`${__dirname}/readings.txt`, `${dateForText} ${vals.temp} ${vals.humi} \n`, (err) => {
    if(err){
      console.log(err)
      }
      else {
        
      fs.readFileSync(`${__dirname}/readings.txt`, "utf8")
        }
    } )
  
});
}

setInterval(getTemps,60 * 1000);
