# coding=utf-8
# Define your REST API endpoints here.
# In the comments below is an example.

from django.http import JsonResponse, HttpResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes
from hydrostats.metrics import metric_names, metric_abbr, list_of_metrics
from hydrostats.analyze import make_table
import json
import numpy as np
import pandas as pd
import traceback


# noinspection PyBroadException
@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
def calculate_metrics(request):
    """
    API Controller for getting data
    """
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"status": "fail", "reason": "Json could not be parsed."})

    # Retrieving the metrics that the user wants to compute
    try:
        metrics = data['metrics']
    except Exception:
        traceback.print_exc()
        return JsonResponse({"status": "fail", "reason": "No metrics specified."})

    # Retrieving the simulated and observed data
    try:
        sim = data['simulated']
        obs = data['observed']
    except Exception:
        return JsonResponse({"status": "fail", "reason": "simulated and observed parameters not provided."})

    # Retrieving the Extra Parameters
    try:
        mase_m = int(data['mase_m'])
    except Exception:
        mase_m = 1

    try:
        dmod_j = data['dmod_j']
    except Exception:
        dmod_j = 1

    try:
        nse_mod_j = data['nse_mod_j']
    except Exception:
        nse_mod_j = 1

    try:
        h6_mhe_k = data['h6_mhe_k']
    except Exception:
        h6_mhe_k = 1

    try:
        h6_ahe_k = data['h6_ahe_k']
    except Exception:
        h6_ahe_k = 1

    try:
        h6_rmshe_k = data['h6_rmshe_k']
    except Exception:
        h6_rmshe_k = 1

    try:
        lm_x_bar_p = data['lm_x_bar_p']
    except Exception:
        lm_x_bar_p = None

    try:
        d1_p_x_bar_p = data['d1_p_x_bar_p']
    except Exception:
        d1_p_x_bar_p = None

    try:
        kge2009_s = tuple(data['kge2009_s'])
    except Exception:
        kge2009_s = (1, 1, 1)

    try:
        kge2012_s = tuple(data['kge2012_s'])
    except Exception:
        kge2012_s = (1, 1, 1)

    # Checking to see of the user wants to remove zeros and negatives
    try:
        remove_neg = data['remove_neg']
    except Exception:
        remove_neg = False

    try:
        remove_zero = data['remove_zero']
    except Exception:
        remove_zero = False

    # Calculating the metrics wanted
    try:
        calculated_list_of_metrics = list_of_metrics(
            metrics=metrics,
            sim_array=np.array(sim),
            obs_array=np.array(obs),
            abbr=True,
            mase_m=mase_m,
            dmod_j=dmod_j,
            nse_mod_j=nse_mod_j,
            h6_mhe_k=h6_mhe_k,
            h6_ahe_k=h6_ahe_k,
            h6_rmshe_k=h6_rmshe_k,
            d1_p_obs_bar_p=d1_p_x_bar_p,
            lm_x_obs_bar_p=lm_x_bar_p,
            kge2009_s=kge2009_s,
            kge2012_s=kge2012_s,
            remove_neg=remove_neg,
            remove_zero=remove_zero
        )
    except Exception:
        return JsonResponse({"status": "fail", "reason": "There was an error while calculating the metrics."})

    try:
        return_dict = {}

        for i in range(len(metrics)):
            return_dict[metrics[i]] = calculated_list_of_metrics[i]

        return JsonResponse(return_dict)

    except Exception:
        return JsonResponse({"status": "fail", "reason": "There was an error returning the Json response."})


@api_view(['GET'])
# @authentication_classes((TokenAuthentication,))
def get_metrics_names_and_abbr(request):
    """
    API Controller for getting data
    """
    print("In the get_metrics_names api controller.")

    profile = request

    print(profile)

    result = {}

    if request.GET.get('names', False):
        result["names"] = metric_names

    if request.GET.get('abbreviations', False):
        result["abbreviations"] = metric_abbr

    return JsonResponse(result)


