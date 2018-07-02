# Put your persistent store models in this file
import sqlite3
from django.contrib.auth.decorators import login_required
import requests

import pandas as pd
from hydrostats import *


def all_metrics(forecasted_array, observed_array, station_name):
    """Takes two numpy arrays and returns a pandas dataframe with all of the metrics included."""
    metrics_list = ['Mean Error', 'Mean Absolute Error', 'Mean Squared Error', 'Eclidean Distance',
                    'Normalized Eclidean Distance', 'Root Mean Square Error', 'Root Mean Squared Log Error',
                    'Mean Absolute Scaled Error', 'R^2', 'Anomoly Correlation Coefficient',
                    'Mean Absolute Percentage Error', 'Mean Absolute Percentage Deviation',
                    'Symmetric Mean Absolute Percentage Error (1)', 'Symmetric Mean Absolute Percentage Error (2)',
                    'Index of Agreement (d)', 'Index of Agreement (d1)', 'Index of Agreement Refined (dr)',
                    'Relative Index of Agreement', 'Modified Index of Agreement', "Watterson's M", 'Mielke-Berry R',
                    'Nash-Sutcliffe Efficiency', 'Modified Nash-Sutcliffe Efficiency',
                    'Relative Nash-Sutcliffe Efficiency',
                    'Legate-McCabe Index', 'Spectral Angle', 'Spectral Correlation',
                    'Spectral Information Divergence', 'Spectral Gradient Angle', 'H1 - Mean', 'H1 - Absolute',
                    'H1 - Root', 'H2 - Mean', 'H2 - Absolute', 'H2 - Root', 'H3 - Mean', 'H3 - Absolute', 'H3 - Root',
                    'H4 - Mean', 'H4 - Absolute', 'H4 - Root', 'H5 - Mean', 'H5 - Absolute', 'H5 - Root', 'H6 - Mean',
                    'H6 - Absolute', 'H6 - Root', 'H7 - Mean', 'H7 - Absolute', 'H7 - Root', 'H8 - Mean',
                    'H8 - Absolute', 'H8 - Root', 'H10 - Mean', 'H10 - Absolute', 'H10 - Root']

    # Creating the Metrics Matrix
    metrics_array = np.zeros(len(metrics_list), dtype=float)

    metrics_array[0] = me(forecasted_array, observed_array)
    warnings.filterwarnings("ignore")
    metrics_array[1] = mae(forecasted_array, observed_array)
    metrics_array[2] = mse(forecasted_array, observed_array)
    metrics_array[3] = ed(forecasted_array, observed_array)
    metrics_array[4] = ned(forecasted_array, observed_array)
    metrics_array[5] = rmse(forecasted_array, observed_array)
    metrics_array[6] = rmsle(forecasted_array, observed_array)
    metrics_array[7] = mase(forecasted_array, observed_array)
    metrics_array[8] = r_squared(forecasted_array, observed_array)
    metrics_array[9] = acc(forecasted_array, observed_array)
    metrics_array[10] = mape(forecasted_array, observed_array)
    metrics_array[11] = mapd(forecasted_array, observed_array)
    metrics_array[12] = smap1(forecasted_array, observed_array)
    metrics_array[13] = smap2(forecasted_array, observed_array)
    metrics_array[14] = d(forecasted_array, observed_array)
    metrics_array[15] = d1(forecasted_array, observed_array)
    metrics_array[16] = dr(forecasted_array, observed_array)
    metrics_array[17] = drel(forecasted_array, observed_array)
    metrics_array[18] = dmod(forecasted_array, observed_array)
    metrics_array[19] = M(forecasted_array, observed_array)
    metrics_array[20] = R(forecasted_array, observed_array)
    metrics_array[21] = E(forecasted_array, observed_array)
    metrics_array[22] = Emod(forecasted_array, observed_array)
    metrics_array[23] = Erel(forecasted_array, observed_array)
    metrics_array[24] = E_1(forecasted_array, observed_array)
    metrics_array[25] = sa(forecasted_array, observed_array)
    metrics_array[26] = sc(forecasted_array, observed_array)
    metrics_array[27] = sid(forecasted_array, observed_array)
    metrics_array[28] = sga(forecasted_array, observed_array)
    metrics_array[29] = h1(forecasted_array, observed_array, 'mean')
    metrics_array[30] = h1(forecasted_array, observed_array, 'absolute')
    metrics_array[31] = h1(forecasted_array, observed_array, 'rmhe')
    metrics_array[32] = h2(forecasted_array, observed_array, 'mean')
    metrics_array[33] = h2(forecasted_array, observed_array, 'absolute')
    metrics_array[34] = h2(forecasted_array, observed_array, 'rmhe')
    metrics_array[35] = h3(forecasted_array, observed_array, 'mean')
    metrics_array[36] = h3(forecasted_array, observed_array, 'absolute')
    metrics_array[37] = h3(forecasted_array, observed_array, 'rmhe')
    metrics_array[38] = h4(forecasted_array, observed_array, 'mean')
    metrics_array[39] = h4(forecasted_array, observed_array, 'absolute')
    metrics_array[40] = h4(forecasted_array, observed_array, 'rmhe')
    metrics_array[41] = h5(forecasted_array, observed_array, 'mean')
    metrics_array[42] = h5(forecasted_array, observed_array, 'absolute')
    metrics_array[43] = h5(forecasted_array, observed_array, 'rmhe')
    metrics_array[44] = h6(forecasted_array, observed_array, 'mean')
    metrics_array[45] = h6(forecasted_array, observed_array, 'absolute')
    metrics_array[46] = h6(forecasted_array, observed_array, 'rmhe')
    metrics_array[47] = h7(forecasted_array, observed_array, 'mean')
    metrics_array[48] = h7(forecasted_array, observed_array, 'absolute')
    metrics_array[49] = h7(forecasted_array, observed_array, 'rmhe')
    metrics_array[50] = h8(forecasted_array, observed_array, 'mean')
    metrics_array[51] = h8(forecasted_array, observed_array, 'absolute')
    metrics_array[52] = h8(forecasted_array, observed_array, 'rmhe')
    metrics_array[53] = h10(forecasted_array, observed_array, 'mean')
    metrics_array[54] = h10(forecasted_array, observed_array, 'absolute')
    metrics_array[55] = h10(forecasted_array, observed_array, 'rmhe')
    warnings.filterwarnings("always")

    df = pd.DataFrame(np.column_stack([metrics_list, metrics_array]), columns=['Metrics', station_name])
    return df.set_index('Metrics')

