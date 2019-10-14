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


// Function to validate the observed data csv
$(document).ready(function () {
    $("#merged_csv").change(function () {
        // Hide any previous error messages
        $("#merged_csv_error_message").empty();
        $('#merged_csv_file_input').css({ "border": 'hidden'});

        let obsCSV = document.getElementById("merged_csv").files[0];

        // Parsing the CSV to check for errors
        if (typeof document.getElementById("merged_csv").files[0] === "object") {
            Papa.parse(
                obsCSV,
                {

                    preview: 100,
                    complete: function (results) {
                        let error = false;

                        for (let i = 0; i < results.data.length - 1; i++) {

                            let row = results.data[i];

                            if (row.length !== 3) {
                                console.log("Error Protocol Running");
                                $('#merged_csv_error_message').html(`<p style="color: #FF0000"><small>Please make sure that your CSV has 3 columns, an error was encountered in row ${i + 1} (Datetime, Simulated Data, Observed Data).</small></p>`);
                                $('#merged_csv_file_input').css({
                                    "border": '#FF0000 1px solid',
                                    "border-radius": '4px'
                                });
                                break;
                            }
                        }
                    }
                });
        } else {
            $('#obs_file_upload_div').css({"border": 'hidden'});
        }
    });
});


// Function for the select2 metric selection tool
$(document).ready(function() {
    $('#metric_select2').select2({ width: 'resolve' });
});

// Display optional parameters when user's select certain metrics
$('#metric_select2').on("select2:close", function(e) {
    e.preventDefault();

    console.log("triggered!");
    let select_val = $( '#metric_select2' ).val();

    if ( select_val.includes("MASE") ) {
        $('#mase_param_div').fadeIn()
    } else {
        $('#mase_param_div').fadeOut()
    }

    if ( select_val.includes("d (Mod.)") ) {
        $('#dmod_param_div').fadeIn()
    } else {
        $('#dmod_param_div').fadeOut()
    }

    if ( select_val.includes("NSE (Mod.)") ) {
        $('#nse_mod_param_div').fadeIn()
    } else {
        $('#nse_mod_param_div').fadeOut()
    }

    if ( select_val.includes("E1'") ) {
        $('#lm_eff_param_div').fadeIn()
    } else {
        $('#lm_eff_param_div').fadeOut()
    }

    if ( select_val.includes("D1'") ) {
        $('#d1_p_param_div').fadeIn()
    } else {
        $('#d1_p_param_div').fadeOut()
    }

    if ( select_val.includes("H6 (MHE)") ) {
        $('#mean_h6_param_div').fadeIn()
    } else {
        $('#mean_h6_param_div').fadeOut()
    }

    if ( select_val.includes("H6 (MAHE)") ) {
        $('#mean_abs_H6_param_div').fadeIn()
    } else {
        $('#mean_abs_H6_param_div').fadeOut()
    }

    if ( select_val.includes("H6 (RMSHE)") ) {
        $('#rms_H6_param_div').fadeIn()
    } else {
        $('#rms_H6_param_div').fadeOut()
    }

     if ( select_val.includes("KGE (2009)") ) {
        $('#kge_2009_param_div').fadeIn()
    } else {
        $('#kge_2009_param_div').fadeOut()
    }

    if ( select_val.includes("KGE (2012)") ) {
        $('#kge_2012_param_div').fadeIn()
    } else {
        $('#kge_2012_param_div').fadeOut()
    }

});


// Function for the file upload
$(document).ready(function() {
    $("#merged_csv").change(function (evt) {
        evt.preventDefault();

        const label = $("#merged_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#merged_csv_name").val(label);
    });
});


