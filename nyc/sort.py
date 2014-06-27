
import csv


#B, P-004958,RANDALL AVENUE,FAILE STREET,COSTER STREET,N

#B, P-004958,1,0000 ,   ,Curb Line

#[[B, P-004958, RANDALL AVENUE,FAILE STREET,COSTER STREET,N, [1,0000, Curb Line][2,000, Curb Line]]


# locations count : 94102
# locations duplicates : ['S-003375', 'S-005176', 'S-028053']
locationsCSV = csv.reader(open("./locations.csv", "rU"))
# signs count : 750475
#signsCSV = csv.reader(open("./signs.csv", "rU"))
wr = csv.writer(open("./locationsandsigns1.csv", "wb"))
#locations and signs count : 750467
#locationsandsignsCSV = csv.reader(open("./locationsandsigns1.csv", "rU"))
allRows = []
count = 0
found = False
countSign = 0
"""
for lrow in locationsCSV:
	signsCSV = csv.reader(open("./signs.csv", "rU"))
	for thisSign in signsCSV:
		if lrow[1] == thisSign[1]:
			count = count + 1
			print count
			#lrow.append(thisSign)

for r in allRows:
	wr.writerow(r)
"""


rowsadded = 0
found = False
addedRowIds = []
for lrow in locationsCSV:
	signsCSV = csv.reader(open("./signs.csv", "rU"))
	for thisSign in signsCSV:
		if lrow[1] == thisSign[1]:
			found = True
			lrow.append(thisSign)

		if found == True:
			if lrow[1] != thisSign[1]:
				wr.writerow(lrow)
				rowsadded = rowsadded + 1
				print lrow[1]
				print rowsadded
				found = False
				break
				
"""
counter = 0
for lrow in locationsCSV:
	idStatus = False
	locationId = lrow[1]
	for srow in signsCSV:
		if srow[1] == lrow[1]:
			idStatus = True
					
			newRow = [srow[0], srow[2], srow[3], srow[4], srow[5]]
			lrow.append(newRow)
		else:
			if idStatus == True:
				wr.writerow(lrow)
				print lrow
				counter = counter + 1
				print counter

print "final count : " + str(counter)

"""
