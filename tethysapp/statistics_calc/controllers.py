# python 2.7
# -*- coding: utf-8 -*-
"""
Created on Jan 16 5:02:32 2018
@author: Wade Roberts
"""
from __future__ import division, print_function

# Django Imports
from django.shortcuts import render, reverse, HttpResponse
from django.contrib.auth.decorators import login_required
# from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse
from django.core import serializers

# Tethys Imports
from tethys_sdk.gizmos import Button, TableView, PlotlyView, TextInput, \
    SelectInput, ToggleSwitch, DatePicker, TextInput
from .app import StatisticsCalc as app

# Data Management and Plotting imports
import pandas as pd
import sqlite3
import plotly.graph_objs as go
import numpy as np
import sympy as sp
from matplotlib import use as matplotlib_use
import matplotlib.pyplot as plt
from scipy import integrate

# Hydrostats Imports
import hydrostats as hs
from hydrostats.metrics import metric_names, metric_abbr
import hydrostats.visual as hv
import hydrostats.data as hd

# Various Python Standard Library Imports
import requests
import os
import shutil
import datetime
from StringIO import StringIO
from pytz import all_timezones

# Setting the Matplotlib Backend
matplotlib_use('Agg')


@login_required()
def home(request):
    """
    Controller for the app home page.
    """

    first_name = request.user.get_short_name()

    if first_name == "":
        first_name = "there"

    context = {
        "first_name": first_name,
    }

    print(first_name)

    return render(request, 'statistics_calc/home.html', context)


@login_required()
def calculate_single(request):
    """
    Controller for page to upload data to perform analysis on a single stream reach.
    """
    # Getting metric names from the hydrostats package and abbreviation names for dynamic rendering

    metric_loop_list = list(zip(metric_names, metric_abbr))

    context = {'metric_loop_list': metric_loop_list}

    # Displaying all of the plots to users to select which ones they want.
    list_of_plots = ['Hydrograph', 'Scatter Plot', 'Scatter Plot (Log Scale)', 'Histogram', 'Quantile-Quantile Plot',
                     'Hydrograph', 'Hydrograph with Error Bars (Standard Deviation)',
                     'Hydrograph with Error Bars (Standard Error)', 'Scatter Plot']

    context['list_of_plots'] = list_of_plots

    # I commented this code because the API was being slow, when the app deploys we need to change it back
    """# Calling the REST API for watershed names
    request_headers = dict(Authorization='Token 3e6d5a373ff8230ccae801bf0758af9f43922e32')

    print("About to request headers")

    res = requests.get('http://tethys-staging.byu.edu/apps/streamflow-prediction-tool/api/GetWatersheds/',
                       headers=request_headers)
    print('The API response for headers is:')
    print(res)
    print(res.content)

    # Formatting the watershed names
    watershed_error = False
    try:
        names = res.json()
        watersheds = []
        for i in range(len(names)):
            watersheds.append(names[i][0])
            # Adding the watersheds to the context
        context['watersheds'] = watersheds
    except ValueError:
        watershed_error = True
        if watershed_error:
            print('There is an error with the watershed API call.')"""

    watershed_error = False
    context['watershed_error'] = watershed_error

    watersheds = ['South Asia (Mainland)']
    context['watersheds'] = watersheds

    # Adding the timezones
    context['timezones'] = all_timezones

    return render(request, 'statistics_calc/calculate_single.html', context)


