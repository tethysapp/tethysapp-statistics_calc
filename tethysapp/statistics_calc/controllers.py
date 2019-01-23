# python 2.7
# -*- coding: utf-8 -*-
"""
Created on Jan 16 5:02:32 2018
@author: Wade Roberts
"""
from __future__ import division, print_function

# Django Imports
from django.shortcuts import render, HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.http.response import JsonResponse

# Tethys Imports
from .app import StatisticsCalc as App

# Data Management and Plotting imports
import pandas as pd
import numpy as np
from scipy import integrate

# Hydrostats Imports and helper functions
import hydrostats as hs
from hydrostats.metrics import metric_names, metric_abbr
import hydrostats.data as hd
import hydrostats.ens_metrics as em
from .model import parse_api_request, convert_units

# Various Python Standard Library Imports
import traceback
import requests
from pytz import all_timezones
import datetime
from ast import literal_eval
try:
    # noinspection PyCompatibility
    from StringIO import StringIO
except ImportError:
    from io import StringIO


@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    context = {}

    return render(request, 'statistics_calc/home.html', context)


@never_cache
@login_required()
def preprocessing(request):
    """
    Controller for the preprocessing page.
    """

    context = {}

    return render(request, 'statistics_calc/preprocessing.html', context)


# noinspection PyBroadException
@login_required()
def pps_hydrograph_raw_data_ajax(request):
    """AJAX Controller for the preprocessing page. Creates a Hydrograph given the Interpolation method selected"""
    print("In the raw data ajax controller!")
    try:
        if request.method == "POST":
            print(request.POST)
            print(request.FILES)

            # POST data collection
            csv_file = request.FILES.get('pps_csv', None)
            current_units = request.POST.get("current_units", None)
            desired_units = request.POST.get("desired_units", None)

            df = pd.read_csv(csv_file, index_col=0)

            # Changing index to datetime type
            df.index = pd.to_datetime(df.index, infer_datetime_format=True, errors='coerce')
            # Dropping bad time values if necessary
            df = df[df.index.notnull()]

            if current_units == "on":
                current_units = 'si'
            else:
                current_units = 'bg'

            if desired_units == "on":
                desired_units = 'si'
            else:
                desired_units = 'bg'

            df = convert_units(single_df=df, single_units=current_units, final_units=desired_units)

            # Converting the DF to JSON
            date_list = df.index.strftime("%Y-%m-%d %H:%M:%S")
            date_list = date_list.tolist()
            data = df.iloc[:, 0].tolist()

            # Getting basic info from the data
            time_values = df.index
            len_time_values = len(time_values)

            time_delta = time_values[1:len_time_values] - time_values[0:len_time_values - 1]
            time_delta_freq = time_delta.value_counts()

            common_time_delta = str(time_delta_freq.index[0])

            if time_delta_freq.values.size > 1:
                message = """<div class="alert alert-warning" role="alert">The timeseries data is <strong>not consistent.
                                </strong> The most common time frequency in the time series is {}.</div>"""

                # Setting pandas column width option to infinite
                pd.set_option('display.max_colwidth', -1)

                # Finding the location of the irregular time frequencies
                data_list = []
                for i, time_del in enumerate(time_delta_freq.index):
                    if i > 0:
                        data_sublist = [time_del]
                        indices = np.where(time_delta == time_del)
                        missing_times = time_values[indices]
                        missing_times = missing_times.strftime("%B %d, %Y %H:%M:%S")
                        missing_times = missing_times.tolist()
                        missing_times = ', '.join(missing_times)
                        data_sublist.append(missing_times)

                        data_list.append(data_sublist)

                table_of_freq = pd.DataFrame(data_list, columns=["Time Frequency", "Location"])
                table_of_freq = table_of_freq.to_html(classes="table table-hover table-striped", index=False)
                table_of_freq = table_of_freq.replace('border="1"', 'border="0"')

                message += table_of_freq

                information = message.format(common_time_delta)
            else:
                message = """<div class="alert alert-success" role="alert">The timeseries data is <strong>consistent
                             </strong> with a time frequency of {}.</div>"""

                information = message.format(common_time_delta)

            response = {
                "backend_error": False,
                "dates": date_list,
                "data": data,
                "units": desired_units,
                "information": information,
            }

            return JsonResponse(response)

    except Exception:
        traceback.print_exc()

        response = {
            "backend_error": True,
            "error_message": "There was an error while processing the uploaded data."
        }

        return JsonResponse(response)


@login_required()
def pps_check_dates_ajax(request):
    """AJAX Controller for the preprocessing page. Checks if the user has made sure that the date range is included in
    the timeseries data"""

    if request.method == "POST":

        # Getting the POST data
        csv_file = request.FILES.get('pps_csv', None)
        begin_date = request.POST.get('begin_date', None)
        end_date = request.POST.get('end_date', None)

        # Initializing response dictionary
        resp = {
            "backend_error": False,
            "error_message": ""
        }

        # Parsing CSV
        try:
            df = pd.read_csv(csv_file, index_col=0)
            begin_timeseries = pd.to_datetime(df.index[0])
            end_timeseries = pd.to_datetime(df.index[-1])
            begin_date = pd.to_datetime(begin_date, errors="coerce")
            end_date = pd.to_datetime(end_date, errors="coerce")
        except Exception as e:
            print(e)
            resp["backend_error"] = True
            resp["error_message"] = "Error while parsing the CSV and dates supplied."

        if not resp["backend_error"]:
            try:
                if begin_timeseries <= begin_date <= end_timeseries and begin_timeseries <= end_date <= end_timeseries:
                    resp["error"] = False
                else:
                    resp["error"] = False

            except Exception as e:
                print(e)
                resp["backend_error"] = True
                resp["error_message"] = "Error while comparing the dates."

        return JsonResponse(resp)


@login_required()
def pps_hydrograph_ajax(request):
    """AJAX Controller for the preprocessing page. Creates a Hydrograph given the Interpolation method selected"""

    if request.method == "POST":

        # Initializing the resp variable
        resp = {
            "backend_error": False,
            "error_message": ""
        }

        # Parsing the CSV and checking units
        try:
            # Collect POST data
            csv_file = request.FILES.get('pps_csv', None)
            current_units = request.POST.get("current_units", None)
            desired_units = request.POST.get("desired_units", None)

            df = pd.read_csv(csv_file, index_col=0)
            df.iloc[:, 0] = df.iloc[:, 0].astype(np.float64)
            df.index = pd.to_datetime(df.index, infer_datetime_format=True, errors='coerce')
            df = df[df.index.notnull()]

            if current_units == "on":
                current_units = 'si'
            else:
                current_units = 'bg'

            if desired_units == "on":
                desired_units = 'si'
            else:
                desired_units = 'bg'

            df = convert_units(single_df=df, single_units=current_units, final_units=desired_units)

            resp['units'] = desired_units

        except Exception as e:
            print(e)
            resp["backend_error"] = True
            resp["error_message"] = "Error while parsing the CSV."

        # Time scaling if requested
        if not resp["backend_error"]:
            if request.POST.get('time_range_bool', None) == "on":
                try:
                    begin_date = request.POST.get('begin_date', None)
                    end_date = request.POST.get('end_date', None)
                    begin_date = pd.to_datetime(begin_date)
                    end_date = pd.to_datetime(end_date)
                    df = df.loc[begin_date: end_date]
                except Exception as e:
                    print(e)
                    resp["backend_error"] = True
                    resp["error_message"] = "Error while time scaling the data."

        # Interpolating the data if requested
        if not resp["backend_error"]:
            if request.POST.get('interpolation_bool', None) == "on":
                try:
                    # Retrieving the POST data
                    interp_method = request.POST.get('interp_method', None)
                    interp_hours = request.POST.get('interp_hours', None)
                    interp_minutes = request.POST.get('interp_minutes', None)

                    new_index = pd.date_range(df.index[0],
                                              df.index[-1],
                                              freq="{}H {}min".format(interp_hours, interp_minutes))
                    df = df.reindex(new_index)
                    df = df.interpolate(interp_method)
                except Exception as e:
                    print(e)
                    resp["backend_error"] = True
                    resp["error_message"] = "Error while time interpolating the data."

        # Returning the response data
        if not resp['backend_error']:
            date_list = df.index.strftime("%Y-%m-%d %H:%M:%S")
            date_list = date_list.tolist()
            data_list = df.iloc[:, 0].tolist()

            resp['dates'] = date_list
            resp['data'] = data_list

        return JsonResponse(resp)


