# Define your REST API endpoints here.
# In the comments below is an example.
# For more information, see:
# http://docs.tethysplatform.org/en/dev/tethys_sdk/rest_api.html (Not Real Anymore)

from django.http import JsonResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes
from hydrostats import kge_2012
import json
import numpy as np


@api_view(['POST'])
@authentication_classes((TokenAuthentication,))
def get_metrics(request):
    """
    API Controller for getting data
    """
    print("In the get_metrics api controller.")
    # print(request.body)

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