# @login_required()
# def single_results(request):
#     """
#     Controller for page to upload data to perform analysis on a single stream reach.
#     """
#     # Setting the context to an empty dictionary so I can append to it
#     context = {}
#
#     # Calling the REST API for watershed names
#     request_headers = dict(Authorization='Token 3e6d5a373ff8230ccae801bf0758af9f43922e32')
#
#     res = requests.get('http://tethys-staging.byu.edu/apps/streamflow-prediction-tool/api/GetWatersheds/',
#                        headers=request_headers)
#
#     # Formatting the watershed names
#     names = res.json()
#     watersheds = []
#     for i in range(len(names)):
#         watersheds.append(names[i][0])
#
#     # Default Values
#     stream_id = 'Enter the Stream ID here'
#
#     # Errors
#     data_error = ''
#     data_upload_error = ''
#     stream_id_error = ''
#     watershed_error = ''
#     metrics_error = ''
#
#     # Handle form submission
#     if request.POST and 'add-button' in request.POST:
#
#         # Get Values
#         has_errors = False
#
#         if request.FILES:
#             # Retrieving the gauge data csv
#             gauge_data = request.FILES.get('gauge_data_upload')
#             print('Gauge Data is: ')
#             print(gauge_data)
#
#         # Retrieving the stream ID
#         stream_id = request.POST.get('stream_id', None)
#         print('Stream ID is: ')
#         print(stream_id)
#
#         # Retrieving the watershed
#         watershed = request.POST.get('watershed_select_input', None)
#         print('Watershed is: ')
#         print(watershed)
#
#         # Retrieving the selected metrics
#         selected_metrics = request.POST.getlist('metrics', None)
#         print('Selected Metrics are: ')
#         print(selected_metrics)
#         watershed_name = watershed[:watershed.find('(') - 1]
#
#         # Retrieving the toggle switch data
#         time_series_bool = request.POST.get('time_series', None)
#         if time_series_bool == u'on':
#             context['time_series_bool'] = True
#         else:
#             context['time_series_bool'] = False
#
#         daily_average_bool = request.POST.get('daily_average', None)
#         if daily_average_bool == u'on':
#             context['daily_average_bool'] = True
#         else:
#             context['daily_average_bool'] = False
#
#         monthly_average_bool = request.POST.get('monthly_average', None)
#         if monthly_average_bool == u'on':
#             context['monthly_average_bool'] = True
#         else:
#             context['monthly_average_bool'] = False
#
#         histogram_bool = request.POST.get('histogram', None)
#         if histogram_bool == u'on':
#             context['histogram_bool'] = True
#         else:
#             context['histogram_bool'] = False
#
#         scatter_bool = request.POST.get('scatter', None)
#         if scatter_bool == u'on':
#             context['scatter_bool'] = True
#         else:
#             context['scatter_bool'] = False
#
#         # Retrieving the seasonal data if requested
#         date_range_begin = request.POST.get('date_range_begin_picker', None)
#         print('The beginning date range is: ')
#         print(date_range_begin)
#
#         date_range_end = request.POST.get('date_range_end_picker', None)
#         print('The ending date range is: ')
#         print(date_range_end)
#
#         seasonal_period_begin = request.POST.get('seasonal_period_begin_text')
#         print('The begin seasonal period is: ')
#         print(seasonal_period_begin)
#
#         seasonal_period_end = request.POST.get('seasonal_period_end_text')
#         print('The ending seasonal period is: ')
#         print(seasonal_period_end)
#
#         if date_range_begin and date_range_end and seasonal_period_begin and seasonal_period_end:
#             # Making lists for the time ranges if there were entries
#             calculate_seasonal = True
#             date_range_list = [date_range_begin, date_range_end]
#             seasonal_period_list = [seasonal_period_begin, seasonal_period_end]
#         else:
#             calculate_seasonal = False
#
#         # Validate
#         if not request.FILES.get('gauge_data_upload'):
#             has_errors = True
#             data_error = 'Gauge data is required.'
#
#             # Adding data error to the context
#             context['data_error'] = data_error
#
#         if not stream_id or stream_id == 'Enter the Stream ID here':
#             has_errors = True
#             stream_id_error = 'Stream ID is required.'
#
#         if not request.POST.get('watershed_select_input', None):
#             has_errors = True
#             watershed_error = 'Watershed is required.'
#
#         if not request.POST.getlist('metrics', None):
#             has_errors = True
#             metrics_error = 'Metrics are required'
#
#         if request.FILES.get('gauge_data_upload') and stream_id != 'Enter the Stream ID here' \
#                 and request.POST.get('watershed_select_input', None) and request.POST.getlist('metrics', None):
#
#             # Formatting the watershed name to fit the API if neccessary
#             if watershed_name.find(" ") != -1:
#                 watershed_name = watershed_name.replace(" ", '_')
#             print('Formatted watershed name is :' + watershed_name)
#
#             # Formatting the subbasin name as well
#             subbasin_name = watershed[watershed.find('(') + 1:watershed.find(')')]
#             print('Formatted subbasin name is :' + subbasin_name)
#
#             def parse_api_request(watershed, subbasin, reach):
#                 """Function to parse the predicted data from the API request"""
#                 request_headers_in_function = dict(Authorization='Token 3e6d5a373ff8230ccae801bf0758af9f43922e32')
#                 request_params = dict(watershed_name=watershed, subbasin_name=subbasin, reach_id=reach,
#                                       return_format='csv')
#                 forecasted_string_data = requests.get(
#                     'http://tethys-staging.byu.edu/apps/streamflow-prediction-tool/api'
#                     '/GetHistoricData/',
#                     params=request_params, headers=request_headers_in_function)
#                 print('The string data from the API is:')
#                 print(forecasted_string_data.content)
#
#                 data = StringIO(forecasted_string_data.content)
#
#                 return pd.read_csv(data, delimiter=",", header=None, names=['predicted streamflow'],
#                                    index_col=0, skiprows=1)
#
#             # Creating the predicted data frame based on the API info
#             df_predicted = parse_api_request(watershed=watershed_name, subbasin=subbasin_name, reach=int(stream_id))
#             # Changing the predicted df index to datetime type
#             df_predicted.index = pd.to_datetime(df_predicted.index, infer_datetime_format=True)
#             print("Predicted Df is:")
#             # print(df_predicted)
#
#             if df_predicted.empty:
#                 has_errors = True
#                 data_upload_error = 'Either the gauge data is improperly formatted or the Reach ID is incorrect (It ' \
#                                     'may also be a server time-out error). '
#
#                 # Adding the data_upload_error to the context
#                 context['data_upload_error'] = data_upload_error
#
#         if not has_errors:
#
#             # Adding calculate to the context as True
#             context['calculate'] = True
#
#             # Creating the recorded data frame from the file upload
#             df_recorded = pd.read_csv(gauge_data, delimiter=",", header=None, names=['recorded streamflow'],
#                                       index_col=0, infer_datetime_format=True, skiprows=1)
#             print('Recorded Df is:')
#             print(df_recorded)
#
#             # Converting the recorded df index to datetime type
#             df_recorded.index = pd.to_datetime(df_recorded.index, infer_datetime_format=True)
#
#             # Joining the two data frames
#             df_merged = pd.DataFrame.join(df_predicted, df_recorded).dropna()
#             print('The merged df is:')
#             print(df_merged)
#
#             # Using conditional statements to for when a user wants to see seasonal error metrics
#             if calculate_seasonal:
#                 # Getting numpy arrays that have the seasonal period data
#                 predicted_array, observed_array = hd.seasonal_period(merged_dataframe=df_merged,
#                                                                      daily_period=seasonal_period_list,
#                                                                      time_range=date_range_list,
#                                                                      numpy=True)
#                 print('The Predicted array is: ')
#                 print(predicted_array)
#                 print('The Observed array is: ')
#                 print(observed_array)
#                 if predicted_array.size == 0 and observed_array.size == 0:
#                     """if there is nothing in the arrays, then it will just calculate the normal data
#                        and not the seasonal period data as well as raise an error"""
#                     seasonal_data_error = 'An Error was raised when calculating the Seasonal Metrics, the full data ' \
#                                           'set was used to calculate the metrics instead '
#
#                     # Adding seasonal_data error to the context
#                     context['seasonal_data_error'] = seasonal_data_error
#
#                     predicted_array = df_merged.iloc[:, 0].as_matrix()
#                     print('The Predicted array is: ')
#                     print(predicted_array)
#                     observed_array = df_merged.iloc[:, 1].as_matrix()
#                     print('The Observed array is: ')
#                     print(observed_array)
#
#             else:
#                 predicted_array = df_merged.iloc[:, 0].as_matrix()
#                 print('The Predicted array is: ')
#                 print(predicted_array)
#                 observed_array = df_merged.iloc[:, 1].as_matrix()
#                 print('The Observed array is: ')
#                 print(observed_array)
#
#             # Connecting to the SQL Database
#             conn = sqlite3.connect(
#                 '//home//wade//tethysdev//tethysapp-statistics_calc//tethysapp//statistics_calc//stat_app.db')
#             # Calculating the metrics values
#             metrics_df = md.sql_table(forecasted_array=predicted_array, observed_array=observed_array,
#                                       watershed=watershed, reach_ID=stream_id)
#             print("The metrics DF is: ")
#             print(metrics_df)
#
#             # Saving the metrics DF to an SQL Database
#             # metrics_df.to_sql('Metrics', con=conn, if_exists='append', index=False)
#
#             # Creating a new list for just the selected metrics
#             metrics = md.select_metrics(metrics_df, selected_metrics)
#             df_daily = hd.daily_average(merged_data=df_merged)
#             df_monthly = hd.monthly_average(merged_data=df_merged)
#
#             # Plotting the Time Series Plot
#             if time_series_bool:
#                 print("I AM PLOTTING THE TIME SERIES!!!")
#                 recorded_plot = go.Scatter(
#                     x=df_merged.index,
#                     y=df_merged['recorded streamflow'],
#                     mode='lines',
#                     line=dict(
#                         color='rgb(205, 12, 24)'
#                     ),
#                     name='Recorded Streamflow'
#                 )
#
#                 predicted_plot = go.Scatter(
#                     x=df_merged.index,
#                     y=df_merged['predicted streamflow'],
#                     mode='lines',
#                     name='Predicted Streamflow'
#                 )
#
#                 data = [recorded_plot, predicted_plot]
#
#                 my_plotly_view_time_series = PlotlyView(go.Figure(data=data))
#
#                 # Adding the time series graph to the context
#                 context['my_plotly_view_time_series'] = my_plotly_view_time_series
#
#             # Plotting the Daily Averages
#             if daily_average_bool:
#                 print("I AM PLOTTING THE DAILY AVERAGES!!!")
#                 recorded_plot2 = go.Scatter(
#                     x=df_daily.index,
#                     y=df_daily['recorded streamflow'],
#                     mode='lines',
#                     line=dict(
#                         color='rgb(205, 12, 24)'
#                     ),
#                     name='Recorded Streamflow (Daily Average)'
#                 )
#
#                 predicted_plot2 = go.Scatter(
#                     x=df_daily.index,
#                     y=df_daily['predicted streamflow'],
#                     mode='lines',
#                     name='Predicted Streamflow (Daily Average)'
#                 )
#
#                 data2 = [recorded_plot2, predicted_plot2]
#
#                 my_plotly_view_daily_average = PlotlyView(go.Figure(data=data2))
#
#                 # Adding the daily average graph to the context
#                 context['my_plotly_view_daily_average'] = my_plotly_view_daily_average
#
#             if monthly_average_bool:
#                 print("I AM PLOTTING THE MONTHLY AVERAGES!!!")
#                 recorded_plot3 = go.Scatter(
#                     x=df_monthly.index,
#                     y=df_monthly['recorded streamflow'],
#                     mode='lines',
#                     line=dict(
#                         color='rgb(205, 12, 24)'
#                     ),
#                     name='Recorded Streamflow (Monthly Average)'
#                 )
#
#                 predicted_plot3 = go.Scatter(
#                     x=df_monthly.index,
#                     y=df_monthly['predicted streamflow'],
#                     mode='lines',
#                     name='Predicted Streamflow (Monthly Average)'
#                 )
#
#                 data3 = [recorded_plot3, predicted_plot3]
#
#                 my_plotly_view_monthly_average = PlotlyView(go.Figure(data=data3))
#
#                 # Adding the monthly average graph to the context
#                 context['my_plotly_view_monthly_average'] = my_plotly_view_monthly_average
#
#                 # Plotting the Histogram
#             if histogram_bool:
#                 print("I AM PLOTTING THE HISTOGRAM!!!")
#
#                 # Normalizing the Data
#                 sim_normal = (df_merged['predicted streamflow'] -
#                               np.mean(df_merged['predicted streamflow'])) / np.std(df_merged['predicted streamflow'])
#                 obs_normal = (df_merged['recorded streamflow'] -
#                               np.mean(df_merged['recorded streamflow'])) / np.std(df_merged['recorded streamflow'])
#
#                 trace1 = go.Histogram(
#                     x=sim_normal,
#                     histnorm='count',
#                     name='Simulated Data',
#                     xbins=dict(
#                         start=-7.0,
#                         end=7.0,
#                         size=0.25
#                     ),
#                     marker=dict(
#                         color='#7CEA49',
#                     ),
#                     opacity=0.75
#                 )
#
#                 trace2 = go.Histogram(
#                     x=obs_normal,
#                     histnorm='count',
#                     name='Observed Data',
#                     xbins=dict(
#                         start=-7.0,
#                         end=7.0,
#                         size=0.25
#                     ),
#                     marker=dict(
#                         color='#70DEEF'
#                     ),
#                     opacity=0.75
#                 )
#
#                 data = [trace1, trace2]
#
#                 layout = go.Layout(
#                     title='Normalized Predicted and Observed Streamflow Histograms',
#                     xaxis=dict(
#                         title='Value'
#                     ),
#                     yaxis=dict(
#                         title='Count'
#                     ),
#                     bargap=0.2,
#                     bargroupgap=0.1
#                 )
#
#                 my_plotly_view_histogram = PlotlyView(go.Figure(data=data, layout=layout))
#
#                 # Adding the histogram to the context
#                 context['my_plotly_view_histogram'] = my_plotly_view_histogram
#
#             # Plotting the Scatter Plot
#             if scatter_bool:
#                 print("I AM PLOTTING THE SCATTER PLOT!!!")
#                 # Getting a polynomial fit and defining a function with it
#                 p = np.polyfit(df_merged['predicted streamflow'], df_merged['recorded streamflow'], 1)
#                 f = np.poly1d(p)
#
#                 # calculate new x's and y's
#                 x_new = np.linspace(0, df_merged['predicted streamflow'].max(), df_merged['recorded streamflow'].size)
#                 y_new = f(x_new)
#
#                 # Formatting the best fit equation to be able to display in latex
#                 x = sp.symbols("x")
#                 poly = sum(sp.S("{:6.4f}".format(v)) * x ** i for i, v in enumerate(p[::-1]))
#                 eq_latex = sp.printing.latex(poly)
#
#                 # Trace for all of the scatter points
#                 trace1 = go.Scatter(
#                     x=df_merged['predicted streamflow'],
#                     y=df_merged['recorded streamflow'],
#                     mode='markers',
#                     marker=dict(
#                         color='#15E0EA',
#                         line=dict(width=1)
#                     )
#                 )
#
#                 # Trace for the best fit line
#                 trace2 = go.Scatter(
#                     x=x_new,
#                     y=y_new,
#                     mode='lines+text',
#                     line=dict(
#                         color='#000000',
#                         width=1
#                     )
#                 )
#
#                 # Plotting
#                 data = [trace1, trace2]
#
#                 layout = go.Layout(
#                     showlegend=False,
#                     title='Observed and Forecasted Streamflow Scatter Plot',
#                     xaxis=dict(
#                         title='Simulated Streamflow (m^3 / s)'),
#                     yaxis=dict(
#                         title='Observed Streamflow (m^3 / s)'),
#                     annotations=[
#                         dict(
#                             x=x_new[int(x_new.size * 0.75)],
#                             y=f(x_new[int(x_new.size * 0.75)]),
#                             xref='x',
#                             yref='y',
#                             text=eq_latex,
#                             showarrow=True,
#                             arrowhead=2,
#                             ax=-40,
#                             ay=-40
#                         )
#                     ],
#                 )
#
#                 my_plotly_view_scatter = PlotlyView(go.Figure(data=data, layout=layout))
#
#                 # Adding the scatter plot to the context
#                 context['my_plotly_view_scatter'] = my_plotly_view_scatter
#
#             # Creating the Table of Metrics
#             table_view = TableView(column_names=('Metric Name', 'Result'),
#                                    rows=metrics,
#                                    hover=True,
#                                    striped=False,
#                                    bordered=False,
#                                    condensed=False)
#
#             # Adding the table view to the context
#             context['table_view'] = table_view
#
#             # Create the HttpResponse object with the appropriate CSV header.
#             # response = HttpResponse(content_type='text/csv')
#             # response['Content-Disposition'] = 'attachment; filename="somefilename.csv"'
#             #
#             # writer = csv.writer(response)
#             # writer.writerow(['datetime', 'streamflow'])
#
#     stream_id_input = TextInput(
#         display_text='Reach ID',
#         name='stream_id',
#         error=stream_id_error,
#     )
#
#     # Adding the stream ID input to the context
#     context['stream_id_input'] = stream_id_input
#
#     watershed_select_input = SelectInput(display_text='Select a Watershed',
#                                          name='watershed_select_input',
#                                          multiple=False,
#                                          options=zip(watersheds, watersheds),
#                                          initial=['Three'],
#                                          select2_options={'placeholder': '', 'allowClear': True},
#                                          error=watershed_error
#                                          )
#
#     # Adding the watershed_select_input to the context
#     context['watershed_select_input'] = watershed_select_input
#
#     metric_select_input = SelectInput(display_text='Select Metrics',
#                                       name='metrics',
#                                       multiple=True,
#                                       original=True,
#                                       options=zip(metric_names, metric_names),
#                                       error=metrics_error
#                                       )
#
#     # Adding the metric_select_input to the context
#     context['metric_select_input'] = metric_select_input
#
#     add_button = Button(
#         display_text='Calculate',
#         name='add-button',
#         icon='glyphicon',
#         style='success',
#         attributes={'form': 'add-data-form'},
#         submit=True
#     )
#
#     # Adding the add_button to the context
#     context['add_button'] = add_button
#
#     cancel_button = Button(
#         display_text='Home',
#         name='cancel-button',
#         href=reverse('statistics_calc:home')
#     )
#
#     # Adding the cancel_button to the context
#     context['cancel_button'] = cancel_button
#
#     time_series_toggle = ToggleSwitch(display_text='Streamflow Plot',
#                                       name='time_series',
#                                       on_label='Yes',
#                                       off_label='No',
#                                       )
#
#     # Adding the time_series_toggle to the context
#     context['time_series_toggle'] = time_series_toggle
#
#     daily_average_toggle = ToggleSwitch(display_text='Daily Average Streamflow Plot',
#                                         name='daily_average',
#                                         on_label='Yes',
#                                         off_label='No',
#                                         )
#
#     # Adding the daily_average_toggle to the context
#     context['daily_average_toggle'] = daily_average_toggle
#
#     monthly_average_toggle = ToggleSwitch(display_text='Monthly Average Streamflow Plot',
#                                           name='monthly_average',
#                                           on_label='Yes',
#                                           off_label='No',
#                                           )
#
#     # Adding the monthly_average_toggle to the context
#     context['monthly_average_toggle'] = monthly_average_toggle
#
#     histogram_toggle = ToggleSwitch(display_text='Histogram',
#                                     name='histogram',
#                                     on_label='Yes',
#                                     off_label='No',
#                                     )
#
#     # Adding the histogram_toggle to the context
#     context['histogram_toggle'] = histogram_toggle
#
#     # Scatter Toggle Gizmo
#     scatter_toggle = ToggleSwitch(display_text='Scatter Plot',
#                                   name='scatter',
#                                   on_label='Yes',
#                                   off_label='No',
#                                   )
#
#     # Adding the scatter_toggle to the context
#     context['scatter_toggle'] = scatter_toggle
#
#     # Date Range Begin Gizmo
#     date_range_begin = DatePicker(name='date_range_begin_picker',
#                                   display_text='Begin Date',
#                                   autoclose=True,
#                                   format='yyyy-mm-d',
#                                   start_date='01/01/1980',
#                                   start_view='decade',
#                                   today_button=True, )
#
#     # Adding the Date Range Begin to the context
#     context['date_range_begin'] = date_range_begin
#
#     # Date Range End Gizmo
#     date_range_end = DatePicker(name='date_range_end_picker',
#                                 display_text='End Date',
#                                 autoclose=True,
#                                 format='yyyy-mm-d',
#                                 start_date='01/01/1980',
#                                 start_view='decade',
#                                 today_button=True, )
#
#     # Adding the Date Range End to the context
#     context['date_range_end'] = date_range_end
#
#     # Adding the seasonal period begin gizmo
#     seasonal_period_begin = TextInput(display_text='Seasonal Period Beginning',
#                                       name='seasonal_period_begin_text',
#                                       )
#
#     # Adding the seasonal period begin to the context
#     context['seasonal_period_begin'] = seasonal_period_begin
#
#     # Adding the seasonal period end gizmo
#     seasonal_period_end = TextInput(display_text='Seasonal Period Ending',
#                                     name='seasonal_period_end_text',
#                                     )
#
#     # Adding the seasonal period end to the context
#     context['seasonal_period_end'] = seasonal_period_end
#
#     return render(request, 'statistics_calc/add_data.html', context)


