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
                name='calculate_single',
                url='calculate_single',
                controller='statistics_calc.controllers.calculate_single'
            ),
            UrlMap(name='add_country_data',
                   url='add_country_data',
                   controller='statistics_calc.controllers.add_country_data'),
            UrlMap(name='toggle_ajax',
                   url='toggle_ajax',
                   controller='statistics_calc.controllers.toggle_ajax'),
            UrlMap(name='some_view',
                   url='some_view',
                   controller='statistics_calc.controllers.some_view'),
            UrlMap(name='calculate_single',
                   url='calculate_single',
                   controller='statistics_calc.controllers.calculate_single'),
            UrlMap(name='test_controller1',
                   url='test_controller1',
                   controller='statistics_calc.controllers.test_controller1'),
            UrlMap(name='test_controller1_ajax',
                   url='test_controller1_ajax',
                   controller='statistics_calc.controllers.test_controller1_ajax'),
        )

        return url_maps
