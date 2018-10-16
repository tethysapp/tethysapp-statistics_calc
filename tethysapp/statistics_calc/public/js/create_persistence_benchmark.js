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


// Function for the Water Balance CSV file upload
$(document).ready(function () {
    $("#water_bal_csv").change(function () {
        const label = $("#water_bal_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#water_bal_csv_name").val(label);
    });
});


// Function to visualize the time series data on button click
$(document).ready(function () {
    $("#visualize_persistence").click(function () {
        // Clear Previous Errors
        clearPreviousError();

        // Validation
        let fileBool = CheckFileInput();
        let dayBool = CheckDayInput();
        let hourBool = CheckHourInput();
        let minuteBool = CheckMinuteInput();
        let errorMessage = `<p class="error_text">The following errors occured:<br/>`;

        let validationBool = (fileBool && dayBool && hourBool && minuteBool);

        console.log(validationBool);

        if (validationBool) {
            createHydrographPersistence();
        } else {
            window.location.assign("#error_redirect_point");
            if (!fileBool) {
                errorMessage += "- No file supplied<br />";
                $("#water_bal_csv_file_input").addClass("has-error");
            }
            if (!dayBool) {
                errorMessage += "- No day value supplied<br />";
                $("#day_form").addClass("has-error");
            }
            if (!hourBool) {
                errorMessage += "- No hour value supplied<br />";
                $("#hours_form").addClass("has-error");
            }
            if (!minuteBool) {
                errorMessage += "- No minute value supplied<br />";
                $("#minutes_form").addClass("has-error");
            }
            errorMessage += `</p>`;

            $("#error_message").html(errorMessage);
        }
    });
});

function createHydrographPersistence() {

    let formData = new FormData($("#persistence_benchmark")[0]);// getting the data from the form
    console.log(formData); // another sanity check

    $.ajax({
        url: "/apps/statistics-calc/visualize_persistence_benchmark/", // the endpoint
        type: "POST", // http method
        data: formData, // data sent with the post request, the form data from above
        processData: false,
        contentType: false,

        // handle a successful response
        success: function (resp) {
            let trace1 = {
                type: "scatter",
                mode: "lines",
                name: "Original Data",
                x: resp["original_dates"],
                y: resp["data"],
                line: {color: '#17BECF'}
            };
            let trace2 = {
                type: "scatter",
                mode: "lines",
                name: 'Persistence Benchmark Data',
                x: resp["persistence_dates"],
                y: resp["data"],
                line: {color: '#7F7F7F'}
            };
            let data = [trace1, trace2];
            let layout = {
                title: 'Comparison of Original Data to Persistence Benchmark Forecast',

                // xaxis: {
                //     autotick: false,
                //     tick0: 0,
                //     dtick: 10,
                //     tickangle: 45,
                //  },
            };

            Plotly.newPlot('plot', data, layout);

            console.log(resp);
            console.log("successfully plotted the daily average hydrograph"); // another sanity check
        },

        // handle a non-successful response
        error: function (xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + ".</div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
            $("#hydrograph_daily_avg_loader").hide();
        }
    });
}

// Function to download the persistence forecast on button click
$(document).ready(function () {
    $("#download_persistence").click(function () {
        // Clear Previous Errors
        clearPreviousError();

        // Validation
        let fileBool = CheckFileInput();
        let dayBool = CheckDayInput();
        let hourBool = CheckHourInput();
        let minuteBool = CheckMinuteInput();
        let errorMessage = `<p class="error_text">The following errors occured:<br/>`;

        let validationBool = (fileBool && dayBool && hourBool && minuteBool);

        console.log(validationBool);

        if (validationBool) {
            downloadPersistence();
        } else {
            window.location.assign("#error_redirect_point");
            if (!fileBool) {
                errorMessage += "- No file supplied<br />";
                $("#water_bal_csv_file_input").addClass("has-error");
            }
            if (!dayBool) {
                errorMessage += "- No day value supplied<br />";
                $("#day_form").addClass("has-error");
            }
            if (!hourBool) {
                errorMessage += "- No hour value supplied<br />";
                $("#hours_form").addClass("has-error");
            }
            if (!minuteBool) {
                errorMessage += "- No minute value supplied<br />";
                $("#minutes_form").addClass("has-error");
            }
            errorMessage += `</p>`;

            $("#error_message").html(errorMessage);
        }
    });
});
function downloadPersistence() {
    $("#persistence_benchmark").submit();
}


// VALIDATION FUNCTIONS

/** Clears all errors
 * @return {boolean}
 */
function clearPreviousError() {
    $("#error_message").empty();
    $("#water_bal_csv_file_input").removeClass("has-error");
    $("#day_form").removeClass("has-error");
    $("#hours_form").removeClass("has-error");
    $("#minutes_form").removeClass("has-error");
}

/** Check if file exists
 * @return {boolean}
 */
function CheckFileInput() {
    return ($("#water_bal_csv").val() !== "");
}

/** Check if Day exists
 * @return {boolean}
 */
function CheckDayInput() {
    return ($("#day").val() !== "");
}

/** Check if Hour exists
 * @return {boolean}
 */
function CheckHourInput() {
    return ($("#hours").val() !== "");
}

/** Check if Minute exists
 * @return {boolean}
 */
function CheckMinuteInput() {
    return ($("#minutes").val() !== "");
}