# noinspection PyBroadException
@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
def create_metrics_table(request):
    """
    Creates a table of metrics and returns them to the user

    Parameters
    ----------

    metrics: list of str
        A list of metric abbreviations (accessed through hydrostats.metrics.metric_abbr

    sim: 1D array
        An array of simulated data.

    obs: 1D array
        An array of simulated data. Must be the same length as sim or an error will be returned.

    dates: 1D array
        An array of dates corresponding to the given simulated and observed data

    seasonal_periods: 2D array, optional
        If given, specifies the seasonal periods that the user wants to analyze (e.g. [[‘06-01’, ‘06-30’],
        [‘08-12’, ‘11-23’]] would analyze the dates from June 1st to June 30th and also August 8th to November 23).
        Note that the entire time series is analyzed with the selected metrics by default.

    mase_m: int, Optional
        Parameter for the mean absolute scaled error (MASE) metric.

    dmod_j: int or float, optional
        Parameter for the modified index of agreement (dmod) metric.

    nse_mod_j: int or float, optional
        Parameter for the modified Nash-Sutcliffe (nse_mod) metric.

    h6_mhe_k: int or float, optional
        Parameter for the H6 (MHE) metric.

    h6_ahe_k: int or float, optional
        Parameter for the H6 (AHE) metric.

    h6_rmshe_k: int or float, optional
        Parameter for the H6 (RMSHE) metric.

    d1_p_obs_bar_p: float, optional
        Parameter fot the Legate McCabe Index of Agreement (d1_p).

    lm_x_obs_bar_p: float, optional
        Parameter for the Lagate McCabe Efficiency Index (lm_index).

    kge2009_s: tuple of floats, optional
        A tuple of floats of length three signifying how to weight the three values used in the Kling Gupta (2009) metric.

    kge2012_s: tuple of floats, optional
        A tuple of floats of length three signifying how to weight the three values used in the Kling Gupta (2012) metric.

    return_type: str
        A string representing how the user would like to have the data returned. Default is 'json'. Alternatives are
        'html' which returns a json response with the html for the table in it. 'csv' can also be used to return a
        json object with a csv string in it for the table.

    Returns
    -------
    JsonResponse
        A json response with different properties, depending on the return_type parameter

    """

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"status": "fail", "reason": "Json could not be parsed."})

    # Retrieving the metrics that the user wants to compute
    try:
        metrics = data['metrics']
    except Exception:
        traceback.print_exc()
        return JsonResponse({"status": "fail", "reason": "No metrics specified."})

    # Retrieving the data and constructing a DataFrame from it
    try:
        sim = data['simulated']
        obs = data['observed']
        dates = pd.to_datetime(data['dates'], errors='coerce')

        df = pd.DataFrame(np.column_stack((sim, obs)), index=dates, columns=["Simulated", "Observed"])

        # Drop bad time values if they exist
        df = df[df.index.notnull()]

    except Exception:
        traceback.print_exc()
        return JsonResponse({"status": "fail", "reason": "simulated, observed, or dates parameters not sent."})

    # Retrieving the seasonal periods if the user wants them
    try:
        seasonal_periods = data['seasonal_periods']
    except Exception:
        seasonal_periods = None

    # Retrieving the Extra Parameters
    try:
        mase_m = int(data['mase_m'])
    except Exception:
        mase_m = 1

    try:
        dmod_j = data['dmod_j']
    except Exception:
        dmod_j = 1

    try:
        nse_mod_j = data['nse_mod_j']
    except Exception:
        nse_mod_j = 1

    try:
        h6_mhe_k = data['h6_mhe_k']
    except Exception:
        h6_mhe_k = 1

    try:
        h6_ahe_k = data['h6_ahe_k']
    except:
        h6_ahe_k = 1

    try:
        h6_rmshe_k = data['h6_rmshe_k']
    except Exception:
        h6_rmshe_k = 1

    try:
        lm_x_bar_p = data['lm_x_bar_p']
    except:
        lm_x_bar_p = None

    try:
        d1_p_x_bar_p = data['d1_p_x_bar_p']
    except:
        d1_p_x_bar_p = None

    try:
        kge2009_s = tuple(data['kge2009_s'])
    except:
        kge2009_s = (1, 1, 1)

    try:
        kge2012_s = tuple(data['kge2012_s'])
    except:
        kge2012_s = (1, 1, 1)

    # Checking to see of the user wants to remove zeros and negatives
    try:
        remove_neg = data['remove_neg']
    except Exception:
        remove_neg = False

    try:
        remove_zero = data['remove_zero']
    except Exception:
        remove_zero = False

    # Creating the Table Based on User Input
    table = make_table(
        merged_dataframe=df,
        metrics=metrics,
        remove_neg=remove_neg,
        remove_zero=remove_zero,
        mase_m=mase_m,
        dmod_j=dmod_j,
        nse_mod_j=nse_mod_j,
        h6_mhe_k=h6_mhe_k,
        h6_ahe_k=h6_ahe_k,
        h6_rmshe_k=h6_rmshe_k,
        d1_p_obs_bar_p=d1_p_x_bar_p,
        lm_x_obs_bar_p=lm_x_bar_p,
        kge2009_s=kge2009_s,
        kge2012_s=kge2012_s,
        seasonal_periods=seasonal_periods
    )
    table_transposed = table.transpose()

    # Getting the return type that the user specified
    try:
        return_type = data['return_type']
    except Exception:
        return_type = 'json'

    # Returning a response to the user
    if return_type == 'json':
        json_string = table_transposed.to_json(orient='split')
        return_value = '{"status":"success",' + json_string[1:]
        return HttpResponse(return_value)

    elif return_type == 'html':
        table_html = table_transposed.to_html(classes="table table-hover table-striped").replace('border="1"', 'border="0"')
        return JsonResponse({"status": "success", "html_table": table_html})

    elif return_type == 'csv':
        return JsonResponse({"status": "success", "csv_table": table_transposed.to_csv(index=True)})

    else:
        return JsonResponse({"status": "fail", "reason": "Invalid return type given."})