// Create hydrograph on Button Click
$(document).ready(function(){
    $("#create-hydrograph").click(function(){
        // Validation
        let validation_error = false;

        // Checking if an observed data was provided and if no parsing errors exist
        if ($("#merged_csv_error_message").html() !== "") { // parsing error
            window.location.assign("#error_redirect_point");
            validation_error = true;
        } else if (!(typeof document.getElementById("merged_csv").files[0] === "object")) {
            $('#merged_csv_file_input').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#merged_csv_error_message").html('<p style="color: #FF0000"><small>The merged data CSV is a required input.</small></p>');
            window.location.assign("#error_redirect_point");
            validation_error = true;
        }

        if (!validation_error) {
            createHydrograph();
        }

        console.log('Hydrograph Button Event Triggered');
    });
});
// AJAX for Hydrograph
function createHydrograph() {
    // Show Loader
    $("#hydrograph_loader").fadeIn();

    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : `${apiServer}/hydrograph_ajax_plotly/`, // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            // TODO: create an if statement to utilize the error response if there is an error parsing
            console.log(resp);

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
                name: 'Observed Data',
                x: resp["dates"],
                y: resp["observed"],
                line: {color: '#7F7F7F'}
            };
            let data = [trace1,trace2];
            let layout = {
                title: 'Hydrograph',
                xaxis: {
                    title: 'Datetime'
                },
                yaxis: {
                    title: 'Streamflow Values'
                }
            };

            Plotly.newPlot('hydrograph', data, layout);
            $("#hydrograph_loader").hide();

            console.log("successfully plotted the hydrograph"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#hydrograph_loader").hide();
        }
    });
}


// Create hydrograph of daily averages on button click
$(document).ready(function(){
    $("#create-hydrograph-daily-avg").click(function(){
        // Declare DOM elements I need
        let merged_csv_error_message = $("#merged_csv_error_message");
        let merged_csv_file_input = $('#merged_csv_file_input');
        // Validation
        let validation_error = false;

        // Checking if an observed data was provided and if no parsing errors exist
        if (merged_csv_error_message.html() !== "") { // parsing error
            window.location.assign("#error_redirect_point");
            validation_error = true;
        } else if ( !(typeof document.getElementById("merged_csv").files[0] === "object") ) {
            merged_csv_file_input.css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            merged_csv_error_message.html('<p style="color: #FF0000"><small>The merged data CSV is a required input.</small></p>');
            window.location.assign("#error_redirect_point");
            validation_error = true;
        }

        if (!validation_error) {
            createHydrographDailyAvg();
        }
        console.log('Hydrograph Daily Avg Button Event Triggered');
    });
});
// AJAX for Hydrograph of Daily Averages
function createHydrographDailyAvg() {
    // Show Loader
    $("#hydrograph_daily_avg_loader").fadeIn();

    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : `${apiServer}/hydrograph_daily_avg_ajax_plotly/`, // the endpoint
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
                name: 'Observed Data',
                x: resp["dates"],
                y: resp["observed"],
                line: {color: '#7F7F7F'}
            };
            let data = [trace1,trace2];
            let layout = {
                title: 'Hydrograph of Daily Averages',
                xaxis: {
                    title: 'Datetime',
                    autotick: false,
                    tick0: 0,
                    dtick: 10,
                    tickangle: 45,
                },
                yaxis: {
                    title: 'Streamflow Values',
                }
             };

            Plotly.newPlot('hydrograph-daily-avg', data, layout);
            $("#hydrograph_daily_avg_loader").hide();

            console.log("successfully plotted the daily average hydrograph"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#hydrograph_daily_avg_loader").hide();
        }
    });
}


