# encoding: utf-8
from selenium import webdriver
import json
from urllib2 import urlopen
from pymongo import MongoClient

client = MongoClient('mongodb://dave:aaron@kahana.mongohq.com:10046/hack')
challengepostWords = client.hack.challengepostWords
challengepostWordsio = client.hack.challengepostWordsio
challengepostListing = client.hack.challengepostListing

driver = webdriver.Chrome('../chromedriver')
def domainAvailDomainr(query, extension):
		query = query.replace(" ", "").replace("\"", "").replace("\n", "").replace(u"“", "").replace(u"”", "").replace(u'\xa0', u'').replace(u'\u2022', u'').replace(u'\u2026', '').replace(u"\u2018", '').replace(u"\u2019", '').replace(u'\xe9', '').replace(u'\xb4', '')

		if len(query) == 0:
			return ""
		webQuery = query + extension
		domain = "something"
		if extension == ".com":
			domain = challengepostWords.find_one({"site" : webQuery})
		elif extension == ".io":
			domain = challengepostWordsio.find_one({"site" : webQuery})

		if not domain:
			print webQuery
			print len(webQuery)
			if len(webQuery) < 6:
				return ""
			url = "https://domai.nr/api/site/availability?d=" + webQuery 
			print url
			raw = urlopen(url).read()
			r = json.loads(raw)
			print r
			availability = r['availability'][webQuery]
			if extension == ".com":
				challengepostWords.insert({
					'site' : webQuery,
					'availability' : availability
				})
			elif extension == ".io":
				challengepostWordsio.insert({
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

for i in range(1, 607):
	driver.get('http://challengepost.com/software/trending?page=' + str(i))

	allListings = driver.execute_script("""
		var listings = document.getElementsByClassName('portfolio-row')[0].children;
		var allListings = [];
		for(var l = 0; l < listings.length; l++) {
			try {
				allListings.push(listings[l].children[0].href);
			}
			catch(e) {

			}
			
		}
		return allListings;
	""")

	for i in allListings:
		challengepostListing.insert({
			'url' : i

		})
		driver.get(i)
		
		wordList = driver.execute_script("""
			function cleanWord(w) {
				if(w === undefined || null) {
					return "";
				}
				else {
					return w.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
				}
				
			}
			var paras = document.getElementsByTagName('p');
			var wordList = [];
			for(var p = 0; p < paras.length; p++) {
				var rawWordList = paras[p].textContent.trim().split(' ');

				for(var w = 0; w < rawWordList.length; w++) {
					var thisWord = cleanWord(rawWordList[w])
					if(thisWord.length > 0) {
						wordList.push(thisWord);
					}
					
				}
				
			}
			/*
			var appTitle = document.getElementById('app-title').textContent.split(' ');
			var appDescription = document.getElementById('app-tagline').textContent.split(' ');
			var appWords = [];
			for(var i = 0; i < appTitle.length; i++) {
				if(appTitle[i].length > 0) {
					var thisWord = cleanWord(appTitle[w]);

					if(thisWord.length > 0) {
						appWords.push(thisWord);
					}
				}
			}
			for(var a = 0; a < appDescription.length; a++) {
				var thisWord = cleanWord(appDescription[a]);
				if(thisWord.length > 0) {
					appWords.push(thisWord);
				}
			}
			
			var finalWordList = wordList.concat(appWords);
			*/

			return wordList;

		""")
		print wordList
		for w in wordList:
			domainAvailDomainr(w, '.com')
			domainAvailDomainr(w, '.io')

	