@login_required()
def pps_csv(request):
    # noinspection PyBroadException
    try:
        if request.method == "POST":

            # Initializing the resp variable
            resp = {
                "backend_error": False,
                "error_message": ""
            }

            # Parsing the CSV and applying specified units
            csv_file = request.FILES.get('pps_csv', None)
            current_units = request.POST.get("current_units", None)
            desired_units = request.POST.get("desired_units", None)

            df = pd.read_csv(csv_file, index_col=0)
            df.iloc[:, 0] = df.iloc[:, 0].astype(np.float64)
            df.index = pd.to_datetime(df.index, infer_datetime_format=True, errors='coerce')
            df = df[df.index.notnull()]

            if current_units == "on":
                current_units = 'si'
            else:
                current_units = 'bg'

            if desired_units == "on":
                desired_units = 'si'
            else:
                desired_units = 'bg'

            df = convert_units(single_df=df, single_units=current_units, final_units=desired_units)

            resp['units'] = desired_units

            # Time scaling if requested
            if request.POST.get('time_range_bool', None) == "on":
                begin_date = request.POST.get('begin_date', None)
                end_date = request.POST.get('end_date', None)
                begin_date = pd.to_datetime(begin_date)
                end_date = pd.to_datetime(end_date)
                df = df.loc[begin_date: end_date]

            # Interpolating the data if requested
            if request.POST.get('interpolation_bool', None) == "on":
                # Retrieving the POST data
                interp_method = request.POST.get('interp_method', None)
                interp_hours = request.POST.get('interp_hours', None)
                interp_minutes = request.POST.get('interp_minutes', None)

                new_index = pd.date_range(df.index[0],
                                          df.index[-1],
                                          freq="{}H {}min".format(interp_hours, interp_minutes))
                df = df.reindex(new_index)
                df = df.interpolate(interp_method)

            time_stamp = str(datetime.datetime.utcnow()).replace(" ", "_").replace(":", "")
            content_disposition = 'attachment; filename=preprocessed_data_{}.csv'.format(time_stamp)

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = content_disposition

            df.to_csv(path_or_buf=response, index_label="Datetime")

            return response

    except Exception:
        traceback.print_exc()

        error_message = "<h1>Something went wrong in the form submission, please make sure that your file is " \
                        "formatted correctly.</h1>"

        return HttpResponse(error_message)


@login_required()
def merge_two_datasets(request):
    """
    Controller for the merge_two_datasets page.
    """
    # Getting the watershed names
    watershed_error = False

    context = {}

    try:
        token = App.get_custom_setting('spt_token')
        url = App.get_custom_setting('api_source')
        request_headers = dict(Authorization='Token {}'.format(token))
        res = requests.get(
            '{}/apps/streamflow-prediction-tool/api/GetWatersheds/'.format(url),
            headers=request_headers
        )
        watersheds = literal_eval(res.content)
        watersheds = [i[0] for i in watersheds]
        context["watersheds"] = watersheds
    except Exception as e:
        print(e)
        watershed_error = True

    # TODO: Incorporate the watershed error into the template
    context["all_timezones"] = all_timezones

    return render(request, 'statistics_calc/merge_two_datasets.html', context)


@login_required()
def merged_hydrograph(request):
    """
    AJAX Controller for the merge_two_datasets page to plot a hydrograph of the datasets when merged.
    """
    # noinspection PyBroadException
    try:

        if request.method == 'POST':

            resp = {
                "backend_error": False,
                "error_message": ""
            }

            # getting the observed and simulated data
            obs = request.FILES.get('obs_csv', None)

            if request.POST.get("predicted_radio", None) == "upload":
                sim = request.FILES.get('sim_csv', None)
            elif request.POST.get("predicted_radio", None) == "sfpt":
                reach_id = request.POST.get("reach_id", None)
                watershed = request.POST.get("watershed", None)
                sim = parse_api_request(
                    watershed=watershed,
                    reach=reach_id,
                    token=App.get_custom_setting('spt_token'),
                    url=App.get_custom_setting('api_source')
                )

                obs = pd.read_csv(obs, index_col=0)
                obs.index = pd.to_datetime(obs.index, errors="coerce")
                obs = obs[obs.index.notnull()]

            # Getting the timezone information
            timezone_boolean = (request.POST.get('time_zone_bool', None) == "on")

            if timezone_boolean:
                simulated_tz = request.POST.get('sim_tz', None)
                observed_tz = request.POST.get('obs_tz', None)
                interpolate = request.POST.get('interpolate_radio')
            else:
                simulated_tz = None
                observed_tz = None
                interpolate = None

            if request.POST.get("predicted_radio", None) == "upload":
                merged_df = hd.merge_data(
                    sim_fpath=sim, obs_fpath=obs, interpolate=interpolate, column_names=('Simulated', 'Observed'),
                    simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
                )
            elif request.POST.get("predicted_radio", None) == "sfpt":
                merged_df = hd.merge_data(
                    sim_df=sim, obs_df=obs, interpolate=interpolate, column_names=('Simulated', 'Observed'),
                    simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
                )

            # Collecting post data
            simulated_units = request.POST.get("simulated-units", None)
            observed_units = request.POST.get("observed-units", None)
            desired_units = request.POST.get('desired_units', None)

            # Converting Units
            if request.POST.get("predicted_radio", None) == "sfpt":
                simulated_units = 'si'

                if observed_units == "on":
                    observed_units = 'si'
                else:
                    observed_units = 'bg'

                if desired_units == "on":
                    desired_units = 'si'
                else:
                    desired_units = 'bg'

            elif request.POST.get("predicted_radio", None) == "upload":

                if simulated_units == "on":
                    simulated_units = 'si'
                else:
                    simulated_units = 'bg'

                if observed_units == "on":
                    observed_units = 'si'
                else:
                    observed_units = 'bg'

                if desired_units == "on":
                    desired_units = 'si'
                else:
                    desired_units = 'bg'

            merged_df = convert_units(two_stream_df=merged_df, sim_units=simulated_units, obs_units=observed_units,
                                      final_units=desired_units)

            date_list = merged_df.index.strftime("%Y-%m-%d %H:%M:%S")
            date_list = date_list.tolist()

            sim_list = merged_df.iloc[:, 0].tolist()
            obs_list = merged_df.iloc[:, 1].tolist()

            resp['dates'] = date_list
            resp['simulated'] = sim_list
            resp['observed'] = obs_list
            resp['units'] = desired_units

            return JsonResponse(resp)

    except Exception:
        traceback.print_exc()

        response = {
            "backend_error": True,
            "error_message": "There was an error while merging the two datasets, please make sure that applying "
                             "timezones will not create a non-existing time, and also that the two datasets have dates "
                             "in common",
        }

        return JsonResponse(response)


