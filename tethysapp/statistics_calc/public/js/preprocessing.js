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


// Function for the file upload
$(document).ready(function() {
    $("#pps_csv").change(function () {
        const label = $("#pps_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#pps_csv_name").val(label);
    });
});


// Function to validate the File Upload on change
$(document).ready(function () {
    $("#pps_csv").change(function (evt) {
        evt.preventDefault();

        ClearPreviousPlots(); // Refresh things when new data is entered
        ClearPreviousErrors();

        if (FileExists()) {
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
                    SetParseError(rejectReason);
                });
        }
    })
});


// Creating a raw data plot with the button click
$(document).ready(function() {

    $("#raw_data_plot_button").click( function(evt) {
        evt.preventDefault();

        // Show Loader
        const plotRawDataLoader = $("#raw_data_plot_loader");
        plotRawDataLoader.fadeIn();

        // Validate
        let validation_error = false;

        if (!FileExists()) {
            SetMissingFileError();
            validation_error = true;
        } else if ($('#csv_error').html() !== "") {
            window.location.assign("#h2_raw_data_checks");
            validation_error = true;
        }

        // Run plotting function if no errors
        if (!validation_error) {
            plotRawData();
        } else {
            window.location.assign("#form_error_ref_point");
            $("#form_error_message").show();
            plotRawDataLoader.fadeOut();
        }
    });
});
function plotRawData() {
    let formData = new FormData();

    let userFile = document.getElementById("pps_csv").files[0];

    formData.append('pps_csv', userFile);
    formData.append('current_units', $("#current_units").val());
    formData.append('desired_units', $("#desired_units").val());

    $.ajax({
        url: `${apiServer}pps_hydrograph_raw_data_ajax/`,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',

        // handle a successful response
        success: function (resp) {

            console.log(resp.units);

            if (resp['backend_error'] === false) {

                PlotlyRawData(resp['units'], resp["dates"], resp["data"]);

                // Fill the div with preprocessing info
                $('#raw_data_results').html(resp['information']);

                $("#clear_raw_data_plot_button").show();
                $("#raw_data_plot_loader").fadeOut();
            } else {
                $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>" +
                    "Oops! We have encountered an error: " + resp['error_message'] + ".</div>");
                $("#raw_data_plot_loader").fadeOut();
            }
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}
$(document).ready(function () { // Button that clears the plot and data
    $("#clear_raw_data_plot_button").click( function(evt) {
        evt.preventDefault();
        $("#clear_raw_data_plot_button").hide();
        $("#raw_data_plot").empty();
        $("#raw_data_results").empty();
    });
});


// Displaying Interpolation Inputs on Slider Click
$(document).ready( function() {
    $("#interpolation_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            $("#interpolation_inputs").fadeIn();
        } else {
            $("#interpolation_inputs").fadeOut();
        }
        console.log('Interpolation Slider Clicked.'); // sanity check

    });
});


// Functions to Display the current value of the hour and minute slider
$(document).ready(function () {
    $("#interp_hours").on( "input", function(evt) {
        evt.preventDefault();
        $("#interp_hours_value").html($(this).val());
    });
});
$(document).ready(function () {
    $("#interp_minutes").on( "input", function(evt) {
        evt.preventDefault();
        $("#interp_minutes_value").html($(this).val());
    });
});


// Function to show the begin and end date inputs if the user wants them
$(document).ready( function() {
    $("#time_range_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            $("#time_range_inputs").fadeIn();
        } else {
            $("#time_range_inputs").fadeOut();
        }
    });
});


// Function for the datepickers
$(document).ready(function () {
    $('.input-daterange').datepicker({
        format: 'MM d, yyyy',
        clearBtn: true,
        autoclose: true,
        startDate: "January 1, 1900",
        endDate: "0d",
        startView: "decade",
    })
});