@login_required()
def validate_multiple_streams(request):
    """
    Controller for the add country data page.
    """
    # Getting metric names from the hydrostats package and abbreviation names for dynamic rendering
    metric_abbrs = metric_abbr

    metric_loop_list = list(zip(metric_names, metric_abbrs))

    context = {'metric_loop_list': metric_loop_list}

    # Displaying all of the plots to users to select which ones they want.
    list_of_plots = ['Hydrograph', 'Scatter Plot', 'Scatter Plot (Log Scale)', 'Histogram', 'Quantile-Quantile Plot',
                     'Hydrograph',
                     'Hydrograph with Error Bars (Standard Deviation)',
                     'Hydrograph with Error Bars (Standard Error)',
                     'Scatter Plot']

    context['list_of_plots'] = list_of_plots

    # I commented this code because the API was being slow, when the app deploys we need to change it back
    """# Calling the REST API for watershed names
    request_headers = dict(Authorization='Token 3e6d5a373ff8230ccae801bf0758af9f43922e32')

    print("About to request headers")

    res = requests.get('http://tethys-staging.byu.edu/apps/streamflow-prediction-tool/api/GetWatersheds/',
                       headers=request_headers)
    print('The API response for headers is:')
    print(res)
    print(res.content)

    # Formatting the watershed names
    watershed_error = False
    try:
        names = res.json()
        watersheds = []
        for i in range(len(names)):
            watersheds.append(names[i][0])
            # Adding the watersheds to the context
        context['watersheds'] = watersheds
    except ValueError:
        watershed_error = True
        if watershed_error:
            print('There is an error with the watershed API call.')"""

    watershed_error = False
    context['watershed_error'] = watershed_error

    watersheds = ['South Asia (Mainland)']
    context['watersheds'] = watersheds

    return render(request, 'statistics_calc/validate_multiple_streams.html', context)


