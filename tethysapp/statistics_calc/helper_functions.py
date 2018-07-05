from StringIO import StringIO
import pandas as pd
import requests


def parse_api_request(watershed, subbasin, reach):
    """Function to parse the predicted data from the API request"""
    request_headers_in_function = dict(Authorization='Token 3e6d5a373ff8230ccae801bf0758af9f43922e32')
    request_params = dict(watershed_name=watershed, subbasin_name=subbasin, reach_id=reach,
                          return_format='csv')
    forecasted_string_data = requests.get(
        'http://tethys-staging.byu.edu/apps/streamflow-prediction-tool/api'
        '/GetHistoricData/',
        params=request_params, headers=request_headers_in_function)

    data = StringIO(forecasted_string_data.content)

    return pd.read_csv(data, delimiter=",", header=None, names=['predicted streamflow'],
                       index_col=0, skiprows=1)
