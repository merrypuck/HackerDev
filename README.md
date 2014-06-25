parkour
=======


Where we develop:
--> style.css
--> script.js

/ -> index
GET /park_here -> render("park_here")
POST /direct -> return JSON with payload

GET http://localhost:5000/api/parking-nearby?lat=32.0718116&lon=34.7915697 -> Gives 10 closest parking lots
GET http://localhost:5000/api/do-parkour?lat=32.077535&lon=34.788547 -> Gives parkour routing for parking at destination

API:
socket.io for /zazti_notices


GPS coordinates:
Google:32.070276,34.794166

Uno Italian Restaurant:32.077535,34.788547,17