// Validating form input and then triggering the create plot function
$(document).ready(function () {
    $("#generate_plot").click(function (evt) {

        evt.preventDefault();
        console.log('Plot preprocessed data Event Triggered'); // sanity check

        // Validation
        let validation_error = false;

        ClearPreviousErrors(false);
        $('#pps_hydrograph').empty();
        $("#clear_plot").hide();

        // Checking the file
        validation_error = checkFileInput();

        // Checking the time range data
        if (!validation_error) {
            validation_error = checkTimeRange();
        } else {
            checkTimeRange();
        }

        // Checking the interpolation data
        if (!validation_error) {
            validation_error = checkInterpolation();
        } else {
            checkInterpolation();
        }

        // Checking to see if any preprocessing options were selected
        if (!validation_error) {
            validation_error = checkOptions();
        } else {
            checkOptions();
        }

        // Checking if the dates fit into the csv time range
        if (!validation_error) {

            // Show Loader
            $("#plot_loader").fadeIn();

            let formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form

            $.ajax({
                url: `${apiServer}pps_check_dates_ajax/`, // the endpoint
                type: "POST", // http method
                data: formData, // data sent with the post request, the form data from above
                processData: false,
                contentType: false,

                // handle a successful response
                success: function (resp) {

                    if (resp["error"]) {
                        validation_error = true;
                        console.log("The time ranges to timescale do not fit into the csv time ranges!");
                        $('#time_error').html('<p style="color: #FF0000"><small>Your date range does not fit into the time values in the CSV!</small></p>');
                        $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

                        window.location.assign("#form_error_ref_point");
                        $("#form_error_message").show();

                        $("#plot_loader").hide();
                    } else {
                        ppsPlotHydrograph();
                    }
                },

                // handle a non-successful response
                error: function (xhr, errmsg, err) {
                    $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
                    console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                }
            });
        } else {
            window.location.assign("#form_error_ref_point");
            $("#form_error_message").show();

            $("#plot_loader").hide();
        }
    });
});
function ppsPlotHydrograph() {
    let formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form
    console.log(formData); // another sanity check
    $('#pps_hydrograph').empty();

    $.ajax({
        url : `${apiServer}pps_hydrograph_ajax/`, // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success: function (resp) {
            if (!resp['backend_error']) {
                let trace = {
                    type: "scatter",
                    mode: "lines",
                    name: "Simulated Data",
                    x: resp["dates"],
                    y: resp["data"],
                    line: {color: '#17BECF'}
                };

                let data = [trace];

                // Changing the y axis label based on the units selected
                let y_axis_label = "";

                if (resp['units'] === 'si') {
                    y_axis_label = 'Streamflow (cms)';
                } else {
                    y_axis_label = 'Streamflow (cfs)';
                }

                let layout = {
                    title: 'Hydrograph',

                    titlefont: {
                        family: 'Arial',
                        size: 24,
                        color: '#000000'
                    },

                    xaxis: {
                        title: "Datetime",
                        titlefont: {
                            family: 'Arial',
                            size: 18,
                            color: '#000000'
                        },
                    },
                    yaxis: {
                        title: y_axis_label,
                        titlefont: {
                            family: 'Arial',
                            size: 18,
                            color: '#000000'
                        },
                    },
                };

                Plotly.newPlot('pps_hydrograph', data, layout);
                $("#clear_plot").show();
                $("#plot_loader").hide();

            } else {
                $('#pps_hydrograph').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered " +
                    "an error: " + resp['error_message'] + ".</div>");
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                $("#plot_loader").hide();
            }
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#pps_hydrograph').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#plot_loader").hide();
        }
    });
}
$(document).ready(function () {
    $("#clear_plot").click( function(evt) {
        evt.preventDefault();
        $("#clear_plot").hide();
        $("#pps_hydrograph").empty();
    });
});



$(document).ready(function() {
    $("#csv_button").click( function(evt) {
        evt.preventDefault();

        ClearPreviousErrors(false); // Omitting the parsing error

        // Validation
        let validation_error;

        // Checking the file
        validation_error = checkFileInput();

        // Checking the time range data
        if (!validation_error) {
            validation_error = checkTimeRange();
        } else {
            checkTimeRange();
        }

        // Checking the interpolation data
        if (!validation_error) {
            validation_error = checkInterpolation();
        } else {
            checkInterpolation();
        }

        // Checking to see if any preprocessing options were selected
        if (!validation_error) {
            validation_error = checkOptions();
        } else {
            checkOptions();
        }

        if (!validation_error) {

            let formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form

            $.ajax({  // Checking to make sure that the given dates fit into the timeseries
                url: `${apiServer}pps_check_dates_ajax/`, // the endpoint
                type: "POST", // http method
                data: formData, // data sent with the post request, the form data from above
                processData: false,
                contentType: false,

                // handle a successful response
                success: function (resp) {

                    if (resp["error"]) {
                        console.log("The time ranges to timescale do not fit into the csv time ranges!");
                        $('#time_error').html('<p style="color: #FF0000"><small>Your date range does not fit into the time values in the CSV!</small></p>');
                        $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

                        window.location.assign("#form_error_ref_point");
                        $("#form_error_message").show();
                    } else {
                        console.log("Submitting the form");
                        $("#pps_form").submit();
                    }
                },

                // handle a non-successful response
                error: function (xhr, errmsg, err) {
                    $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
                    console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                }
            });
        } else {
            window.location.assign("#form_error_ref_point");
            $("#form_error_message").show();
        }
    });
});


