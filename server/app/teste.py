import smtplib

server = smtplib.SMTP("smtp.gmail.com", 587)
server.starttls()

server.login("nandraina.dev22@gmail.com", "eldu iqyn xijo ntfp")
print("✅ LOGIN OK")