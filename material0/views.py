from flask import Blueprint, request, render_template, jsonify, send_file
from material.text_recognition import text_recognition_api, get_material
import material.manage_data as manage_data
import json

views = Blueprint('material_views', __name__, template_folder='templates')

@views.route('/')
def hours():
    return render_template('material_home.html')

@views.route('/send-image', methods=['POST'])
def get_image():
    image_raw = request.data
    image_filename = request.headers['fileName']

    data_api = text_recognition_api(image_raw, image_filename)

    if data_api['IsErroredOnProcessing']:
        return data_api

    raw_text = data_api['ParsedResults'][0]['ParsedText']
    material = get_material(raw_text)

    response_data = {
        'material': material,
        'ProcessingTimeMS': data_api['ProcessingTimeInMilliseconds']
    }

    return jsonify(response_data)

@views.route('/send-table', methods=['POST'])
def get_table():
    table_data = json.loads(request.data)
    table_mode = request.headers['mode']
    table_delete = request.headers['delete']

    if len(table_delete) > 0:
        manage_data.delete(table_delete, table_mode)
    else:
        manage_data.save(table_data, table_mode)

    return 'OK'

@views.route('/get-table', methods=['GET'])
def send_table():
    table_name = request.headers['name']
    table_mode = request.headers['mode']

    return jsonify(manage_data.load(table_name, table_mode))


@views.route('/export-table', methods=['GET'])
def export_table():
    filename = 'material/output.xlsx'
    manage_data.export(filename)

    return send_file(filename)


