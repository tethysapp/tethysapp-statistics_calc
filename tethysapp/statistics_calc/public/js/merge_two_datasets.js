// >>>>>>>>>>>>>>>>>>> Merge Two Datasets JS Functions <<<<<<<<<<<<<<<<<<<<<

// Getting the csrf token
let csrftoken = Cookies.get('csrftoken');
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


// Function for the observed file upload display name
$(document).ready(function() {
    $("#obs_csv").change(function () {
        const label = $("#obs_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#obs_csv_name").val(label);
    });
});

// Function to validate the observed data csv
$(document).ready(function () {
    $("#obs_csv").change(function (evt) {
        evt.preventDefault();

        // Hide any previous error messages
        clearPreviousErrors(); // TODO: Don't clear the other file upload error somehow
        // TODO: Add a ClearPreviousPlots method here

        // Parsing the CSV to check for errors

        if (ObsCsvFileExists()) {
            let theFile = evt.currentTarget.files[0];

            PapaParsePromise(theFile)
                .then(results => {
                    return ParseCsv(results);
                })
                .then(results => {
                    console.log(results); // Amount of columns are correct
                })
                .catch(rejectReason => {
                    console.log(rejectReason); // Amount of columns are incorrect
                    SetParseErrorObsCsv(rejectReason);
                });
        }
    });
});


// Function to Hide and Show Values based on the radio box for the simulated data
$(document).ready(function() {
    $("input[name=predicted_radio]").on( "change", function() {
        let test = $(this).val();
        $(".sim_upload").hide();
        $("#"+test).fadeIn();
    });
});

// Function for the simulated file upload display name
$(document).ready(function() {
    $("#sim_csv").change(function () {
        const label = $("#sim_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#sim_csv_name").val(label);
    });
});

// Function to validate the simulated data csv
$(document).ready(function () {
    $("#sim_csv").change(function (evt) {
        evt.preventDefault();

        // Hide any previous error messages
        clearPreviousErrors(); // TODO: Don't clear the other file upload error somehow
        // TODO: Add a ClearPreviousPlots method here

        // Parsing the CSV to check for errors
        if (SimCsvFileExists()) {
            let theFile = evt.currentTarget.files[0];

            PapaParsePromise(theFile)
                .then(results => {
                    return ParseCsv(results);
                })
                .then(results => {
                    console.log(results); // Amount of columns are correct
                })
                .catch(rejectReason => {
                    console.log(rejectReason); // Amount of columns are incorrect
                    SetParseErrorSimCsv(rejectReason);
                });
        }
    });
});

// Function to show the time zone inputs if the user wants them
$(document).ready( function() {
    $("#time_zone_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            $("#timezone_form").fadeIn();
        } else {
            $("#timezone_form").fadeOut();
        }
    });
});


// jQeury Functions for the select2 inputs
$(document).ready(function() {
    $('.all_the_observed_tz').select2();
});
$(document).ready(function() {
    $('.all_the_simulated_tz').select2();
});