@login_required()
def merged_csv_download(request):
    """
    AJAX Controller for the merge_two_datasets page to plot a hydrograph of the datasets when merged.
    """
    # noinspection PyBroadException
    try:
        if request.method == 'POST':

            # Gathering POST data
            predicted_radio_value = request.POST.get("predicted_radio", None)
            timezone_boolean = request.POST.get('time_zone_bool', None)
            obs = request.FILES.get('obs_csv', None)

            if predicted_radio_value == "upload":
                sim = request.FILES.get('sim_csv', None)
            elif predicted_radio_value == "sfpt":
                reach_id = request.POST.get("reach_id", None)
                watershed = request.POST.get("watershed", None)
                sim = parse_api_request(watershed=watershed, reach=reach_id)  # TODO: add the token from custom settings

                # Parsing the observed CSV data
                obs = pd.read_csv(obs, index_col=0)
                obs.index = pd.to_datetime(obs.index, errors="coerce")

            if timezone_boolean == 'on':
                simulated_tz = request.POST.get('sim_tz', None)
                observed_tz = request.POST.get('obs_tz', None)
                interpolate = request.POST.get('interpolate_radio')
            else:
                simulated_tz = None
                observed_tz = None
                interpolate = None

            if predicted_radio_value == "upload":
                merged_df = hd.merge_data(
                    sim_fpath=sim, obs_fpath=obs, interpolate=interpolate, column_names=('Simulated', 'Observed'),
                    simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
                )

            elif request.POST.get("predicted_radio", None) == "sfpt":
                pass  # TODO: Fix the SPT function to correctly get information from API and fix here
                # merged_df = hd.merge_data(
                #     sim_df=sim, obs_df=obs, interpolate=interpolate, column_names=['Simulated', 'Observed'],
                #     simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
                # )

            response = HttpResponse(content_type='text/csv')
            time_stamp = str(datetime.datetime.utcnow()).replace(" ", "_").replace(":", "")
            response['Content-Disposition'] = 'attachment; filename=merged_data_{}.csv'.format(time_stamp)

            merged_df.to_csv(path_or_buf=response, index_label="Datetime", header=["Simulated Data", "Observed Data"])

            return response

    except Exception:
        traceback.print_exc()

        return HttpResponse("<p>Something wrong happened, please make sure that both CSVs are formatted correctly "
                            "and the timezones in the CSVs exist.</p>")


@login_required()
def calculate_single(request):
    """
    Controller for page to upload data to perform analysis on a single stream reach.
    """
    # Getting metric names from the hydrostats package and abbreviation names for dynamic rendering

    metric_loop_list = list(zip(metric_names, metric_abbr))

    context = {'metric_loop_list': metric_loop_list}

    return render(request, 'statistics_calc/calculate_single.html', context)


@login_required()
def get_metric_names_abbr(request):
    # noinspection PyBroadException
    try:
        if request.method == 'GET':

            result = {}

            if request.GET.get('names', False):
                result["names"] = metric_names

            if request.GET.get('abbreviations', False):
                result["abbreviations"] = metric_abbr

            return JsonResponse(result)

    except Exception:
        traceback.print_exc()

        response = {
            "backend_error": True,
            "error_message": "There was an error retrieving the metric names and abbreviations",
        }

        return JsonResponse(response)


@login_required()
def hydrograph_ajax_plotly(request):
    try:
        if request.method == 'POST':

            merged_csv = request.FILES.get('merged_csv', None)
            merged_df = pd.read_csv(merged_csv, index_col=0)
            merged_df.index = pd.to_datetime(merged_df.index, errors="coerce")
            merged_df = merged_df[merged_df.index.notnull()]

            date_list = merged_df.index.strftime("%Y-%m-%d %H:%M:%S")
            date_list = date_list.tolist()

            sim_list = merged_df.iloc[:, 0].tolist()
            obs_list = merged_df.iloc[:, 1].tolist()

            resp = {
                "backend_error": False,
                "dates": date_list,
                "simulated": sim_list,
                "observed": obs_list
            }

            return JsonResponse(resp)

    except Exception:
        traceback.print_exc()

        resp = {
            "backend_error": True,
            "error_message": 'Error while parsing the CSV.'
        }

        return JsonResponse(resp)


@login_required()
def hydrograph_daily_avg_ajax_plotly(request):
    if request.method == 'POST':

        resp = {
            "backend_error": False,
            "error_message": ""
        }

        try:
            merged_csv = request.FILES.get('merged_csv', None)
            merged_df = pd.read_csv(merged_csv, index_col=0)
            merged_df.index = pd.to_datetime(merged_df.index, errors="coerce")

            daily_avg_df = hd.daily_average(merged_df)

            date_list = daily_avg_df.index.tolist()
            sim_list = daily_avg_df.iloc[:, 0].tolist()
            obs_list = daily_avg_df.iloc[:, 1].tolist()

            resp['dates'] = date_list
            resp['simulated'] = sim_list
            resp['observed'] = obs_list
        except Exception as e:
            print(e)
            resp['backend_error'] = True
            resp['error_message'] = 'Error while parsing the CSV.'

        return JsonResponse(resp)


@login_required()
def scatter_ajax_plotly(request):
    """
    :param request: Request from the client side.
    :return: JSON response with the simulated and observed data.
    """
    if request.method == 'POST':

        resp = {
            "backend_error": False,
            "error_message": ""
        }

        try:
            merged_csv = request.FILES.get('merged_csv', None)
            merged_df = pd.read_csv(merged_csv, index_col=0)

            sim = merged_df.iloc[:, 0].values
            obs = merged_df.iloc[:, 1].values

            sim_list = merged_df.iloc[:, 0].tolist()
            obs_list = merged_df.iloc[:, 1].tolist()

            # Getting a polynomial fit and defining a function with it
            p = np.polyfit(sim, obs, 1)
            f = np.poly1d(p)

            # Calculating new x's and y's
            x_best_fit = np.array([0, sim.max()])
            y_best_fit = f(x_best_fit)

            # Formatting the best fit equation to a string
            equation = "{} x + {}".format(np.round(p[0], 4), np.round(p[1], 4))

            # Data to plot a 45 degree line
            max_both = max([np.max(sim), np.max(obs)])
            min_both = min([np.min(sim), np.min(obs)])
            coords_45_deg = np.array([min_both, max_both + 1])

            resp['simulated'] = sim_list
            resp['observed'] = obs_list
            resp['x_best_fit'] = x_best_fit.tolist()
            resp['y_best_fit'] = y_best_fit.tolist()
            resp['best_fit_equation'] = equation
            resp['coords_45_deg'] = coords_45_deg.tolist()

        except Exception as e:
            print(e)
            resp['backend_error'] = True
            resp['error_message'] = 'There was an error while parsing the CSV.'

        return JsonResponse(resp)


