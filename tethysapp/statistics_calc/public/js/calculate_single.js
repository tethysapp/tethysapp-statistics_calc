// ####################################################################################################################
// Calculate Single Stream Functions
// ####################################################################################################################


function myFunction() {
    console.log('myFunction is Running!'); // sanity check
    // Get the checkbox
    const mase = document.getElementById('MASE');
    const dmod = document.getElementById('d (Mod.)');
    const nse_mod = document.getElementById('NSE (Mod.)');
    const h6_mean = document.getElementById('H6 (MHE)');
    const h6_abs = document.getElementById('H6 (AHE)');
    const h6_rmshe = document.getElementById('H6 (RMSHE)');
    const lm_index = document.getElementById("E1'");
    const d1_p = document.getElementById("D1'");

    // Get the output text
    const mase_label = document.getElementById('MASE_label');
    const dmod_label = document.getElementById('d (Mod.)_label');
    const nse_mod_label = document.getElementById('NSE (Mod.)_label');
    const h6_mean_label = document.getElementById('H6 (MHE)_label');
    const h6_abs_label = document.getElementById('H6 (AHE)_label');
    const h6_rmshe_label = document.getElementById('H6 (RMSHE)_label');
    const lm_index_label = document.getElementById("E1'_label");
    const d1_p_label = document.getElementById("D1'_label");

    // If the checkbox is checked, display the output text
    if (mase.checked) {
        mase_label.style.display = "block";
    } else {
        mase_label.style.display = "none";
    }

    if (dmod.checked) {
        dmod_label.style.display = "block";
    } else {
        dmod_label.style.display = "none";
    }

    if (nse_mod.checked) {
        nse_mod_label.style.display = "block";
    } else {
        nse_mod_label.style.display = "none";
    }

    if (h6_mean.checked) {
        h6_mean_label.style.display = "block";
    } else {
        h6_mean_label.style.display = "none";
    }

    if (h6_abs.checked) {
        h6_abs_label.style.display = "block";
    } else {
        h6_abs_label.style.display = "none";
    }

    if (h6_rmshe.checked) {
        h6_rmshe_label.style.display = "block";
    } else {
        h6_rmshe_label.style.display = "none";
    }

    if (lm_index.checked) {
        lm_index_label.style.display = "block";
    } else {
        lm_index_label.style.display = "none";
    }

    if (d1_p.checked) {
        d1_p_label.style.display = "block";
    } else {
        d1_p_label.style.display = "none";
    }
}


// >>>>>>>jQuery Functions<<<<<<<

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

// Create hydrograph of daily averages on button click
$(document).ready(function(){
    $("#create-hydrograph-daily-avg").click(function(){
        createHydrographDailyAvg();
        console.log('Hydrograph Daily Avg Button Event Triggered');
    });
});

// Create scatterplot on button click
$(document).ready(function(){
    $("#create-hydrograph-daily-avg").click(function(){
        createHydrographDailyAvg();
        console.log('Hydrograph Daily Avg Button Event Triggered');
    });
});

// Create scatterplot on button click
$(document).ready(function(){
    $("#create-scatter").click(function(){
        createScatter();
        console.log('Scatter Button Event Triggered');
    });
});

// Create scatterplot log on button click
$(document).ready(function(){
    $("#create-scatter-log").click(function(){
        createScatterLog();
        console.log('Scatter Log-Log Button Event Triggered');
    });
});

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
  $("#date_range_form").on("change", function() {
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

$(document).ready(function(){
    $("#make_volume_table").click(function(){
        createVolumeTable();
        console.log('Make Volume Table Event Triggered');
    });
});

// >>>>>>>Ajax Functions<<<<<<<

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

//AJAX for Scatter Plot
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

// Ajax for Volume Table
function createVolumeTable() {
    let formData = new FormData(document.getElementsByName('post-form')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/volume_table_ajax/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            console.log(resp)
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
