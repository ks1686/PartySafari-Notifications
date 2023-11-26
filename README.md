## Directories and Files

- `README.md`: The introductory documentation for the project, including setup instructions and other essential information.
- `package-lock.json`: Automatically generated file for any operations where npm modifies either the node_modules tree or `package.json`.
- `package.json`: Lists the packages your project depends on and provides information about the project (like its version).

### `/public`: The client-facing codebase.

- `client.js`: Handles client-side API calls.
- `/components`: Modular JavaScript files for different components of the application.
- `/css`: Styling files for the client-side application.
- `/html`: HTML templates and pages for the application.

### `/src`: The server-side codebase.

- `/controllers`: Contains controllers to handle database interaction.
- ## `/model`: Represents the application's data structures.
- `/routes`: Routes requests to respective controllers.
- `server.js`: The main entry point for the Node.js server.
- `/views`: Server-side templates and views.
  - `landingPage.views.js`: Serves the landing page view.
  - `notifsPage.views.js`: (WIP). Use Postman to test notification API.

## Additional Information

- Make sure you have your .env file located in `/src` and configured as below:

  ```
  MONGO_USER="your_username"
  MONGO_USER_PASSWORD="your_password"
  SENDGRID_API_KEY="your_API_key"
  ```

- Make sure you have the necessary node dependencies. Rebuild your package with `npm ci` to be safe.
