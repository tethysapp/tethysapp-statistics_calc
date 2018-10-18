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


// Function for the merged CSV file upload
$(document).ready(function() {
    $("#forecast_csv").change(function () {
        const label = $("#forecast_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#merged_csv_name").val(label);
    });
});


// Function for the benchmark forecast CSV file upload
$(document).ready(function() {
    $("#benchmark_csv").change(function () {
        const label = $("#benchmark_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#benchmark_csv_name").val(label);
    });
});


// Function to plot the CSV data
$(document).ready(function () {
    $("#visualize_button").click(function() {
        plotData();
    })
});
function plotData() {
    let formData = new FormData(document.getElementsByName('validate_forecast')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/validate_forecast_plot/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success: function (resp) {
            console.log(resp) // TODO: Make sure that the controller is formatted correctly and that error are checked for.
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#validation_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    })
}


// Function to perform analysis of the ensemble metrics
$(document).ready(function () {
    $("#validate_button_ensemble").click(function() {
        validateEnsemble();
    })
});
function validateEnsemble () {
    let formData = new FormData(document.getElementsByName('validate_forecast')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/validate_forecast_ensemble_metrics/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            let table = `<br><table class="table table-bordered table-hover">
                           <thead>
                             <tr><th title="Field #1">Metric</th>
                               <th title="Field #2">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Continuous Ranked Probablity Score (Mean)</td>
                                <td align="left">${resp["ens_crps"]}</td>
                              </tr>
                              <tr>
                                <td>Ensemble Mean Absolute Error</td>
                                <td align="left">${resp["ens_mae"]}</td>
                              </tr>
                              <tr>
                                <td>Ensembe Mean Error</td>
                                <td align="left">${resp["ens_me"]}</td>
                              </tr>
                              <tr>
                                <td>Ensemble Mean Squared Error</td>
                                <td align="left">${resp["ens_mse"]}</td>
                              </tr>
                              <tr>
                                <td>Ensemble Pearson R</td>
                                <td align="left">${resp["ens_pearson_r"]}</td>
                              </tr>
                              <tr>
                                <td>Ensemble Root Mean Square Error</td>
                                <td align="left">${resp["ens_rmse"]}</td>
                              </tr>
                            </tbody></table>`;

            console.log(table);
            $('#validation_results_ensemble').html(table);
            console.log(resp) // TODO: Make sure that the controller is formatted correctly and that error are checked for.
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#validation_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    })
}


// Function to perform analysis of the binary ensemble metrics
$(document).ready(function () {
    $("#validate_button_binary").click(function() { // TODO: Add error checks
        validateBinary();
    })
});
function validateBinary () {
    let formData = new FormData(document.getElementsByName('validate_forecast')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/validate_forecast_binary_metrics/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType: false,

        // handle a successful response
        success: function (resp) {
            if (!resp["error_bool"]) {
                let table = `<br><table class="table table-bordered table-hover">
                               <thead>
                                 <tr><th title="Field #1">Metric</th>
                                   <th title="Field #2">Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>Ensemble-Adjusted Brier Score</td>
                                    <td align="left">${resp["ens_brier"]}</td>
                                  </tr>
                                  <tr>
                                    <td>Area Under the Relative Operating Characteristic curve (AUROC)</td>
                                    <td align="left">${resp["auroc"]}</td>
                                  </tr>
                                </tbody></table>`;

                $('#validation_results_binary').html(table);
                console.log(resp) // TODO: Make sure that the controller is formatted correctly and that error are checked for.
            } else {
                console.log(resp["error_message"])
            }
        },
        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#validation_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    })
}
