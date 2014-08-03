from pymongo import MongoClient
import os
import glob
from random import randint, choice
import string
import pdb, traceback, code, sys

def token_generator(size=5, chars=string.ascii_uppercase + string.digits):
	return ''.join(choice(chars) for _ in range(size))

client = MongoClient('mongodb://abc:abc123@kahana.mongohq.com:10087/1000scientists')

allImages = glob.glob("/Users/aaron/Downloads/people/*")
allLabels  = ['Elon Musk', 							'Aaron Levie', 				'Adora Cheung', 'Alexis Ohanian', 							'Dave Fontenot', 						'Kanye West', 'Nathan Blecharczyk', 'PG Graham', 'Sam Altman', 'Steve jobs']

allimages = [["Elon-Musk-20837159-1-402.jpg.png","elon-musk-portrait.jpg", "elon-musk-tesla.jpg", "musk.jpeg", "obama_musk.jpg"],
["0731_boxnet_630x420.jpg", "130423102643-next-mark-zuckerberg-aaron-levie-620xb.jpg", "Aaron_Levie_Co-founder_and_CEO_Box.jpg", "Aaron-Levie1.jpg", "these-numbers-show-that-box-ceo-aaron-levie-is-a-genius.jpg"],
['628x471.jpg', "6625-300x200.jpg", "adora-cheung-homejoy.jpg", "images.jpeg", "tgqct5ablb4.png"],
['317956_10100534424660506_679122534_n.jpg', "328216_10100325645241136_1305420814_o.jpg", "457502_10100526302237906_468669485_o.jpg", "552842_10100491518340116_556010587_n.jpg", "10154569_10101424309104946_1694987293_n.jpg"],
['478723_10151983623149355_879377615_o.jpg', "1401478_10151862929174355_706475266_o.jpg", "1417714_10151862930964355_519779362_o.jpg", "1921030_10152081007729355_392041710_o.jpg", "10562571_10152994475938066_8002866649267936847_o.jpg"],
["KanyeWest_070432.jpg", "140502-sad-kanye-zipline-picture.jpg", "tumblr_mojh4ie4Cc1s42uj7o1_1280.jpg", "tumblr_mojh8ckhHz1s42uj7o1_1280.jpg", "tumblr_moqn0pxiKA1s42uj7o1_1280.jpg"],
["medium.jpg", "3-airbnb-Nathan-Blecharczyk-1.jpg", "517720043_23v1_853_480.jpg", "airbnb-438x278.jpg", "nathan-blecharczyk_dpa40c85a390b1383066006.jpg"],
["Ycombinatorslide-0-0-331-300*304.jpg", "images.jpeg", "paul-graham-face.jpg", "Paulgraham_240x320.jpg", "paulgraham_2239_0.jpeg"],
["IMG_2804.JPG", "475072081.jpg", "altman.jpg", "IMG_2804.JPG", "img3331*304xx2848-4272-0-0.jpg", "Sam-Altman.jpg"],
["steve_jobs_ipod_349x466.jpg", "blog-images-1349202732-fondo-steve-jobs-ipad.jpg", "148033-apples-steve-jobs.jpg", "170130-steve-jobs.jpg", "steve-jobs-did-acid-10-15-times-and-smoked-pot-every-week-for-5-years.jpg", "project.jpg"]]

elonMusk = ["Elon-Musk-20837159-1-402.jpg.png","elon-musk-portrait.jpg", "elon-musk-tesla.jpg", "musk.jpeg", "obama_musk.jpg"]
aaronLevie = ["0731_boxnet_630x420.jpg", "130423102643-next-mark-zuckerberg-aaron-levie-620xb.jpg", "Aaron_Levie,_Co-founder_and_CEO,_Box.jpg", "Aaron-Levie1.jpg", "these-numbers-show-that-box-ceo-aaron-levie-is-a-genius.jpg"]
adora = ['628x471.jpg',]
alexis = ['317956_10100534424660506_679122534_n.jpg', "328216_10100325645241136_1305420814_o.jpg", "457502_10100526302237906_468669485_o.jpg", "552842_10100491518340116_556010587_n.jpg", "10154569_10101424309104946_1694987293_n.jpg"]
dave = ['478723_10151983623149355_879377615_o.jpg', "1401478_10151862929174355_706475266_o.jpg", "1417714_10151862930964355_519779362_o.jpg", "1921030_10152081007729355_392041710_o.jpg", "10562571_10152994475938066_8002866649267936847_o.jpg"]
kanye = ["KanyeWest_070432.jpg", "140502-sad-kanye-zipline-picture.jpg", "tumblr_mojh4ie4Cc1s42uj7o1_1280.jpg", "tumblr_mojh8ckhHz1s42uj7o1_1280.jpg", "tumblr_moqn0pxiKA1s42uj7o1_1280.jpg"]
nathan = ["medium.jpg", "3-airbnb-Nathan-Blecharczyk-1.jpg", "517720043_23v1_853_480.jpg", "airbnb-438x278.jpg", "nathan-blecharczyk_dpa40c85a390b1383066006.jpg"]
pg = ["Ycombinatorslide-0-0-331-300*304.jpg", "images.jpeg", "paul-graham-face.jpg", "Paulgraham_240x320.jpg", "paulgraham_2239_0.jpeg"]
sam = ["IMG_2804.JPG", "475072081.jpg", "altman.jpg", "IMG_2804.JPG", "img3331*304xx2848-4272-0-0.jpg", "Sam-Altman.jpg"]
steve = ["steve_jobs_ipod_349x466.jpg", "10711.playboy.steve_jobs_1985.large.jpeg", "148033-apples-steve-jobs.jpg", "170130-steve-jobs.jpg", "steve-jobs-did-acid-10-15-times-and-smoked-pot-every-week-for-5-years.jpg"]
allPictures = []
allAnswers = []
thisQuestion = "Where is {{label}}?"
description =  "Find the person."

highLevelDescription = "Analyze data based on supervised learning training sets.";
for i in range(len(allImages)):
	rawLabel  = allImages[i][30:len(allImages[i])]
	print rawLabel
	#cleanLabel = rawLabel[0:len(rawLabel) - 4]
	if(len(rawLabel) > 4):
		thisAnswer = "/images/people/" + rawLabel
		#print cleanLabel
		#print thisAnswer
		#print rawLabel
		#allLabels.append(rawLabel)
		#print thisAnswer
		allAnswers.append(thisAnswer)
print client['1000scientists'].jobs.insert({
	'id'	: "2",
	'question' : thisQuestion,
	'description' : description,
	'labels' : allLabels,
	'answers' : allAnswers,
	})

count = 0
for i in range(len(allLabels)):
	question = thisQuestion.replace("{{label}}", allLabels[i]);
	print question
	for m in range(5):
		potentialAnswers = []
		for n in range(3):
			potentialAnswers.append(allAnswers[randint(0, len(allLabels) - 1)])
		potentialAnswers.insert(randint(0, 3), "/images/people/" + allimages[i][randint(0, len(allimages[i]) - 1)]);

		if len(set(potentialAnswers)) < 4:
			potentialAnswers.append(allAnswers[randint(0, len(allLabels) - 1)])

		if "undefined" in potentialAnswers:
			print "UNDEFINED!!!!"
		print client['1000scientists'].tasks.insert({
			'taskId'    : token_generator(),
			'jobId' 	: "2",
			'question'  : question,
			'label'     : allLabels[i],
			'answers'	: list(set(potentialAnswers)),
			'completed' : 'false',
			'answer'	: 'false'
		})
		count = count + 1
		print count

