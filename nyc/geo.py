from urllib import urlopen
import csv
from pymongo import MongoClient

# Example NYC GEO-Api request:
# URL : https://api.cityofnewyork.us/geoclient/v1/blockface.json
# ?app_id=8d27c6c4
# &app_key=bde3b40f90a67abb90a8efb2c60bfb3b
# &onStreet=RANDALL+AVENUE
# &crossStreetOne=FAILE+STREET
# &crossStreetTwo=COSTER+STREET
# &borough=Bronx

APP_ID = "8d27c6c4"
APP_KEY = "bde3b40f90a67abb90a8efb2c60bfb3b"
client = MongoClient('mongodb://abc:abc123@kahana.mongohq.com:10088/parkour')

locations_collection = client.parkour.locations

locationsCSV = csv.reader(open("./locations.csv", "rU"))

count = 0

for l in locationsCSV:
	count = count + 1
	l[0] = l[0].decode("utf-8-sig").encode("utf-8")
	if l[0] == "B":
		borough = "Bronx"
	elif l[0] == "K":
		borough = "Brooklyn"
	elif l[0] == "M":
		borough = "Manhattan"
	elif l[0] == "Q":
		borough = "Queens"
	elif l[0] == "S":
		borough = "Staten Island"
	else:
		borough = ""

	rawRequest = "https://api.cityofnewyork.us/geoclient/v1/blockface.json?app_id=" + APP_ID + "&app_key=" + APP_KEY + "&onStreet=" + l[2] + "&crossStreetOne=" + l[3] + "&crossStreetTwo=" + l[4] + "&borough=" + borough
	resp = urlopen(rawRequest).read()
	print borough
	print count
	locations_collection.insert({'borough' : l[0],
							   'status_number' : l[1],
							   'main_street' : l[2], 
							   'from_street' : l[3],
							   'to_street' : l[4],
							   'side_of_street' : l[5],
							   'location' : l,
							   'response' : resp
							   })