// import Papa from "papaparse.min.js"
// Function to test parsing a csv client side

function parseCSV() {
    let theFile = document.getElementById("myfile").files[0];

    Papa.parse(
        theFile,
        {
            preview: 50,
            complete: function (results) {
                for (let i = 0; i < results.data.length; i++) {
                    let row = results.data[i];
                    console.log(i);
                    if (row.length >= 3) {
                        console.log("There was an error when parsing the head!");
                        break;
                    }
                }
                console.log("For loop finished")
            }
        });
}
