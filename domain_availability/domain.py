from pymongo import MongoClient
from urllib2 import urlopen
import json
from selenium import webdriver

from bs4 import BeautifulSoup

client = MongoClient('mongodb://dave:aaron@kahana.mongohq.com:10046/hack')

comEmailAvail = client.hack.comEmailAvail
ioEmailAvail = client.hack.ioEmailAvail

#driver = webdriver.PhantomJS('./phantomjs')

apiKey = ""

def domainAvailVerisign(query): 
	url = "http://naming.verisign-grs.com/ns-api/1.0/suggest?callback=jQuery110201646935478784144_1409683157000&key=%2B" + query + "&tlds=com%7Cnet&view=grid&language=ENG&usehyphens=true&usenumbers=true&contentfilter=true&maxresults=100&X-NAMESUGGESTION-APIKEY=" + apiKey + "&actions=geo%3Amedium%7Cbasic%3Ahigh%7Ctopical%3Alow&valid=true&source=netlandingpage&domainText=" + query + "&searchedTlds=org%7Ccom&isIdn=false&domain=" + query
	print query
	raw = urlopen(url).read()
	r = json.loads(raw[42:len(raw)-2])
	return r
	
def domainAvailDomainr(query, extension):
	webQuery = query + extension
	domain = ioEmailAvail.find_one({"site" : webQuery})
	if not domain:
		url = "https://domai.nr/api/site/availability?d=" + webQuery 
		raw = urlopen(url).read()
		r = json.loads(raw)
		print r
		availability = r['availability'][webQuery]
		ioEmailAvail.insert({
			'site' : webQuery,
			'availability' : availability
		})
		"""
		comEmailAvail.insert({
			'site' : webQuery,
			'availability' : availability
		})
		"""
		return availability
	else: 
		return "did"

count = 0

with open("./english_words.txt") as inputFileHandle:
	for i in inputFileHandle:
		count = count + 1
		if count < 1829:
			print i
			print domainAvailDomainr(i.strip(), ".io")



