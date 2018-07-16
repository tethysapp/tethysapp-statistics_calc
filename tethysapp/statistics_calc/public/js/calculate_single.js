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
                    // preview: 50,
                    complete: function (results) {
                        let error = false;
                        for (let i = 0; i < results.data.length; i++) {
                            let row = results.data[i];

                            if (row.length !== 4) {
                                console.log("There was an error when parsing column " + i);
                                error = true;
                                break;
                            }
                        }
                        if (error) {
                            console.log("Error Protocol Running");
                            $('#merged_csv_error_message').html('<p style="color: #FF0000"><small>Please make sure that your CSV has 3 columns.</small></p>');
                            $('#merged_csv_file_input').css({ "border": '#FF0000 1px solid', "border-radius": '4px' });
                        }
                    }
                });
        } else {
            $('#obs_file_upload_div').css({ "border": 'hidden'});
        }
    });
});


// Functions to hide and show the extra parameters for the metrics
$(document).ready(function() {
    $("#MASE").change(function () {
        if (this.checked) {
            $('#MASE_label').show();
        } else {
            $('#MASE_label').hide();
        }
    });
});
$(document).ready(function() {
    $("input[id='d (Mod.)']").change(function () {
        if (this.checked) {
            $("div[id='d (Mod.)_label']").show();
        } else {
            $("div[id='d (Mod.)_label']").hide();
        }
    });
});
$(document).ready(function() {
    $("input[id='NSE (Mod.)']").change(function () {
        if (this.checked) {
            $("div[id='NSE (Mod.)_label']").show();
        } else {
            $("div[id='NSE (Mod.)_label']").hide();
        }
    });
});
$(document).ready(function() {
    $("input[id='H6 (MHE)']").change(function () {
        if (this.checked) {
            $("div[id='H6 (MHE)_label']").show();
        } else {
            $("div[id='H6 (MHE)_label']").hide();
        }
    });
});
$(document).ready(function() {
    $("input[id='H6 (AHE)']").change(function () {
        if (this.checked) {
            $("div[id='H6 (AHE)_label']").show();
        } else {
            $("div[id='H6 (AHE)_label']").hide();
        }
    });
});
$(document).ready(function() {
    $("input[id='H6 (RMSHE)']").change(function () {
        if (this.checked) {
            $("div[id='H6 (RMSHE)_label']").show();
        } else {
            $("div[id='H6 (RMSHE)_label']").hide();
        }
    });
});
$(document).ready(function() {
    $(`input[id="E1'"]`).change(function () {
        if (this.checked) {
            $(`div[id="E1'_label"]`).show();
        } else {
            $(`div[id="E1'_label"]`).hide();
        }
    });
});
$(document).ready(function() {
    $(`input[id="D1'"]`).change(function () {
        if (this.checked) {
            $(`div[id="D1'_label"]`).show();
        } else {
            $(`div[id="D1'_label"]`).hide();
        }
    });
});


// Function for the file upload
$(document).ready(function() {
    $("#merged_csv").change(function () {
        const label = $("#merged_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#merged_csv_name").val(label);
    });
});


// Create hydrograph on Button Click
$(document).ready(function(){
    $("#create-hydrograph").click(function(){
        createHydrograph();
        console.log('Hydrograph Button Event Triggered');
    });
});
// AJAX for Hydrograph
function createHydrograph() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/hydrograph_ajax_plotly/", // the endpoint
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
                title: 'Hydrograph',
            };

            Plotly.newPlot('hydrograph', data, layout);

            console.log("successfully plotted the hydrograph"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}


// Create hydrograph of daily averages on button click
$(document).ready(function(){
    $("#create-hydrograph-daily-avg").click(function(){
        createHydrographDailyAvg();
        console.log('Hydrograph Daily Avg Button Event Triggered');
    });
});
// AJAX for Hydrograph of Daily Averages
function createHydrographDailyAvg() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/hydrograph_daily_avg_ajax_plotly/", // the endpoint
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
                    autotick: false,
                    tick0: 0,
                    dtick: 10,
                    tickangle: 45,
                 },
             };

            Plotly.newPlot('hydrograph-daily-avg', data, layout);

            console.log("successfully plotted the daily average hydrograph"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}


// Create scatterplot on button click
$(document).ready(function(){
    $("#create-scatter").click(function(){
        createScatter();
        console.log('Scatter Button Event Triggered');
    });
});
//AJAX for Scatter Plot
function createScatter() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/scatter_ajax_plotly/", // the endpoint
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
                type: 'scatter'
            };

            const data = [trace1];

            const layout = {
                title: 'Scatter Plot',
            };

            Plotly.newPlot('scatter', data, layout);

            console.log("successfully plotted the interactive scatter plot!"); // another sanity check
        },
        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#scatter').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}


// Create scatterplot log on button click
$(document).ready(function(){
    $("#create-scatter-log").click(function(){
        createScatterLog();
        console.log('Scatter Log-Log Button Event Triggered');
    });
});
//AJAX for Scatter Log Plot
function createScatterLog() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/scatter_ajax_plotly/", // the endpoint
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
                type: 'scatter'
            };

            const data = [trace1];

            const layout = {
                    title: 'Scatter Plot',
                    xaxis: {
                        type: 'log',
                        autorange: true
                    },
                    yaxis: {
                        type: 'log',
                        autorange: true
                    },
                };

            Plotly.newPlot('scatter_log', data, layout);

            console.log("successfully plotted the interactive scatter plot!"); // another sanity check
        },
        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#scatter_log').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
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
        for (i=1; i<=number; i++) {
            form_inputs += `<h3>Date Range ${i}</h3>\
                              <div class="form-row">\
                                  <div class="form-group col-md-3">\
                                    <label for="start_day_${i}">Start Day</label>\
                                    <input type="number" class="form-control" id="start_day_${i}" name="start_day_${i}">\
                                  </div>\
                                <div class="form-group col-md-3">\
                                    <label for="start_month_${i}">Start Month</label>\
                                    <input type="number" class="form-control" id="start_month_${i}" name="start_month_${i}">\
                                  </div>\
                                <div class="form-group col-md-3">\
                                  <label for="end_day_${i}">End Day</label>\
                                  <input type="number" class="form-control" id="end_day_${i}" name="end_day_${i}">\
                                </div>\
                                <div class="form-group col-md-3">\
                                  <label for="end_month_${i}">End Month</label>\
                                  <input type="number" class="form-control" id="end_month_${i}" name="end_month_${i}">\
                                </div>\
                              </div>`;
        }
      $( "#date-ranges" ).html( form_inputs );
    }
  });
});


// Event handler for the make table button
$(document).ready(function(){
    $("#make-table").click(function(){
        createTable();
        console.log('Make Table Event Triggered');
    });
});
// AJAX for table
function createTable() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    // Creating the table
    $.ajax({
        url : "/apps/statistics-calc/make_table_ajax/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            $("#metric-table").show();
            $('#table').html(resp); // Render the Table
            console.log("success"); // another sanity check
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
    });
});
// Ajax for Volume Table
function createVolumeTable() {
    let formData = new FormData(document.getElementsByName('validate_stream')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/volume_table_ajax/", // the endpoint
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
