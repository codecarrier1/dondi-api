
## INSTALLATION

### Install Ganache

This guide will use the desktop version of Ganache. Ganache will provide a personal blockchain to be used for local development and testing of smart contracts.

 1. In Ubuntu, open a browser and navigate to https://github.com/trufflesuite/ganache/releases

 2. Download the latest Linux release which will be the ```*.AppImage``` file.

    For example ```ganache-2.4.0-linux-x86_64.AppImage```.

 3. Once the download is complete, open a new terminal and change into the directory with the ```*.AppImage``` file.

 4. Use ```chmod``` to make the file executable:

    ```shell
    ganache-2.4.0-linux-x86_64.AppImage
    ```

 5. Now run the file

    ```shell
    ./ganache-2.4.0-linux-x86_64.AppImage
    ```

 6. You will be prompted if you want to integrate the application into your system. For convenience, click **Yes**.
    This will allow you to launch Ganache later from Ubuntu Application menu.

 7. Ganache will launch and prompt if you want to enable Google Analytics tracking to help the developers improve the software. Toggle  this off if you wish, then click **Continue**.

 8. The main Ganache window will open and you will notice there are already a number of addresses with a balance of 100 ETH each. Ganache provides a personal blockchain that you can start developing against immediately.

    Ganache is now installed and running. I encourage you to review the official quickstart to learn more about the interface: https://truffleframework.com/docs/ganache/quickstart


### Install NodeJS and NPM

 1. First, ensure your system is up to date:

    ```shell
    sudo apt update
    ```

 2. Install NodeJS and it's package manager, ```npm```:

    ```shell
    sudo apt install nodejs npm
    ```

 3. Verify the install was successful by checking the installed version of NodeJS:

    ```shell
    node -v
    ```

 4. Also verify that ```npm``` was installed successfully by checking the version:

    ```shell
    npm -v
    ```


### Install Truffle, React Truffle Box

 1. Once ```npm``` is install, you can install Truffle with this command:

    ```shell
    sudo npm install -g truffle
    ```

 2. Verify the installation by checking the truffle version:

    ```shell
    truffle version
    ```

### Clone the git repository

 1. Run this command to clone the git repository.

    ```shell
    git clone https://github.com/fahimermo/forsage-api.git
    ```

 2. Run the ```unbox``` command.

    ```shell
    cd forsage-api
    truffle unbox react
    ```

 3. Run the development console.

    ```shell
    truffle develop
    ```

 4. Compile and migrate the smart contracts. Note inside the development console we don't preface commands with ```truffle```.

    ```shell
    compile
    migrate
    ```

 5. In the ```client``` directory, we run the React app. Smart contract changes must be manually recompiled and migrated.

    ```shell
    // in another terminal (i.e. not in the truffle develop prompt)
    cd client
    npm run start
    ```

 6. Truffle can run tests written in Solidity or JavaScript against your smart contracts. Note the command varies slightly if you're in or outside of the development console.

    ```shell
    // inside the development console.
    test

    // outside the development console.
    truffle test
    ```

 7. Jest is included for testing React components. Compile your contracts before running Jest, or you may receive some file not found errors.

    ```shell
    // ensure you are inside the client directory when running this
    npm run test
    ```

 8. To build the application for production, use the build script. A production build will be in the ```client/build``` folder.

    ```shell
    // ensure you are inside the client directory when running this
    npm run build
    ```
    