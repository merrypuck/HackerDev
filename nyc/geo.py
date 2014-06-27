from urllib import urlopen
import csv

locationsCSV = csv.reader(open("./locations.csv", "rU"))

url = "https://maps.googleapis.com/maps/api/geocode/json?address="