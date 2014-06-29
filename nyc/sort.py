
import csv


#B, P-004958,RANDALL AVENUE,FAILE STREET,COSTER STREET,N

#B, P-004958,1,0000 ,   ,Curb Line

#[[B, P-004958, RANDALL AVENUE,FAILE STREET,COSTER STREET,N, [1,0000, Curb Line][2,000, Curb Line]]


# locations count : 94102
# locations duplicates : ['S-003375', 'S-005176', 'S-028053']
locationsCSV = csv.reader(open("./locations.csv", "rU"))
# signs count : 750475
signsCSV = csv.reader(open("./signs.csv", "rU"))
wr = csv.writer(open("./locationsandsigns2.csv", "wb"))


found = False
newRow = []
rowsCounted = 0
for l in locationsCSV:
	signsCSV = csv.reader(open("./signs.csv", "rU"))
	for s in signsCSV:
		if l[1] == s[1]:
			if found == False:
				found = True
				newRow = l
				newRow.append([s[0], s[2], s[3], s[4], s[5]])
			else:
				newRow.append([s[0], s[2], s[3], s[4], s[5]])

		else:
			if found == True:
				found = False
				wr.writerow(newRow)
				rowsCounted = rowsCounted + 1
				print rowsCounted
				newRow = []
			else:
				continue

