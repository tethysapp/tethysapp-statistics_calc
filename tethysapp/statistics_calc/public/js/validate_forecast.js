// Getting the csrf token
let csrftoken = Cookies.get('csrftoken');

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


// Function for the merged CSV file upload
$(document).ready(function () {
    $("#forecast_csv").change(function () {
        const label = $("#forecast_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#merged_csv_name").val(label);
    });
});


// Function to display benchmark file input if user wants to calculate skill score
$(document).ready(function () {
    $("#skill_score_bool").change(function (evt) {
        evt.preventDefault();
        if ($(this).is(":checked")) {
            $("#benchmark_input_div").fadeIn();
        } else {
            $("#benchmark_input_div").fadeOut();
        }
        console.log('Skill Score Slider Clicked.'); // sanity check
    });
});


// Function for the benchmark forecast CSV file upload
$(document).ready(function () {
    $("#benchmark_csv").change(function () {
        const label = $("#benchmark_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#benchmark_csv_name").val(label);
    });
});


// Function to plot the CSV data
$(document).ready(function () {
    $("#visualize_button").click(function () {
        plotData();
    })
});

function plotData() {
    let formData = new FormData(document.getElementsByName('validate_forecast')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/validate_forecast_plot/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) { // TODO: Make sure that error are checked for.
            console.log(resp);

            let skill_score_bool = resp["skill_score_bool"];

            if (skill_score_bool) {
                let forecast_error_bool = resp["forecast_error_bool"];
                let benchmark_error_bool = resp["benchmark_error_bool"];

                if ( benchmark_error_bool && forecast_error_bool ) {
                    // Plot forecasts and observed data with error bars
                    let trace1 = {
                        type: "scatter",
                        mode: "lines",
                        name: 'Observed Data',
                        x: resp["dates"],
                        y: resp["observed_data"],
                        line: {color: '#7F7F7F'}
                    };
                    let trace2 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Ensemble Mean Data",
                        x: resp["dates"],
                        y: resp["forecast"],
                        error_y: {
                            type: 'data',
                            array: resp["forecast_error"],
                            visible: true,
                            color: '#17BECF'
                        },
                        line: {color: '#17BECF'}
                    };
                    let trace3 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Ensemble Benchmark Forecast",
                        x: resp["dates"],
                        y: resp["benchmark"],
                        error_y: {
                            type: 'data',
                            array: resp["benchmark_error_bars"],
                            visible: true,
                            color: '#49cf35'
                        },
                        line: {color: '#49cf35'}
                    };

                    let data = [trace1, trace2, trace3];
                    let layout = {
                        title: 'Observed data, Ensemble Forecast, and Benchmark Forecast Hydrographs',
                    };

                    Plotly.newPlot('plot', data, layout);

                } else if ( benchmark_error_bool && (!forecast_error_bool) ) {
                    // Plot forecasts and observed data with error bars
                    let trace1 = {
                        type: "scatter",
                        mode: "lines",
                        name: 'Observed Data',
                        x: resp["dates"],
                        y: resp["observed_data"],
                        line: {color: '#7F7F7F'}
                    };
                    let trace2 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Forecast Data",
                        x: resp["dates"],
                        y: resp["forecast"],
                        line: {color: '#17BECF'}
                    };
                    let trace3 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Ensemble Benchmark Forecast",
                        x: resp["dates"],
                        y: resp["benchmark"],
                        error_y: {
                            type: 'data',
                            array: resp["benchmark_error_bars"],
                            visible: true
                        },
                        line: {color: '#17BECF'}
                    };

                    let data = [trace1, trace2, trace3];
                    let layout = {
                        title: 'Observed data, Forecast, and Benchmark Forecast Hydrographs',
                    };

                    Plotly.newPlot('plot', data, layout);

                } else if ( (!benchmark_error_bool) && forecast_error_bool ) {
                    // Plot forecasts and observed data with error bars
                    let trace1 = {
                        type: "scatter",
                        mode: "lines",
                        name: 'Observed Data',
                        x: resp["dates"],
                        y: resp["observed_data"],
                        line: {color: '#7F7F7F'}
                    };
                    let trace2 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Ensemble Mean Data",
                        x: resp["dates"],
                        y: resp["forecast"],
                        error_y: {
                            type: 'data',
                            array: resp["forecast_error"],
                            visible: true,
                            color: '#17BECF'
                        },
                        line: {color: '#17BECF'}
                    };
                    let trace3 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Benchmark Forecast",
                        x: resp["dates"],
                        y: resp["benchmark"],
                        line: {color: '#67cf65'}
                    };

                    let data = [trace1, trace2, trace3];
                    let layout = {
                        title: 'Observed data, Ensemble Forecast, and Benchmark Forecast Hydrographs',
                    };

                    Plotly.newPlot('plot', data, layout);

                } else if ( (!benchmark_error_bool) && (!forecast_error_bool) ) {
                    // Plot forecasts and observed data with error bars
                    let trace1 = {
                        type: "scatter",
                        mode: "lines",
                        name: 'Observed Data',
                        x: resp["dates"],
                        y: resp["observed_data"],
                        line: {color: '#7F7F7F'}
                    };
                    let trace2 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Forecast Data",
                        x: resp["dates"],
                        y: resp["forecast"],
                        line: {color: '#17BECF'}
                    };
                    let trace3 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Benchmark Forecast",
                        x: resp["dates"],
                        y: resp["benchmark"],
                        line: {color: '#17BECF'}
                    };

                    let data = [trace1, trace2, trace3];
                    let layout = {
                        title: 'Observed data, Forecast, and Benchmark Forecast Hydrographs',
                    };

                    Plotly.newPlot('plot', data, layout);

                }

            } else {
                if (resp["forecast_error"]) {
                    // Plot forecasts and observed data with error bars
                    let trace1 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Ensemble Mean Data",
                        x: resp["dates"],
                        y: resp["forecast"],
                        error_y: {
                            type: 'data',
                            array: resp["forecast_error"],
                            visible: true
                        },
                        line: {color: '#17BECF'}
                    };
                    let trace2 = {
                        type: "scatter",
                        mode: "lines",
                        name: 'Observed Data',
                        x: resp["dates"],
                        y: resp["observed_data"],
                        line: {color: '#7F7F7F'}
                    };
                    let data = [trace1, trace2];
                    let layout = {
                        title: 'Observed data and Ensemble Hydrographs',
                    };

                    Plotly.newPlot('plot', data, layout);
                } else {
                    // Plot forecasts and observed data with no error bars
                    let trace1 = {
                        type: "scatter",
                        mode: "lines",
                        name: "Forecast Data",
                        x: resp["dates"],
                        y: resp["forecast"],
                        line: {color: '#17BECF'}
                    };
                    let trace2 = {
                        type: "scatter",
                        mode: "lines",
                        name: 'Observed Data',
                        x: resp["dates"],
                        y: resp["observed_data"],
                        line: {color: '#7F7F7F'}
                    };
                    let data = [trace1, trace2];
                    let layout = {
                        title: 'Observed data and Forecast Hydrographs',
                    };

                    Plotly.newPlot('plot', data, layout);
                }
            }


        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#validation_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    })
}


