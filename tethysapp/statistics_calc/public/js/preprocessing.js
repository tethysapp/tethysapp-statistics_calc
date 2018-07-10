// >>>>>>>>jQuery Functions<<<<<<<<

// Function for the file upload
$(document).ready(function() {
    $("#pps_csv").change(function () {
        const label = $("#pps_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#pps_csv_name").val(label);
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

// Function to show the begin and end date inputs if the user wants them
$(document).ready( function() {
    $("#time_range_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            console.log('Checkbox Checked!')
        }
        console.log('Time Range Slider Clicked.'); // sanity check

    });
});

// Creating a plot with the preprocessed data
$(document).ready(function() {
    $("#generate_plot").click( function(evt) {
        evt.preventDefault();
        console.log('Plot preprocessed data Event Triggered'); // sanity check
        console.log($('#begin_date').val());
        ppsPlotHydrograph();
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