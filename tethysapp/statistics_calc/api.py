# Define your REST API endpoints here.
# In the comments below is an example.
# For more information, see:
# http://docs.tethysplatform.org/en/dev/tethys_sdk/rest_api.html (Not Real Anymore)

from django.http import JsonResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes
from hydrostats import kge_2012
from hydrostats.metrics import metric_names, metric_abbr
import json
import numpy as np


@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
def get_metrics(request):
    """
    API Controller for getting data
    """
    print("In the get_metrics api controller.")

    data = json.loads(request.body)

    sim = data['simulated']
    obs = data['observed']

    sim = np.array(sim)
    obs = np.array(obs)

    kge = kge_2012(sim, obs)

    result = {
        "kge_2012": kge,
        "status": "success"
    }

    return JsonResponse(result)


@api_view(['GET'])
# @authentication_classes((TokenAuthentication,))
def get_metrics_names_and_abbr(request):
    """
    API Controller for getting data
    """
    print("In the get_metrics_names api controller.")

    profile = request

    print(profile)

    result = {}

    if request.GET.get('names', False):
        result["names"] = metric_names

    if request.GET.get('abbreviations', False):
        result["abbreviations"] = metric_abbr

    return JsonResponse(result)
