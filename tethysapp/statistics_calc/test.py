import pandas as pd
# import zipfile
# import io
# from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
# import hydrostats.visual as hv
# import hydrostats.data as hd
# from helper_functions import parse_api_request
# from ast import literal_eval
# import json
# import requests

# res = requests.get(app.get_custom_setting('api_source') + '/apps/streamflow-prediction-tool/api/GetWatersheds/',
#                    headers={'Authorization': 'Token ' + app.get_custom_setting('spt_token')})

try:
    request.get()
except Exception as e:
    print(e)

"""Timezone conversions"""
# time_now = pd.Timestamp.now(tz='US/Mountain').strftime("%Y-%m-%d %H:%M:%S")
#
# print("The current time is {} in mountain time.".format(time_now))
#
# dti = pd.DatetimeIndex(start=time_now, freq='D', periods=1, tz="US/Mountain")
#
# new_time = dti.tz_convert("Asia/Kathmandu")
#
# print("Nepal time is {} right now".format(new_time[0].tz_localize(None).strftime("%Y-%m-%d %H:%M:%S")))
# print("UTC time is {} right now".format(new_time[0].tz_convert(None).strftime("%Y-%m-%d %H:%M:%S")))

"""Plotting the Ensemble Forecasts"""
# forecasts = pd.read_csv("/home/wade/Documents/Forecast/south_asia_historical_20170809_01-51.csv",
#                         index_col=0)
#
# forecasts.index = pd.to_datetime(forecasts.index)
#
# mean_forecast = forecasts.mean(axis=1).values
#
# num_of_ensambles = 30
#
# date_range_ensambles = pd.date_range(forecasts.index[0], forecasts.index[-1], periods=num_of_ensambles)
#
# twenty_ensamble_list = []
#
# for i in range(num_of_ensambles):
#     twenty_ensamble_list.append(forecasts.index.get_loc(date_range_ensambles[i], method='nearest'))
#
# ensample_plot_df = forecasts.iloc[twenty_ensamble_list, :]
#
# fig, ax = plt.subplots()
#
# for i in range(len(ensample_plot_df.index)):
#     x = [ensample_plot_df.index[i]] * 51
#     plt.plot(x, ensample_plot_df.iloc[i, :], c='#87a7db', alpha=0.2, marker="o", markeredgecolor="None",
#              linestyle='None', ms=3)
#
# plt.plot(forecasts.index, mean_forecast, "k-")
#
# fig.autofmt_xdate()
#
# plt.show()

"""SFPT api for historic data"""
# reach_id = 5
#
# request_params = dict(watershed_name='Africa', subbasin_name='Continental', reach_id=reach_id)
# request_headers = dict(Authorization='Token')
# res = requests.get('http://tethys-staging.byu.edu/apps/streamflow-prediction-tool/api/GetHistoricData/', params=request_params, headers=request_headers)
#
# print(res.content)
# print(type(res.content))
#
# if res.content == "Not found: ERA Interim river with ID {}.".format(reach_id):
#     print("This stream does not exist")

"""Calling the api to get a metric value"""
# request_headers = dict(Authorization='Token')
#
# sim = np.random.rand(10).tolist()
# obs = np.random.rand(10).tolist()
#
# print(sim)
# print(obs)
#
# request_params = {
#     "simulated": sim,
#     "observed": obs
# }
#
# json_data = json.dumps(request_params)
#
# res = requests.post('http://127.0.0.1:8000/apps/statistics-calc/api/get_metrics/',
#                     headers=request_headers, data=json_data)
#
# response = json.loads(res)
#
# print(response['kge_2012'])
#
# print()

# Formatting the watershed name to fit the API if necessary

# for i in range(len(watershed_list)):
#     watershed_raw = watershed_list[i][0].replace(" ", '_')
#     subbasin = watershed_raw[watershed_raw.find('(') + 1:-1]
#     watershed = watershed_raw[:watershed_raw.find('(')-1]
#     print(watershed)
#     print(subbasin)
#
    # try:
    #     print(parse_api_request(watershed=watershed, subbasin=subbasin, reach=2))
    # except:
    #     print("Failed on {}".format(watershed_list[i][0]))

"""Testing my plotting function"""
# df_index = pd.date_range('1980-01-01', periods=1000, freq='D')
#
# merged_df = pd.DataFrame(np.random.rand(len(df_index), 2), index=df_index, columns=['Sim', 'Obs'])
#
# hv.plot(merged_df, labels=['Datetime', 'Streamflow'],
#         metrics=['ME', 'MAE', 'MSE', 'ED', 'NED', 'RMSE', 'RMSLE', 'MASE', 'R^2', 'ACC'])

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
