import os
import mysql.connector
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from mysql.connector.aio import cursor

load_dotenv()

app= Flask("schoolkitchen")
CORS(app)

@app.route("/api/animetable")
def animetable():
  connection = mysql.connector.connect(
      host=os.getenv("DB_HOST"),
      user=os.getenv("DB_USER"),
      password=os.getenv("DB_PASSWORD"),
      database=os.getenv("DB_NAME")
  )
  cursor = connection.cursor()
  cursor.execute("SELECT animeID, animeName, mainCharacter, sidecharacter, mcPower, scPower, words, stats FROM anime")
  rows = cursor.fetchall()
  cursor.close()
  connection.close()

  results = []
  for row in rows:
   results.append({
    "id": row[0],
    "name": row[1],
    "mainCharacter": row[2],
    "sideCharacter": row[3],
    "mcPower": row[4],
    "scPower": row[5],
    "words": row[6],
    "stats": row[7]
})
  return {"anime": results}
if __name__ == "__main__":
  app.run(debug=True)
  