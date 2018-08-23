# Put your persistent store models in this file
try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO
import requests
import pandas as pd


def parse_api_request(watershed, reach, token, url):
    """Function to parse the predicted data from the API request

    Parameters
    ----------

    watershed: str
        The watershed of the stream (e.g. South Asia (Mainland))

    reach: int
        The Reach ID of the stream

    token: str
        The API token to access the historic streamflow data

    url: str
        The URL of the portal that the streamflow prediction tool is hosted on.

    Returns
    -------
    DataFrame
        Contains the historic data with a datetime index.

    """
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


def convert_units(one_stream_df=None, one_stream_units=None, two_stream_df=None, forecast_df=None, obs_array_units=None,
                  sim_array_units=None, final_units=None):
    """Converts units to what the user wants them to be

    Parameters
    ----------

    one_stream_df: DataFrame
        Dataframe of the observed array with Datetime Index.

    two_stream_df: DataFrame
        Dataframe containing both observed and simulated historic data with datetime index. Columns must be ordered as
        [Simulated, Observed]

    forecast_df: DataFrame
        Dataframe containing both observed (column 0) and forecast ensemble data with datetime index.

    obs_array_units: str
        The units that the observed array values are.

    sim_array_units: str
        The units that the simulated array values are.

    final_units: str
        The units that the user desires.

    Returns
    -------
    Dataframe
        Depending on the input, the dimenstions of the dataframe could be different, but it will always return a
        dataframe that suits the users units request.

    """
    if one_stream_df is not None:
        # Changing units of just one of the streams
        if one_stream_units == final_units:
            pass
        elif one_stream_units == 'si' and final_units == 'bg':
            one_stream_df *= 35.31466672148859
        elif one_stream_units == 'bg' and final_units == 'si':
            one_stream_df *= 0.028316846592

        return one_stream_df

    elif two_stream_df is not None and forecast_df is not None:
        if obs_array_units == sim_array_units == final_units:
            pass

        elif obs_array_units == 'si' and sim_array_units == 'si' and final_units == 'bg':
            two_stream_df *= 35.31466672148859

        elif obs_array_units == 'bg' and sim_array_units == 'bg' and final_units == 'si':
            two_stream_df *= 0.028316846592

        elif obs_array_units == 'si' and sim_array_units == 'bg' and final_units == 'bg':
            two_stream_df.iloc[:, 1] *= 35.31466672148859

        elif obs_array_units == 'si' and sim_array_units == 'bg' and final_units == 'bg':
            two_stream_df.iloc[:, 0] *= 35.31466672148859

        elif obs_array_units == 'bg' and sim_array_units == 'si' and final_units == 'si':
            two_stream_df.iloc[:, 1] *= 0.028316846592

        elif obs_array_units == 'si' and sim_array_units == 'bg' and final_units == 'si':
            two_stream_df.iloc[:, 1] *= 0.028316846592