from urllib import urlopen
import json
from pymongo import MongoClient
import datetime
import time
import csv
import random 
#client = MongoClient('mongodb://abc:abc123@kahana.mongohq.com:10088/parkour')

#smooth_parking = client.parkour.smooth_parking
def saveStreets():
	#138
	for i in range(0, 138):
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
#weekString = "000000000000000000000000000000000000000000000000000000000000000011333333333333333333330000000000000000000000000011333333333333333333330000000000000000000000000011333333333333333333330000000000000000000000000011333333333333333333330000000000000000000000000011333333333333333333330000000000000000000000000011333333333333333333330000000000"

def calculateWeek(weekString):
	timeSlots = ["12am", "12:30am", "1am", "1:30am", "2am", "2:30am", "3am", "3:30am", "4am", "4:30am", "5am", "5:30am", "6am", "6:30am", "7am", "7:30am", "8am", "8:30am", "9am", "9:30am", "10am", "10:30am", "11am", "11:30am", "12pm", "12:30pm", "1pm", "1:30pm", "2pm", "2:30pm", "3pm", "3:30pm", "4pm", "4:30pm", "5pm", "5:30pm", "6pm", "6:30pm", "7pm", "7:30pm", "8pm", "8:30pm", "9pm", "9:30pm", "10pm", "10:30pm", "11pm", "11:30pm"]
	days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
	weekObj = {}
	for i in range(len(days)):
		try:
			weekObj[days[i]] = []
			if i == 0:
				thisDay = weekString[0:48]
			else:
				thisDay = weekString[i*48: (i + 1) * 48]
			for t in range(len(timeSlots)):
				weekObj[days[i]].append(thisDay[t])
		except Exception as err:
			print err
	return weekObj

def exportParkingSpots():
	count = 0
	wr = csv.writer(open("navandcolors.csv", "wb"))
	reader = csv.reader(open("../navcodes.csv", "rU"))
	#spCursor = smooth_parking.find()
	for item in reader:
		count = count + 1
		row = [item[0], item[1], item[2]]
		wr.writerow(row)
		print row
		print count
exportParkingSpots()
