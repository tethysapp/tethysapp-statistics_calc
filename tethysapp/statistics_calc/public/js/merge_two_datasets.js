// >>>>>>>>>>>>>>>>>>> Merge Two Datasets JS Functions <<<<<<<<<<<<<<<<<<<<<

function checkVisible() {
    let obs_error_mesage_bool = $('#obs_csv_error_message').is(':visible');
    console.log("Is the obs csv error msg visible? " + obs_error_mesage_bool)
    let file_exists = (document.getElementById("obs_csv").files.length == 0)
    console.log("Is there not a file in the obs input? " + file_exists)
    let radio_value = $('[name="predicted_radio"]').val();
    console.log("The radio value is " + radio_value)
    // if (!$('#obs_csv_error_message').is(':visible')) {
    //     console.log("ERROR MESSAGE VISIBLE")
    // }
}

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
        $("#obs_csv_error_message").hide();

        let theFile = document.getElementById("obs_csv").files[0];

        // Parsing the CSV to check for errors
        Papa.parse(
            theFile,
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
                        $('#obs_csv_error_message').html('<br><div class="alert alert-danger" role="alert">There was an error while parsing the first 50 lines of your CSV. Please make sure that it only has 2 columns.</div>');

                        // Disable all the Buttons
                        // $('#raw_data_plot_button').prop("disabled", true);
                        // $('#generate_plot').prop("disabled", true);
                        // $('#csv_button').prop("disabled", true);


                    } else {

                    }
                }
            });
    });
});

// Function for the simulated file upload
$(document).ready(function() {
    $("#sim_csv").change(function () {
        const label = $("#sim_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#sim_csv_name").val(label);
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

// Function for the Plot Data Button
$(document).ready(function() {
    $("#plot_merged").click( function(evt) {
        evt.preventDefault();
        console.log('CSV response Event Triggered'); // sanity check
        plotMergedData();
    });
});

// Function for the Merge Data Button


function plotMergedData() {
    let formData = new FormData(document.getElementsByName('merge_form')[0]); // getting the data from the form
    $('#merged_hydrograph').empty();

    // Validate the data to make sure no errors exist
    let obs_file_exists =

    $.ajax({
        url : "/apps/statistics-calc/merged_hydrograph/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
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
