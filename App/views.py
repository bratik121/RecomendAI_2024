import json
from django.http import JsonResponse
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def my_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)  # parse the JSON data into a dictionary
        # do something with the data
        return render(request,'base.html', {'data': data})
    else:
        if request.method == 'GET':
            return render(request,'base.html',) # return the data as a JSON response