@login_required()
def make_table_ajax(request):
    """AJAX controller to make a table and display the html for the user."""

    print('In the make table AJAX controller!')  # Sanity check

    if request.method == 'POST':
        try:
            # Retrieving all of the form data
            merged_csv = request.FILES.get('merged_csv', None)

            # Retrieving the extra optional parameters
            extra_param_dict = {}

            if request.POST.get('mase_m', None) is not None:
                mase_m = int(request.POST.get('mase_m', None))
                extra_param_dict['mase_m'] = mase_m
            else:
                mase_m = 1
                extra_param_dict['mase_m'] = mase_m

            if request.POST.get('dmod_j', None) is not None:
                dmod_j = float(request.POST.get('dmod_j', None))
                extra_param_dict['dmod_j'] = dmod_j
            else:
                dmod_j = 1
                extra_param_dict['dmod_j'] = dmod_j

            if request.POST.get('nse_mod_j', None) is not None:
                nse_mod_j = float(request.POST.get('nse_mod_j', None))
                extra_param_dict['nse_mod_j'] = nse_mod_j
            else:
                nse_mod_j = 1
                extra_param_dict['nse_mod_j'] = nse_mod_j

            if request.POST.get('h6_k_MHE', None) is not None:
                h6_mhe_k = float(request.POST.get('h6_k_MHE', None))
                extra_param_dict['h6_mhe_k'] = h6_mhe_k
            else:
                h6_mhe_k = 1
                extra_param_dict['h6_mhe_k'] = h6_mhe_k

            if request.POST.get('h6_k_AHE', None) is not None:
                h6_ahe_k = float(request.POST.get('h6_k_AHE', None))
                extra_param_dict['h6_ahe_k'] = h6_ahe_k
            else:
                h6_ahe_k = 1
                extra_param_dict['h6_ahe_k'] = h6_ahe_k

            if request.POST.get('h6_k_RMSHE', None) is not None:
                h6_rmshe_k = float(request.POST.get('h6_k_RMSHE', None))
                extra_param_dict['h6_rmshe_k'] = h6_rmshe_k
            else:
                h6_rmshe_k = 1
                extra_param_dict['h6_rmshe_k'] = h6_rmshe_k

            if float(request.POST.get('lm_x_bar', None)) != 1:
                lm_x_bar_p = float(request.POST.get('lm_x_bar', None))
                extra_param_dict['lm_x_bar_p'] = lm_x_bar_p
            else:
                lm_x_bar_p = None
                extra_param_dict['lm_x_bar_p'] = lm_x_bar_p

            if float(request.POST.get('d1_p_x_bar', None)) != 1:
                d1_p_x_bar_p = float(request.POST.get('d1_p_x_bar', None))
                extra_param_dict['d1_p_x_bar_p'] = d1_p_x_bar_p
            else:
                d1_p_x_bar_p = None
                extra_param_dict['d1_p_x_bar_p'] = d1_p_x_bar_p

            # KGE 2009 S Paramters
            kge2009_s = [1, 1, 1]

            if float(request.POST.get('kge_2009_s1', None)) != 1:
                kge_2009_s1 = float(request.POST.get('kge_2009_s1', None))
                kge2009_s[0] = kge_2009_s1

            if float(request.POST.get('kge_2009_s2', None)) != 1:
                kge_2009_s2 = float(request.POST.get('kge_2009_s2', None))
                kge2009_s[1] = kge_2009_s2

            if float(request.POST.get('kge_2009_s3', None)) != 1:
                kge_2009_s3 = float(request.POST.get('kge_2009_s3', None))
                kge2009_s[2] = kge_2009_s3

            # KGE 2012 S Paramters
            kge2012_s = [1, 1, 1]

            if float(request.POST.get('kge_2012_s1', None)) != 1:
                kge_2012_s1 = float(request.POST.get('kge_2012_s1', None))
                kge2012_s[0] = kge_2012_s1

            if float(request.POST.get('kge_2012_s2', None)) != 1:
                kge_2012_s2 = float(request.POST.get('kge_2012_s2', None))
                kge2012_s[1] = kge_2012_s2

            if float(request.POST.get('kge_2012_s3', None)) != 1:
                kge_2012_s3 = float(request.POST.get('kge_2012_s3', None))
                kge2012_s[2] = kge_2012_s3

            # Indexing the metrics to get the abbreviations
            selected_metric_abbr = request.POST.getlist("metrics", None)

            # Getting the Units of the Simulated and Observed Data and Converting if Necessary
            obs_units = request.POST.get('observed-units')
            sim_radio = request.POST.get('predicted_radio')

            if sim_radio == 'upload':
                sim_units = request.POST.get('simulated-units-upload')
            else:
                sim_units = request.POST.get('simulated_units_sfpt')

            # Getting the form data to see of the user wants to remove zeros and negatives
            remove_neg_bool = request.POST.get('remove_neg_bool')

            if remove_neg_bool == 'on':
                remove_neg = True
            else:
                remove_neg = False

            remove_zero_bool = request.POST.get('remove_zero_bool')

            if remove_zero_bool == 'on':
                remove_zero = True
            else:
                remove_zero = False

            # Retrieving any date ranges the user wishes to analyze
            date_range_bool = request.POST.get('date_range_bool')

            if date_range_bool == 'on':
                all_date_range_list = []
                date_counter = 1

                while True:
                    date_list = []

                    begin_day = str(request.POST.get('start_day_{}'.format(date_counter), None))
                    if len(begin_day) == 1:
                        begin_day = '0' + begin_day

                    begin_month = str(request.POST.get('start_month_{}'.format(date_counter), None))
                    if len(begin_month) == 1:
                        begin_month = '0' + begin_month

                    end_day = str(request.POST.get('end_day_{}'.format(date_counter), None))
                    if len(end_day) == 1:
                        end_day = '0' + end_day

                    end_month = str(request.POST.get('end_month_{}'.format(date_counter), None))
                    if len(end_month) == 1:
                        end_month = '0' + end_month

                    if begin_day == 'None':
                        break

                    begin_date = '{}-{}'.format(begin_month, begin_day)
                    end_date = '{}-{}'.format(end_month, end_day)
                    date_list.append(begin_date)
                    date_list.append(end_date)

                    all_date_range_list.append(date_list)

                    date_counter += 1

            else:
                all_date_range_list = None

            # Parsing the csv
            merged_df = pd.read_csv(merged_csv, index_col=0)
            merged_df.index = pd.to_datetime(merged_df.index)

            # Converting Units
            if obs_units is None and sim_units is None:
                pass
            elif obs_units == 'on' and sim_units == 'on':
                pass
            elif sim_units is None and obs_units == 'on':
                merged_df.iloc[:, 0] *= 35.314666212661
            else:
                merged_df.iloc[:, 1] *= 35.314666212661

            # Creating the Table Based on User Input
            table = hs.make_table(
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
                kge2009_s=tuple(kge2009_s),
                kge2012_s=tuple(kge2012_s),
                seasonal_periods=all_date_range_list
            )
            table_html = table.transpose()
            table_html = table_html.to_html(classes="table table-hover table-striped").replace('border="1"', 'border="0"')

            return HttpResponse(table_html)

        except Exception:
            traceback.print_exc()

            return HttpResponse("An error occured")


