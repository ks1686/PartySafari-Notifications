## Directories and Files

- `README.md`: The introductory documentation for the project, including setup instructions and other essential information.
- `package-lock.json`: Automatically generated file for any operations where npm modifies either the node_modules tree or `package.json`.
- `package.json`: Lists the packages your project depends on and provides information about the project (like its version). Run command _npm i_ to install listed dependencies before testing.
- `/shareToSocial`: Sharing to social media functionality that must be implemented on a case-by-case basis when rendering HTML pages. Refer to the README in the folder for information on how to implement the respective functions/JavaScript files.

### `/src`: The server-side codebase.

- `/controllers`: Contains controllers
- `/routes`: Contains routes
- `server.js`: run this to begin sending HTTP requests through Postman

## Additional Information

- Make sure you have your .env file located in `/src` and configured as below:

  ```
  MONGO_USER="your_username"
  MONGO_USER_PASSWORD="your_password"
  SENDGRID_API_KEY="your_API_key"
  ```

- Make sure you have the necessary node dependencies. Rebuild your package with `npm ci` to be safe.

- To run the server, use open integrated terminal in `/src` and use command _node server.js_.
