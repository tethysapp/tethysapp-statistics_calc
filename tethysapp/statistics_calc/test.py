import pandas as pd
import zipfile
import io
# from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import hydrostats_visual as hv


"""Testing my plotting function"""
df_index = pd.date_range('1980-01-01', periods=1000, freq='D')

merged_df = pd.DataFrame(np.random.rand(len(df_index), 2), index=df_index, columns=['Sim', 'Obs'])

hv.plot(merged_df, labels=['Datetime', 'Streamflow'],
        metrics=['ME', 'MAE', 'MSE', 'ED', 'NED', 'RMSE', 'RMSLE', 'MASE', 'R^2', 'ACC'])

"""Testing writing a zip file"""
# plt.figure()
# plt.plot([1, 2])
# plt.title("test")
# buf1 = io.BytesIO()
# buf2 = io.BytesIO()
# plt.savefig(buf1, format='png')
# plt.savefig(buf2, format='png')
# buf1.seek(0)
# print(buf1)
# # buf1.close()
# buf2.seek(0)
# # buf2.close()
# # my "Excel" file, which is an in-memory output file (buffer)
# # for the new workbook
# excel_file = io.BytesIO()
#
# xlwriter = pd.ExcelWriter(excel_file, engine='xlsxwriter')
#
# df = pd.DataFrame(np.random.rand(5, 5))
#
# df.to_excel(xlwriter, 'sheetname')
#
# xlwriter.save()
# xlwriter.close()
#
# # important step, rewind the buffer or when it is read() you'll get nothing
# # but an error message when you try to open your zero length file in Excel
# excel_file.seek(0)
#
# zip_buffer = io.BytesIO()
# with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
#     # for file_name, data in [('1.txt', io.BytesIO(b'111')), ('2.txt', io.BytesIO(b'222'))]:
#     for file_name, data in [('1.png', buf1), ('2.png', buf2), ('df.xlsx', excel_file)]:
#         zip_file.writestr(file_name, data.getvalue())
# with open(r'/home/wade/Downloads/ZIPPY.zip', 'wb') as f:
#     f.write(zip_buffer.getvalue())
#
# buf1.close()
# buf2.close()
# excel_file.close()

"""Testing the Seasonal Period"""
# dates = pd.date_range(start='1990-01-01', end='2000-01-01')
#
# data = np.random.rand(3653, 2)
#
# merged_df = pd.DataFrame(data, index=dates)
#
# print(merged_df)

# print(seasonal_period(merged_df, daily_period=['01-01', '01-05'], time_range=['hi', 'bye']))


"""Appending to a dictionary"""
# d = {}
#
# print(d)
#
# d['newkey'] = 'newvalue'
#
# print(d)
#
# d['second key'] = 'two'
#
# print(d)