@login_required()
def volume_table_ajax(request):
    """Calculates the volumes of two streams"""

    if request.method == 'POST':
        merged_csv = request.FILES.get('merged_csv', None)

        merged_df = pd.read_csv(merged_csv, index_col=0)

        sim_array = merged_df.iloc[:, 0].values
        obs_array = merged_df.iloc[:, 1].values

        sim_volume = round(integrate.simps(sim_array), 3)
        obs_volume = round(integrate.simps(obs_array), 3)

        resp = {
            "sim_volume": sim_volume,
            "obs_volume": obs_volume,
        }

        return JsonResponse(resp)


@login_required()
def create_persistence_benchmark(request):
    context = {}

    return render(request, 'statistics_calc/create_persistence_benchmark.html', context)


@login_required()
def visualize_persistence_benchmark(request):
    try:
        if request.method == "POST":

            # Getting the Persistence info
            days = request.POST.get('day', None)
            hours = request.POST.get('hours', None)
            minutes = request.POST.get('minutes', None)

            # Getting CSV and reading it
            csv_file = request.FILES.get('water_bal_csv', None)
            water_balance_df = pd.read_csv(csv_file, index_col=0)
            # Changing index to datetime type
            water_balance_df.index = pd.to_datetime(
                water_balance_df.index, infer_datetime_format=True, errors='coerce'
            )
            # Dropping bad time values if necessary
            water_balance_df = water_balance_df[water_balance_df.index.notnull()]

            # Getting the Data into JSON format for response
            date_list = water_balance_df.index.strftime("%Y-%m-%d %H:%M:%S")
            date_list = date_list.tolist()

            timedelta_string = "{} days {} hours {} min".format(days, hours, minutes)
            persistence_date_list = (water_balance_df.index +
                                     pd.Timedelta(timedelta_string)).strftime("%Y-%m-%d %H:%M:%S")
            persistence_date_list = persistence_date_list.tolist()

            data_list = water_balance_df.iloc[:, 0].tolist()

            response = {
                "original_dates": date_list,
                "data": data_list,
                "persistence_dates": persistence_date_list,
                "error_bool": False
            }

            return JsonResponse(response)

        else:
            response = {
                "error_bool": True,
                "error_message": "Request method was not POST."
            }

            return JsonResponse(response)

    except Exception as e:
        print(e)

        response = {
            "error_bool": True,
            "error_message": e
        }

        return JsonResponse(response)


@login_required()
def persistence_benchmark_download(request):
    print("In the download persistence benchmark controller")
    try:
        if request.method == "POST":

            # Sanity Check
            print("In the download persistence benchmark controller")

            # Getting the Persistence info
            days = request.POST.get('day', None)
            hours = request.POST.get('hours', None)
            minutes = request.POST.get('minutes', None)
            timedelta_string = "{} days {} hours {} min".format(days, hours, minutes)

            # Getting CSV and reading it
            csv_file = request.FILES.get('water_bal_csv', None)
            df = pd.read_csv(csv_file, index_col=0)
            # Changing index to datetime type
            df.index = pd.to_datetime(
                df.index, infer_datetime_format=True, errors='coerce'
            )
            # Dropping bad time values if necessary
            df = df[df.index.notnull()]

            # Creating Persistence DF
            df.index = (df.index + pd.Timedelta(timedelta_string))

            # Returning CSV response to user
            response = HttpResponse(content_type='text/csv')
            time_stamp = str(datetime.datetime.utcnow()).replace(" ", "_").replace(":", "")
            response['Content-Disposition'] = 'attachment; filename=persistence_forecasts_{}.csv'.format(time_stamp)
            print('attachment; filename=persistence_forecasts_{}.csv'.format(time_stamp))

            df.to_csv(path_or_buf=response, index_label="Datetime")

            return response

        else:
            response = {
                "error_bool": True,
                "error_message": "Request method was not POST."
            }

            return JsonResponse(response)

    except Exception as e:
        print(e)

        response = {
            "error_bool": True,
            "error_message": e
        }

        return JsonResponse(response)


@login_required()
def process_a_forecast(request):
    context = {}

    return render(request, 'statistics_calc/process_a_forecast.html', context)


@login_required()
def forecast_raw_data_ajax(request):
    print("In the raw forecast data ajax controller!")

    if request.method == "POST":

        # Creating a blank response
        resp = {}

        csv_file = request.FILES.get('forecast_csv', None)

        df = pd.read_csv(csv_file, index_col=0)
        # Changing index to datetime type
        df.index = pd.to_datetime(df.index, infer_datetime_format=True, errors='coerce')
        # Dropping bad time values if necessary
        df = df[df.index.notnull()]

        # Creating a list of the dates and appending it to the response
        date_list = df.index.strftime("%Y-%m-%d %H:%M:%S")
        date_list = date_list.tolist()
        resp['all_dates'] = date_list

        # Appending the dates with all ensamble members to the response
        for i, date in enumerate(date_list):
            resp[date] = df.iloc[i, :].tolist()

        mean_forecast = df.mean(axis=1).tolist()
        resp["ensamble_mean"] = mean_forecast

        return JsonResponse(resp)


@login_required()
def forecast_check_dates_ajax(request):
    """AJAX Controller for the preprocessing page. Checks if the user has made sure that the date range is included in
    the timeseries data"""

    if request.method == "POST":

        # Getting the timeseries range
        csv_file = request.FILES.get('forecast_csv', None)
        df = pd.read_csv(csv_file, index_col=0)
        begin_timeseries = pd.to_datetime(df.index[0])
        end_timeseries = pd.to_datetime(df.index[-1])

        # Getting the beggining and ending date
        begin_date = request.POST.get('begin_date', None)
        end_date = request.POST.get('end_date', None)

        resp = {
            "error": False
        }

        print(pd.isna(begin_date), pd.isna(end_date))
        print(type(begin_date), type(end_date))
        print(begin_date, end_date)

        begin_date = pd.to_datetime(begin_date, errors="coerce")
        end_date = pd.to_datetime(end_date, errors="coerce")

        if begin_timeseries < begin_date < end_timeseries and begin_timeseries < end_date < end_timeseries:
            print("Timescale range is contained in the timeseries")
        else:
            print("Timescale range is not contained in the timeseries!")
            resp = {
                "error": True
            }

        return JsonResponse(resp)


@login_required()
def forecast_plot_ajax(request):
    """
    Controller to create a plot of the processed forecast
    """
    if request.method == "POST":

        # Creating a blank response
        resp = {}

        # Parsing and processing the csv data
        csv_file = request.FILES.get('forecast_csv', None)
        print("Csv file is: {}".format(csv_file))

        df = pd.read_csv(csv_file, index_col=0)
        df.index = pd.to_datetime(df.index, infer_datetime_format=True, errors='coerce')
        df = df[df.index.notnull()]  # Dropping bad time values if necessary

        # Time Scaling
        time_scale_bool = request.POST.get('time_range_bool', None)
        begin_date = request.POST.get('begin_date', None)
        end_date = request.POST.get('end_date', None)
        begin_date = pd.to_datetime(begin_date)  # Convert to Datetime Object
        end_date = pd.to_datetime(end_date)

        if time_scale_bool == "on":
            df = df.loc[begin_date: end_date]

        # Interpolation
        interp_bool = request.POST.get('interpolation_bool', None)
        interp_method = request.POST.get('interp_method', None)
        interp_hours = request.POST.get('interp_hours', None)
        interp_minutes = request.POST.get('interp_minutes', None)

        if interp_bool == "on":
            print("Interpolating!")
            new_index = pd.date_range(df.index[0], df.index[-1], freq="{}H {}min".format(interp_hours, interp_minutes))
            df = df.reindex(new_index)
            df = df.interpolate(interp_method)

        # Creating a list of all of the dates
        all_date_list = df.index.strftime("%Y-%m-%d %H:%M:%S")
        all_date_list = all_date_list.tolist()
        resp['all_dates'] = all_date_list

        # Creating a seperate JSON list for each ensamble
        for i, date in enumerate(all_date_list):
            resp[date] = df.iloc[i, :].tolist()

        # Getting the ensamble mean for the time series
        mean_forecast = df.mean(axis=1).tolist()
        resp["ensamble_mean"] = mean_forecast

        return JsonResponse(resp)


