# Floating Bridge Online (Demo: https://floating-bridge-app.netlify.app/)

This repo contains the code for both the front-end and back-end for the application.

## Pre-requisuite
### Node
Confirm that you have node and npm using:
`node --version` and `npm --version`. You should see the versions for both commands.

If not, please install them. You are free to install node and npm in any way you see fit.

A recommended way to install them on **Unix** system is to use NVM.

Follow the instructions from [here](https://github.com/nvm-sh/nvm) to install nvm.

Then, run:

`nvm install --lts <version>`

Version tested: v14.15.4

### Postgresql
You will also need to install PostgreSQL for now. Go [here](https://www.postgresql.org/download/) to install it into your local system. No additional setup is required.

In the future, the database should be hosted online to be accessed by the developers.

## Running
The front-end is located in the _web/_ directory and the back-end is located in the _server/_ directory.

Assuming you are using BASH terminal:

1) In one terminal, enter the _server/_ directory and run:
`npm install && npm start`
2) In a separate terminal, enter the _web/_ directory and run: `npm install && npm start`

Your browser should start up and the application should be running
