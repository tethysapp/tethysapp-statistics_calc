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


// Function for the file upload display name
$(document).ready(function() {
    $("#forecast_csv").change(function () {
        const label = $("#forecast_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#forecast_csv_name").val(label);
    });
});


// Creating a raw data plot with the button click
$(document).ready(function() {
    $("#raw_data_plot_button").click( function(evt) {
        evt.preventDefault();

        console.log('Plot Raw Data Event Triggered'); // sanity check

        // Validate
        let validation_error = false;

        // Clear any former errors
        $("#form_error_message").hide();
        $("#csv_error").empty();
        $('#csv_file_upload').css({"border": 'hidden'});


        if (typeof document.getElementById("forecast_csv").files[0] !== "object") {
            $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#csv_error").html('<p style="color: #FF0000"><small>The raw data CSV is a required input.</small></p>');
            validation_error = true;

        }

        if (!validation_error) {
            plotRawData();
        } else {
            window.location.assign("#form_error_ref_point");
            $("#form_error_message").show();
        }
    });
});
function plotRawData() {
    let formData = new FormData(document.getElementsByName('process_forecast_form')[0]); // getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/forecast_raw_data_ajax/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {
            let dates = resp["all_dates"];

            let single_date_array;
            let single_data_array;
            let dataElement;
            let data = [];

            function fillArray(value, len) {
                if (len === 0) return [];
                let a = [value];
                while (a.length * 2 <= len) {
                    a = a.concat(a);
                }
                if (a.length < len) a = a.concat(a.slice(0, len - a.length));
                return a;
            }

            for (let i = 0; i < dates.length; i++) {
                single_date_array = fillArray(dates[i], 51);
                single_data_array = resp[dates[i]];

                if (i === 0) {
                    dataElement = {
                        x: single_date_array,
                        y: single_data_array,
                        type: "scatter",
                        mode: "markers",
                        marker: {color: '#119dff', size: 5, opacity: 0.4},
                        showlegend: true,
                        hoverinfo: 'none',
                        name: "Ensamble Value"
                    };
                } else {
                    dataElement = {
                        x: single_date_array,
                        y: single_data_array,
                        type: "scatter",
                        mode: "markers",
                        marker: {color: '#119dff', size: 5, opacity: 0.4},
                        showlegend: false,
                        hoverinfo: 'none'
                    };
                }

                data.push(dataElement);
            }
            data.push({
                x: resp["all_dates"],
                y: resp["ensamble_mean"],
                type: "scatter",
                name: "Ensamble Mean",
                showlegend: true,
                mode: "lines",
                line: {color: '#000000'}
            });

            let layout = {
                title: "Ensamble Forecast Data",
                xaxis: {title: 'Datetime'},
                yaxis: {title: 'Streamflow (cms)'}
            };

            // let d3 = Plotly.d3;
            // let img_jpg = d3.select('#jpg-export');

            Plotly.newPlot("raw_data_plot", data, layout);

            $("#clear_raw_data_plot").show() // Shows the button that allows user to clear the plot
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}
$(document).ready(function () { // Clears the plot
    $("#clear_raw_data_plot").click(function (evt) {
        evt.preventDefault();
        $("#raw_data_plot").empty();
        $("#clear_raw_data_plot").hide();
    })
});


// Displaying Interpolation Inputs on Slider Click
$(document).ready( function() {
    $("#interpolation_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            $("#interpolation_inputs").show();
        } else {
            $("#interpolation_inputs").hide();
        }
        console.log('Interpolation Slider Clicked.'); // sanity check

    });
});


// Displaying the slider values on input
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