@login_required()
def forecast_csv_ajax(request):
    """Controller to return a csv download of the preprocessed CSV"""
    if request.method == "POST":

        # Parsing and processing the csv data

        csv_file = request.FILES.get('forecast_csv', None)

        df = pd.read_csv(csv_file, index_col=0)
        df.index = pd.to_datetime(df.index, infer_datetime_format=True, errors='coerce')
        df = df[df.index.notnull()]  # Dropping bad time values if necessary

        # Time Scaling

        time_scale_bool = request.POST.get('time_range_bool', None)
        begin_date = request.POST.get('begin_date', None)
        end_date = request.POST.get('end_date', None)
        begin_date = pd.to_datetime(begin_date)  # Convert to Datetime Object
        end_date = pd.to_datetime(end_date)

        if time_scale_bool == "on":
            df = df.loc[begin_date: end_date]

        # Interpolation

        interp_bool = request.POST.get('interpolation_bool', None)
        interp_method = request.POST.get('interp_method', None)
        interp_hours = request.POST.get('interp_hours', None)
        interp_minutes = request.POST.get('interp_minutes', None)

        if interp_bool == "on":
            new_index = pd.date_range(df.index[0], df.index[-1], freq="{}H {}min".format(interp_hours, interp_minutes))
            df = df.reindex(new_index)
            df = df.interpolate(interp_method)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=preprocessed_forecasts.csv'

        df.to_csv(path_or_buf=response, index_label="Datetime")

        return response


@login_required()
def merge_forecast(request):
    context = {}

    return render(request, 'statistics_calc/merge_forecast.html', context)


@login_required()
def merge_forecast_plot_ajax(request):
    # noinspection PyBroadException
    try:
        if request.method == "POST":

            ens_csv = request.FILES.get('ens_csv', None)
            obs_csv = request.FILES.get('obs_csv', None)

            ens_df = pd.read_csv(ens_csv, index_col=0)
            ens_df.index = pd.to_datetime(ens_df.index, infer_datetime_format=True, errors='coerce')
            ens_df = ens_df[ens_df.index.notnull()]  # Dropping bad time values if necessary

            obs_df = pd.read_csv(obs_csv, index_col=0)
            obs_df.index = pd.to_datetime(obs_df.index, infer_datetime_format=True, errors='coerce')
            obs_df = obs_df[obs_df.index.notnull()]  # Dropping bad time values if necessary

            merged_df = pd.DataFrame.join(obs_df, ens_df, lsuffix="_obs").dropna()

            dates_list = merged_df.index.tolist()
            water_balance_list = merged_df.iloc[:, 0].values.tolist()
            ensemble_mean = merged_df.iloc[:, 1:].values.mean(axis=1)
            ensemble_mean_list = ensemble_mean.tolist()
            ensemble_std_dev = merged_df.iloc[:, 1:].values.std(axis=1)
            ensemble_std_dev_list = ensemble_std_dev.tolist()

            response = {
                "dates_list": dates_list,
                "water_balance_list": water_balance_list,
                "ensemble_mean_list": ensemble_mean_list,
                "ensemble_std_dev_list": ensemble_std_dev_list
            }

            return JsonResponse(response)

    except Exception:
        traceback.print_exc()

        response = {
            "backend_error": True,
            "error_message": "Something went wrong while merging the files. Please make sure the files are formatted "
                             "correctly"
        }

        return JsonResponse(response)


def merge_forecast_download_ajax(request):
    # noinspection PyBroadException
    try:
        if request.method == "POST":
            ens_csv = request.FILES.get('ens_csv', None)
            obs_csv = request.FILES.get('obs_csv', None)

            ens_df = pd.read_csv(ens_csv, index_col=0)
            ens_df.index = pd.to_datetime(ens_df.index, infer_datetime_format=True, errors='coerce')
            ens_df = ens_df[ens_df.index.notnull()]  # Dropping bad time values if necessary

            obs_df = pd.read_csv(obs_csv, index_col=0)
            obs_df.index = pd.to_datetime(obs_df.index, infer_datetime_format=True, errors='coerce')
            obs_df = obs_df[obs_df.index.notnull()]  # Dropping bad time values if necessary

            merged_df = pd.DataFrame.join(obs_df, ens_df, lsuffix="_obs").dropna()

            time_stamp = str(datetime.datetime.utcnow()).replace(" ", "_").replace(":", "")
            content_disposition = 'attachment; filename=merged_forecast_data_{}.csv'.format(time_stamp)

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = content_disposition

            merged_df.to_csv(path_or_buf=response, index_label="Datetime")

            return response

    except Exception:
        traceback.print_exc()

        error_message = "<h1>Something went wrong in the form submission, please make sure that your files are " \
                        "formatted correctly.</h1>"

        return HttpResponse(error_message)



@login_required()
def validate_forecast(request):
    context = {}

    return render(request, 'statistics_calc/validate_forecast.html', context)


