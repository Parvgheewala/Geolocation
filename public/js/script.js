const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude,longitude} = position.coords;
        socket.emit("send-location",{latitude,longitude})
    }, (error) =>{
        console.error(error);  
    },
    {
        enableHighAccuracy:true,
        maximumAge:0,
        timeout: 5000,
    }
)
}

const map = L.map("map").setView([0,0],10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution: "Parv's map tracking",
}).addTo(map)

const markers = {};

socket.on("receive-location",(data)=>{
    const {id,latitude,longitude} = data;
    map.setView([latitude,longitude],16)
    if(markers[id]){
        markers[id].setLatLang([latitude,longitude]);
    }
    else{
        markers[id] = L.marker([latitude,longitude]).addTo(map);
    }
})

map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    socket.emit("add-marker", { latitude: lat, longitude: lng });
    addMarker(lat, lng);
});

// Function to add a marker
function addMarker(latitude, longitude) {
    const marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`Marker at: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        .openPopup();
}
socket.on("new-marker", (data) => {
    const { latitude, longitude } = data;
    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`Shared Marker at: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        .openPopup();
});


socket.on("user-disconnect",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id]
    }
})