// Create scatterplot on button click
$(document).ready(function(){
    $("#create-scatter").click(function(){
        // Validation
        let validation_error = false;

        // Checking if an observed data was provided and if no parsing errors exist
        if ($("#merged_csv_error_message").html() !== "") { // parsing error
            window.location.assign("#error_redirect_point");
            validation_error = true;
        } else if (!(typeof document.getElementById("merged_csv").files[0] === "object")) {
            $('#merged_csv_file_input').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#merged_csv_error_message").html('<p style="color: #FF0000"><small>The merged data CSV is a required input.</small></p>');
            window.location.assign("#error_redirect_point");
            validation_error = true;
        }

        if (!validation_error) {
            createScatter();
        }

        console.log('Scatter Button Event Triggered');
    });
});
//AJAX for Scatter Plot
function createScatter() {
    // Show Loader
    $("#scatterplot_loader").fadeIn();

    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: `${apiServer}/scatter_ajax_plotly/`, // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {

            $("#scatter").empty();

            const trace1 = {
                x: resp["simulated"],
                y: resp["observed"],
                mode: 'markers',
                type: 'scatter',
                name: 'Streamflow Scatter Points',
                hoverinfo: 'none',
                marker: {color: '#119dff', size: 5, opacity: 0.5},
            };

            const trace2 = {
                type: "scatter",
                mode: "lines",
                name: resp['best_fit_equation'],
                x: resp["x_best_fit"],
                y: resp["y_best_fit"],
                line: {
                    dash: 'dash',
                    color: '#7F7F7F'
                }
            };

            const data = [trace1, trace2];

            const layout = {
                title: 'Scatter Plot with Linear Best Fit Line',
                xaxis: {
                    title: 'Simulated Streamflow Values',
                },
                yaxis: {
                    title: 'Observed Streamflow Values',
                }
            };

            Plotly.newPlot('scatter', data, layout);
            $("#scatterplot_loader").hide();

            console.log("successfully plotted the interactive scatter plot!"); // another sanity check
        },
        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#scatter').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#scatterplot_loader").hide();
        }
    });
}


// Create scatterplot log on button click
$(document).ready(function(){
    $("#create-scatter-log").click(function(){
        // Validation
        let validation_error = false;

        // Checking if an merged data was provided and if no parsing errors exist
        if ($("#merged_csv_error_message").html() !== "") { // parsing error
            window.location.assign("#error_redirect_point");
            validation_error = true;
        } else if (!(typeof document.getElementById("merged_csv").files[0] === "object")) {
            $('#merged_csv_file_input').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#merged_csv_error_message").html('<p style="color: #FF0000"><small>The merged data CSV is a required input.</small></p>');
            window.location.assign("#error_redirect_point");
            validation_error = true;
        }

        if (!validation_error) {
            createScatterLog();
        }

        console.log('Scatter Log-Log Button Event Triggered');
    });
});
//AJAX for Scatter Log Plot
function createScatterLog() {
    // Show Loader
    $("#scatterplot_log_loader").fadeIn();

    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: `${apiServer}/scatter_ajax_plotly/`, // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {

            $("#scatter_log").empty(); // In case there is an error message from before or something like that.

            const trace1 = {
                x: resp["simulated"],
                y: resp["observed"],
                mode: 'markers',
                type: 'scatter',
                name: 'Streamflow Scatter Points',
                marker: {color: '#119dff', size: 5, opacity: 0.5},
                hoverinfo: 'none',
            };

            const trace2 = {
                type: "scatter",
                mode: "lines",
                name: '45 Degree Line',
                x: resp["coords_45_deg"],
                y: resp["coords_45_deg"],
                line: {
                    dash: 'dash',
                    color: '#7F7F7F'
                }
            };

            const data = [trace1, trace2];

            const layout = {
                    title: 'Scatter Plot',
                    xaxis: {
                        title: 'Simulated Streamflow Values (Log)',
                        type: 'log',
                        autorange: true
                    },
                    yaxis: {
                        title: 'Observed Streamflow Values (Log)',
                        type: 'log',
                        autorange: true
                    },
                };

            Plotly.newPlot('scatter_log', data, layout);
            $("#scatterplot_log_loader").hide();

            console.log("successfully plotted the interactive scatter plot!"); // another sanity check
        },
        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#scatter_log').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#scatterplot_log_loader").hide();
        }
    });
}