@login_required()
def validate_forecast_plot(request):
    try:
        forecast_csv = request.FILES.get('forecast_csv', None)
        benchmark_csv = request.FILES.get('benchmark_csv', None)
        skill_score_bool = request.POST.get('skill_score_bool', None)
        skill_score_bool = (skill_score_bool == "on")  # Change to boolean type

        forecast_df = pd.read_csv(forecast_csv, index_col=0)
        forecast_df.index = pd.to_datetime(forecast_df.index, infer_datetime_format=True, errors='coerce')
        forecast_df = forecast_df[forecast_df.index.notnull()]  # Dropping bad time values if necessary

        if skill_score_bool:
            benchmark_df = pd.read_csv(benchmark_csv, index_col=0)
            benchmark_df.index = pd.to_datetime(benchmark_df.index, infer_datetime_format=True, errors='coerce')
            benchmark_df = benchmark_df[benchmark_df.index.notnull()]  # Dropping bad time values if necessary

            num_col_forecast = len(forecast_df.columns)

            merged_df = pd.DataFrame.join(forecast_df, benchmark_df, lsuffix='_forecast', rsuffix='_benchmark')
            obs = merged_df.iloc[:, 0].values
            forecast = merged_df.iloc[:, 1:num_col_forecast].values
            benchmark_forecast = merged_df.iloc[:, num_col_forecast:].values
            dates = merged_df.index.strftime("%Y-%m-%d %H:%M:%S")
            date_list = dates.tolist()

            # Checking if the forecast is ensemble of single time series
            if forecast.shape[1] == 1:
                forecast_error_bool = False
            else:
                forecast_error_bool = True

            # Checking if the benchmark is ensemble of single time series
            if benchmark_forecast.shape[1] == 1:
                benchmark_error_bool = False
            else:
                benchmark_error_bool = True

            if benchmark_error_bool and forecast_error_bool:
                forecast_mean = np.mean(forecast, axis=1)
                forecast_error = np.std(forecast, axis=1, ddof=1)

                benchmark_mean = np.mean(benchmark_forecast, axis=1)
                benchmark_error_bars = np.mean(benchmark_forecast, axis=1)

                response = {
                    "error_bool": False,
                    "skill_score_bool": skill_score_bool,
                    "forecast_error_bool": forecast_error_bool,
                    "benchmark_error_bool": benchmark_error_bool,
                    "observed_data": obs.tolist(),
                    "forecast": forecast_mean.tolist(),
                    "forecast_error": forecast_error.tolist(),
                    "benchmark": benchmark_mean.tolist(),
                    "benchmark_error_bars": benchmark_error_bars.tolist(),
                    "dates": date_list
                }

            if benchmark_error_bool and not forecast_error_bool:
                benchmark_mean = np.mean(benchmark_forecast, axis=1)
                benchmark_error_bars = np.mean(benchmark_forecast, axis=1)

                response = {
                    "error_bool": False,
                    "skill_score_bool": skill_score_bool,
                    "forecast_error_bool": forecast_error_bool,
                    "benchmark_error_bool": benchmark_error_bool,
                    "observed_data": obs.tolist(),
                    "forecast": forecast.tolist(),
                    "benchmark": benchmark_mean.tolist(),
                    "benchmark_error_bars": benchmark_error_bars.tolist(),
                    "dates": date_list
                }

            if not benchmark_error_bool and forecast_error_bool:
                forecast_mean = np.mean(forecast, axis=1)
                forecast_error = np.std(forecast, axis=1, ddof=1)

                response = {
                    "error_bool": False,
                    "skill_score_bool": skill_score_bool,
                    "forecast_error_bool": forecast_error_bool,
                    "benchmark_error_bool": benchmark_error_bool,
                    "observed_data": obs.tolist(),
                    "forecast": forecast_mean.tolist(),
                    "forecast_error": forecast_error.tolist(),
                    "benchmark": benchmark_forecast.flatten().tolist(),
                    "dates": date_list
                }

            if not benchmark_error_bool and not forecast_error_bool:
                response = {
                    "error_bool": False,
                    "skill_score_bool": skill_score_bool,
                    "forecast_error_bool": forecast_error_bool,
                    "benchmark_error_bool": benchmark_error_bool,
                    "observed_data": obs.tolist(),
                    "forecast": forecast.flatten().tolist(),
                    "benchmark": benchmark_forecast.tolist(),
                    "dates": date_list
                }

        else:
            obs = forecast_df.iloc[:, 0].values
            forecast = forecast_df.iloc[:, 1:].values
            dates = forecast_df.index.strftime("%Y-%m-%d %H:%M:%S")
            date_list = dates.tolist()

            print(forecast)

            if forecast.shape[1] == 1:
                forecast_error_bool = False
            else:
                forecast_error_bool = True

            if forecast_error_bool:
                ens_mean = np.mean(forecast, axis=1)
                error = np.std(forecast, axis=1, ddof=1)

                response = {
                    "error_bool": False,
                    "skill_score_bool": skill_score_bool,
                    "forecast_error_bool": forecast_error_bool,
                    "observed_data": obs.tolist(),
                    "forecast": ens_mean.tolist(),
                    "forecast_error": error.tolist(),
                    "dates": date_list
                }

            else:
                response = {
                    "error_bool": False,
                    "skill_score_bool": skill_score_bool,
                    "forecast_error_bool": forecast_error_bool,
                    "observed_data": obs.tolist(),
                    "forecast": forecast.flatten().tolist(),
                    "dates": date_list
                }

        return JsonResponse(response)

    except Exception:
        traceback.print_exc()

        response = {
            "error_bool": True
        }

        return JsonResponse(response)


@login_required()
def validate_forecast_ensemble_metrics(request):
    if request.method == "POST":
        try:
            # Retrieving form data
            csv_file_forecast = request.FILES.get('forecast_csv', None)
            benchmark_file = request.FILES.get('benchmark_csv', None)
            skill_score_bool = request.POST.get('skill_score_bool', None)
            skill_score_bool = (skill_score_bool == "on")  # Change to boolean type

            # Parsing and processing the csv data
            df_forecast = pd.read_csv(csv_file_forecast, index_col=0)
            df_forecast.index = pd.to_datetime(df_forecast.index, infer_datetime_format=True, errors='coerce')
            df_forecast = df_forecast[df_forecast.index.notnull()]  # Dropping bad time values if necessary

            num_col_forecast = len(df_forecast.columns)

            if skill_score_bool:
                df_benchmark = pd.read_csv(benchmark_file, index_col=0)
                df_benchmark.index = pd.to_datetime(df_benchmark.index, infer_datetime_format=True, errors='coerce')
                df_benchmark = df_benchmark[df_benchmark.index.notnull()]  # Dropping bad time values if necessary

                merged_df = pd.DataFrame.join(df_forecast, df_benchmark, lsuffix='_forecast', rsuffix='_benchmark')
                obs = merged_df.iloc[:, 0].values
                forecast = merged_df.iloc[:, 1:num_col_forecast].values
                benchmark_forecast = merged_df.iloc[:, num_col_forecast:].values

                if forecast.ndim == 1:
                    forecast = forecast.reshape((-1, 1))

                if benchmark_forecast.ndim == 1:
                    benchmark_forecast = benchmark_forecast.reshape((-1, 1))

            else:
                obs = df_forecast.iloc[:, 0].values
                forecast = df_forecast.iloc[:, 1:].values

                if forecast.ndim == 1:
                    forecast = forecast.reshape((-1, 1))

            ens_me_forecast = em.ens_me(obs, forecast)
            ens_mae_forecast = em.ens_mae(obs, forecast)
            ens_mse_forecast = em.ens_mse(obs, forecast)
            ens_rmse_forecast = em.ens_rmse(obs, forecast)
            ens_pearson_r_forecast = em.ens_pearson_r(obs, forecast)
            ens_crps_mean_forecast = em.ens_crps(obs, forecast)["crpsMean"]

            if skill_score_bool:
                ens_me_benchmark = em.ens_me(obs, benchmark_forecast)
                ens_mae_benchmark = em.ens_mae(obs, benchmark_forecast)
                ens_mse_benchmark = em.ens_mse(obs, benchmark_forecast)
                ens_rmse_benchmark = em.ens_rmse(obs, benchmark_forecast)
                ens_pearson_r_benchmark = em.ens_pearson_r(obs, benchmark_forecast)
                ens_crps_mean_benchmark = em.ens_crps(obs, benchmark_forecast)["crpsMean"]

                # TODO: Once Hydrostats is fixed remove the manual solution workaround for more robustness
                me_ss = 1 - ens_me_forecast / ens_me_benchmark
                mae_ss = 1 - ens_mae_forecast / ens_mae_benchmark
                mse_ss = 1 - ens_mse_forecast / ens_mse_benchmark
                rmse_ss = 1 - ens_rmse_forecast / ens_rmse_benchmark
                pearson_r_ss = 1 - (ens_pearson_r_forecast - 1) / (ens_pearson_r_benchmark - 1)
                crps_ss = 1 - ens_crps_mean_forecast / ens_crps_mean_benchmark

                data_dict = {
                    'Metric Name': ["Continuous Ranked Probablity Score", "Ensemble Mean Error",
                                    "Ensemble Mean Absolute Error", "Ensemble Mean Squared Error",
                                    "Ensemble Root Mean Square Error", "Ensemble Pearson R"],
                    'Value': [ens_crps_mean_forecast, ens_me_forecast, ens_mae_forecast, ens_mse_forecast,
                              ens_rmse_forecast, ens_pearson_r_forecast],
                    'Benchmark Value': [ens_crps_mean_benchmark, ens_me_benchmark, ens_mae_benchmark, ens_mse_benchmark,
                                        ens_rmse_benchmark, ens_pearson_r_benchmark],
                    'Skill Score': [crps_ss, me_ss, mae_ss, mse_ss, rmse_ss, pearson_r_ss]
                }

                # Creating DataFrame from Dictionary
                table_df = pd.DataFrame.from_dict(data_dict)
                # Reordering columns to be correct
                table_df = table_df[['Metric Name', 'Value', 'Benchmark Value', 'Skill Score']]
                # Rounding all table values
                table_df = table_df.round(3)

                table_df = table_df.to_html(classes="table table-hover table-striped", index=False)
                table_df = table_df.replace('border="1"', 'border="0"')

            else:
                data_dict = {
                    'Metric Name': ["Continuous Ranked Probablity Score", "Ensemble Mean Error",
                                    "Ensemble Mean Absolute Error", "Ensemble Mean Squared Error",
                                    "Ensemble Root Mean Square Error", "Ensemble Pearson R"],
                    'Value': [ens_crps_mean_forecast, ens_me_forecast, ens_mae_forecast, ens_mse_forecast,
                              ens_rmse_forecast, ens_pearson_r_forecast],
                }

                table_df = pd.DataFrame.from_dict(
                    data_dict
                )

                # Reordering columns to be correct
                table_df = table_df[['Metric Name', 'Value']]
                # Rounding all table values
                table_df = table_df.round(3)

                table_df = table_df.to_html(classes="table table-hover table-striped", index=False)
                table_df = table_df.replace('border="1"', 'border="0"')


            response = {
                "error_bool": False,
                "table": table_df
            }

            return JsonResponse(response)

        except Exception as e:

            response = {
                "error_bool": True,
                "error_message": e.args[0]
             }

            return JsonResponse(response)


