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


// Function for the Water Balance CSV file upload
$(document).ready(function() {
    $("#water_bal_csv").change(function () {
        const label = $("#water_bal_csv").val().replace(/\\/g, '/').replace(/.*\//, '');
        $("#water_bal_csv_name").val(label);
    });
});


// Function to visualize the time series data on button click
$(document).ready(function(){
    $("#visualize_persistence").click(function(){
        // Validation
        let fileBool = CheckFileInput();
        let dayBool = CheckDayInput();
        let hourBool = CheckHourInput();
        let minuteBool = CheckMinuteInput();
        let errorMessage = "The following errors occured:\n";

        let validationBool = (fileBool && dayBool && hourBool && minuteBool);

        console.log(validationBool);

        if (validationBool) {
            createHydrographPersistence();
        } else {
            window.location.assign("#error_redirect_point");
            if (fileBool) {
                errorMessage += "No file supplied\n";
            }
            if (dayBool) {
                errorMessage += "No day value supplied\n";
            }
            if (hourBool) {
                errorMessage += "No hour value supplied\n";
            }
            if (minuteBool) {
                errorMessage += "No minute value supplied\n";
            }
            console.log(errorMessage);
            $("#error_message").html(errorMessage);
        }
    });
});
function createHydrographPersistence() {
    console.log("Validation for visualization cleared")
}


// VALIDATION FUNCTIONS

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