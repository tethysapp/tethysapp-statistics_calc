# Put your persistent store models in this file
try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO
import requests
import pandas as pd
import unittest


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


def convert_units(single_df=None, single_units=None, two_stream_df=None, forecast_df=None, obs_units=None,
                  sim_units=None, final_units=None):
    """Converts units to what the user wants them to be

    Parameters
    ----------

    single_df: DataFrame
        Dataframe of the observed array with Datetime Index.

    two_stream_df: DataFrame
        Dataframe containing both observed and simulated historic data with datetime index. Columns must be ordered as
        [Simulated, Observed]

    forecast_df: DataFrame
        Dataframe containing both observed (column 0) and forecast ensemble data with datetime index.

    obs_units: str
        The units that the observed array values are.

    sim_units: str
        The units that the simulated array values are.

    final_units: str
        The units that the user desires.

    Returns
    -------
    Dataframe
        Depending on the input, the dimenstions of the dataframe could be different, but it will always return a
        dataframe that suits the users units request.

    """
    if single_df is not None:
        # Changing units of just one of the streams

        one_stream_df_new = single_df.copy()

        if single_units == final_units:
            pass
        elif single_units == 'si' and final_units == 'bg':
            one_stream_df_new *= 35.31466672148859
        elif single_units == 'bg' and final_units == 'si':
            one_stream_df_new *= 0.028316846592
        else:
            raise RuntimeError("Units were not specified correctly.")

        return one_stream_df_new

    elif two_stream_df is not None:

        two_stream_df_new = two_stream_df.copy()

        if obs_units == sim_units == final_units:
            pass

        elif sim_units == 'si' and obs_units == 'si' and final_units == 'bg':
            two_stream_df_new *= 35.31466672148859

        elif sim_units == 'si' and obs_units == 'bg' and final_units == 'bg':
            two_stream_df_new.iloc[:, 0] *= 35.31466672148859

        elif sim_units == 'bg' and obs_units == 'si' and final_units == 'bg':
            two_stream_df_new.iloc[:, 1] *= 35.31466672148859

        elif sim_units == 'bg' and obs_units == 'bg' and final_units == 'si':
            two_stream_df_new *= 0.028316846592

        elif sim_units == 'si' and obs_units == 'bg' and final_units == 'si':
            two_stream_df_new.iloc[:, 1] *= 0.028316846592

        elif sim_units == 'bg' and obs_units == 'si' and final_units == 'si':
            two_stream_df_new.iloc[:, 0] *= 0.028316846592

        else:
            raise RuntimeError("Incorrect Inputs")

        return two_stream_df_new

    elif forecast_df is not None:

        forecast_df_new = forecast_df.copy()

        if obs_units == sim_units == final_units:
            pass

        elif sim_units == 'si' and obs_units == 'si' and final_units == 'bg':
            forecast_df_new *= 35.31466672148859

        elif sim_units == 'si' and obs_units == 'bg' and final_units == 'bg':
            forecast_df_new.iloc[:, 1:] *= 35.31466672148859

        elif sim_units == 'bg' and obs_units == 'si' and final_units == 'bg':
            forecast_df_new.iloc[:, 0] *= 35.31466672148859

        elif sim_units == 'bg' and obs_units == 'bg' and final_units == 'si':
            forecast_df_new *= 0.028316846592

        elif sim_units == 'si' and obs_units == 'bg' and final_units == 'si':
            forecast_df_new.iloc[:, 0] *= 0.028316846592

        elif sim_units == 'bg' and obs_units == 'si' and final_units == 'si':
            forecast_df_new.iloc[:, 1:] *= 0.028316846592

        else:
            raise RuntimeError("Incorrect Inputs")

        return forecast_df_new