@login_required()
def validate_forecast_binary_metrics(request):
    if request.method == "POST":
        try:
            print("in binary metrics controller")

            # Parsing and processing the csv data
            csv_file_forecast = request.FILES.get('forecast_csv', None)
            benchmark_file = request.FILES.get('benchmark_csv', None)
            threshold = float(request.POST.get("threshold", None))
            skill_score_bool = request.POST.get('skill_score_bool', None)
            skill_score_bool = (skill_score_bool == "on")  # Change to boolean type

            df_forecast = pd.read_csv(csv_file_forecast, index_col=0)
            df_forecast.index = pd.to_datetime(df_forecast.index, infer_datetime_format=True, errors='coerce')
            df_forecast = df_forecast[df_forecast.index.notnull()]  # Dropping bad time values if necessary

            num_col_forecast = len(df_forecast.columns)

            if skill_score_bool:
                df_benchmark = pd.read_csv(benchmark_file, index_col=0)
                df_benchmark.index = pd.to_datetime(df_benchmark.index, infer_datetime_format=True, errors='coerce')
                df_benchmark = df_benchmark[df_benchmark.index.notnull()]  # Dropping bad time values if necessary

                merged_df = pd.DataFrame.join(df_forecast, df_benchmark, lsuffix='_forecast', rsuffix='_benchmark')
                obs = merged_df.iloc[:, 0].values
                forecast = merged_df.iloc[:, 1:num_col_forecast].values
                benchmark_forecast = merged_df.iloc[:, num_col_forecast:].values

                if forecast.ndim == 1:
                    forecast = forecast.reshape((-1, 1))

                if benchmark_forecast.ndim == 1:
                    benchmark_forecast = benchmark_forecast.reshape((-1, 1))

            else:
                obs = df_forecast.iloc[:, 0].values
                forecast = df_forecast.iloc[:, 1:].values

                if forecast.ndim == 1:
                    forecast = forecast.reshape((-1, 1))

            ens_brier = np.mean(em.ens_brier(forecast, obs, threshold))
            auroc = em.auroc(forecast, obs, threshold)[0]

            if skill_score_bool:
                ens_brier_benchmark = np.mean(em.ens_brier(benchmark_forecast, obs, threshold))
                auroc_benchmark = em.auroc(benchmark_forecast, obs, threshold)[0]

                print(ens_brier, ens_brier_benchmark)
                print(auroc, auroc_benchmark)

                # TODO: Once Hydrostats is fixed remove the manual solution workaround for more robustness
                brier_ss = 1 - ens_brier / ens_brier_benchmark
                auroc_ss = 1 - (auroc - 1) / (auroc_benchmark - 1)

                data_dict = {
                    'Metric Name': ["Brier Score", "Area Under the Relative Operating Characteristic curve (AUROC)"],
                    'Value': [ens_brier, auroc],
                    'Benchmark Value': [ens_brier_benchmark, auroc_benchmark],
                    'Skill Score': [brier_ss, auroc_ss]
                }

                # Creating DataFrame from dict
                table_df = pd.DataFrame.from_dict(data_dict)
                # Reordering columns to be correct
                table_df = table_df[['Metric Name', 'Value', 'Benchmark Value', 'Skill Score']]
                # Rounding all table values
                table_df = table_df.round(3)

                table_df = table_df.to_html(classes="table table-hover table-striped", index=False)
                table_df = table_df.replace('border="1"', 'border="0"')

            else:
                data_dict = {
                    'Metric Name': ["Brier Score", "Area Under the Relative Operating Characteristic curve (AUROC)"],
                    'Value': [ens_brier, auroc],
                 }

                # Creating DataFrame from dict
                table_df = pd.DataFrame.from_dict(data_dict)
                # Reordering columns to be correct
                table_df = table_df[['Metric Name', 'Value']]
                # Rounding all table values
                table_df = table_df.round(3)

                table_df = table_df.to_html(classes="table table-hover table-striped", index=False)
                table_df = table_df.replace('border="1"', 'border="0"')

            response = {
                "error_bool": False,
                "table": table_df
            }

            return JsonResponse(response)

        except Exception as e:

            response = {
                "error_bool": True,
                "error_message": e.args[0]
            }

            return JsonResponse(response)


@login_required()
def timeseries_csv_example(request):
    context = {}

    return render(request, 'statistics_calc/timeseries_csv_example.html', context)


@login_required()
def merged_timeseries_csv_example(request):
    context = {}

    return render(request, 'statistics_calc/merged_timeseries_csv_example.html', context)


@login_required()
def forecast_csv_example(request):
    context = {}

    return render(request, 'statistics_calc/forecast_csv_example.html', context)


@login_required()
def merged_forecast_csv_example(request):
    context = {}

    return render(request, 'statistics_calc/merged_forecast_csv_example.html', context)


@login_required()
def test(request):
    return render(request, 'statistics_calc/test.html', {})
