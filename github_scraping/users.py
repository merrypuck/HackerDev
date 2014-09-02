from pymongo import MongoClient
from urllib2 import urlopen

from hashlib import md5
import json

client = MongoClient('mongodb://dave:aaron@kahana.mongohq.com:10046/hack')

all_github_users = client.hack.all_github_users


def getUserBatch(since):
	e = urlopen("https://api.github.com/users?since=" + str(since)).read()
	r = json.loads(r)


def getEmailFromGravatar(firstName, lastName, personal):


def md5ofString(str):
	return md5(str).hexdigest()
