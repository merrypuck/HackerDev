from urllib import urlopen
import json
from pymongo import MongoClient
import datetime
import time
import random 
client = MongoClient('mongodb://abc:abc123@kahana.mongohq.com:10088/parkour')

smooth_parking = client.parkour.smooth_parking
#138
for i in range(11, 138):
	strGridResp = urlopen("http://smoothparking.com/loadgrids/loadgridphp2.php?grid=grid" + str(i)).read()
	gridResp = json.loads(strGridResp)
	for c in range(len(gridResp)):
		randomFloat = random.uniform(0.1, .5)
		time.sleep(randomFloat)
		strSubResp = urlopen("http://smoothparking.com/loadgrids/lineinfo.php?subsegid=" + gridResp[c]['a']).read()
		subResp = json.loads(strSubResp)
		timestamp = str(datetime.datetime.now().isoformat())
		doc = smooth_parking.find_one({'a' : gridResp[c]['a']})
		if doc == None:
			smooth_parking.insert({
				"a" : gridResp[c]['a'],
				"b" : gridResp[c]['b'],
				"c" : gridResp[c]['c'],
				"d" : gridResp[c]['d'],
				"e" : gridResp[c]['e'],
				"color" : gridResp[c]['color'],
				"g" : gridResp[c]['g'],
				"h" : gridResp[c]['h'],
				"i" : gridResp[c]['i'],
				"j" : gridResp[c]['j'],
				"k" : gridResp[c]['k'],
				"l" : gridResp[c]['l'],
				"m" : gridResp[c]['m'],
				"n" : gridResp[c]['n'],
				"pa" : gridResp[c]['pa'],
				"ss" : subResp[0]['ss'],
				"ul" : subResp[0]['ul'],
				"ml" : subResp[0]['ml'],
				"w" : subResp[0]['w'],
				"grid" : str(i),
				"timestamp" : timestamp
				})
			print "gridNumber : " + str(i)
			print "Success : " + gridResp[c]['a']
			print "Color : " + gridResp[c]['color']
		else:
			print "gridNumber : " + str(i)
			print "Already exists : " + gridResp[c]['a']