@login_required()
def some_view(request):
    """Create the HttpResponse for the zip file with content"""

    # Function to parse the predicted data from the API request
    def parse_api_request(watershed_api, subbasin_api, reach_api):

        request_headers_in_function = dict(Authorization='Token 3e6d5a373ff8230ccae801bf0758af9f43922e32')
        request_params = dict(watershed_name=watershed_api, subbasin_name=subbasin_api, reach_id=reach_api,
                              return_format='csv')
        forecasted_string_data = requests.get(
            'http://tethys-staging.byu.edu/apps/streamflow-prediction-tool/api'
            '/GetHistoricData/',
            params=request_params, headers=request_headers_in_function)

        data = StringIO(forecasted_string_data.content)

        return pd.read_csv(data, delimiter=",", header=None, names=['predicted streamflow'],
                           index_col=0, skiprows=1)

    # Setting response to none in case of errors
    response = HttpResponse()

    # Handle form submission
    if request.method == 'POST':
        # Station Name
        station_name = request.POST.get('station_name', None)
        print("Station Name:{}".format(station_name))

        # Units
        units = request.POST.get('units', None)
        print("Units:{}".format(units))

        # Observed Data
        gauge_data = request.FILES.get('gauge_data_upload', None)
        print("Oberved Data:{}".format(gauge_data))

        # Simulated Data
        predicted_type = request.POST.get("predicted", None)
        print("Predicted Type: {}".format(predicted_type))

        if predicted_type == "upload":
            simulated_file = request.FILES.get("predicted_data_upload", None)
            reach_id = None
            watershed = None
            subbasin = None
        elif predicted_type == "sfpt":
            simulated_file = None
            reach_id = request.POST.get("reach_id", None)
            watershed_raw = request.POST.get("watershed", None)
            if watershed_raw is not None:
                # Formatting the watershed name to fit the API if necessary
                if watershed_raw.find(" ") != -1:
                    watershed = watershed_raw.split(' (')[0]
                    watershed = watershed.replace(" ", '_')
                else:
                    watershed = watershed_raw
                print('Formatted watershed name is: {}'.format(watershed))
                # Formatting the sub-basin name as well
                subbasin = watershed_raw[watershed_raw.find('(') + 1:watershed_raw.find(')')]
                print('Formatted subbasin name is: {}'.format(subbasin))
            else:
                watershed = None
                subbasin = None
        else:
            simulated_file = None
            reach_id = None
            watershed = None
            subbasin = None

        print("Simulated File: {}".format(simulated_file))
        print("Reach ID: {}".format(reach_id))
        print("Watershed: {}".format(watershed))
        print("Subbasin: {}".format(subbasin))

        # Remove Negative and Zero Booleans
        remove_neg = request.POST.get("remove_neg", None)
        remove_zero = request.POST.get("remove_zero", None)
        print("Remove Negative: {}".format(remove_neg))
        print("Remove Zero: {}".format(remove_zero))

        # Retrieving the User data From Selecting Metrics:
        list_of_metric_post_data = []

        metric_abbreviations = hs.metric_abbr

        for metric_abbreviation in metric_abbreviations:
            list_of_metric_post_data.append(request.POST.get(metric_abbreviation, None))

        # Retrieving Extra Parameters Required for some metrics
        if request.POST.get('mase_m', None) is not None:
            mase_m = float(request.POST.get('mase_m', None))
        else:
            mase_m = None

        if request.POST.get('dmod_j', None) is not None:
            dmod_j = float(request.POST.get('dmod_j', None))
        else:
            dmod_j = None

        if request.POST.get('nse_mod_j', None) is not None:
            nse_mod_j = float(request.POST.get('nse_mod_j', None))
        else:
            nse_mod_j = None

        if request.POST.get('h6_k_MHE', None) is not None:
            h6_mhe_k = float(request.POST.get('h6_k_MHE', None))
        else:
            h6_mhe_k = None

        if request.POST.get('h6_k_AHE', None) is not None:
            h6_ahe_k = float(request.POST.get('h6_k_AHE', None))
        else:
            h6_ahe_k = None

        if request.POST.get('h6_k_RMSHE', None) is not None:
            h6_rmshe_k = float(request.POST.get('h6_k_RMSHE', None))
        else:
            h6_rmshe_k = None

        if request.POST.get('lm_x_bar', None) is not None:
            lm_x_bar_p = float(request.POST.get('lm_x_bar', None))
        else:
            lm_x_bar_p = None

        if request.POST.get('d1_p_x_bar', None) is not None:
            d1_p_x_bar_p = float(request.POST.get('d1_p_x_bar', None))
        else:
            d1_p_x_bar_p = None

        # Retriving the selected metrics and creating a list of their functions
        list_of_metric_names = hs.HydrostatsVariables.metric_names

        selected_metric_names = []

        for name_index, post_data in enumerate(list_of_metric_post_data):
            if post_data == 'on':
                selected_metric_names.append(list_of_metric_names[name_index])

        # Date Ranges
        date_range_bool = request.POST.get('date_range_bool')

        if date_range_bool == 'on':
            all_date_range_list = []
            date_counter = 0

            while True:
                date_list = []

                begin_day = str(request.POST.get('begin_day{}'.format(date_counter), None))
                if len(begin_day) == 1:
                    begin_day = '0' + begin_day

                begin_month = str(request.POST.get('begin_month{}'.format(date_counter), None))
                if len(begin_month) == 1:
                    begin_month = '0' + begin_month

                end_day = str(request.POST.get('end_day{}'.format(date_counter), None))
                if len(end_day) == 1:
                    end_day = '0' + end_day

                end_month = str(request.POST.get('end_month{}'.format(date_counter), None))
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

            print("The date ranges are: {}".format(all_date_range_list))

        else:
            print('The User Did not want to do a date range analysis')

        # Retrieving Plot Information
        list_of_plots = ['Hydrograph', 'Scatter Plot', 'Scatter Plot (Log Scale)', 'Histogram',
                         'Quantile-Quantile Plot',
                         'Hydrograph',
                         'Hydrograph with Error Bars (Standard Deviation)',
                         'Hydrograph with Error Bars (Standard Error)',
                         'Scatter Plot']
        post_data_plots = []
        for plot in list_of_plots[:5]:
            post_data_plots.append(request.POST.get(plot))
        for plot in list_of_plots[5:]:
            post_data_plots.append(request.POST.get(plot + '_daily_average'))

        print("Plot Booleans are: {}".format(post_data_plots))

        # Retrieving Volume Table POST info
        volume_table_bool = request.POST.get('volume_table')
        print('Volume Table Bool: {}'.format(volume_table_bool))

        # Validate Form Data
        has_errors = False  # Setting has errors to false in case of no errors

        if units == 'si':
            streamflow = 'csf'
        elif units == 'bg':
            streamflow = 'cms'
        else:
            has_errors = True
            response.write('<p>An error occured with the units.</p>')

        if gauge_data is None:
            has_errors = True
            response.write('<p>Gauge Data is required.</p>')

        if predicted_type == 'upload':
            if simulated_file is None:
                has_errors = True
                response.write('<p>Simulated data file is required.</p>')

        if predicted_type == 'sfpt':
            if watershed_raw is None or reach_id is None:
                has_errors = True
                response.write('<p>Reach ID and Watershed are required to call the SFPT API.</p>')

        if not selected_metric_names:
            has_errors = True
            response.write('<p>You must select at least one metric</p>')

        if not has_errors:
            # Creating a directory to store the csv and plots in
            app_workspace = app.get_app_workspace()

            count = 1

            while True:
                zip_dir = os.path.join(app_workspace.path, 'dir' + str(count))
                if os.path.exists(zip_dir):
                    count += 1
                if not os.path.exists(zip_dir):
                    os.mkdir(zip_dir)
                    break

            # Reading the file into pandas df
            obs_df = pd.read_csv(gauge_data, delimiter=',', index_col=0, columns=['Observed Data'])

            if predicted_type == 'upload':
                sim_df = pd.read_csv(simulated_file, delimiter=',', index_col=0, columns=['Simulated Data'])
            elif predicted_type == 'sfpt':
                # getting the predicted data from the api and parsing it
                sim_df = parse_api_request(watershed_api=watershed, subbasin_api=subbasin,
                                           reach_api=int(reach_id))

            df_merged = hd.merge_data(sim_df=sim_df, obs_df=obs_df)

            print('The merged df is:')
            print(df_merged)

            # Changing the type for the columns to floats
            df_merged.iloc[:, 0] = df_merged.iloc[:, 0].astype(np.float64)
            df_merged.iloc[:, 1] = df_merged.iloc[:, 1].astype(np.float64)

            sim_array = df_merged['predicted streamflow'].values
            obs_array = df_merged['recorded streamflow'].values

            selected_metric_values = hs.list_of_metrics(metrics=selected_metric_names, sim_array=sim_array,
                                                        obs_array=obs_array, mase_m=mase_m, dmod_j=dmod_j,
                                                        nse_mod_j=nse_mod_j, h6_mhe_k=h6_mhe_k, h6_ahe_k=h6_ahe_k,
                                                        h6_rmshe_k=h6_rmshe_k, d1_p_x_bar=d1_p_x_bar_p,
                                                        lm_x_bar=lm_x_bar_p, replace_nan=None, replace_inf=None,
                                                        remove_neg=False, remove_zero=False)

            # Plotting a hydrograph for visualization
            for i, plot_bool in enumerate(post_data_plots):
                if i == 0 and plot_bool == 'on':
                    if station_name is None:
                        hv.plot(merged_data_df=df_merged, legend=['Simulated Data', 'Observed Data'], title='Hydrograph',
                                labels=['Datetime', 'Streamflow ({})'.format(streamflow)])
                    else:
                        hv.plot(merged_data_df=df_merged, legend=['Simulated Data', 'Observed Data'],
                                title='Hydrograph for {}'.format(station_name),
                                labels=['Datetime', 'Streamflow ({})'.format(streamflow)])
                if i == 1 and plot_bool == 'on':
                    if station_name is None:
                        hv.scatter(merged_data_df=df_merged, title=None, labels=['Datetime', 'Streamflow ({})'.format(streamflow)], best_fit=False,
                                    savefigure=None, marker_style='ko', metrics=None, log_scale=False, line45=False, figsize=(12, 8))
                    else:
                        hv.plot(merged_data_df=df_merged, legend=['Simulated Data', 'Observed Data'],
                                title='Hydrograph for {}'.format(station_name),
                                labels=['Datetime', 'Streamflow ({})'.format(streamflow)])
                if i == 2 and plot_bool == 'on':
                    pass
                if i == 3 and plot_bool == 'on':
                    pass
                if i == 4 and plot_bool == 'on':
                    pass
                if i == 5 and plot_bool == 'on':
                    pass
                if i == 6 and plot_bool == 'on':
                    pass
                if i == 7 and plot_bool == 'on':
                    pass
                if i == 8 and plot_bool == 'on':
                    pass

            hv.plot(df_merged, legend=['Forecasted Data', 'Observed Data'], grid=True,
                    title='Forecasted and Observed Flow for ' + station_name + 'Station',
                    labels=['Datetime', 'Discharge (m^3/s)'],
                    savefigure=os.path.join(zip_dir, station_name + '.png'))
            plt.gcf().clear()

            # Saving the csv to the directory that holds the plots
            # final_csv.to_csv(zip_dir + '//' + watershed_name + '.csv', index_label='Datetime')

            # Creating zip file path
            zip_file = app_workspace.path + '/' + watershed + '_' + subbasin + \
                       '_' + datetime.datetime.now().strftime("%b-%d-%Y_%H:%M:%S.%f")
            print(zip_file)
            print(zip_dir)
            # Creating Zip Archive
            shutil.make_archive(zip_file, 'zip', zip_dir)

            # Deleting the temporary Directory to free memory space
            shutil.rmtree(zip_dir, ignore_errors=True)

            # Reading zip file for response
            with open(zip_file + '.zip', 'rb') as f:
                data = f.read()

            response = HttpResponse(data, content_type='application/zip')

            # # set the file name in the Content-Disposition header
            # response['Content-Disposition'] = 'attachment; filename=TEST.zip'  # % file_name
            #
            # print(response)
            #
            # # Close all of the io wrappers
            # buf1.close()
            # buf2.close()
            # excel_file.close()
            # zip_buffer.close()

            # filename = watershed + reach_id
            #
            # response = HttpResponse(content_type='text/csv')
            # response['Content-Disposition'] = 'attachment; filename="%s.csv"' % filename
            #
            # writer = csv.writer(response)
            # writer.writerow(['First row', 'Foo', 'Bar', 'Baz'])
            # writer.writerow(['Second row', 'A', 'B', 'C', '"Testing"', "Here's a quote"])

    return response