def sql_table(forecasted_array, observed_array, watershed, reach_ID):
    """Takes two numpy arrays and returns a pandas dataframe with all of the metrics included."""
    metrics_list = ["reach_ID", "watershed", 'Mean Error', 'Mean Absolute Error', 'Mean Squared Error',
                    'Eclidean Distance', 'Normalized Eclidean Distance', 'Root Mean Square Error',
                    'Root Mean Squared Log Error', 'Mean Absolute Scaled Error',
                    'Coefficient of Determination', 'Anomoly Correlation Coefficient',
                    'Mean Absolute Percentage Error', 'Mean Absolute Percentage Deviation',
                    'Symmetric Mean Absolute Percentage Error (1)', 'Symmetric Mean Absolute Percentage Error (2)',
                    'Index of Agreement (d)', 'Index of Agreement (d1)', 'Index of Agreement Refined (dr)',
                    'Relative Index of Agreement', 'Modified Index of Agreement', "Watterson's M", 'Mielke-Berry R',
                    'Nash-Sutcliffe Efficiency', 'Modified Nash-Sutcliffe Efficiency',
                    'Relative Nash-Sutcliffe Efficiency',
                    'Legate-McCabe Index', 'Spectral Angle', 'Spectral Correlation',
                    'Spectral Information Divergence', 'Spectral Gradient Angle', 'H1 - Mean', 'H1 - Absolute',
                    'H1 - Root', 'H2 - Mean', 'H2 - Absolute', 'H2 - Root', 'H3 - Mean', 'H3 - Absolute', 'H3 - Root',
                    'H4 - Mean', 'H4 - Absolute', 'H4 - Root', 'H5 - Mean', 'H5 - Absolute', 'H5 - Root', 'H6 - Mean',
                    'H6 - Absolute', 'H6 - Root', 'H7 - Mean', 'H7 - Absolute', 'H7 - Root', 'H8 - Mean',
                    'H8 - Absolute', 'H8 - Root', 'H10 - Mean', 'H10 - Absolute', 'H10 - Root']

    # Creating the Metrics Matrix
    metrics_array = np.zeros(len(metrics_list), dtype=object)

    metrics_array[0] = reach_ID
    metrics_array[1] = watershed
    metrics_array[2] = me(forecasted_array, observed_array)
    warnings.filterwarnings("ignore")
    metrics_array[3] = mae(forecasted_array, observed_array)
    metrics_array[4] = mse(forecasted_array, observed_array)
    metrics_array[5] = ed(forecasted_array, observed_array)
    metrics_array[6] = ned(forecasted_array, observed_array)
    metrics_array[7] = rmse(forecasted_array, observed_array)
    metrics_array[8] = rmsle(forecasted_array, observed_array)
    metrics_array[9] = mase(forecasted_array, observed_array)
    metrics_array[10] = r_squared(forecasted_array, observed_array)
    metrics_array[11] = acc(forecasted_array, observed_array)
    metrics_array[12] = mape(forecasted_array, observed_array)
    metrics_array[13] = mapd(forecasted_array, observed_array)
    metrics_array[14] = smap1(forecasted_array, observed_array)
    metrics_array[15] = smap2(forecasted_array, observed_array)
    metrics_array[16] = d(forecasted_array, observed_array)
    metrics_array[17] = d1(forecasted_array, observed_array)
    metrics_array[18] = dr(forecasted_array, observed_array)
    metrics_array[19] = drel(forecasted_array, observed_array)
    metrics_array[20] = dmod(forecasted_array, observed_array)
    metrics_array[21] = M(forecasted_array, observed_array)
    metrics_array[22] = R(forecasted_array, observed_array)
    metrics_array[23] = E(forecasted_array, observed_array)
    metrics_array[24] = Emod(forecasted_array, observed_array)
    metrics_array[25] = Erel(forecasted_array, observed_array)
    metrics_array[26] = E_1(forecasted_array, observed_array)
    metrics_array[27] = sa(forecasted_array, observed_array)
    metrics_array[28] = sc(forecasted_array, observed_array)
    metrics_array[29] = sid(forecasted_array, observed_array)
    metrics_array[30] = sga(forecasted_array, observed_array)
    metrics_array[31] = h1(forecasted_array, observed_array, 'mean')
    metrics_array[32] = h1(forecasted_array, observed_array, 'absolute')
    metrics_array[33] = h1(forecasted_array, observed_array, 'rmhe')
    metrics_array[34] = h2(forecasted_array, observed_array, 'mean')
    metrics_array[35] = h2(forecasted_array, observed_array, 'absolute')
    metrics_array[36] = h2(forecasted_array, observed_array, 'rmhe')
    metrics_array[37] = h3(forecasted_array, observed_array, 'mean')
    metrics_array[38] = h3(forecasted_array, observed_array, 'absolute')
    metrics_array[39] = h3(forecasted_array, observed_array, 'rmhe')
    metrics_array[40] = h4(forecasted_array, observed_array, 'mean')
    metrics_array[41] = h4(forecasted_array, observed_array, 'absolute')
    metrics_array[42] = h4(forecasted_array, observed_array, 'rmhe')
    metrics_array[43] = h5(forecasted_array, observed_array, 'mean')
    metrics_array[44] = h5(forecasted_array, observed_array, 'absolute')
    metrics_array[45] = h5(forecasted_array, observed_array, 'rmhe')
    metrics_array[46] = h6(forecasted_array, observed_array, 'mean')
    metrics_array[47] = h6(forecasted_array, observed_array, 'absolute')
    metrics_array[48] = h6(forecasted_array, observed_array, 'rmhe')
    metrics_array[49] = h7(forecasted_array, observed_array, 'mean')
    metrics_array[50] = h7(forecasted_array, observed_array, 'absolute')
    metrics_array[51] = h7(forecasted_array, observed_array, 'rmhe')
    metrics_array[52] = h8(forecasted_array, observed_array, 'mean')
    metrics_array[53] = h8(forecasted_array, observed_array, 'absolute')
    metrics_array[54] = h8(forecasted_array, observed_array, 'rmhe')
    metrics_array[55] = h10(forecasted_array, observed_array, 'mean')
    metrics_array[56] = h10(forecasted_array, observed_array, 'absolute')
    metrics_array[57] = h10(forecasted_array, observed_array, 'rmhe')
    warnings.filterwarnings("always")
    print(metrics_array.size)

    return pd.DataFrame(metrics_array.reshape(-1, len(metrics_array)), columns=metrics_list)


def select_metrics(metrics_dataframe, selected_metrics):
    metrics_dictionary = metrics_dataframe.to_dict(orient='list')
    selected_metrics_name = []
    selected_metrics_value = []
    for metric in selected_metrics:
        for key, value in metrics_dictionary.iteritems():
            if metric == key:
                selected_metrics_name.append(key)
                selected_metrics_value.append(value)
    for i in range(len(selected_metrics_value)):
        selected_metrics_value[i] = selected_metrics_value[i][0]
    return list(zip(selected_metrics_name, selected_metrics_value))