class TestModels(unittest.TestCase):

    def test_convert_units(self):
        """
        Tests the unit conversion function in the models
        """
        import numpy as np
        import pandas as pd

        dates = pd.date_range('1980-01-01', periods=4)

        sim_data_cfs = np.array([35000, 27000, 29500, 32000]).astype(np.float64)
        obs_data_cfs = np.array([34000, 26000, 28500, 31000]).astype(np.float64)
        forecast_data_cfs = np.array([[34500, 33500, 32500, 31500],
                                      [30500, 29500, 28500, 27500],
                                      [26500, 25500, 24500, 23500],
                                      [22500, 21500, 20500, 19500]]).astype(np.float64)

        sim_data_cms = sim_data_cfs * 0.028316846592
        obs_data_cms = obs_data_cfs * 0.028316846592
        forecast_data_cms = forecast_data_cfs * 0.028316846592

        one_column_df_cfs = pd.DataFrame(obs_data_cfs, index=dates)
        one_column_df_cms = pd.DataFrame(obs_data_cms, index=dates)

        one_forecast_df_cfs = pd.DataFrame(forecast_data_cfs, index=dates)
        one_forecast_df_cms = pd.DataFrame(forecast_data_cms, index=dates)

        two_column_df_cfs_cfs = pd.DataFrame(np.column_stack((sim_data_cfs, obs_data_cfs)), index=dates)
        two_column_df_cms_cms = pd.DataFrame(np.column_stack((sim_data_cms, obs_data_cms)), index=dates)
        two_column_df_cms_cfs = pd.DataFrame(np.column_stack((sim_data_cms, obs_data_cfs)), index=dates)
        two_column_df_cfs_cms = pd.DataFrame(np.column_stack((sim_data_cfs, obs_data_cms)), index=dates)

        forecast_df_cfs_cfs = pd.DataFrame(np.insert(forecast_data_cfs, 0, obs_data_cfs, axis=1), index=dates)
        forecast_df_cms_cms = pd.DataFrame(np.insert(forecast_data_cms, 0, obs_data_cms, axis=1), index=dates)
        forecast_df_cms_cfs = pd.DataFrame(np.insert(forecast_data_cfs, 0, obs_data_cms, axis=1), index=dates)
        forecast_df_cfs_cms = pd.DataFrame(np.insert(forecast_data_cms, 0, obs_data_cfs, axis=1), index=dates)

        # Testing one stream case
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(single_df=one_column_df_cms, single_units='si', final_units='si'),
                one_column_df_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(single_df=one_column_df_cfs, single_units='bg', final_units='bg'),
                one_column_df_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                one_column_df_cms,
                convert_units(single_df=one_column_df_cfs, single_units='bg', final_units='si')
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                one_column_df_cfs,
                convert_units(single_df=one_column_df_cms, single_units='si', final_units='bg')
            )
        )

        # Testing one forecast case
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(single_df=one_forecast_df_cms, single_units='si', final_units='si'),
                one_forecast_df_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(single_df=one_forecast_df_cfs, single_units='bg', final_units='bg'),
                one_forecast_df_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(single_df=one_forecast_df_cfs, single_units='bg', final_units='si'),
                one_forecast_df_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(single_df=one_forecast_df_cms, single_units='si', final_units='bg'),
                one_forecast_df_cfs
            )
        )

        # Testing two stream case
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cms_cms, sim_units='si',
                              obs_units='si', final_units='si'),
                two_column_df_cms_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cfs_cfs, sim_units='bg',
                              obs_units='bg', final_units='bg'),
                two_column_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cms_cms, sim_units='si',
                              obs_units='si', final_units='bg'),
                two_column_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cms_cfs, sim_units='si',
                              obs_units='bg', final_units='bg'),
                two_column_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cfs_cms, sim_units='bg',
                              obs_units='si', final_units='bg'),
                two_column_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cfs_cfs, sim_units='bg',
                              obs_units='bg', final_units='si'),
                two_column_df_cms_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cms_cfs, sim_units='si',
                              obs_units='bg', final_units='si'),
                two_column_df_cms_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=two_column_df_cfs_cms, sim_units='bg',
                              obs_units='si', final_units='si'),
                two_column_df_cms_cms
            )
        )

        # Testing forecast case with observed data
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=forecast_df_cms_cms, sim_units='si',
                              obs_units='si', final_units='si'),
                forecast_df_cms_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(two_stream_df=forecast_df_cfs_cfs, sim_units='bg',
                              obs_units='bg', final_units='bg'),
                forecast_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(forecast_df=forecast_df_cms_cms, sim_units='si',
                              obs_units='si', final_units='bg'),
                forecast_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(forecast_df=forecast_df_cfs_cms, sim_units='si',
                              obs_units='bg', final_units='bg'),
                forecast_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(forecast_df=forecast_df_cms_cfs, sim_units='bg',
                              obs_units='si', final_units='bg'),
                forecast_df_cfs_cfs
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(forecast_df=forecast_df_cfs_cfs, sim_units='bg',
                              obs_units='bg', final_units='si'),
                forecast_df_cms_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(forecast_df=forecast_df_cfs_cms, sim_units='si',
                              obs_units='bg', final_units='si'),
                forecast_df_cms_cms
            )
        )
        self.assertIsNone(
            pd.testing.assert_frame_equal(
                convert_units(forecast_df=forecast_df_cms_cfs, sim_units='bg',
                              obs_units='si', final_units='si'),
                forecast_df_cms_cms
            )
        )


if __name__ == '__main__':
    unittest.main()