@login_required()
def make_table_ajax(request):
    """AJAX controller to make a table and display the html for the user."""

    print('In the make table AJAX controller!')  # Sanity check

    if request.method == 'POST':

        # Getting the CSV data and parameters and Merging it
        obs = request.FILES.get('observed-csv', None)
        sim = request.FILES.get('simulated-csv', None)
        preprocessing_radio = request.POST.get('preprocessing', None)
        timezone_boolean = request.POST.get('timezone', None)

        if preprocessing_radio == "unequal-time":
            interpolate = request.POST.get('interpolate_radio')
        else:
            interpolate = None

        if timezone_boolean == 'on':
            simulated_tz = request.POST.get('sim_timezone', None)
            observed_tz = request.POST.get('obs_timezone', None)
            print(simulated_tz, observed_tz)
        else:
            simulated_tz = None
            observed_tz = None

        merged_df = hd.merge_data(
            sim_fpath=sim, obs_fpath=obs, interpolate=interpolate, column_names=['Simulated', 'Observed'],
            simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
        )

        # Retrieving the extra optional parameters
        extra_param_dict = {}

        if request.POST.get('mase_m', None) is not None:
            mase_m = float(request.POST.get('mase_m', None))
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

        # Indexing the metrics to get the abbreviations
        selected_metric_abbr = []

        for abbr in metric_abbr:
            metric_post_boolean = request.POST.get(abbr, None)
            if metric_post_boolean == 'on':
                selected_metric_abbr.append(abbr)

        # Getting the Units of the Simulated and Observed Data and Converting if Necessary
        obs_units = request.POST.get('observed-units')
        sim_radio = request.POST.get('predicted_radio')

        if sim_radio == 'upload':
            sim_units = request.POST.get('simulated-units-upload')
        else:
            sim_units = request.POST.get('simulated_units_sfpt')

        if obs_units is None and sim_units is None:
            pass
        elif obs_units == 'on' and sim_units == 'on':
            pass
        elif sim_units is None and obs_units == 'on':
            merged_df.iloc[:, 0] *= 35.314666212661
        else:
            merged_df.iloc[:, 1] *= 35.314666212661

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
            seasonal_periods=all_date_range_list
        )

        table_html = table.transpose()
        table_html = table_html.to_html(classes="table table-hover table-striped").replace('border="1"', 'border="0"')

        return HttpResponse(table_html)


