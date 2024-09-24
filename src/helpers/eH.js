


// #1
try {

} catch (error) {
    console.error(error);
}
// ###################################





// #2
// in callback of async => error parameter
fs.readFile('file.txt', (error, data) => {
    if (error) {
        return console.error(error);
    }
    // ...
});
// ###################################




// #3
// with promis we can use catch
someAsyncFunction()
    .then(result => {
        //...
    })
    .catch(error => {
        console.error(error);
    });
// ###################################





// #4
// in async/await we can use try/catch
async function example() {
    try {
        const result = await someAsyncFunction();
        // ...
    } catch (error) {
        console.error(error);
    }
}
// ###################################




// #5
// in Express program we can use middleware like Helper/asyncHandler.js
// ###################################




// #6
// Domain / but deprecate
const domain = require('domain');
const d = domain.create();
d.on('error', (err) => {
    console.error('error in domain : ', err.message);
});

function riskyFunction() {
    throw new Error('ERRRRRRRRRRRRRRRRRRRRROR');
}

d.run(() => {
    riskyFunction();
});
// ###################################





// #7
// EventEmitter in nodejs in Http service
const http = require('http');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

myEmitter.on('error', (err) => {
    console.error('Error occurred in server:', err);
});

const server = http.createServer((req, res) => {
    if (req.url === '/error') {
        myEmitter.emit('error', new Error('Simulated server error!'));
        res.statusCode = 500;
        res.end('Internal Server Error');
    } else {
        res.statusCode = 200;
        res.end('Hello World!');
    }
});
// ###################################




// #8
//uncaughtException & unhandledRejection
// Whenever an error occurs without a handler, this listener is activated and prints the error to the console
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

//Whenever a Promise is rejected and there is no handler for it, this listener is activated and prints information about the Promise and the reason for rejection.
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

function riskyFunction() {
    throw new Error('This is an uncaught exception!');
}

function promiseFunction() {
    return new Promise((resolve, reject) => {
        reject(new Error('This is an unhandled rejection!'));
    });
}

riskyFunction();

promiseFunction().then(() => {
    console.log('Promise resolved successfully');
}).catch((error) => {
    console.error('Caught rejection in promise:', error);
});
// ###################################




