from tethys_sdk.base import TethysAppBase, url_map_maker
from tethys_sdk.app_settings import CustomSetting


class StatisticsCalc(TethysAppBase):
    """
    Tethys app class for Statistics Calculator.
    """

    name = 'Statistics Calculator'
    index = 'statistics_calc:home'
    icon = 'statistics_calc/images/icon.gif'
    package = 'statistics_calc'
    root_url = 'statistics-calc'
    color = '#AEDB9F'
    description = 'Calculates both hydrologic and forecast skill between simulated ond observed streamflow data. ' \
                  'Also contains tools for preprocessing data and visualizing data.'
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='',
                controller='statistics_calc.controllers.home'
            ),
            UrlMap(
                name='preprocessing',
                url='preprocessing',
                controller='statistics_calc.controllers.preprocessing'
            ),
            UrlMap(
                name='pps_hydrograph_ajax',
                url='pps_hydrograph_ajax',
                controller='statistics_calc.controllers.pps_hydrograph_ajax'
            ),
            UrlMap(
                name='pps_check_dates_ajax',
                url='pps_check_dates_ajax',
                controller='statistics_calc.controllers.pps_check_dates_ajax'
            ),
            UrlMap(
                name='pps_hydrograph_raw_data_ajax',
                url='pps_hydrograph_raw_data_ajax',
                controller='statistics_calc.controllers.pps_hydrograph_raw_data_ajax'
            ),
            UrlMap(
                name='pps_csv',
                url='pps_csv',
                controller='statistics_calc.controllers.pps_csv'
            ),
            UrlMap(
                name='merge_two_datasets',
                url='merge_two_datasets',
                controller='statistics_calc.controllers.merge_two_datasets'
            ),
            UrlMap(
                name='merged_hydrograph',
                url='merged_hydrograph',
                controller='statistics_calc.controllers.merged_hydrograph'
            ),
            UrlMap(
                name='merged_csv_download',
                url='merged_csv_download',
                controller='statistics_calc.controllers.merged_csv_download'
            ),
            UrlMap(
                name='calculate_single',
                url='calculate_single',
                controller='statistics_calc.controllers.calculate_single'
            ),
            UrlMap(
                name='validate_multiple_streams',
                url='validate_multiple_streams',
                controller='statistics_calc.controllers.validate_multiple_streams'
            ),
            UrlMap(
                name='some_view',
                url='some_view',
                controller='statistics_calc.controllers.some_view'
            ),
            UrlMap(
                name='calculate_single',
                url='calculate_single',
                controller='statistics_calc.controllers.calculate_single'
            ),
            UrlMap(
                name='get_metric_names_abbr',
                url='get_metric_names_abbr',
                controller='statistics_calc.controllers.get_metric_names_abbr'
            ),
            UrlMap(
                name='make_table_ajax',
                url='make_table_ajax',
                controller='statistics_calc.controllers.make_table_ajax'
            ),
            UrlMap(
                name='hydrograph_ajax_plotly',
                url='hydrograph_ajax_plotly',
                controller='statistics_calc.controllers.hydrograph_ajax_plotly'
            ),
            UrlMap(
                name='hydrograph_daily_avg_ajax_plotly',
                url='hydrograph_daily_avg_ajax_plotly',
                controller='statistics_calc.controllers.hydrograph_daily_avg_ajax_plotly'
            ),
            UrlMap(
                name='scatter_ajax_plotly',
                url='scatter_ajax_plotly',
                controller='statistics_calc.controllers.scatter_ajax_plotly'
            ),
            UrlMap(
                name='volume_table_ajax',
                url='volume_table_ajax',
                controller='statistics_calc.controllers.volume_table_ajax'
            ),
            UrlMap(
                name='process_a_forecast',
                url='process_a_forecast',
                controller='statistics_calc.controllers.process_a_forecast'
            ),
            UrlMap(
                name='forecast_raw_data_ajax',
                url='forecast_raw_data_ajax',
                controller='statistics_calc.controllers.forecast_raw_data_ajax'
            ),
            UrlMap(
                name='forecast_check_dates_ajax',
                url='forecast_check_dates_ajax',
                controller='statistics_calc.controllers.forecast_check_dates_ajax'
            ),
            UrlMap(
                name='forecast_plot_ajax',
                url='forecast_plot_ajax',
                controller='statistics_calc.controllers.forecast_plot_ajax'
            ),
            UrlMap(
                name='forecast_csv_ajax',
                url='forecast_csv_ajax',
                controller='statistics_calc.controllers.forecast_csv_ajax'
            ),
            UrlMap(
                name='test_template',
                url='test_template',
                controller='statistics_calc.controllers.test_template'
            ),
            UrlMap(
                name='test_ajax',
                url='test_ajax',
                controller='statistics_calc.controllers.test_ajax'
            ),

            # API Controllers
            UrlMap(
                name='get_metrics',
                url='api/get_metrics',
                controller='statistics_calc.api.get_metrics'
            ),
            UrlMap(
                name='get_metrics_names_and_abbr',
                url='api/get_metrics_names_and_abbr',
                controller='statistics_calc.api.get_metrics_names_and_abbr'
            )
        )

        return url_maps

    def custom_settings(self):
        return (
            CustomSetting(
                name='api_source',
                type=CustomSetting.TYPE_STRING,
                description='Tethys portal where Streamflow Prediction Tool is installed (e.g. '
                            'https://tethys.byu.edu). Note: No trailing slash!',
                required=True
            ),
            CustomSetting(
                name='spt_token',
                type=CustomSetting.TYPE_STRING,
                description='Unique token to access data from the Streamflow Prediction Tool (API Key from the Portal)',
                required=True
            ),
        )
