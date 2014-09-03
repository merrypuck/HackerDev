from pymongo import MongoClient
import csv
client = MongoClient("mongodb://dave:aaron@kahana.mongohq.com:10046/hack")

emailAvail = client.hack.emailAvail
ioEmailAvail = client.hack.ioEmailAvail

wr = csv.writer(open("comavail.csv", "wb"))
ios = emailAvail.find({'availability' : { "$ne": "taken" }})
for i in ios:
	row = [];
	i.pop("_id", None)
	row.append(i)
	wr.writerow(row)
