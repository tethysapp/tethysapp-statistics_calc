// Function for the file upload
$(document).ready(function() {
    $("#pps_csv").change(function () {
        const label = $("#pps_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#pps_csv_name").val(label);
    });
});


// Function to validate the File Upload on change
$(document).ready(function () {
    $("#pps_csv").change(function () {
        // Clear all of the current plots
        $('#raw_data_plot').empty();
        $('#raw_data_results').empty();
        $('#pps_hydrograph').empty();

        // Clear the error message div
        $('#validate_csv').empty();

        // Hide Error border if it exists
        $('#csv_file_upload').css({ "border": 'hidden'});


        if (typeof document.getElementById("pps_csv").files[0] === "object") {
            let theFile = document.getElementById("pps_csv").files[0];

            // Parsing the CSV to check for errors
            Papa.parse(
                theFile,
                {
                    preview: 50,
                    complete: function (results) {
                        let error = false;
                        for (let i = 0; i < results.data.length - 1; i++) {
                            let row = results.data[i];
                            if (row.length !== 2) {
                                console.log("There was an error when parsing column " + i);
                                error = true;
                                break;
                            }
                        }
                        if (error) {
                            console.log("Error Protocol Running");
                            $('#validate_csv').html('<p style="color: #FF0000"><small>There was an error parsing the first 50 lines of the csv, please make sure that there are only two columns throughout the csv.</small></p>');
                            $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                        }
                    }
                });
        }
    });

});


// Creating a raw data plot with the button click
$(document).ready(function() {
    $("#raw_data_plot_button").click( function(evt) {
        evt.preventDefault();

        console.log('Plot Raw Data Event Triggered'); // sanity check

        // Validate
        let validation_error = false;

        if (typeof document.getElementById("pps_csv").files[0] !== "object") {
            $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#validate_csv").html('<p style="color: #FF0000"><small>The raw data CSV is a required input.</small></p>');
            window.location.assign("#h2_raw_data_checks")
            validation_error = true;
        } else if ($('#validate_csv').html() !== "") {
            window.location.assign("#h2_raw_data_checks");
            validation_error = true;
        }

        if (!validation_error) {
            plotRawData();
        }
    });
});
function plotRawData() {
    let formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/pps_hydrograph_raw_data_ajax/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {
            console.log(resp);

            let trace = {
                x: resp["dates"],
                y: resp["data"],
                mode: 'lines',
                type: 'scatter'
            };

            let data = [trace];

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
                    title: 'Streamflow (cms)',
                    titlefont: {
                        family: 'Arial',
                        size: 18,
                        color: '#000000'
                    },
                },
            };

            Plotly.newPlot('raw_data_plot', data, layout);

            console.log(resp['information']);
            $('#raw_data_results').html(resp['information']);

        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}


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
            $("#time_range_inputs").show();
        } else {
            $("#time_range_inputs").hide();
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

        let validation_error = false;

        // Checking the file
        if ($("#validate_csv").html() !== "") { // parsing error
            validation_error = true;
        } else if (!(typeof document.getElementById("pps_csv").files[0] === "object")) {
            $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#validate_csv").html('<p style="color: #FF0000"><small>The raw data CSV is a required input.</small></p>');
            validation_error = true;
        }

        // Checking the time range data
        $('#validation_error_time').empty(); // Emptying the error divs

        // Getting the form data
        let begin_date = $('#begin_date').val();
        let end_date = $('#end_date').val();

        // Checking to make sure that the dates make sense
        let begin_date_int = new Date(begin_date).getTime();
        let end_date_int = new Date(end_date).getTime();

        console.log(begin_date, end_date);

        if (begin_date === "" && end_date !== "") {
            console.log("No Begin Date Supplied!");
            validation_error = true;
            $('#validation_error_time').html('<p style="color: #FF0000"><small>No begin date supplied!</small></p>');
            $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
        } else if (begin_date !== "" && end_date === "") {
            console.log("No End date supplied!");
            validation_error = true;
            $('#validation_error_time').html('<p style="color: #FF0000"><small>No end date supplied!</small></p>');
            $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
        } else if (begin_date === end_date) {
            console.log("Times Equal Each Other!");
            validation_error = true;
            $('#validation_error_time').html('<p style="color: #FF0000"><small>The begin and end times cannot be equal!</small></p>');
            $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
        }

        let formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form

        if (!validation_error) {
            $.ajax({
                url: "/apps/statistics-calc/pps_check_dates_ajax/", // the endpoint
                type: "POST", // http method
                data: formData, // data sent with the post request, the form data from above
                processData: false,
                contentType: false,

                // handle a successful response
                success: function (resp) {

                    if (resp["error"]) {
                        validation_error = true;
                        console.log("The time ranges to timescale do not fit into the csv time ranges!");
                        $('#validation_error_time').html('<p style="color: #FF0000"><small>Your date range does not fit into the time values in the CSV!</small></p>');
                        $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                    }

                    if (!validation_error) {
                        ppsPlotHydrograph();
                    }
                },

                // handle a non-successful response
                error: function (xhr, errmsg, err) {
                    $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
                    console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                }
            });
        }
    });
});