@login_required()
def hydrograph_ajax_plotly(request):

    if request.method == 'POST':
        sim = request.FILES.get('simulated-csv', None)
        obs = request.FILES.get('observed-csv', None)
        preprocessing_radio = request.POST.get('preprocessing', None)
        timezone_boolean = request.POST.get('timezone', None)

        if preprocessing_radio == "unequal-time":
            interpolate = request.POST.get('interpolate_radio')
        else:
            interpolate = None

        if timezone_boolean == 'on':
            simulated_tz = request.POST.get('sim_timezone', None)
            observed_tz = request.POST.get('obs_timezone', None)
            print(simulated_tz, observed_tz)
        else:
            simulated_tz = None
            observed_tz = None

        merged_df = hd.merge_data(
            sim_fpath=sim, obs_fpath=obs, interpolate=interpolate, column_names=['Simulated', 'Observed'],
            simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
        )

        date_list = merged_df.index.strftime("%Y-%m-%d %H:%M:%S")
        date_list = date_list.tolist()
        print(type(date_list))
        print(date_list)

        sim_list = merged_df.iloc[:, 0].tolist()
        print(type(sim_list))
        obs_list = merged_df.iloc[:, 1].tolist()

        resp = {'dates': date_list,
                'simulated': sim_list,
                'observed': obs_list}

        return JsonResponse(resp, safe=False)


