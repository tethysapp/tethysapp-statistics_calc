# Put your persistent store models in this file
try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO
import requests
import pandas as pd


def parse_api_request(watershed, reach, token, url):
    """Function to parse the predicted data from the API request"""
    watershed_raw = watershed.replace(" ", '_')
    subbasin = watershed_raw[watershed_raw.find('(') + 1:-1]
    watershed = watershed_raw[:watershed_raw.find('(') - 1]

    request_headers_in_function = dict(Authorization='Token {}'.format(token))
    request_params = dict(watershed_name=watershed, subbasin_name=subbasin, reach_id=reach,
                          return_format='csv')
    forecasted_string_data = requests.get(
        '{}/apps/streamflow-prediction-tool/api/GetHistoricData/'.format(url),
        params=request_params,
        headers=request_headers_in_function
    )

    data = StringIO(forecasted_string_data.content)
    df = pd.read_csv(data, index_col=0)
    data.close()
    df.index = pd.to_datetime(df.index)

    return df