// Displaying the date range selector on slider change
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

        // Validation
        let validation_error = false;

        // Clearing Previous Errors
        $("#form_error_message").hide();

        $("#csv_error").empty();
        $('#csv_file_upload').css({"border": 'hidden'});

        $("#preprocessing_error").empty();
        $('#h2_preprocessing').css({"border": 'hidden'});

        $("#interpolation_error").empty();
        $('#h5_interp_freq').css({"border": 'hidden'});

        $('#validation_error_time').empty();
        $('#timerange_input_box').css({"border": 'hidden'});

        // Checking the file
        if (!(typeof document.getElementById("forecast_csv").files[0] === "object")) {
            $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#csv_error").html('<p style="color: #FF0000"><small>The raw data CSV is a required input.</small></p>');
            validation_error = true;
        }

        // Checking to see if any preprocessing options were selected
        if (!($("#interpolation_bool").is(":checked")) && !($("#time_range_bool").is(":checked"))) {
            $('#h2_preprocessing').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#preprocessing_error").html('<p style="color: #FF0000"><small>No preprocessing options were selected.</small></p>');
            validation_error = true;
        }

        // Checking the interpolation data
        if ($("#interpolation_bool").is(":checked")) {
            if ($("#interp_hours").val() === $("#interp_minutes").val()) {
                $('#h5_interp_freq').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                $("#interpolation_error").html('<p style="color: #FF0000"><small>Both frequency inputs cannot be zero.</small></p>');
                validation_error = true;
            }
        }

        // Checking the dates
        if ($("#time_range_bool").is(":checked")) {
            let begin_date = $('#begin_date').val();
            let end_date = $('#end_date').val();

            if (begin_date === "" && end_date !== "") {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>No begin date supplied!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            } else if (begin_date !== "" && end_date === "") {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>No end date supplied!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            } else if (begin_date === "" && end_date === "") {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>No dates supplied!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            } else if (begin_date === end_date) {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>The begin and end times cannot be equal!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            }
        }

        let formData = new FormData(document.getElementsByName('process_forecast_form')[0]); // getting the data from the form

        if ($("#time_range_bool").is(":checked") && !validation_error) {
            $.ajax({
                url: "/apps/statistics-calc/forecast_check_dates_ajax/", // the endpoint
                type: "POST", // http method
                data: formData, // data sent with the post request, the form data from above
                processData: false,
                contentType: false,

                // handle a successful response
                success: function (resp) {

                    if (resp["error"]) {
                        console.log("The time ranges to timescale do not fit into the csv time ranges!");
                        $('#validation_error_time').html('<p style="color: #FF0000"><small>Your date range does not fit into the time values in the CSV!</small></p>');
                        $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                        window.location.assign("#form_error_ref_point");
                        $("#form_error_message").show();
                    } else {
                        plotForecast();
                    }
                },

                // handle a non-successful response
                error: function (xhr, errmsg, err) {
                    $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
                    console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                }
            });
        } else {
            if (!validation_error) {
                plotForecast();
            } else {
                window.location.assign("#form_error_ref_point");
                $("#form_error_message").show();
            }
        }
    });
});
function plotForecast() {
    let formData = new FormData(document.getElementsByName('process_forecast_form')[0]); // getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/forecast_plot_ajax/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {
            let dates = resp["all_dates"];

            let single_date_array;
            let single_data_array;
            let dataElement;
            let data = [];

            function fillArray(value, len) {
                if (len === 0) return [];
                let a = [value];
                while (a.length * 2 <= len) a = a.concat(a);
                if (a.length < len) a = a.concat(a.slice(0, len - a.length));
                return a;
            }

            for (let i = 0; i < dates.length; i++) {
                single_date_array = fillArray(dates[i], 51);
                single_data_array = resp[dates[i]];

                if (i === 0) {
                    dataElement = {
                        x: single_date_array,
                        y: single_data_array,
                        type: "scatter",
                        mode: "markers",
                        marker: {color: '#119dff', size: 5, opacity: 0.2},
                        showlegend: true,
                        hoverinfo: 'none',
                        name: "Ensamble Value"
                    };
                } else {
                    dataElement = {
                        x: single_date_array,
                        y: single_data_array,
                        type: "scatter",
                        mode: "markers",
                        marker: {color: '#119dff', size: 5, opacity: 0.2},
                        showlegend: false,
                        hoverinfo: 'none'
                    };
                }

                data.push(dataElement);
            }
            data.push({
                x: resp["all_dates"],
                y: resp["ensamble_mean"],
                type: "scatter",
                name: "Ensamble Mean",
                showlegend: true,
                mode: "lines",
                line: {color: '#000000'}
            });

            let layout = {
                title: "Ensamble Forecast Data",
                xaxis: {title: 'Datetime'},
                yaxis: {title: 'Streamflow (cms)'}
            };

            // let d3 = Plotly.d3;
            // let img_jpg = d3.select('#jpg-export');

            Plotly.newPlot("forecast_plot", data, layout)

            $("#clear_forecast_plot").show()
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}
$(document).ready(function () {
    $("#clear_forecast_plot").click(function (evt) {
        evt.preventDefault();
        $("#forecast_plot").empty();
        $("#clear_forecast_plot").hide();
    })
});


