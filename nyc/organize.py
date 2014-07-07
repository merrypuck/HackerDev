from pymongo import MongoClient
import json

client = MongoClient('mongodb://abc:abc123@kahana.mongohq.com:10088/parkour')

locations_collection = client.parkour.locations

allMLocations = locations_collection.find({'borough':'M'})

for i in allMLocations:
	resp = json.loads(allMLocations[i])
	blockface = resp['blockface']
	for k in blockface:
		

