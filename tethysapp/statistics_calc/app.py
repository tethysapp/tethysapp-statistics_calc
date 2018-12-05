from tethys_sdk.base import TethysAppBase, url_map_maker
from tethys_sdk.app_settings import CustomSetting


class StatisticsCalc(TethysAppBase):
    """
    Tethys app class for Statistics Calculator.
    """

    name = 'Hydrostats App'
    index = 'statistics_calc:home'
    icon = 'statistics_calc/images/icon.gif'
    package = 'statistics_calc'
    root_url = 'statistics-calc'
    color = '#158329'
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
                name='create_persistence_benchmark',
                url='create_persistence_benchmark',
                controller='statistics_calc.controllers.create_persistence_benchmark'
            ),
            UrlMap(
                name='visualize_persistence_benchmark',
                url='visualize_persistence_benchmark',
                controller='statistics_calc.controllers.visualize_persistence_benchmark'
            ),
            UrlMap(
                name='persistence_benchmark_download',
                url='persistence_benchmark_download',
                controller='statistics_calc.controllers.persistence_benchmark_download'
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
                name='merge_forecast',
                url='merge_forecast',
                controller='statistics_calc.controllers.merge_forecast'
            ),
           UrlMap(
               name='merge_forecast_plot_ajax',
               url='merge_forecast_plot_ajax',
               controller='statistics_calc.controllers.merge_forecast_plot_ajax'
            ),
            UrlMap(
                name='merge_forecast_download_ajax',
                url='merge_forecast_download_ajax',
                controller='statistics_calc.controllers.merge_forecast_download_ajax'
            ),
            UrlMap(
                name='validate_forecast',
                url='validate_forecast',
                controller='statistics_calc.controllers.validate_forecast'
            ),
            UrlMap(
                name='validate_forecast_plot',
                url='validate_forecast_plot',
                controller='statistics_calc.controllers.validate_forecast_plot'
            ),
            UrlMap(
                name='validate_forecast_ensemble_metrics',
                url='validate_forecast_ensemble_metrics',
                controller='statistics_calc.controllers.validate_forecast_ensemble_metrics'
            ),
            UrlMap(
                name='validate_forecast_binary_metrics',
                url='validate_forecast_binary_metrics',
                controller='statistics_calc.controllers.validate_forecast_binary_metrics'
            ),

            # Examples
            UrlMap(
                name='timeseries_csv_example',
                url='timeseries_csv_example',
                controller='statistics_calc.controllers.timeseries_csv_example'
            ),
            UrlMap(
                name='merged_timeseries_csv_example',
                url='merged_timeseries_csv_example',
                controller='statistics_calc.controllers.merged_timeseries_csv_example'
            ),
            UrlMap(
                name='forecast_csv_example',
                url='forecast_csv_example',
                controller='statistics_calc.controllers.forecast_csv_example'
            ),
            UrlMap(
                name='merged_forecast_csv_example',
                url='merged_forecast_csv_example',
                controller='statistics_calc.controllers.merged_forecast_csv_example'
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
