require('dotenv').config()

const app = require("express")();

server = app.listen(3001);

const io = require("socket.io")(server);
const cors = require("cors");
const fetch = require("isomorphic-fetch");

const VEHICLE_URL = "http://developer.trimet.org/ws/v2/vehicles";

var vehicles;

async function getVehicles() {
  const res = await fetch("http://developer.trimet.org/ws/v2/vehicles?ids=101&appid=CD8208259A81D0B1CADD9C2C6");
  const data = await res.json();

  if (data && data.resultSet && data.resultSet.vehicle) {
    vehicles = data.resultSet.vehicle.map(vehicle => {
      return {
        routeNumber: vehicle.routeNumber,
        direction: vehicle.direction,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        type: vehicle.type,
        vehicleID: vehicle.vehicleID,
      };
    });

    io.emit("vehicles_update", vehicles);
  }
}

setInterval(() => getVehicles(), 5000);

app.use(
  cors({
    origin: true,
  }),
);

io.set("origins", "*:*");
app.get("/", (req, res) => {
  console.log(vehicles);
  
  res.send(vehicles);
});

io.on("connection", function(socket) {
  console.log('client connected');

  socket.on('fuck', data => {
    console.log('fucking:', data);
    
  });
  
  socket.emit("vehicles_update", vehicles);
});