@login_required()
def hydrograph_daily_avg_ajax_plotly(request):

    if request.method == 'POST':
        sim = request.FILES.get('simulated-csv', None)
        obs = request.FILES.get('observed-csv', None)
        preprocessing_radio = request.POST.get('preprocessing', None)
        timezone_boolean = request.POST.get('timezone', None)

        if preprocessing_radio == "unequal-time":
            interpolate = request.POST.get('interpolate_radio')
        else:
            interpolate = None

        if timezone_boolean == 'on':
            simulated_tz = request.POST.get('sim_timezone', None)
            observed_tz = request.POST.get('obs_timezone', None)
            print(simulated_tz, observed_tz)
        else:
            simulated_tz = None
            observed_tz = None

        merged_df = hd.merge_data(
            sim_fpath=sim, obs_fpath=obs, interpolate=interpolate, column_names=['Simulated', 'Observed'],
            simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
        )

        daily_avg_df = hd.daily_average(merged_df)

        date_list = daily_avg_df.index.tolist()
        sim_list = daily_avg_df.iloc[:, 0].tolist()
        obs_list = daily_avg_df.iloc[:, 1].tolist()

        resp = {'dates': date_list,
                'simulated': sim_list,
                'observed': obs_list}

        return JsonResponse(resp, safe=False)


