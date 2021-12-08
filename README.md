# nym-file-uploader-client
A client that exemplifies how to send a file via the Nym network. The destination address can be a nym-file-service-provider, which will save a copy of the file. 

The application is written in React with Typescript. Can be run as a browser app or a desktop app using the electron framework.

At the moment the user can:
- send a file to the service-provider
- download a file from the service-provider
- delete the file form the service-provider

The client was tested on the Milhon NYN tested (v0.11.0) running a nym-client built from source, v0.11.0. A separate nym-client instance must be run for the file-service-provider and another one for the nym-file-uploader-client. Each one will listen on different ports in case they run on the local machine.

The configuration of the server-provider that is used by the current client can be done from `src/config/Config.s`. In the same place you can configure the nym-client used by the client.

The messages sent between the client and the service-provider are binary messages.

The encryption algorithm used for the files is AES-CTR 128.
The hashing is done using an md5 sum.
The metadata about the files is stored in the browser localStorage.

Known fallback:
- cannot send back from the service provider -> client large files at the moment (this might be due to Milhon testnet)

## React browser app

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Electron desktop app

Prerequisites:

`sudo apt install  libwayland-server0 libgbm1  libgtk-3-0 libgbm-dev libnss3-dev libxss-dev `

Run App:

### `yarn start`
### `yarn electron`


## Challenge details

### Users must be able to do the following via the GUI: 

- Store an encrypted file on the service provider [x]

  + Users must be able to encrypt a file and upload it to the service provider’s storage via the Nym mixnet. Whether new keys are generated for this encryption or whether the user can import existing keys is up to the developer. [x]

  + This step will also hash the contents of the file and store the resulting hash in local storage on the user’s machine, and be represented in the GUI. [x]

- Verify their file has been uploaded and stored: [verification is implicit by download the file]

  + Users must be able to poke the service provider with the hash of the file they uploaded in order to verify that the encrypted file exists with this hash as its identifier. 

  + If the service provider answers in the affirmative, users should have the option of having their client-side application overwrite the bytes of their local storage where the file is to remove it. 

- Retrieve their encrypted file from the service provider: [x]

  + Users must be able to request their file from the service provider using the hash as proof of ownership. [x]

  + Users must be able to decrypt the retrieved file locally. [x]

- Request for the service provider to delete its copy of their encrypted file: [x]

  + Users must be able to ask the service provider to delete the file it is storing, and verify there is no identifier remaining, again using the content-hash of the encrypted file. [x]