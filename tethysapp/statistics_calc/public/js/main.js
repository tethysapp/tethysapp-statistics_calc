// ####################################################################################################################
// Preprocesing Functions
// ####################################################################################################################


// >>>>>>>>jQuery Functions<<<<<<<<

// Creating a plot with no interpolation applied
$(document).ready(function() {
    $("#pps_no_interp").click( function() {
        console.log('No Interpolation Event Triggered') // sanity check
        name = "interp_method";
        value = "no_interp";
        ppsPlotHydrograph(name, value);
    });
});

$(document).ready(function() {
    $("#pps_linear").click( function() {
        console.log('Linear Interpolation Event Triggered') // sanity check
        name = "interp_method";
        value = "linear";
        ppsPlotHydrograph(name, value);
    });
});

$(document).ready(function() {
    $("#pps_cubic").click( function() {
        console.log('Cubic Spline Interpolation Event Triggered') // sanity check
        name = "interp_method";
        value = "cubic";
        ppsPlotHydrograph(name, value);
    });
});

$(document).ready(function() {
    $("#pps_pchip").click( function() {
        console.log('PCHIP Interpolation Event Triggered') // sanity check
        name = "interp_method";
        value = "pchip";
        ppsPlotHydrograph(name, value);
    });
});

function ppsPlotHydrograph(name, value) {
    var formData = new FormData(document.getElementsByName('pps_form')[0]); // getting the data from the form
    formData.append(name, value); // appending the name and value based on the button clicked
    console.log(formData) // another sanity check

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
            }

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
};

// ####################################################################################################################
// Calculate Single Stream Functions
// ####################################################################################################################


function myFunction() {
  console.log('myFunction is Running!') // sanity check
  // Get the checkbox
  var mase = document.getElementById('MASE');
  var dmod = document.getElementById('d (Mod.)');
  var nse_mod = document.getElementById('NSE (Mod.)');
  var h6_mean = document.getElementById('H6 (MHE)');
  var h6_abs = document.getElementById('H6 (AHE)');
  var h6_rmshe = document.getElementById('H6 (RMSHE)');
  var lm_index = document.getElementById("E1'");
  var d1_p = document.getElementById("D1'");
  var lag_analysis_bool = document.getElementById("lag_analysis_bool");

  // Get the output text
  var mase_label = document.getElementById('MASE_label');
  var dmod_label = document.getElementById('d (Mod.)_label');
  var nse_mod_label = document.getElementById('NSE (Mod.)_label');
  var h6_mean_label = document.getElementById('H6 (MHE)_label');
  var h6_abs_label = document.getElementById('H6 (AHE)_label');
  var h6_rmshe_label = document.getElementById('H6 (RMSHE)_label');
  var lm_index_label = document.getElementById("E1'_label");
  var d1_p_label = document.getElementById("D1'_label");
  var lag_analysis_form = document.getElementById("lag_analysis_form");

  // If the checkbox is checked, display the output text
  if (mase.checked == true){
    mase_label.style.display = "block";
  } else {
    mase_label.style.display = "none";
  }

  if (dmod.checked == true){
    dmod_label.style.display = "block";
  } else {
    dmod_label.style.display = "none";
  }

  if (nse_mod.checked == true){
    nse_mod_label.style.display = "block";
  } else {
    nse_mod_label.style.display = "none";
  }

  if (h6_mean.checked == true){
    h6_mean_label.style.display = "block";
  } else {
    h6_mean_label.style.display = "none";
  }

  if (h6_abs.checked == true){
    h6_abs_label.style.display = "block";
  } else {
    h6_abs_label.style.display = "none";
  }

  if (h6_rmshe.checked == true){
    h6_rmshe_label.style.display = "block";
  } else {
     h6_rmshe_label.style.display = "none";
  }

  if (lm_index.checked == true){
    lm_index_label.style.display = "block";
  } else {
     lm_index_label.style.display = "none";
  }

  if (d1_p.checked == true){
    d1_p_label.style.display = "block";
  } else {
     d1_p_label.style.display = "none";
  }
}


// >>>>>>>jQuery Functions<<<<<<<


// Function to Hide and Show Values based on the radio box for the simulated data
$(document).ready(function() {
    $("input[name=predicted_radio]").on( "change", function() {
         console.log('Radio Checkbox function working!') // sanity check
         var test = $(this).val();
         $(".sim_upload").hide();
         $("#"+test).show();
    });
});

// Function to hide and show divs based on the preprocessing input
$(document).ready(function() {
    $('input[name=preprocessing]').on( "change", function() {
        console.log("Preprocessing Checkbox Function Working!")
        if(document.getElementById('unequal_time').checked) {
            $("#preprocessing_form").show();
        } else {
            $("#preprocessing_form").hide();
        }
    });
});

