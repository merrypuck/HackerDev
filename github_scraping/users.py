from pymongo import MongoClient
from urllib2 import urlopen, Request
import time
from hashlib import md5
import json
import requests
from selenium import webdriver
from requests.auth import HTTPBasicAuth

client = MongoClient('mongodb://dave:aaron@kahana.mongohq.com:10046/hack')

all_github_users 	= client.hack.all_github_users
github_user_emails  = client.hack.github_user_emails

hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
       'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
       'Accept-Encoding': 'none',
       'Accept-Language': 'en-US,en;q=0.8'
       }
#driver = webdriver.PhantomJS("./phantomjs")
def getUserBatch(since):
	print "since " + str(since)
	time.sleep(.3)
	req1 = requests.get("https://api.github.com/users?since=" + str(since), auth=HTTPBasicAuth('aaln', 'reddit123'), headers=hdr)
	resp = json.loads(req1.text)
	if len(resp) == 0:
		return False
	for i in range(len(resp)):
		time.sleep(.1)
		req2 = requests.get(resp[i]['url'], auth=HTTPBasicAuth('aaln', 'reddit123'), headers=hdr)
		rawUserPage = req2.text
		thisUser 	= json.loads(rawUserPage)
		gravatar_id = thisUser['gravatar_id']
		username 	= thisUser['login']
		userId 		= thisUser['id']
		try:
			name 	= thisUser['name']
			firstName 	= name.split(" ")[0]
			lastName 	= name.split(" ")[1]
		except:
			name 	= ""
			firstName = ""
			lastName = ""
		try:
			blog 		= thisUser['blog']
		except:
			blog = ""
		try:
			email		= thisUser['email']
		except:
			email = ""
		if not email:
			try:
				if name:
					gravatar_email = getEmailFromGravatar(username, firstName, lastName, blog, gravatar_id)
				else:
					gravatar_email = getEmailFromGravatar(username, "", "", blog, gravatar_id)
			except:
				gravatar_email = ""
			
			if len(gravatar_email) > 0:
				print "found " + gravatar_email
				emailUser = github_user_emails.find_one({'login': username})
				if not emailUser:
					github_user_emails.insert({
						'login' 				: username,
						'name' 					: name,
						'id' 					: userId,
						'email' 				: gravatar_email,
						'gravatar_id'			: gravatar_id,
						'blog'					: blog,
						'found_from_gravatar' 	: "true"
					})
		else:
			
			emailUser = github_user_emails.find_one({'login': username})
			if not emailUser:
				github_user_emails.insert({
					'login' 				: username,
					'name' 					: name,
					'id' 					: userId,
					'email' 				: email,
					'gravatar_id'			: gravatar_id,
					'blog'					: blog,
					'found_from_gravatar' 	: "false"
				})

		user = all_github_users.find_one({'login' : username})
		if not user:
			all_github_users.insert(thisUser)
			
	getUserBatch(since + len(resp))

	
def cleanUrl(rawUrl):
	if rawUrl is not None and len(rawUrl) > 0:
		if rawUrl[0:8] == "https://":
			rawUrl = rawUrl[8:]
			if rawUrl[0:4] == "www.":
				rawUrl = rawUrl[4:]
		elif rawUrl[0:7] == "http://":
			rawUrl = rawUrl[7:]
			if rawUrl[0:4] == "www.":
				rawUrl = rawUrl[4:]
		goodUrl = rawUrl.split("/")[0]
		return goodUrl
	else:
		return ""

emailsToTry = ['gmail.com', 'yahoo.com', 'aol.com']
def getEmailFromGravatar(username, firstName, lastName, blog, gravatar_id):
	emailsToTry.append(cleanUrl(blog))
	# username
	for e in emailsToTry:
		thisEmail = username + "@" + e
		md5str = md5ofString(thisEmail)
		if md5str == gravatar_id:
			return thisEmail
	if firstName and lastName:
		# firstName + "." + lastName
		for e in emailsToTry:
			thisEmail = firstName + "." + lastName + "@" + e
			md5str = md5ofString(thisEmail)
			if md5str == gravatar_id:
				return thisEmail

		# firstLetter + lastName
		for e in emailsToTry:
			thisEmail = firstName[0] + lastName + "@" + e
			md5str = md5ofString(thisEmail)
			if md5str == gravatar_id:
				return thisEmail

		# firstLetter + "." + lastName
		for e in emailsToTry:
			thisEmail = firstName[0] + "." + lastName + "@" + e
			md5str = md5ofString(thisEmail)
			if md5str == gravatar_id:
				return thisEmail

		# firstName
		for e in emailsToTry:
			thisEmail = firstName + "@" + e
			md5str = md5ofString(thisEmail)
			if md5str == gravatar_id:
				return thisEmail

		# lastName
		for e in emailsToTry:
			thisEmail = lastName + "@" + e
			md5str = md5ofString(thisEmail)
			if md5str == gravatar_id:
				return thisEmail
	return ""
	

def md5ofString(str):
	return md5(str).hexdigest()

getUserBatch(99)