// >>>>>>>>>>>>>>>>>>> Merge Two Datasets JS Functions <<<<<<<<<<<<<<<<<<<<<

// Select2 Test
$(document).ready(function() {
    $('.js-example-basic-single').select2();
});

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
    $("#obs_csv").change(function () {
        // Hide any previous error messages
        $("#obs_csv_error_message").empty();
        $('#obs_file_upload_div').css({ "border": 'hidden'});

        let obsCSV = document.getElementById("obs_csv").files[0];

        // Parsing the CSV to check for errors
        if (typeof document.getElementById("obs_csv").files[0] === "object") {
            Papa.parse(
                obsCSV,
                {
                    // preview: 50,
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
                            $('#obs_csv_error_message').show();
                            $('#obs_csv_error_message').html('<p style="color: #FF0000"><small>Please make sure that your CSV only has 2 columns.</small></p>');
                            $('#obs_file_upload_div').css({ "border": '#FF0000 1px solid', "border-radius": '4px' });
                        }
                    }
                });
        } else {
            $('#obs_file_upload_div').css({ "border": 'hidden'});
        }
    });
});


// Function to Hide and Show Values based on the radio box for the simulated data
$(document).ready(function() {
    $("input[name=predicted_radio]").on( "change", function() {
        let test = $(this).val();
        $(".sim_upload").hide();
        $("#"+test).show();
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
    $("#sim_csv").change(function () {
        // Hide any previous error messages
        $("#sim_csv_error_message").empty();
        $('#sim_file_upload_div').css({ "border": 'hidden'});

        let obsCSV = document.getElementById("sim_csv").files[0];

        // Parsing the CSV to check for errors
        if (typeof document.getElementById("sim_csv").files[0] === "object") {
            Papa.parse(
                obsCSV,
                {
                    // preview: 50,
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
                            $('#sim_csv_error_message').html('<p style="color: #FF0000"><small>Please make sure that your CSV only has 2 columns.</small></p>');
                            $('#sim_file_upload_div').css({ "border": '#FF0000 1px solid', "border-radius": '4px' });
                        }
                    }
                });
        }
    });
});

// Function to show the begin and end date inputs if the user wants them
$(document).ready( function() {
    $("#time_zone_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            $("#timezone_form").show();
        } else {
            $("#timezone_form").hide();
        }
        console.log('Time Range Slider Clicked.'); // sanity check

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
        console.log('Plot merged data Event Triggered'); // sanity check

        // Validation
        let validation_error = false;

        // Checking if an observed data was provided and if no parsing errors exist
        if (!($("#obs_csv_error_message").html() === "")) { // parsing error
            window.location.assign("#error_redirect_point");
            validation_error = true;
        } else if (!(typeof document.getElementById("obs_csv").files[0] === "object")) {
            $('#obs_file_upload_div').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#obs_csv_error_message").html('<p style="color: #FF0000"><small>The observed data csv is a required input.</small></p>');
            window.location.assign("#error_redirect_point");
            validation_error = true;
        }

        // Checking if the simulated data forms were filled and if no parsing errors exist
        let radio_value = $( 'input[name=predicted_radio]:checked' ).val();

        if (radio_value === "upload") {
            if (!($("#sim_csv_error_message").html() === "")) { // parsing error
                window.location.assign("#error_redirect_point");
                validation_error = true;
            } else if (!(typeof document.getElementById("sim_csv").files[0] === "object")) {
                $('#sim_file_upload_div').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                $("#sim_csv_error_message").html('<p style="color: #FF0000"><small>The simulated data csv is a required input.</small></p>');
                window.location.assign("#error_redirect_point")
                validation_error = true;
            }
        } else {
            if ($("#reach_id").val() === "") {
                $('#reach_id').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                $("#reach_id_error_message").html('<p style="color: #FF0000"><small>The reach ID is a required input.</small></p>');
                window.location.assign("#error_redirect_point")
                validation_error = true;
            }
        }

        if (!validation_error) {
            plotMergedData();
        }
    });
});

// Function for the Merge Data Button
function plotMergedData() {
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
            console.log(resp)

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

        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#merged_hydrograph').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}

// Function to submit the form and write a CSV response
$(document).ready(function() {
    $("#download_merged").click( function(evt) {
        evt.preventDefault();
        $( "#merge_form" ).submit();
        console.log('CSV response Event Triggered'); // sanity check
    });
});
