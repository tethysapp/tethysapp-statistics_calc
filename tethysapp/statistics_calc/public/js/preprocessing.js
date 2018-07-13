// >>>>>>>>jQuery Functions<<<<<<<<

// Function for the file upload
$(document).ready(function() {
    $("#pps_csv").change(function () {
        const label = $("#pps_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#pps_csv_name").val(label);
    });
});

// Function to validate the File Upload
$(document).ready(function () {
    $("#pps_csv").change(function () {
        // Clear all of the current plots
        $('#raw_data_plot').empty();
        $('#raw_data_results').empty();
        $('#pps_hydrograph').empty();


        let theFile = document.getElementById("pps_csv").files[0];

        // Parsing the CSV to check for errors
        Papa.parse(
            theFile,
            {
                preview: 50,
                complete: function (results) {
                    let error = false;
                    for (let i = 0; i < results.data.length; i++) {
                        let row = results.data[i];
                        if (row.length >= 3) {
                            console.log("There was an error when parsing column " + i);
                            error = true;
                            break;
                        }
                    }
                    if (error) {
                        console.log("Error Protocol Running");
                        $('#validate_csv').show();
                        $('#validate_csv').html(`There was an error while parsing the first 50 lines of your csv. 
                                                 Please make sure that you have only two columns in the csv.`);

                        $('#validate_csv_break').show();
                        $('#validate_csv_break').html("<br>");

                        // Disable all the Buttons
                        $('#raw_data_plot_button').prop("disabled", true);
                        $('#generate_plot').prop("disabled", true);
                        $('#csv_button').prop("disabled", true);


                    } else {
                        $('#raw_data_plot').show();
                        $('#raw_data_results').show();
                        $('#validate_csv').hide();
                        $('#validate_csv_break').hide();

                        // Enable all of the Buttons
                        $('#raw_data_plot_button').prop("disabled", false);
                        $('#generate_plot').prop("disabled", false);
                        $('#csv_button').prop("disabled", false);
                    }
                }
            });
    });
});

// Creating a raw data plot
$(document).ready(function() {
    $("#raw_data_plot_button").click( function(evt) {
        evt.preventDefault();
        console.log('Plot Raw Data Event Triggered'); // sanity check
        plotRawData();
    });
});

// Function to Display the current value of the hour slider
function updateSliderDisplayValue(element_id, element) {
    if (element_id === "interp_hours") {
        $("#interp_hour_value").html($("#interp_hours").val()+' Hours');
    } else if (element_id === "interp_minutes") {
        $("#interp_minute_value").html($("#interp_minutes").val()+' Minutes');
    }
}

// Function to show the begin and end date inputs if the user wants them
$(document).ready( function() {
    $("#time_range_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            $("#time_range_inputs").show();
        } else {
            $("#time_range_inputs").hide();
        }
        console.log('Time Range Slider Clicked.'); // sanity check

    });
});

// Creating a plot with the preprocessed data
$(document).ready(function() {
    $("#generate_plot").click( function(evt) {
        evt.preventDefault();
        console.log('Plot preprocessed data Event Triggered'); // sanity check
        // Validating the inerpolation frequencies

        let validation_error = false;

        // Emptying the error divs
        $('#validation_error_interp').empty();
        $('#validation_error_time').empty();

        // Getting the form data
        let interp_hours = $('#interp_hours').val();
        let interp_minutes = $('#interp_minutes').val();
        let begin_date = $('#begin_date').val();
        let end_date = $('#end_date').val();

        // Checking to make sure the interpolation frequency is ok
        if (interp_hours === "0" && interp_minutes === "0") {
            $('#validation_error_interp').html('<br><div class="alert alert-danger" role="alert">You cannot set both the hours and the minutes to equal zero.</div><br>');
            validation_error = true;
        }

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
        } else if (!isNaN(begin_date_int) && !isNaN(end_date_int)) {
            if (begin_date_int > end_date_int) {
                validation_error = true;
                console.log("Begin date cannot be after end date!");
                $('#validation_error_time').html('<br><div class="alert alert-danger" role="alert">Begin date cannot be after end date!</div><br>');
            }
        }

        if (!validation_error) {
            ppsPlotHydrograph();
        } else {
            window.location.href="#h2_preprocessing";
        }
    });
});

$(document).ready(function() {
    $("#csv_button").click( function(evt) {
        evt.preventDefault();
        $( "#pps_form" ).submit();
        console.log('CSV response Event Triggered'); // sanity check
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