# Simple tweet backend system

## Description

A simple tweet backend system written in Typescript + nestjs.
Includes user and tweet management.
The system is designed as a microservice with a distributed database.

### Architecture Overview
1. API Gateway (api-gateway):
    * Handles all incoming HTTP requests
    * Responsible for JWT authentication and initial RBAC checks
    * Routes requests to the appropriate microservice
    * Exposes the RESTful API
    
2. Auth Service (auth-service):
    * Manages user credentials data (hashed password, user role)
    * Handles password hashing, jwt token signing and validation
    * Has its own database

3. User Service (users-service):
    * Manages user data (creation, retrieval, update, deletion)
    * Handles user information, the main primary key for user credentials, and tweets
    * Has its own database

4. Tweets Service (tweets-service):
    * Manages tweet data (creation, retrieval, update, deletion)
    * Performs ownership checks for tweet modifications
    * Has its own database

Communication: The API Gateway will communicate with the Auth, User and Tweet services using TCP (NestJS's default microservice transport, easy for local dev).

## Installation

1. copy the `/.env.sample` as `/.env`
2. update the `/.env`
3. run the `start.sh` script
4. (Optional) run `npm run cli create:admin -- -u ${username} -p ${strongPassword}` to create first admin user
5. have fun

## Test

```bash
# unit tests
$ npm run test

# e2e tests (not ready)
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Api endpoints

**User Object Structure (shared):**

| Field       | Type   | Description                                                     |
|-------------|--------|-----------------------------------------------------------------|
| id          | string | Unique identifier for the user (derived from `idHash`).         |
| username    | string | The user's username.                                            |
| firstName   | string | The user's first name.                                          |
| lastName    | string | The user's last name.                                           |
| dateOfBirth | Date   | The user's date of birth (ISO 8601 format, e.g., "YYYY-MM-DD"). |
| role        | string | The user's role (e.g., "USER", "ADMIN").                        |
| createdAt   | Date   | Timestamp indicating when the user account was created.         |
| updatedAt   | Date   | Timestamp indicating when the user account was last updated.    |

### root

1. **POST /register**
    * Registers a new user

    Request:
    
    | Field       | Type   | Description                                                                             | 
    |-------------|--------|-----------------------------------------------------------------------------------------| 
    | username    | string | User's desired username. Must start with a letter and contain only letters and numbers. | 
    | password    | string | User's password. Must meet strong password requirements.                                | 
    | firstName   | string | User's first name.                                                                      | 
    | lastName    | string | User's last name.                                                                       | 
    | dateOfBirth | Date   | User's date of birth. Must be between 14 and 70 years old.                              |
    
    Response:
    
    | Field       | Type   | Description                                                  | 
    |-------------|--------|--------------------------------------------------------------| 
    | id          | string | Unique identifier for the registered user.                   | 
    | username    | string | The registered user's username.                              | 
    | firstName   | string | The registered user's first name.                            | 
    | lastName    | string | The registered user's last name.                             | 
    | dateOfBirth | Date   | The registered user's date of birth.                         | 
    | role        | string | The registered user's role (e.g., "USER", "ADMIN").          | 
    | createdAt   | Date   | Timestamp indicating when the user account was created.      | 
    | updatedAt   | Date   | Timestamp indicating when the user account was last updated. | 

2. **POST /login**
    * Authenticates an existing user 

    Request:
    
    | Field    | Type   | Description                                                                     | 
    |----------|--------|---------------------------------------------------------------------------------| 
    | username | string | User's username. Must start with a letter and contain only letters and numbers. | 
    | password | string | User's password.                                                                |
    
    Response:
    
    | Field | Type   | Description                         | 
    |-------|--------|-------------------------------------| 
    | user  | User   | Object containing user information. | 
    | token | string | JWT token for authentication.       |
    

### users

1. **GET /users**
    * Retrieves paginated list of users 
    * Requires authentication (valid JWT)
    * Requires **ADMIN** role.

    Query Parameters:

    | Field | Type   | Optional | Default | Min | Max | Description                                       |
    |-------|--------|----------|---------|-----|-----|---------------------------------------------------|
    | page  | number | Yes      | 1       | 1   | -   | The page number to retrieve.                      |
    | limit | number | Yes      | 10      | 1   | 100 | The number of users to retrieve per page.         |

    Response: 

    | Field        | Type       | Description                                                               |
    |--------------|------------|---------------------------------------------------------------------------|
    | data         | User Array | An array of user objects for the current page.                            |
    | totalItems   | number     | Total number of users available across all pages.                         |
    | itemCount    | number     | Number of users in the `data` array for the current page.                 |
    | itemsPerPage | number     | The number of items requested per page (matches the `limit` query param). |
    | totalPages   | number     | Total number of pages available.                                          |
    | currentPage  | number     | The current page number (matches the `page` query param).                 |

2. **POST /users**
    * Creates a new user. This endpoint can be used by an administrator to create users with either 'USER' or 'ADMIN' roles.
    * Requires authentication (valid JWT)
    * Requires **ADMIN** role.

    Request:

    | Field       | Type                       | Optional | Description                                                                                                                                                                                                         |
    |-------------|----------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | username    | string                     | No       | User's desired username. Must start with a letter and can only contain letters and numbers. (e.g., "newuser123")                                                                                                    |
    | password    | string                     | No       | User's password. Must be a strong password (typically requires a mix of uppercase, lowercase, numbers, and special characters, with a minimum length - specific rules depend on `@IsStrongPassword` configuration). |
    | firstName   | string                     | No       | User's first name. Cannot be blank.                                                                                                                                                                                 |
    | lastName    | string                     | No       | User's last name. Cannot be blank.                                                                                                                                                                                  |
    | role        | string (Enum: `EUserRole`) | No       | The role to assign to the new user. Must be a valid role from `EUserRole` (e.g., "USER", "ADMIN").                                                                                                                  |
    | dateOfBirth | string (ISO Date)          | No       | User's date of birth in `YYYY-MM-DD` format. The user must be between 14 and 70 years old.                                                                                                                          |

    Response:

    ref to User Object
3. **GET /users/:id**
    * Retrieves the profile information for a specific user by their unique hashed ID
    * Requires authentication (valid JWT)
    * Requires **ADMIN** / **USER** role.

    Path Parameters:

    | Parameter | Type   | Required | Description                                          |
    |-----------|--------|----------|------------------------------------------------------|
    | id        | string | Yes      | The unique hashed identifier (`idHash`) of the user. |

    Response:

    ref to User Object
4. **PUT /users/:id**
    * Updates the profile information for a specific user by their unique hashed ID
    * Requires authentication (valid JWT).
    * At least one field (`firstName`, `lastName`, or `dateOfBirth`) must be provided in the request body.
    * Requires **ADMIN** / **USER** role.
        * **ADMINS:** Can update any user.
        * **USERS (Tweet Owners):** Can only update their own user.
    
    Path Parameters:

    | Parameter | Type   | Required | Description                                                    |
    |-----------|--------|----------|----------------------------------------------------------------|
    | id        | string | Yes      | The unique hashed identifier (`idHash`) of the user to update. |

    Request: 

    | Field       | Type              | Optional | Description                                                                                              |
    |-------------|-------------------|----------|----------------------------------------------------------------------------------------------------------|
    | firstName   | string / null     | Yes      | User's updated first name. Can be set to `null` to clear it (if allowed by the backend logic).           |
    | lastName    | string            | Yes      | User's updated last name.                                                                                |
    | dateOfBirth | string (ISO Date) | Yes      | User's updated date of birth in `YYYY-MM-DD` format. Must adhere to age constraints (14-70 years old).   |

    Response:

    ref to User Object
5. **DELETE /users/:id**
    * Soft deletes a user by their unique hashed ID. This typically means the user is marked as inactive or deleted in the database but not permanently removed
    * Also emit event to soft all the related **tweet** by the user
    * Requires **ADMIN** role

    Path Parameters:

    | Parameter | Type   | Required | Description                                                    |
    |-----------|--------|----------|----------------------------------------------------------------|
    | id        | string | Yes      | The unique hashed identifier (`idHash`) of the user to delete. |

### Tweet
**Tweet Object Structure (shared):**

| Field     | Type             | Description                                             |
|-----------|------------------|---------------------------------------------------------|
| id        | string           | Unique identifier for the tweet.                        |
| title     | string           | The title of the tweet.                                 |
| content   | string           | The main content of the tweet.                          |
| updatedAt | Date             | Timestamp indicating when the tweet was last updated.   |
| createdAt | Date             | Timestamp indicating when the tweet was created.        |
| own       | TweetOwnerObject | Object containing information about the tweet's author. |

**Own Object Structure (shared):**

| Field    | Type   | Description                                            |
|----------|--------|--------------------------------------------------------|
| userId   | string | The unique user hashed identifier of the tweet author. |
| username | string | The username of the tweet author.                      |

1. **GET /tweets**
    * Retrieves a paginated list of all tweets
    * Requires authentication (any logged-in user can access this).

    Query Parameters:

    | Field | Type   | Optional | Default | Min | Max | Description                                       |
    |-------|--------|----------|---------|-----|-----|---------------------------------------------------|
    | page  | number | Yes      | 1       | 1   | -   | The page number to retrieve.                      |
    | limit | number | Yes      | 10      | 1   | 100 | The number of users to retrieve per page.         |

    Response:

    | Field        | Type        | Description                                                               |
    |--------------|-------------|---------------------------------------------------------------------------|
    | data         | Tweet Array | An array of tweet objects for the current page.                           |
    | totalItems   | number      | Total number of tweets available across all pages.                        |
    | itemCount    | number      | Number of tweets in the `data` array for the current page.                |
    | itemsPerPage | number      | The number of items requested per page (matches the `limit` query param). |
    | totalPages   | number      | Total number of pages available.                                          |
    | currentPage  | number      | The current page number (matches the `page` query param).                 |
2. **GET /tweets/:id**
    * Retrieves a specific tweet by its unique ID
    * Requires authentication (any logged-in user can access this).

   Path Parameters:

   | Parameter | Type            | Required | Description                             |
   |-----------|-----------------|----------|-----------------------------------------|
   | id        | string / number | Yes      | The unique identifier of the tweet.     |

    Response:
    ref to Tweet object
3. **POST /tweets**
    * Creates a new tweet for the authenticated user.
    * Requires authentication (any logged-in user can create a tweet).

    Request:

    | Field   | Type   | Required | Max Length | Description                    |
    |---------|--------|----------|------------|--------------------------------|
    | title   | string | Yes      | 100        | The title of the tweet.        |
    | content | string | Yes      | 800        | The main content of the tweet. |

    Response:
    ref to Tweet object
4. **PUT /tweets/:id**
    * Updates an existing tweet
    * Requires authentication
    * At least one field (`title` or `content`) must be provided in the request body
    * Requires **ADMIN** / **USER** role.
        * **ADMINS:** Can update any tweet.
        * **USERS (Tweet Owners):** Can only update their own tweet.

    Path Parameters:

    | Parameter | Type            | Required | Description                                   |
    |-----------|-----------------|----------|-----------------------------------------------|
    | id        | string / number | Yes      | The unique identifier of the tweet to update. |

    Request:

    | Field   | Type   | Optional | Max Length | Description                       |
    |---------|--------|----------|------------|-----------------------------------|
    | title   | string | Yes      | 100        | The updated title of the tweet.   |
    | content | string | Yes      | 800        | The updated content of the tweet. |

    Response:
    ref to Tweet object
5. **DELETE /tweets/:id**
    * Soft deletes a specific tweet by its unique ID. This typically marks the tweet as inactive or deleted but does not permanently remove it from the database
    * Requires authentication
    * Requires **ADMIN** / **USER** role
      * **ADMINS:** Can soft delete any tweet.
      * **USERS (Tweet Owners):** Can only soft delete their own tweets.

    Path Parameters:**

    | Parameter | Type            | Required | Description                                   |
    |-----------|-----------------|----------|-----------------------------------------------|
    | id        | string / number | Yes      | The unique identifier of the tweet to delete. |


## Improvement

1. setup migration stage instead of docker start sql
2. setup mq 
3. setup microservice dockerfile for deployment
4. complete e2e test
 