// Validating form input and then triggering the create plot function
$(document).ready(function () {
    $("#csv_button").click(function (evt) {
        evt.preventDefault();
        console.log('Download preprocessed csv event triggered.'); // sanity check

        // Validation
        let validation_error = false;

        // Clearing Previous Errors
        $("#form_error_message").hide();

        $("#csv_error").empty();
        $('#csv_file_upload').css({"border": 'hidden'});

        $("#preprocessing_error").empty();
        $('#h2_preprocessing').css({"border": 'hidden'});

        $("#interpolation_error").empty();
        $('#h5_interp_freq').css({"border": 'hidden'});

        $('#validation_error_time').empty();
        $('#timerange_input_box').css({"border": 'hidden'});

        // Checking the file
        if (!(typeof document.getElementById("forecast_csv").files[0] === "object")) {
            $('#csv_file_upload').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#csv_error").html('<p style="color: #FF0000"><small>The raw data CSV is a required input.</small></p>');
            validation_error = true;
        }

        // Checking to see if any preprocessing options were selected
        if (!($("#interpolation_bool").is(":checked")) && !($("#time_range_bool").is(":checked"))) {
            $('#h2_preprocessing').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#preprocessing_error").html('<p style="color: #FF0000"><small>No preprocessing options were selected.</small></p>');
            validation_error = true;
        }

        // Checking the interpolation data
        if ($("#interpolation_bool").is(":checked")) {
            if ($("#interp_hours").val() === $("#interp_minutes").val()) {
                $('#h5_interp_freq').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                $("#interpolation_error").html('<p style="color: #FF0000"><small>Both frequency inputs cannot be zero.</small></p>');
                validation_error = true;
            }
        }

        // Checking the dates
        if ($("#time_range_bool").is(":checked")) {
            let begin_date = $('#begin_date').val();
            let end_date = $('#end_date').val();

            if (begin_date === "" && end_date !== "") {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>No begin date supplied!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            } else if (begin_date !== "" && end_date === "") {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>No end date supplied!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            } else if (begin_date === "" && end_date === "") {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>No dates supplied!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            } else if (begin_date === end_date) {

                validation_error = true;
                $('#validation_error_time').html('<p style="color: #FF0000"><small>The begin and end times cannot be equal!</small></p>');
                $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});

            }
        }

        let formData = new FormData(document.getElementsByName('process_forecast_form')[0]); // getting the data from the form

        if ($("#time_range_bool").is(":checked") && !validation_error) {
            $.ajax({
                url: "/apps/statistics-calc/forecast_check_dates_ajax/", // the endpoint
                type: "POST", // http method
                data: formData, // data sent with the post request, the form data from above
                processData: false,
                contentType: false,

                // handle a successful response
                success: function (resp) {

                    if (resp["error"]) {
                        console.log("The time ranges to timescale do not fit into the csv time ranges!");
                        $('#validation_error_time').html('<p style="color: #FF0000"><small>Your date range does not fit into the time values in the CSV!</small></p>');
                        $('#timerange_input_box').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                        window.location.assign("#form_error_ref_point");
                        $("#form_error_message").show();
                    } else {
                        $("#process_forecast_form").submit();
                    }
                },

                // handle a non-successful response
                error: function (xhr, errmsg, err) {
                    $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
                    console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                }
            });
        } else {
            if (!validation_error) {
                $("#process_forecast_form").submit();
            } else {
                window.location.assign("#form_error_ref_point");
                $("#form_error_message").show();
            }
        }
    });
});