// Function for the Plot Data Button
$(document).ready(function() {
    $("#plot_merged").click( function(evt) {
        evt.preventDefault();

        // Validation
        let validation_error;

        // Clearing previous errors and plots
        clearPreviousErrors(); // TODO: Change this so that it doesn't clear the Parse Errors
        clearPreviousPlots();

        // Checking the observed data csv
        validation_error = checkObsCsv();

        // Checking if the simulated data forms were filled and if no parsing errors exist
        if (!validation_error) {
            validation_error = checkSimulatedInput();
        } else {
            checkSimulatedInput()
        }

        if (!validation_error) {
            plotMergedData();
        } else {
            window.location.assign("#error_redirect_point");
            $("#form_error_message").show();
        }
    });
});
function plotMergedData() {
    // Show the loader
    $("#plot_loader").fadeIn();

    let formData = new FormData(document.getElementsByName('merge_form')[0]); // getting the data from the form
    $('#merged_hydrograph').empty();

    $.ajax({
        url : "/apps/statistics-calc/merged_hydrograph/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            console.log(resp);

            if (resp["backend_error"]) {
                $("#merged_hydrograph").html(`<p style="color:red">${resp["error_message"]}</p>`);
                $("#plot_loader").hide();
            } else {
                let trace1 = {
                    type: "scatter",
                    mode: "lines",
                    name: "Simulated Data",
                    x: resp["dates"],
                    y: resp["simulated"],
                    line: {color: '#17BECF'}
                };

                let trace2 = {
                    type: "scatter",
                    mode: "lines",
                    name: "Observed Data",
                    x: resp["dates"],
                    y: resp["observed"],
                    line: {color: '#7F7F7F'}
                };

                let data = [trace1, trace2];
                let layout = {
                    title: 'Hydrograph',
                };

                Plotly.newPlot('merged_hydrograph', data, layout);
                $("#clear_plot_button").show();
                $("#plot_loader").hide();
            }
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#merged_hydrograph').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}
$(document).ready(function () {
    $("#clear_plot_button").click( function(evt) {
        evt.preventDefault();
        $("#clear_plot_button").hide();
        $("#merged_hydrograph").empty();
    });
});

// Function to submit the form and write a CSV response
$(document).ready(function() {
    $("#download_merged").click( function(evt) {
        evt.preventDefault();
        console.log('Plot merged data Event Triggered'); // sanity check

        // Validation
        let validation_error = false;

        // Clearing previous errors
        clearPreviousErrors();

        // Checking the observed data csv
        validation_error = checkObsCsv();
        validation_error = checkSimulatedInput();
        checkSimulatedInput();

        // Checking if the simulated data forms were filled and if no parsing errors exist
        if (!validation_error) {

        } else {

        }

        if (!validation_error) {
            $("#merge_form").submit();
        } else {
            window.location.assign("#error_redirect_point");
            $("#form_error_message").show();
        }
    });
});

// ********************
// * HELPER FUNCTIONS *
// ********************

/**
 * @return {boolean}
 */
function ObsCsvFileExists() {
    return (typeof document.getElementById("obs_csv").files[0] === "object");
}

/**
 * @return {boolean}
 */
function SimCsvFileExists() {
    return (typeof document.getElementById("sim_csv").files[0] === "object");
}

function PapaParsePromise(file) {
    return new Promise((complete, error) => {
        Papa.parse(file, {preview: 50, complete, error});
    });
}

function ParseCsv(csvArray) {
    return new Promise((resolve, reject) => {
        let parseError = false;
        for (let i = 0; i < csvArray.data.length - 1; i++) {
            let row = csvArray.data[i];
            if (row.length !== 2) {
                parseError = true;
                break;
            }
        }
        if (!parseError) {
            resolve('Columns look fine in the CSV');
        } else {
            reject('There are too many columns in the CSV provided.');
        }
    })
}

function SetParseErrorObsCsv(errorMsg) {
    $('#obs_csv_error_message').html(`<p style="color: #FF0000"><small>${errorMsg}</small></p>`);
    $('#obs_file_upload_div').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
}

function SetParseErrorSimCsv(errorMsg) {
    $('#sim_csv_error_message').html(`<p style="color: #FF0000"><small>${errorMsg}</small></p>`);
    $('#sim_file_upload_div').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
}

function clearPreviousErrors() {

    // Clear the error messages
    $("#obs_csv_error_message").empty();
    $('#obs_file_upload_div').css({ "border": 'hidden'});

    $("#sim_csv_error_message").empty();
    $('#sim_file_upload_div').css({ "border": 'hidden'});

    $("#form_error_message").hide();
}

function clearPreviousPlots() {
    $('#merged_hydrograph').empty();

    $("#clear_plot_button").hide();
}

function checkObsCsv() {
    if (!($("#obs_csv_error_message").html() === "")) { // parsing error
        return true;
    } else if (!(typeof document.getElementById("obs_csv").files[0] === "object")) { // no csv provided
        $('#obs_file_upload_div').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
        $("#obs_csv_error_message").html('<p style="color: #FF0000"><small>The observed data csv is a required input.</small></p>');
        return true;
    } else {
        return false;
    }
}

function checkSimulatedInput() {

    // language=JQuery-CSS
    let radio_value = $("input[name=predicted_radio]:checked").val();

    // Retrieving Elements from DOM
    // language=JQuery-CSS
    let sim_csv_error_message = $("#sim_csv_error_message");

    if (radio_value === "upload") {
        if (!(sim_csv_error_message.html() === "")) { // parsing error
            return true;
        } else if (!(typeof document.getElementById("sim_csv").files[0] === "object")) { // No CSV provided
            $('#sim_file_upload_div').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            sim_csv_error_message.html('<p style="color: #FF0000"><small>The simulated data csv is a required input.</small></p>');
            return true;
        } else {
            return false;
        }
    } else {
        if ($("#reach_id").val() === "") {
            $('#reach_id').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#reach_id_error_message").html('<p style="color: #FF0000"><small>The reach ID is a required input.</small></p>');
            return true;
        } else {
            return false
        }
    }
}