// Function to perform analysis of the ensemble metrics
$(document).ready(function () { // TODO: Add error checks for the benchmark forecast to see if it is provided
    $("#validate_button_ensemble").click(function () {
        validateEnsemble();
    })
});

function validateEnsemble() { // TODO: Make sure that the controller is formatted correctly and that error are checked for.
    let formData = new FormData(document.getElementsByName('validate_forecast')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/validate_forecast_ensemble_metrics/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) { // TODO: Use error bool in case of error
            $('#validation_results_ensemble').html(resp["table"]);
            console.log(resp);
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#validation_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    })
}


// Function to perform analysis of the binary ensemble metrics
$(document).ready(function () { // TODO: Add error checks
    $("#validate_button_binary").click(function () {
        validateBinary();
    })
});

function validateBinary() {
    let formData = new FormData(document.getElementsByName('validate_forecast')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/validate_forecast_binary_metrics/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {
            if (!resp["error_bool"]) {
                // let table = `<br><table class="table table-bordered table-hover">
                //                <thead>
                //                  <tr><th title="Field #1">Metric</th>
                //                    <th title="Field #2">Value</th>
                //                   </tr>
                //                 </thead>
                //                 <tbody>
                //                   <tr>
                //                     <td>Ensemble-Adjusted Brier Score</td>
                //                     <td align="left">${resp["ens_brier"]}</td>
                //                   </tr>
                //                   <tr>
                //                     <td>Area Under the Relative Operating Characteristic curve (AUROC)</td>
                //                     <td align="left">${resp["auroc"]}</td>
                //                   </tr>
                //                 </tbody></table>`;

                $('#validation_results_binary').html(resp["table"]);
                console.log(resp) // TODO: Make sure that the controller is formatted correctly and that error are checked for.
            } else {
                console.log(resp["error_message"])
            }
        },
        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#validation_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    })
}
