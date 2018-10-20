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


// Function to display benchmark file input if user wants to calculate skill score
$(document).ready( function() {
    $("#skill_score_bool").change( function(evt) {
        evt.preventDefault();
        if($(this).is(":checked")) {
            $("#benchmark_input_div").fadeIn();
        } else {
            $("#benchmark_input_div").fadeOut();
        }
        console.log('Skill Score Slider Clicked.'); // sanity check
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
$(document).ready(function () { // TODO: Add error checks for the benchmark forecast to see if it is provided
    $("#validate_button_ensemble").click(function() {
        validateEnsemble();
    })
});
function validateEnsemble () { // TODO: Make sure that the controller is formatted correctly and that error are checked for.
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
            // let table = `<br><table class="table table-bordered table-hover">
            //                <thead>
            //                  <tr><th title="Field #1">Metric</th>
            //                    <th title="Field #2">Value</th>
            //                   </tr>
            //                 </thead>
            //                 <tbody>
            //                   <tr>
            //                     <td>Continuous Ranked Probablity Score (Mean)</td>
            //                     <td align="left">${resp["ens_crps"]}</td>
            //                   </tr>
            //                   <tr>
            //                     <td>Ensemble Mean Absolute Error</td>
            //                     <td align="left">${resp["ens_mae"]}</td>
            //                   </tr>
            //                   <tr>
            //                     <td>Ensemble Mean Error</td>
            //                     <td align="left">${resp["ens_me"]}</td>
            //                   </tr>
            //                   <tr>
            //                     <td>Ensemble Mean Squared Error</td>
            //                     <td align="left">${resp["ens_mse"]}</td>
            //                   </tr>
            //                   <tr>
            //                     <td>Ensemble Pearson R</td>
            //                     <td align="left">${resp["ens_pearson_r"]}</td>
            //                   </tr>
            //                   <tr>
            //                     <td>Ensemble Root Mean Square Error</td>
            //                     <td align="left">${resp["ens_rmse"]}</td>
            //                   </tr>
            //                 </tbody></table>`;
            //
            // let benchmark_table = null;
            // let skill_score_table = null;
            //
            // if (resp["skill_score_bool"]) {
            //     benchmark_table =   `<br><table class="table table-bordered table-hover">
            //                            <thead>
            //                              <tr><th title="Field #1">Benchmark Metric</th>
            //                                <th title="Field #2">Value</th>
            //                               </tr>
            //                             </thead>
            //                             <tbody>
            //                               <tr>
            //                                 <td>Continuous Ranked Probablity Score (Mean)</td>
            //                                 <td align="left">${resp["ens_crps_bench"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Mean Absolute Error</td>
            //                                 <td align="left">${resp["ens_mae_bench"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Mean Error</td>
            //                                 <td align="left">${resp["ens_me_bench"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Mean Squared Error</td>
            //                                 <td align="left">${resp["ens_mse_bench"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Pearson R</td>
            //                                 <td align="left">${resp["ens_pearson_r_bench"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Root Mean Square Error</td>
            //                                 <td align="left">${resp["ens_rmse_bench"]}</td>
            //                               </tr>
            //                             </tbody></table>`;
            //     skill_score_table = `<br><table class="table table-bordered table-hover">
            //                            <thead>
            //                              <tr><th title="Field #1">Skill Score</th>
            //                                <th title="Field #2">Value</th>
            //                               </tr>
            //                             </thead>
            //                             <tbody>
            //                               <tr>
            //                                 <td>Continuous Ranked Probablity Skill Score</td>
            //                                 <td align="left">${resp["crps_ss"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Mean Absolute Error Skill Score</td>
            //                                 <td align="left">${resp["mae_ss"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Mean Error Skill Score</td>
            //                                 <td align="left">${resp["me_ss"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Mean Squared Error Skill Score</td>
            //                                 <td align="left">${resp["mse_ss"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Pearson R Skill Score</td>
            //                                 <td align="left">${resp["pearson_r_ss"]}</td>
            //                               </tr>
            //                               <tr>
            //                                 <td>Ensemble Root Mean Square Error Skill Score</td>
            //                                 <td align="left">${resp["rmse_ss"]}</td>
            //                               </tr>
            //                             </tbody></table>`;
            // }

            $('#validation_results_ensemble').html(resp["table"]);

            // if (resp["skill_score_bool"]) {
            //     $('#validation_benchmark_ensemble').html(benchmark_table);
            //     $('#validation_skill_score_ensemble').html(skill_score_table);
            // }

            console.log(resp);
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#validation_results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    })
}


// Function to perform analysis of the binary ensemble metrics
$(document).ready(function () { // TODO: Add error checks
    $("#validate_button_binary").click(function() {
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
