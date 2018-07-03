
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
  var date_range_bool = document.getElementById("date_range_bool");
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
  var date_range_form = document.getElementById("date_range_form");
  var end_date = document.getElementById("end_date");
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

  if (date_range_bool.checked == true){
    date_range_form.style.display = "block";
  } else {
    date_range_form.style.display = "none";
  }

//  if (lag_analysis_bool.checked == true){
//    lag_analysis_form.style.display = "block";
//  } else {
//    lag_analysis_form.style.display = "none";
//  }
}

function addFields() {
    // Number of inputs to create
    var number = document.getElementById("Num_of_Date_Ranges").value;
    // Container <div> where dynamic content will be placed
    var container = document.getElementById("date_range_container");
    // Clear previous contents of the container
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }
    // Inserting a page break for consistent spacing
    container.appendChild(document.createElement("br"));
    for (i=0; i<number; i++){
        // Append a node with a dynamic title for date ranges
        var title = document.createElement("b");
        title.innerHTML = "Date Range " + (i+1)
        container.appendChild(title)
        container.appendChild(document.createElement("br"));
        container.appendChild(document.createElement("br"));

        // Create <input> elements, set its type and name attributes
        var begin_day = document.createElement("input");
        var begin_month = document.createElement("input");
        var end_day = document.createElement("input");
        var end_month = document.createElement("input");

        container.appendChild(document.createTextNode("Beginning Date:"));
        container.appendChild(document.createElement("br"));
        begin_day.type = "number";
        begin_day.name = "begin_day" + i;
        container.appendChild(document.createTextNode("Day:"));
        container.appendChild(begin_day);
        container.appendChild(document.createElement("br"));

        begin_month.type = "number";
        begin_month.name = "begin_month" + i;
        container.appendChild(document.createTextNode("Month:"));
        container.appendChild(begin_month);
        container.appendChild(document.createElement("br"));

        container.appendChild(document.createTextNode("Ending Date:"));
        container.appendChild(document.createElement("br"));
        end_day.type = "number";
        end_day.name = "end_day" + i;
        container.appendChild(document.createTextNode("Day:"));
        container.appendChild(end_day);
        container.appendChild(document.createElement("br"));

        end_month.type = "number";
        end_month.name = "end_month" + i;
        container.appendChild(document.createTextNode("Month:"));
        container.appendChild(end_month);

        // Append a line break
        container.appendChild(document.createElement("br"));
        container.appendChild(document.createElement("br"));
    }
}

// ####################################################################################################################
//                                                  jQuery Functions
// ####################################################################################################################

$(document).ready(function() {
    $("input[name=predicted_radio]").on( "change", function() {
         console.log('Radio Checkbox function working!') // sanity check
         var test = $(this).val();
         $(".desc").hide();
         $("#"+test).show();
    } );
});

// ####################################################################################################################
//                                                  Ajax Functions
// ####################################################################################################################

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

// Create Table on Button Click
function createTable() {
    create_table();
    console.log('Button Event Triggered') // Sanity Check
};

// Create Hydrograph on Button Click
function createHydrograph() {
    create_hydrograph();
    console.log('Hydrograph Created')
};

// AJAX for table
function create_table() {
    var formData = new FormData(document.getElementsByName('csv-upload')[0]);// getting the data from the form
    console.log(formData) // another sanity check

    $.ajax({
        url : "/apps/statistics-calc/make_table_ajax/", // the endpoint
        type : "POST", // http method
        data : formData, // data sent with the post request, the form data from above
        processData : false,
        contentType : false,

        // handle a successful response
        success : function(resp) {
            $('#table').html(resp); // Render the Table
            console.log("success"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#table').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
};

// AJAX for Hydrograph
function create_hydrograph() {
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

            Plotly.newPlot('Hydrograph', data, layout);

            console.log("successfully plotted the hydrograph"); // another sanity check
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });

};
