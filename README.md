# transcendence
Transcendence

# Techno
 - TypeScript (Language)
 - NestJS (Back)
 - Angular (Front)
 - PostgreSQL (Database)
 - Docker (Security/Management)
 - Snyk (Security)
 - Sqlmap (SQLInjection)
 - ExcaliburJS (Gameplay)
 - Angular Matérial (Front)
 - TailWind (Front)
 - Postman (Back)
 - WebSocket || socket.io (Back)

# Security & Problems
 - The user should encounter no unhandled errors and no warnings when browsing the website

# Security Concerns
 - Any password stored in your database must be hased
 - Your website must be protected against SQL injections
 - You must implement some kind of server-side validation for forms and any user input
 - Please make sure you use a strong password hashing algorithm
 - For obvious security reasons, any credentials, API Keys, env variables etc.. must be saved locally in a .env file and ignored by git
 - Publicy stored credentials will lead you directly to a failure of the project

# User Account
 - The user must login using the OAuth system of 42 intranet
 - The user should be able to choose a unique name that will be displayed on the website.
 - The user should be able to upload an avatar. If the user doesn't upload an avatar a default one must be set
 - The user should be able to enable two-factor authentication. For instance Google authenticator or sending a text message to their phone
 - The user should be able to add other users as friends and see their current status (online, offline, in a game, and so forth)
 - Stats (such as: wins and losses, ladder level, achievements, and so forth) have to be displayed on the user profile.
 - Each user should have a Match history including 1v1 games, ladder, and anything else useful, Anyone who is logged in should be able to consult it

# Chat
 - The user should be able to create channels (chat rooms) that can be either public or private or protected by a password
 - The user should be able to send direct messages to other users
 - The user should be able to block other users? This way they will see no more messages from the account they blocked
 - The user who has created a new channel is automatically set as the channel owner until they leave it
 - The channel owner can set a password reduired to access the channel change it, and also remove it
 - The channel owner is a channel administrator. They can set other users as administrators
 - A user who is an administrator of a channel can kick,ban,mute other user, but not the channel owners
 - The user should be able to invite other users to play a Pong game through the chat interface
 - The user should be able to access other players profiles through the chat interface

# Game
 - Therefore users, should be able to play a live Pong game versus another player directly on the website
 - There must be a matchmaking system the user can join a queue until they get automatically matched with someone else.
 - It can be a canvas game, or it can be a game rendered in 3D, it can also be ugly but in any case it must be faithful to the original Pong (1972)
 - You must offer some customization options (for example power-ups or different maps). However the user should be able to select a default version of the game without any extra features if they want to
 - The game must be responsive.

# Ressources

- <a href="https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/typescript-best-practices.html">Typescript Best Pratice</a>

- <a href="https://codelynx.dev/posts/typescript-type-vs-interface">Typescript (Type vs Interface)</a>
- <a href="https://blog.bitsrc.io/type-vs-interface-in-typescript-cf3c00bc04ae">Typescript (Type vs Interface)</a>
- <a href="https://api.intra.42.fr/apidoc/guides/web_application_flow">How to use 42API</a>