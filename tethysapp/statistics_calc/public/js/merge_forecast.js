// >>>>>>>>>>>>>>>>>>> Merge Forecast JS Functions <<<<<<<<<<<<<<<<<<<<<

// Getting the csrf token for AJAX requests
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


// jQuery Functions for displaying the file
$(document).ready(function() {
    $("#ens_csv").change(function () {
        const label = $("#ens_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#ens_csv_name").val(label);
    });
});

$(document).ready(function() {
    $("#obs_csv").change(function () {
        const label = $("#obs_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#obs_csv_name").val(label);
    });
});


// TODO: Validate whether user has uploaded the files before plotting or downloading
// TODO: Parse files to make sure that they are acceptable before letting users continue

// Function for the plot buttn
$(document).ready(function() {
    $("#visualize").click(function (e) {
        e.preventDefault();

        PlotMergedData();
    });
});
function PlotMergedData() {
    // TODO: Add loader
    let formData = new FormData(document.getElementsByName('merge_forecast_form')[0]); // getting the data from the form

    $.ajax({
        url :  `${apiServer}merge_forecast_plot_ajax/`, // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            console.log(resp);

            if (resp["backend_error"]) {
                $('#plot').html('<p style="color:red">' + resp["error_message"] + '</p>');
            } else {
                // Plot forecasts and observed data with error bars
                let trace1 = {
                    type: "scatter",
                    mode: "lines",
                    name: 'Observed Data',
                    x: resp["dates_list"],
                    y: resp["water_balance_list"],
                    line: {color: '#7F7F7F'}
                };
                let trace2 = {
                    type: "scatter",
                    mode: "lines",
                    name: "Ensemble Mean with Error (Standard Deviation)",
                    x: resp["dates_list"],
                    y: resp["ensemble_mean_list"],
                    error_y: {
                        type: 'data',
                        array: resp["ensemble_std_dev_list"],
                        visible: true,
                        color: '#17BECF'
                    },
                    line: {color: '#17BECF'}
                };

                let data = [trace1, trace2];
                let layout = {
                    title: 'Observed Data and Ensemble Mean Hydrographs',
                    xaxis: {
                        title: 'Datetime'
                    },
                    yaxis: {
                        title: 'Streamflow Values',
                    }

                };

                Plotly.newPlot('plot', data, layout);
            }
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#plot').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>");
           console.log(xhr.status + ": " + xhr.responseText);
        }
    });
}

// Serving the merged csv file to the user on button click
$(document).ready(function() {
    $("#download").click(function (e) {
        e.preventDefault();

        // TODO: Add error checks for the form here

        DownloadMergedData();
    });
});
function DownloadMergedData() {
    $("#merge_forecast_form").submit();
}

