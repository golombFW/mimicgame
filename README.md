#Mimic Game
##Overview
This project is created as a part of master's thesis on 
*"Utilization of the gamification in the building the human emotions photo database"*
in Computer Science at Gdansk University of Technology.

##Getting Started
This project to get working needs **Node.js** or io.js and **npm** package manager
installed on your machine.

It also needs to set up a new Parse app at [Parse.com](https://parse.com) and setup 
a new facebook app at [developers.facebook.com](https://developers.facebook.com/)

**Remember to turn on and configure facebook authentication in Parse app settings!**
###1. Change application ids and keys
Once you've set up Parse and Facebook, insert your app's Parse Application Id, 
Parse JavaScript Key and Facebook App ID into the config file [`KeyConfig.js`](js/KeyConfig.js).

###2. How to build and run application
In project root (same path like this README file) run following commands

```npm install``` will download and install all needed stuff to build and run project

```npm start``` will build project and run server.

You can stop server with ```Ctrl-C```

###3. Deploy app to Parse
*Work in progress. In this caption will be instructions of deploying app to Parse when
corresponding features will appear in this repo.*

##Miscellaneous
* default ssl certificates and keys password is '1234'
* If you don't want to run server, but only build project you can run
   ```npm build``` instead of ```npm start```  

##Authors
Filip Gołębiewski