function ppsPlotHydrograph() {
    let formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form
    console.log(formData); // another sanity check
    $('#pps_hydrograph').empty();

    $.ajax({
        url : "/apps/statistics-calc/pps_hydrograph_ajax/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            let trace = {
                type: "scatter",
                mode: "lines",
                name: "Simulated Data",
                x: resp["dates"],
                y: resp["data"],
                line: {color: '#17BECF'}
            };

            let data = [trace];
            let layout = {
                title: 'Hydrograph',
            };

            Plotly.newPlot('pps_hydrograph', data, layout);

        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#pps_hydrograph').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}


$(document).ready(function() {
    $("#csv_button").click( function(evt) {
        evt.preventDefault();
        console.log('CSV response Event Triggered'); // sanity check

        let formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form

        $.ajax({
            url: "/apps/statistics-calc/pps_check_dates_ajax/", // the endpoint
            type: "POST", // http method
            data: formData, // data sent with the post request, the form data from above
            processData: false,
            contentType: false,

            // handle a successful response
            success: function (resp) {
                // Validating the inerpolation frequencies

                let validation_error = false;

                // Emptying the error divs
                $('#validation_error_time').empty();

                // Getting the form data
                let begin_date = $('#begin_date').val();
                let end_date = $('#end_date').val();

                // Checking to make sure that the dates make sense
                let begin_date_int = new Date(begin_date).getTime();
                let end_date_int = new Date(end_date).getTime();

                if (isNaN(begin_date_int) && !isNaN(end_date_int)) {
                    console.log("No Begin Date Supplied!");
                    validation_error = true;
                    $('#validation_error_time').html('<br><div class="alert alert-danger" role="alert">No begin date supplied!</div><br>');
                } else if (!isNaN(begin_date_int) && isNaN(end_date_int)) {
                    console.log("No End date supplied!");
                    validation_error = true;
                    $('#validation_error_time').html('<br><div class="alert alert-danger" role="alert">No End date supplied!</div><br>');
                } else if (!isNaN(begin_date_int) && !isNaN(end_date_int) && begin_date_int > end_date_int) {
                    validation_error = true;
                    console.log("Begin date cannot be after end date!");
                    $('#validation_error_time').html('<br><div class="alert alert-danger" role="alert">Begin date cannot be after end date!</div><br>');
                } else if (resp["error"]) {
                    validation_error = true;
                    console.log("The time ranges to timescale do not fit into the csv time ranges!");
                    $('#validation_error_time').html('<br><div class="alert alert-danger" role="alert">Your timescale values do not fit into the time range provided in the CSV!</div><br>');
                }

                if (!validation_error) {
                    $("#pps_form").submit();
                } else {
                    window.location.href = "#h2_preprocessing";

                }
            },

            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        });
    });
});

