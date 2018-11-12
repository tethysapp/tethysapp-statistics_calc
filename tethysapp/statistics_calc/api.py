# coding=utf-8
# Define your REST API endpoints here.
# In the comments below is an example.

from django.http import JsonResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes
from hydrostats import kge_2012
from hydrostats.metrics import metric_names, metric_abbr
from hydrostats.analyze import make_table
import json
import numpy as np


@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
def get_metrics(request):
    """
    API Controller for getting data
    """
    print("In the get_metrics api controller.")

    data = json.loads(request.body)

    sim = data['simulated']
    obs = data['observed']

    sim = np.array(sim)
    obs = np.array(obs)

    kge = kge_2012(sim, obs)

    result = {
        "kge_2012": kge,
        "status": "success"
    }

    return JsonResponse(result)


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


@api_view(['GET'])
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
        An array of

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
        Parameter for the H6 (AHE) metric

    h6_rmshe_k: int or float, optional
        Parameter for the H6 (RMSHE) metric

    d1_p_obs_bar_p: float, optional
        Parameter fot the Legate McCabe Index of Agreement (d1_p).

    lm_x_obs_bar_p: float, optional
        Parameter for the Lagate McCabe Efficiency Index (lm_index).

    kge2009_s: tuple of floats
        A tuple of floats of length three signifying how to weight the three values used in the Kling Gupta (2009) metric.

    kge2012_s: tuple of floats
        A tuple of floats of length three signifying how to weight the three values used in the Kling Gupta (2012) metric.

    """

    # Retrieving the metrics that the user wants to compute
    metrics = request.GET.getlist('metrics', None)

    # Retrieving the data and constructing a DataFrame from it
    sim = request.GET.getlist('metrics', None)
    obs = request.GET.getlist('obs', None)
    dates = request.GET.getlist('dates', None)

    # Retrieving the seasonal periods if the user wants them
    seasonal_periods = request.GET.getlist('seasonal_periods', None)

    # Retrieving the Extra Parameters
    extra_param_dict = {}

    if request.GET.get('mase_m', None) is not None:
        mase_m = int(request.GET.get('mase_m', None))
        extra_param_dict['mase_m'] = mase_m
    else:
        mase_m = 1
        extra_param_dict['mase_m'] = mase_m

    if request.GET.get('dmod_j', None) is not None:
        dmod_j = float(request.GET.get('dmod_j', None))
        extra_param_dict['dmod_j'] = dmod_j
    else:
        dmod_j = 1
        extra_param_dict['dmod_j'] = dmod_j

    if request.GET.get('nse_mod_j', None) is not None:
        nse_mod_j = float(request.GET.get('nse_mod_j', None))
        extra_param_dict['nse_mod_j'] = nse_mod_j
    else:
        nse_mod_j = 1
        extra_param_dict['nse_mod_j'] = nse_mod_j

    if request.GET.get('h6_mhe_k', None) is not None:
        h6_mhe_k = float(request.GET.get('h6_mhe_k', None))
        extra_param_dict['h6_ahe_k'] = h6_mhe_k
    else:
        h6_mhe_k = 1
        extra_param_dict['h6_mhe_k'] = h6_mhe_k

    if request.GET.get('h6_ahe_k', None) is not None:
        h6_ahe_k = float(request.GET.get('h6_ahe_k', None))
        extra_param_dict['h6_ahe_k'] = h6_ahe_k
    else:
        h6_ahe_k = 1
        extra_param_dict['h6_ahe_k'] = h6_ahe_k

    if request.GET.get('h6_rmshe_k', None) is not None:
        h6_rmshe_k = float(request.GET.get('h6_rmshe_k', None))
        extra_param_dict['h6_rmshe_k'] = h6_rmshe_k
    else:
        h6_rmshe_k = 1
        extra_param_dict['h6_rmshe_k'] = h6_rmshe_k

    if float(request.GET.get('lm_x_obs_bar_p', None)) != 1:  # TODO: Fix these to be set to use the mean as default
        lm_x_bar_p = float(request.GET.get('lm_x_obs_bar_p', None))
        extra_param_dict['lm_x_obs_bar_p'] = lm_x_bar_p
    else:
        lm_x_bar_p = None
        extra_param_dict['lm_x_obs_bar_p'] = lm_x_bar_p

    if float(request.GET.get('d1_p_obs_bar_p', None)) != 1:
        d1_p_x_bar_p = float(request.GET.get('d1_p_obs_bar_p', None))
        extra_param_dict['d1_p_obs_bar_p'] = d1_p_x_bar_p
    else:
        d1_p_x_bar_p = None
        extra_param_dict['d1_p_obs_bar_p'] = d1_p_x_bar_p

    if float(request.GET.get('kge2009_s', None)) is not None:
        kge2009_s = float(request.GET.get('kge2009_s', None))
    else:
        kge2009_s = (1, 1, 1)
        extra_param_dict['kge2009_s'] = kge2009_s

    if float(request.GET.get('kge2012_s', None)) is not None:
        kge2012_s = float(request.GET.get('kge2012_s', None))
    else:
        kge2012_s = (1, 1, 1)
        extra_param_dict['kge2012_s'] = kge2012_s

    # Checking to see of the user wants to remove zeros and negatives
    if request.POST.get('remove_neg_bool', None) is not None:
        remove_neg_bool = request.POST.get('remove_neg_bool') == 'on'

    if request.POST.get('remove_zero_bool') is not None:
        remove_zero_bool = request.POST.get('remove_zero_bool') == 'on'


    # Creating the Table Based on User Input
    table = make_table(
        merged_dataframe=merged_df,
        metrics=selected_metric_abbr,
        remove_neg=remove_neg,
        remove_zero=remove_zero,
        mase_m=extra_param_dict['mase_m'],
        dmod_j=extra_param_dict['dmod_j'],
        nse_mod_j=extra_param_dict['nse_mod_j'],
        h6_mhe_k=extra_param_dict['h6_mhe_k'],
        h6_ahe_k=extra_param_dict['h6_ahe_k'],
        h6_rmshe_k=extra_param_dict['h6_rmshe_k'],
        d1_p_obs_bar_p=extra_param_dict['d1_p_x_bar_p'],
        lm_x_obs_bar_p=extra_param_dict['lm_x_bar_p'],
        seasonal_periods=all_date_range_list
    )
    table_html = table.transpose()
    table_html = table_html.to_html(classes="table table-hover table-striped").replace('border="1"', 'border="0"')

    # TODO: Finish this API function, as I think it will be quite useful for other developers

    result = {
        "hello": 123,
        "error": False
    }

    return JsonResponse(result)