# def sql_table(forecasted_array, observed_array, watershed, reach_ID):
#     """Takes two numpy arrays and returns a pandas dataframe with all of the metrics included."""
#     metrics_list = ["reach_ID", "watershed", 'Mean Error', 'Mean Absolute Error', 'Mean Squared Error',
#                     'Eclidean Distance', 'Normalized Eclidean Distance', 'Root Mean Square Error',
#                     'Root Mean Squared Log Error', 'Mean Absolute Scaled Error', 'R^2', 'Anomoly Correlation Coefficient',
#                     'Mean Absolute Percentage Error', 'Mean Absolute Percentage Deviation',
#                     'Symmetric Mean Absolute Percentage Error (1)', 'Symmetric Mean Absolute Percentage Error (2)',
#                     'Index of Agreement (d)', 'Index of Agreement (d1)', 'Index of Agreement Refined (dr)',
#                     'Relative Index of Agreement', 'Modified Index of Agreement', "Watterson's M", 'Mielke-Berry R',
#                     'Nash-Sutcliffe Efficiency', 'Modified Nash-Sutcliffe Efficiency',
#                     'Relative Nash-Sutcliffe Efficiency',
#                     'Legate-McCabe Index', 'Spectral Angle', 'Spectral Correlation',
#                     'Spectral Information Divergence', 'Spectral Gradient Angle', 'H1 - Mean', 'H1 - Absolute',
#                     'H1 - Root', 'H2 - Mean', 'H2 - Absolute', 'H2 - Root', 'H3 - Mean', 'H3 - Absolute', 'H3 - Root',
#                     'H4 - Mean', 'H4 - Absolute', 'H4 - Root', 'H5 - Mean', 'H5 - Absolute', 'H5 - Root', 'H6 - Mean',
#                     'H6 - Absolute', 'H6 - Root', 'H7 - Mean', 'H7 - Absolute', 'H7 - Root', 'H8 - Mean',
#                     'H8 - Absolute', 'H8 - Root', 'H10 - Mean', 'H10 - Absolute', 'H10 - Root']
#
#     # Creating the Metrics Matrix
#     metrics_array = np.zeros(len(metrics_list), dtype=object)
#
#     metrics_array[0] = reach_ID
#     metrics_array[1] = watershed
#     metrics_array[2] = me(forecasted_array, observed_array)
#     warnings.filterwarnings("ignore")
#     metrics_array[3] = mae(forecasted_array, observed_array)
#     metrics_array[4] = mse(forecasted_array, observed_array)
#     metrics_array[5] = ed(forecasted_array, observed_array)
#     metrics_array[6] = ned(forecasted_array, observed_array)
#     metrics_array[7] = rmse(forecasted_array, observed_array)
#     metrics_array[8] = rmsle(forecasted_array, observed_array)
#     metrics_array[9] = mase(forecasted_array, observed_array)
#     metrics_array[10] = r_squared(forecasted_array, observed_array)
#     metrics_array[11] = acc(forecasted_array, observed_array)
#     metrics_array[12] = mape(forecasted_array, observed_array)
#     metrics_array[13] = mapd(forecasted_array, observed_array)
#     metrics_array[14] = smap1(forecasted_array, observed_array)
#     metrics_array[15] = smap2(forecasted_array, observed_array)
#     metrics_array[16] = d(forecasted_array, observed_array)
#     metrics_array[17] = d1(forecasted_array, observed_array)
#     metrics_array[18] = dr(forecasted_array, observed_array)
#     metrics_array[19] = drel(forecasted_array, observed_array)
#     metrics_array[20] = dmod(forecasted_array, observed_array)
#     metrics_array[21] = M(forecasted_array, observed_array)
#     metrics_array[22] = R(forecasted_array, observed_array)
#     metrics_array[23] = E(forecasted_array, observed_array)
#     metrics_array[24] = Emod(forecasted_array, observed_array)
#     metrics_array[25] = Erel(forecasted_array, observed_array)
#     metrics_array[26] = E_1(forecasted_array, observed_array)
#     metrics_array[27] = sa(forecasted_array, observed_array)
#     metrics_array[28] = sc(forecasted_array, observed_array)
#     metrics_array[29] = sid(forecasted_array, observed_array)
#     metrics_array[30] = sga(forecasted_array, observed_array)
#     metrics_array[31] = h1(forecasted_array, observed_array, 'mean')
#     metrics_array[32] = h1(forecasted_array, observed_array, 'absolute')
#     metrics_array[33] = h1(forecasted_array, observed_array, 'rmhe')
#     metrics_array[34] = h2(forecasted_array, observed_array, 'mean')
#     metrics_array[35] = h2(forecasted_array, observed_array, 'absolute')
#     metrics_array[36] = h2(forecasted_array, observed_array, 'rmhe')
#     metrics_array[37] = h3(forecasted_array, observed_array, 'mean')
#     metrics_array[38] = h3(forecasted_array, observed_array, 'absolute')
#     metrics_array[39] = h3(forecasted_array, observed_array, 'rmhe')
#     metrics_array[40] = h4(forecasted_array, observed_array, 'mean')
#     metrics_array[41] = h4(forecasted_array, observed_array, 'absolute')
#     metrics_array[42] = h4(forecasted_array, observed_array, 'rmhe')
#     metrics_array[43] = h5(forecasted_array, observed_array, 'mean')
#     metrics_array[44] = h5(forecasted_array, observed_array, 'absolute')
#     metrics_array[45] = h5(forecasted_array, observed_array, 'rmhe')
#     metrics_array[46] = h6(forecasted_array, observed_array, 'mean')
#     metrics_array[47] = h6(forecasted_array, observed_array, 'absolute')
#     metrics_array[48] = h6(forecasted_array, observed_array, 'rmhe')
#     metrics_array[49] = h7(forecasted_array, observed_array, 'mean')
#     metrics_array[50] = h7(forecasted_array, observed_array, 'absolute')
#     metrics_array[51] = h7(forecasted_array, observed_array, 'rmhe')
#     metrics_array[52] = h8(forecasted_array, observed_array, 'mean')
#     metrics_array[53] = h8(forecasted_array, observed_array, 'absolute')
#     metrics_array[54] = h8(forecasted_array, observed_array, 'rmhe')
#     metrics_array[55] = h10(forecasted_array, observed_array, 'mean')
#     metrics_array[56] = h10(forecasted_array, observed_array, 'absolute')
#     metrics_array[57] = h10(forecasted_array, observed_array, 'rmhe')
#     warnings.filterwarnings("always")
#
#     return pd.DataFrame(metrics_array.reshape(-1, len(metrics_array)), columns=metrics_list)


# conn = sqlite3.connect('//home//wade//tethysdev//tethysapp-statistics_calc//tethysapp//statistics_calc//stat_app.db')
# c = conn.cursor()

"""Saving the database to a database"""
# metrics_df = sql_table(forecasted_array=sim, observed_array=obs, watershed='South Asia', reach_ID=5892430543909403)
# metrics_df.to_sql('Metrics', con=conn,
#                   if_exists='append', index=False)


# for row in c.execute('SELECT * FROM Metrics'):
#     print row
#
# c.execute('DELETE FROM Metrics')

"""Dropping tables and stuff like that in SQLite"""
# c.execute("DROP TABLE Metrics")
# for row in c.execute("SELECT name FROM sqlite_master WHERE type='table';"):
#     print(row)

#
# tables = ['None'] + tables
# for i in range(tables):
#     print(tables)
#
# new_table = []
# for i in range(len(tables)):
#     if tables[i][-3:] != "raw":
#         new_table.append(tables[i])

"""Finding the selected metrics from the pandas dataframe"""
# metrics_selected = [u'Mean Error', u'Mean Absolute Percentage Error', u'Relative Index of Agreement', u'Spectral Gradient Angle', u'H6 - Mean']
#
#
# def select_metrics(metrics_dataframe, selected_metrics):
#     metrics_dictionary = metrics_dataframe.to_dict(orient='list')
#     selected_metrics_name = []
#     selected_metrics_value = []
#     for metric in selected_metrics:
#         for key, value in metrics_dictionary.iteritems():
#             if metric == key:
#                 selected_metrics_name.append(key)
#                 selected_metrics_value.append(value)
#     for i in range(len(selected_metrics_value)):
#         selected_metrics_value[i] = selected_metrics_value[i][0]
#     return list(zip(selected_metrics_name, selected_metrics_value))
#
#
# print(select_metrics(metrics_df, metrics_selected))
