import requests

data =  requests.get("https://8ec62c011749.ngrok-free.app/catalog/?channel=Palas Kiosk")
# print(data)
print(data.json())