// Show the date range creator when the switch is on
$(document).ready(function() {
    $("#date_range_bool").on("change", function() {
        if(document.getElementById('date_range_bool').checked) {
            $("#date_range_form").show();
            $("#date-ranges").show();
        } else {
            $("#date_range_form").hide();
            $("#date-ranges").hide();
        }
    });
});


// Create a variable amount of date ranges for the user
$(document).ready(function() {
  $("#date_range_form").on("input", function() {
    let number = $("#Num_of_Date_Ranges").val();
    if (number === 0) {
      $("#date_range_container").hide();
    } else {
      let form_inputs = "";
        for (let i=1; i<=number; i++) {
            form_inputs += `<h5>Date Range ${i}</h5>\
                            <div class="row">
                              <div class="col-md-2">
                                <label for="start_month_${i}">Start Month</label>
                                <select id="start_month_${i}" name="start_month_${i}">
                                    <option value="1">January</option>
                                    <option value="2">February</option>
                                    <option value="3">March</option>
                                    <option value="4">April</option>
                                    <option value="5">May</option>
                                    <option value="6">June</option>
                                    <option value="7">July</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                  </select>
                              </div>
                              <div class="col-md-2">
                                <label for="start_day_${i}">Start Day</label>
                                <input type="number" id="start_day_${i}" name="start_day_${i}" min=1 max=31>
                              </div>
                              <div class="col-md-2">
                                <label for="end_month_${i}">End Month</label>
                                <select id="start_day_${i}" id="end_month_${i}" name="end_month_${i}">
                                  <option value="1">January</option>
                                  <option value="2">February</option>
                                  <option value="3">March</option>
                                  <option value="4">April</option>
                                  <option value="5">May</option>
                                  <option value="6">June</option>
                                  <option value="7">July</option>
                                  <option value="8">August</option>
                                  <option value="9">September</option>
                                  <option value="10">October</option>
                                  <option value="11">November</option>
                                  <option value="12">December</option>
                                </select>
                              </div>
                              <div class="col-md-2">
                                <label for="end_day_${i}">End Day</label>
                                <input type="number" id="end_day_${i}" name="end_day_${i}" min=1 max=31>
                              </div>
                            </div>`;
        }
      $( "#date-ranges" ).html( form_inputs );
    }
  });
});


