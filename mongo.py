from pymongo import MongoClient
import os
import glob
from random import randint, choice
import string

def token_generator(size=5, chars=string.ascii_uppercase + string.digits):
	return ''.join(choice(chars) for _ in range(size))

client = MongoClient('mongodb://abc:abc123@kahana.mongohq.com:10087/1000scientists')

allImages = glob.glob("/Users/aaron/Downloads/images/*")
allLabels  = []
allAnswers = []
thisQuestion = "Which minecraft block is {{label}}?"
description = "Choose the right minecraft block."
for i in allImages:
	rawLabel  = i[30:len(i)]
	cleanLabel = rawLabel[0:len(rawLabel) - 4]
	thisAnswer = "/images/minecraft/" + rawLabel
	#print cleanLabel
	#print thisAnswer
	print rawLabel
	allLabels.append(rawLabel)
	allAnswers.append(thisAnswer)

print client['1000scientists'].jobs.insert({
	'id'	: 1,
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
		for n in range(4):
			potentialAnswers.append(allAnswers[randint(0, len(allLabels) - 1)])
		print client['1000scientists'].tasks.insert({
			'taskId' 		: token_generator(),
			'jobId' 	: "1",
			'question'  : question,
			'label'     : allLabels[i],
			'answers'	: potentialAnswers,
			'completed' : 'false',
			'answer'	: 'false'
		})
		count = count + 1
		print count
