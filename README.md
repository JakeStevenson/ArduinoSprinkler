ArduinoSprinkler
================

My Lawn Sprinkler System


There are two main projects:
"Controller" and "Server"

Controller
=================
/Controller/arduino/Sprinkler/Sprinkler.ino
This is the software that runs on the arduino itself, allowing it to respond to HTTP requests and turn on or off the relay-driven sprinkler zones based on the path in the URL.  For example, http://192.168.1.237/3/ON would turn zone 3 on.

/Controller/dummy/dummy.js
This is a node.js driven "dummy" controller that I use during development so I don't tie up my real arduino.  It responds the same was as the arduino sketch would, and even plays "click" sounds when relays would change.

Server
=================
This is a node.js server that handles the advanced functionality for the sprinkler system and presents a web-based UI.  It manages telling the arduino when to turn various zones on and off.  
