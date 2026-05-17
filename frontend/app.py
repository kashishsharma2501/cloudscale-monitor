
@app.route('/api/scale', methods=['POST'])
def scale():
    data = request.json or {}
    desired = int(data.get('desired', 1))
    if desired < 1 or desired > 3:
        return jsonify({'status':'error', 'error':'desired must be 1-3'}), 400
    try:
        ecs = boto3.client('ecs', region_name=AWS_REGION)
        ecs.update_service(
            cluster=CLUSTER,
            service=SERVICE,
            desiredCount=desired
        )
        return jsonify({'status':'success', 'desired':desired})
    except Exception as e:
        return jsonify({'status':'error', 'error':str(e)}), 500