// Function to hide and show timezones based on the user input
$(document).ready(function() {
    $('#timezone').on( "change", function() {
        console.log("Timezone Checkbox Function Working!")
        if(document.getElementById('timezone').checked) {
            $("#timezone_form").show();
        } else {
            $("#timezone_form").hide();
        }
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
    var number = $("#Num_of_Date_Ranges").val();
    if (number === 0) {
      $("#date_range_container").hide();
    } else {
      var form_inputs = "";
        for (i=1; i<=number; i++) {
        var html = `<h3>Date Range ${i}</h3>\
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
                  </div>`
          form_inputs += html;
        }

      $( "#date-ranges" ).html( form_inputs );
    };
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
var csrftoken = Cookies.get('csrftoken');

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
    var formData = new FormData(document.getElementsByName('post-form')[0]);// getting the data from the form
    console.log(formData) // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/hydrograph_ajax_plotly/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            var trace1 = {
                type: "scatter",
                mode: "lines",
                name: "Simulated Data",
                x: resp["dates"],
                y: resp["simulated"],
                line: {color: '#17BECF'}
            }
            var trace2 = {
                type: "scatter",
                mode: "lines",
                name: 'Observed Data',
                x: resp["dates"],
                y: resp["observed"],
                line: {color: '#7F7F7F'}
            }
            var data = [trace1,trace2];
            var layout = {
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
};

// AJAX for Hydrograph of Daily Averages
function createHydrographDailyAvg() {
    var formData = new FormData(document.getElementsByName('post-form')[0]);// getting the data from the form
    console.log(formData) // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/hydrograph_daily_avg_ajax_plotly/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            var trace1 = {
                type: "scatter",
                mode: "lines",
                name: "Simulated Data",
                x: resp["dates"],
                y: resp["simulated"],
                line: {color: '#17BECF'}
            }
            var trace2 = {
                type: "scatter",
                mode: "lines",
                name: 'Observed Data',
                x: resp["dates"],
                y: resp["observed"],
                line: {color: '#7F7F7F'}
            }
            var data = [trace1,trace2];
            var layout = {
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
};

//AJAX for Scatter Plot
function createScatter() {
    const formData = new FormData(document.getElementsByName('post-form')[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/scatter_ajax_plotly/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {

            if (resp['simulated'].length <= 1000) {
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
            } else {
                const tester = document.getElementById('scatter');
                const trace1 = {
                    x: resp["simulated"],
                    y: resp["observed"],
                    "type": 'scattergl',
                    "mode": 'markers',
                    "marker": {
                        "size": 20,
                        color: "#006400"
                    }
                };

                const data = [trace1];

                const layout = {
                    title: 'Scatter Plot',
                };

                Plotly.plot(tester, data, layout);

                console.log("successfully plotted the scattergl plot!"); // another sanity check
            }

        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}

//AJAX for Scatter Plot
function createScatterLog() {
    var formData = new FormData(document.getElementsByName('post-form')[0]);// getting the data from the form
    console.log(formData) // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/scatter_ajax_plotly/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {

            if (resp['simulated'].length <= 1000) {

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

                Plotly.newPlot('scatter-log', data, layout);

                console.log("successfully plotted the scatter plot!"); // another sanity check

            } else {

                const tester = document.getElementById('scatter-log');
                const trace1 = {
                    x: resp["simulated"],
                    y: resp["observed"],
                    type: 'scattergl',
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

                Plotly.plot(tester, data, layout);

                console.log("successfully plotted the scattergl plot!"); // another sanity check
            }
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
}

// AJAX for table
function createTable() {
    var formData = new FormData(document.getElementsByName('post-form')[0]);// getting the data from the form
    console.log(formData) // another sanity check

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

function plotlyStatic() {
    let d3 = Plotly.d3;
    let img_jpg = d3.select('#jpg-export');

// Ploting the Graph

    let trace = {x: [3, 9, 8, 10, 4, 6, 5], y: [5, 7, 6, 7, 8, 9, 8], type: "scatter"};
    let trace1 = {x: [3, 4, 1, 6, 8, 9, 5], y: [4, 2, 5, 2, 1, 7, 3], type: "scatter"};
    let data = [trace, trace1];
    let layout = {title: "Simple Javascript Graph"};
    Plotly.plot(
        'plotly_div',
        data,
        layout)

    // static image in jpg format

        .then(
            function (gd) {
                Plotly.toImage(gd, {height: 300, width: 300})
                    .then(
                        function (url) {
                            img_jpg.attr("src", url);
                            return Plotly.toImage(gd, {format: 'jpeg', height: 400, width: 400});
                        }
                    )
            });
}