// ****************
// HELPER FUNCTIONS
// ****************

// Promises
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

// Methods to set errors for elements
function SetParseError(errorMsg) {
    $('#csv_error').html(`<p style="color: #FF0000"><small>${errorMsg}</small></p>`);
    $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
}

function SetMissingFileError() {
    $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
    $("#csv_error").html('<p style="color: #FF0000"><small>The raw data CSV is a required input.</small></p>');
    window.location.assign("#h2_raw_data_checks");
}

// Methods to check if form elements have been filled out
/**
 * @return {boolean}
 */
function FileExists() {
    return (typeof document.getElementById("pps_csv").files[0] === "object");
}

/**
 * @return {boolean}
 */
function CsvErrorExists() {
    return ($("#csv_error") !== "");
}

function ClearPreviousErrors(csvError=true) {
    // Clear the error messages
    if (csvError) {
        $('#csv_error').empty();
        $('#csv_file_upload').css({"border": 'hidden'});
    }

    $("#preprocessing_error").empty();
    $('#h2_preprocessing').css({"border": 'hidden'});

    $('#interpolation_error').empty();
    $('#h5_interp_freq').css({"border": 'hidden'});

    $('#time_error').empty();
    $('#timerange_input_box').css({"border": 'hidden'});

    $("#form_error_message").hide();
}

function ClearPreviousPlots() {
    $('#raw_data_plot').empty();
    $('#raw_data_results').empty();
    $('#pps_hydrograph').empty();

    $("#clear_plot").hide();
    $("#clear_raw_data_plot_button").hide();
}

function checkFileInput() { // TODO: Fix this bad method, make it into two seperate methods
    let csv_error = $("#csv_error");

    if (csv_error.html() !== "") { // parsing error
        return true;
    } else if (!(typeof document.getElementById("pps_csv").files[0] === "object")) {
        $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
        csv_error.html('<p style="color: #FF0000"><small>The raw data CSV is a required input.</small></p>');
        return true;
    } else {
        return false;
    }
}

function checkTimeRange() {
    if ($("#time_range_bool").is(":checked")) {
        let begin_date = $('#begin_date').val();
        let end_date = $('#end_date').val();

        if (begin_date === "" && end_date !== "") {

            $('#time_error').html('<p style="color: #FF0000"><small>No begin date supplied.</small></p>');
            $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            return true;

        } else if (begin_date !== "" && end_date === "") {

            $('#time_error').html('<p style="color: #FF0000"><small>No end date supplied.</small></p>');
            $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            return true;

        } else if (begin_date === "" && end_date === "") {

            $('#time_error').html('<p style="color: #FF0000"><small>No dates supplied.</small></p>');
            $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            return true;

        } else if (begin_date === end_date) {

            $('#time_error').html('<p style="color: #FF0000"><small>The begin and end times cannot be equal.</small></p>');
            $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            return true;

        } else {
            return false;
        }
    } else {
        return false;
    }
}

function checkInterpolation() {
    if ($("#interpolation_bool").is(":checked")) {
        if ($("#interp_hours").val() === $("#interp_minutes").val()) {
            $('#h5_interp_freq').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#interpolation_error").html('<p style="color: #FF0000"><small>Both frequency inputs cannot be zero.</small></p>');
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function checkOptions() {
    if (!($("#interpolation_bool").is(":checked")) && !($("#time_range_bool").is(":checked"))) {
        $('#h2_preprocessing').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
        $("#preprocessing_error").html('<p style="color: #FF0000"><small>No preprocessing options were selected.</small></p>');
        return true;
    } else {
        return false;
    }
}

function PlotlyRawData(units, dates, data) {
    let trace = {
        x: dates,
        y: data,
        mode: 'lines',
        type: 'scatter'
    };

    // Changing the y axis label based on the units selected
    let y_axis_label = "";

    if (units === 'si') {
        y_axis_label = 'Streamflow (cms)';
    } else {
        y_axis_label = 'Streamflow (cfs)';
    }

    let layout = {
        title: 'Hydrograph',
        titlefont: {
            family: 'Arial',
            size: 24,
            color: '#000000'
        },

        xaxis: {
            title: "Datetime",
            titlefont: {
                family: 'Arial',
                size: 18,
                color: '#000000'
            },
        },
        yaxis: {
            title: y_axis_label,
            titlefont: {
                family: 'Arial',
                size: 18,
                color: '#000000'
            },
        },
    };

    Plotly.newPlot('raw_data_plot', [trace], layout);
}
