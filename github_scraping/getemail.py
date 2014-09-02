from hashlib import md5
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
		print thisEmail
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
	

def md5ofString(thisStr):
	return md5(thisStr).hexdigest()

print getEmailFromGravatar('alwaysbcoding', 'jordan', 'leigh', 'alwaysbecoding.io', "2096352")