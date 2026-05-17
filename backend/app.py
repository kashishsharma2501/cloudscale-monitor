from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
import subprocess
import threading
import time
import datetime

app = Flask(__name__)
CORS(app)

AWS_REGION = 'ap-south-1'
CLUSTER = 'myapp-cluster2'
SERVICE = 'myapp-service-new'

def get_cloudwatch_metric(metric_name, minutes=5):
    try:
        cw = boto3.client('cloudwatch', region_name=AWS_REGION)
        end = datetime.datetime.now(datetime.UTC)
        start = end - datetime.timedelta(minutes=minutes)
        resp = cw.get_metric_statistics(
            Namespace='AWS/ECS', MetricName=metric_name,
            Dimensions=[{'Name':'ClusterName','Value':CLUSTER},{'Name':'ServiceName','Value':SERVICE}],
            StartTime=start, EndTime=end, Period=60, Statistics=['Average']
        )
        points = sorted(resp['Datapoints'], key=lambda x: x['Timestamp'])
        return round(points[-1]['Average'], 2) if points else 0
    except:
        return 0

@app.route('/api/metrics', methods=['GET'])
def metrics():
    cpu = get_cloudwatch_metric('CPUUtilization')
    mem = get_cloudwatch_metric('MemoryUtilization')
    try:
        ecs = boto3.client('ecs', region_name=AWS_REGION)
        svc = ecs.describe_services(cluster=CLUSTER, services=[SERVICE])['services'][0]
        running = svc['runningCount']
        desired = svc['desiredCount']
    except:
        running, desired = 1, 1
    return jsonify({'cpu':cpu,'memory':mem,'runningTasks':running,'desiredTasks':desired,'timestamp':datetime.datetime.now(datetime.UTC).isoformat()})

@app.route('/api/scale', methods=['POST'])
def scale():
    data = request.json or {}
    desired = int(data.get('desired', 1))
    if desired < 1 or desired > 3:
        return jsonify({'status':'error','error':'desired must be 1-3'}), 400
    try:
        ecs = boto3.client('ecs', region_name=AWS_REGION)
        ecs.update_service(cluster=CLUSTER, service=SERVICE, desiredCount=desired)
        return jsonify({'status':'success','desired':desired})
    except Exception as e:
        return jsonify({'status':'error','error':str(e)}), 500

@app.route('/api/load-test', methods=['POST'])
def load_test():
    data = request.json or {}
    target_url = data.get('url', 'http://13.232.42.69:5000')
    concurrency = int(data.get('concurrency', 100))
    requests_count = int(data.get('requests', 10000))
    duration = int(data.get('duration', 30))
    def run_test():
        try:
            subprocess.run(['ab','-n',str(requests_count),'-c',str(concurrency),target_url+'/'], timeout=120)
        except:
            for _ in range(200):
                subprocess.Popen(['curl','-s',target_url,'-o','/dev/null'])
                time.sleep(0.05)
    threading.Thread(target=run_test, daemon=True).start()
    return jsonify({'status':'started','requests':requests_count,'concurrency':concurrency,'target':target_url})

@app.route('/api/alerts', methods=['GET'])
def alerts():
    try:
        cw = boto3.client('cloudwatch', region_name=AWS_REGION)
        resp = cw.describe_alarms()
        return jsonify([{
            'name':a['AlarmName'],'state':a['StateValue'],
            'reason':a['StateReason'],'time':a['StateUpdatedTimestamp'].isoformat()
        } for a in resp['MetricAlarms']])
    except:
        return jsonify([])

@app.route('/api/scaling-history', methods=['GET'])
def scaling_history():
    try:
        cw = boto3.client('cloudwatch', region_name=AWS_REGION)
        end = datetime.datetime.now(datetime.UTC)
        start = end - datetime.timedelta(hours=1)
        resp = cw.get_metric_statistics(
            Namespace='AWS/ECS', MetricName='CPUUtilization',
            Dimensions=[{'Name':'ClusterName','Value':CLUSTER},{'Name':'ServiceName','Value':SERVICE}],
            StartTime=start, EndTime=end, Period=60, Statistics=['Average']
        )
        points = sorted(resp['Datapoints'], key=lambda x: x['Timestamp'])
        return jsonify([{'time':p['Timestamp'].strftime('%H:%M'),'cpu':round(p['Average'],1)} for p in points])
    except:
        return jsonify([])

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status':'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
