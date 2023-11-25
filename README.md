# Project Structure

This project follows the given directory structure with various components organized into specific folders:

```
.
├── README.md
├── package-lock.json
├── package.json
├── public
│   ├── client.js
│   ├── components
│   │   ├── footer.js
│   │   └── navigation.js
│   ├── css
│   │   ├── footer.css
│   │   ├── landingPage.css
│   │   ├── navigation.css
│   │   └── notifs.css
│   └── html
│       ├── landingPage.html
│       └── notifsTemplate.html
└── src
    ├── controllers
    │   ├── notifs.controller.js
    ├── model
    │   └──
    ├── routes
    │   ├── notifs.routes.js
    │   └── rsvp.routes.js
    ├── server.js
    └── views
        ├── landingPage.views.js
        ├── notifsPage.views.js
        └── staticFile.views.js
```

## Directories and Files

- `README.md`: The introductory documentation for the project, including setup instructions and other essential information.
- `package-lock.json`: Automatically generated file for any operations where npm modifies either the node_modules tree or `package.json`.
- `package.json`: Lists the packages your project depends on and provides information about the project (like its version).

### `/public`: Contains the client-facing codebase.

- `client.js`: Handles client-side API calls.
- `/components`: Modular JavaScript files for different components of the application.
- `/css`: Styling files for the client-side application.
- `/html`: HTML templates and pages for the application.

### `/src`: The server-side codebase including the MVC (Model-View-Controller) architecture.

- `/controllers`: Contains controllers that handle direct interactions with the mongodb.
- ## `/model`: Represents the application's data structures.
- `/routes`: Routes requests to the right controllers.
- `server.js`: The main entry point for the Node.js server.
- `/views`: Server-side templates and views.
  - `landingPage.views.js`: Serves the landing page view.
  - `notifsPage.views.js`: Serves a testing environment page to the user; allows for testing the sending notifications feature. WIP (not currently operational; rely on Postman).

## Additional Information

- Make sure you have your .env file located in `/src` and configured like so:

  ```
  MONGO_USER="your_username"
  MONGO_USER_PASSWORD="your_password"
  SENDGRID_API_KEY="provided_on_request"

  ```

- Make sure you have the necessary node dependencies. Rebuild your package with `npm ci` to be safe.
