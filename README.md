Cameron Stuart
s2365780

to start clone the reposoty open the intigrated terminal and type npm i 
then node index to run the website 

"dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-handlebars": "^7.1.2",
    "gray-nedb": "^1.8.3",
    "handlebars": "^4.7.8",
    "jquery": "^3.7.1",
    "json-web-token": "^3.2.0",
    "jsonwebtoken": "^9.0.2",
    "moment": "^2.30.1",
    "nedb": "^1.8.0",
    "nodemon": "^3.1.0",
    "path": "^0.12.7"
  }
  list of dependences required



authintication there are 4 user types 
guest ie no role
guest user can acsess the homepage login page about us page and resgister page 
user of the user role with the ability to visit all of the place guest expet register or login because they have an account and are logged in can with the adition on the contact us page and the donate page and logout
pantry the ability to acsess all donations pantry spesific donations and logout 
as the name implys all donatiosn gets every donation that is able to be claimed and the pantry account can clame it and it gets added to that account then they can navigate to there pantry donations to see all of the claimed donations
with the date it expires it will auto be deleted if its passed the expired date it also provides the user who donated it the ability to unclaim or delete a claimed donation

Admin can create users of type user pantry and admin with a name and password need the password validation has been turned off for the administrations allowing for lower security passwords tempereroly, they can delete users within the user control page.
they can delete donations from the gloabal panty clamable page under all donations and have acsesss to any contact forms that were sent by user and the ability to delete them along with logging out this fuills the following

The application should allow the users to do the following:
•	People should be able to view an About Us page with information about the initiative and access a Contact Us page with a contact form
•	Individuals with food to donate should be able to register for the application
•	Registered users should be able to login and add items
•	Pantries should be able to browse to the site and view currently available items
•	Pantries should be able to select items  
•	Items should only be displayed while they are within date and usable
•	Items should not be displayed once they have been selected
•	There should be an administrator role provided. Administrators should be able to add and delete users and items.

for the template engien handlebars was implemented rather than mustashe for the ability to customise the navigation bar rather thean sending users to seperate parts of the site with 3 seperate navigation bars 

authinitaction is done within the routs file ensureign that on the spesified roles can accsess the spesific parts of the website 
