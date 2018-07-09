// ####################################################################################################################
// Preprocesing Functions
// ####################################################################################################################


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


$(document).ready(function() {
    $("#pps_linear").click( function() {
        console.log('Linear Interpolation Event Triggered'); // sanity check
        const name = "interp_method";
        const value = "linear";
        ppsPlotHydrograph(name, value);
    });
});

$(document).ready(function() {
    $("#pps_cubic").click( function() {
        console.log('Cubic Spline Interpolation Event Triggered') // sanity check
        const name = "interp_method";
        const value = "cubic";
        ppsPlotHydrograph(name, value);
    });
});

$(document).ready(function() {
    $("#pps_pchip").click( function() {
        console.log('PCHIP Interpolation Event Triggered') // sanity check
        const name = "interp_method";
        const value = "pchip";
        ppsPlotHydrograph(name, value);
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
            };

            Plotly.newPlot('raw_data_plot', data, layout);

        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#raw_data_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
           console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}

function ppsPlotHydrograph(name, value) {
    var formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form
    formData.append(name, value); // appending the name and value based on the button clicked
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/pps_hydrograph_ajax/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            var trace = {
                type: "scatter",
                mode: "lines",
                name: "Simulated Data",
                x: resp["dates"],
                y: resp["data"],
                line: {color: '#17BECF'}
            };

            var data = [trace];
            var layout = {
                title: 'Hydrograph',
            };

            Plotly.newPlot('pps_hydrograph', data, layout);

        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
//            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#pps_hydrograph").html(xhr.responseText);
        }
    });
}