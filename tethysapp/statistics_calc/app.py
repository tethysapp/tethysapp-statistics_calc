from tethys_sdk.base import TethysAppBase, url_map_maker


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
    description = 'Calculates Correlation Between Predicted and Gauged Streamflow'
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
                name='test_template',
                url='test_template',
                controller='statistics_calc.controllers.test_template'
            ),

            # API Controllers
            UrlMap(
                name='get_metrics',
                url='api/get_metrics',
                controller='statistics_calc.api.get_metrics'
            )
        )

        return url_maps