@login_required()
def scatter_ajax_plotly(request):

    if request.method == 'POST':
        sim = request.FILES.get('simulated-csv', None)
        obs = request.FILES.get('observed-csv', None)
        preprocessing_radio = request.POST.get('preprocessing', None)
        timezone_boolean = request.POST.get('timezone', None)

        if preprocessing_radio == "unequal-time":
            interpolate = request.POST.get('interpolate_radio')
        else:
            interpolate = None

        if timezone_boolean == 'on':
            simulated_tz = request.POST.get('sim_timezone', None)
            observed_tz = request.POST.get('obs_timezone', None)
            print(simulated_tz, observed_tz)
        else:
            simulated_tz = None
            observed_tz = None

        merged_df = hd.merge_data(
            sim_fpath=sim, obs_fpath=obs, interpolate=interpolate, column_names=['Simulated', 'Observed'],
            simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
        )

        sim_list = merged_df.iloc[:, 0].tolist()
        obs_list = merged_df.iloc[:, 1].tolist()

        resp = {'simulated': sim_list,
                'observed': obs_list}

        return JsonResponse(resp, safe=False)


def volume_table_ajax(request):
    """Calculates the volumes of two streams"""

    if request.method == 'POST':
        sim = request.FILES.get('simulated-csv', None)
        obs = request.FILES.get('observed-csv', None)
        preprocessing_radio = request.POST.get('preprocessing', None)
        timezone_boolean = request.POST.get('timezone', None)

        if preprocessing_radio == "unequal-time":
            interpolate = request.POST.get('interpolate_radio')
        else:
            interpolate = None

        if timezone_boolean == 'on':
            simulated_tz = request.POST.get('sim_timezone', None)
            observed_tz = request.POST.get('obs_timezone', None)
            print(simulated_tz, observed_tz)
        else:
            simulated_tz = None
            observed_tz = None

        merged_df = hd.merge_data(
            sim_fpath=sim, obs_fpath=obs, interpolate=interpolate, column_names=['Simulated', 'Observed'],
            simulated_tz=simulated_tz, observed_tz=observed_tz, interp_type='pchip'
        )

        sim_array = merged_df.iloc[:, 0].values
        obs_array = merged_df.iloc[:, 1].values

        sim_volume = round(integrate.simps(sim_array), 3)
        obs_volume = round(integrate.simps(obs_array), 3)

        resp = {
            "sim_volume": sim_volume,
            "obs_volume": obs_volume,
        }

        return JsonResponse(resp)