// Event handler for the make table button
$(document).ready(function(){
    $("#make-table").click(function(){
        console.log('Make Table Event Triggered');

        // Validation

        // Clearing all of the previous errors
        $("#empty_date_range_error").empty();
        $("#non_integer_error").empty();

        let clear_counter = 1;

        while (true) {
            if ($(`#start_day_${clear_counter}`).length === 0) {
                break
            }

            $(`#start_day_${clear_counter}`).css({"border": 'hidden'});
            $(`#start_month_${clear_counter}`).css({"border": 'hidden'});
            $(`#end_day_${clear_counter}`).css({"border": 'hidden'});
            $(`#end_month_${clear_counter}`).css({"border": 'hidden'});

            clear_counter++
        }

        $("#metric_select_error").empty();
        $("#metric_overflow_div").css({"border": 'hidden'});

        let validation_error = false;

        // Checking if an merged data was provided and if no parsing errors exist
        if ($("#merged_csv_error_message").html() !== "") { // parsing error
            window.location.assign("#error_redirect_point");
            validation_error = true;
        } else if (!(typeof document.getElementById("merged_csv").files[0] === "object")) {
            $('#merged_csv_file_input').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#merged_csv_error_message").html('<p style="color: #FF0000"><small>The merged data CSV is a required input.</small></p>');
            window.location.assign("#error_redirect_point");
            validation_error = true;
        }

        // Checking to see if all of the date inputs were supplied
        let counter = 1;

        while (true) {
            if ($(`#start_day_${counter}`).length === 0) {
                break
            }

            // Checking if the inputs are filled
            if ($(`#start_day_${counter}`).val() === "") {
                $("#empty_date_range_error").html('<p style="color: #FF0000"><small>One or more date range inputs were left blank.</small></p>');
                $(`#start_day_${counter}`).css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                validation_error = true;
            }
            if ($(`#start_month_${counter}`).val() === "") {
                $("#empty_date_range_error").html('<p style="color: #FF0000"><small>One or more date range inputs were left blank.</small></p>');
                $(`#start_month_${counter}`).css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                validation_error = true;
            }
            if ($(`#end_day_${counter}`).val() === "") {
                $("#empty_date_range_error").html('<p style="color: #FF0000"><small>One or more date range inputs were left blank.</small></p>');
                $(`#end_day_${counter}`).css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                validation_error = true;
            }
            if ($(`#end_month_${counter}`).val() === "") {
                $("#empty_date_range_error").html('<p style="color: #FF0000"><small>One or more date range inputs were left blank.</small></p>');
                $(`#end_month_${counter}`).css({"border": '#FF0000 1px solid', "border-radius": '4px'});
                validation_error = true;
            }

            counter++
        }

        // Retrieving the metric abbreviations to make sure that the user selected at least one metric
        $.ajax({
            url: `${apiServer}/get_metric_names_abbr/`,
            type: "GET",
            data: { "abbreviations": true },
            headers: {
                'Accept': 'application/json',
            },

            // handle a successful response
            success: function (resp) {
                const abbreviations = resp["abbreviations"];
                let selected_metrics = $( '#metric_select2' ).val();

                if (selected_metrics.length === 0) {
                    $("#metric_select_error").html('<p style="color: #FF0000"><small>At least one metric must be selected.</small></p>');
                    $("#metric_overflow_div").css({"border": '#FF0000 1px solid'});
                    validation_error = true;
                }

                if (!validation_error) {
                    // Creating the table
                    createTable()
                } else {
                    // Redirecting the page
                    window.location.assign("#error_redirect_point");
                }
            },

            // handle a non-successful response
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            }
        });
    });
});
// AJAX for table
function createTable() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    // console.log(formData); // another sanity check

    // Creating the table
    $.ajax({
        url : `${apiServer}/make_table_ajax/`, // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            $("#metric-table").show();
            $('#table').html(resp); // Render the Table
            // console.log("success"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#table').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}


$(document).ready(function(){
    $("#make_volume_table").click(function(){
        createVolumeTable();
        console.log('Make Volume Table Event Triggered');

        // Validation
        let validation_error = false;

        // Checking if an merged data was provided and if no parsing errors exist
        if ($("#merged_csv_error_message").html() !== "") { // parsing error
            window.location.assign("#error_redirect_point");
            validation_error = true;
        } else if (!(typeof document.getElementById("merged_csv").files[0] === "object")) {
            $('#merged_csv_file_input').css({"border": '#FF0000 1px solid', "border-radius": '4px'});
            $("#merged_csv_error_message").html('<p style="color: #FF0000"><small>The merged data CSV is a required input.</small></p>');
            window.location.assign("#error_redirect_point");
            validation_error = true;
        }

        if (!validation_error) {
            createVolumeTable();
        }
    });
});
// Ajax for Volume Table
function createVolumeTable() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : `${apiServer}/volume_table_ajax/`, // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            console.log(resp);
            let sim_volume = resp["sim_volume"].toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            let obs_volume = resp["obs_volume"].toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            $("#volume_table_div").show();
            $("#volume_table").html(`<table class="table table-hover table-striped">\
                                        <thead>\
                                          <tr>\
                                            <th>Simulated Data Volume</th>\
                                            <th>Observed Data Volume</th>\
                                          </tr>\
                                        </thead>\
                                        <tbody>\
                                          <tr>\
                                            <td>${sim_volume}</td>\
                                            <td>${obs_volume}</td>\
                                          </tr>\
                                        </tbody>\
                                      </table>`);
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}
