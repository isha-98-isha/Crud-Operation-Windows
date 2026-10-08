
Step 1: Start Your Backend Server

In your first terminal tab, navigate to your project folder and start your Node.js application:
bash
node server.js
Use code with caution.
(Keep this terminal running in the background).

Step 2: Register a Brand New User Account

Open a second terminal tab (make sure it's set to Git Bash). Run this command to create an account:
bash
curl -X POST http://localhost:5000/REGISTERAPI \
  -H "Content-Type: application/json" \
  -d '{"name":"abc","email":"abc@example","password":"mypassword123"}'
Use code with caution.
Expected Server Response: {"message":"User registered successfully", ...}

Step 3: Log In to Generate an Access Token

Run this command to log in with your new credentials. This will generate a fresh token for your authorization headers:
bash
curl -X POST http://localhost:5000/LOGINAPI \
  -H "Content-Type: application/json" \
  -d '{"email":"abc@example","password":"mypassword123"}'
Use code with caution.
Expected Server Response:
json
{"message":"Login successful","token":"eyJhbGciOiJIUzI1NiIs..."}
Use code with caution.
👉 Copy the long token string inside the double quotes.

Step 4: Authenticate Your Browser UI (Frontend)

To see your users visually on the screen and use your frontend app layout:
1. Open your index.html browser window.
2. Press F12 to open the DevTools Console.
3. Paste the following command (replace PASTE_YOUR_COPIED_TOKEN_HERE with the token you just copied from your terminal login) and hit Enter:javascript
localStorage.setItem('token', 'PASTE_YOUR_COPIED_TOKEN_HERE');
Use code with caution.


• Load All Users:bash
curl http://localhost:5000/USERSAPI \
  -H "Authorization: Bearer PASTE_YOUR_TOKEN_HERE"
Use code with caution.
• Create / Add a User:bash
curl -X POST http://localhost:5000/USERSAPI \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav","role":"Frontend Developer"}'
Use code with caution.
• Delete a User (e.g., User ID 32):bash
curl -X DELETE http://localhost:5000/USERSAPI/ID \
  -H "Authorization: Bearer PASTE_YOUR_TOKEN_HERE"