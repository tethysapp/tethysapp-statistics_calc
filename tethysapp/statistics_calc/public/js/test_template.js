// Function to test parsing a csv client side
function parseCSV(file, callBack) {
    let theFile = document.getElementById("myfile").files[0];

    // Papa.parse(
    //     theFile,
    //     {
    //         preview: 50,
    //         complete: function (results) {
    //             let error_bool = false;
    //
    //             for (let i = 0; i < results.data.length; i++) {
    //                 let row = results.data[i];
    //                 console.log(i);
    //                 if (row.length >= 3) {
    //                     console.log("There was an error when parsing the head!");
    //                     error_bool = true;
    //                     break;
    //                 }
    //             }
    //             console.log("For loop finished");
    //             callBack(error_bool);
    //         }
    //     });
    Papa.parsePromise = function (file) {
        return new Promise(function (complete, error) {
            Papa.parse(file, {complete, error});
        });
    };

    Papa.parsePromise(theFile).then(function (results) {
        console.log(results);
    });

}

function triggerParse() {
    parseCSV();
}


// let promiseCount = 0;
//
// function testPromise() {
//     let thisPromiseCount = ++promiseCount;
//
//     let log = document.getElementById('log');
//     log.insertAdjacentHTML('beforeend', thisPromiseCount +
//         ') Started (<small>Sync code started</small>)<br/>');
//
    // We make a new promise: we promise a numeric count of this promise, starting from 1 (after waiting 3s)
    // let p1 = new Promise(
    //     // The resolver function is called with the ability to resolve or
    //     // reject the promise
    //    (resolve, reject) => {
    //         log.insertAdjacentHTML('beforeend', thisPromiseCount +
    //             ') Promise started (<small>Async code started</small>)<br/>');
    //         // This is only an example to create asynchronism
    //         window.setTimeout(
    //             function() {
    //                 // We fulfill the promise !
    //                 resolve(thisPromiseCount);
    //             }, Math.random() * 2000 + 1000);
    //     }
    // );
//
//     // We define what to do when the promise is resolved with the then() call,
//     // and what to do when the promise is rejected with the catch() call
//     p1.then(
//         // Log the fulfillment value
//         function(val) {
//             log.insertAdjacentHTML('beforeend', val +
//                 ') Promise fulfilled (<small>Async code terminated</small>)<br/>');
//         }).catch(
//         // Log the rejection reason
//        (reason) => {
//             console.log('Handle rejected promise ('+reason+') here.');
//         });
//
//     log.insertAdjacentHTML('beforeend', thisPromiseCount +
//         ') Promise made (<small>Sync code terminated</small>)<br/>');
// }