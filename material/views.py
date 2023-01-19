from flask import Blueprint, request, render_template, jsonify, send_file
import material.manage_data as manage_data
import json
import os

views = Blueprint('material_views', __name__, template_folder='templates')

template_filepath = os.getcwd() + '/material/template.json'
data_filepath = os.getcwd() + '/material/data.json'
output_filepath = os.getcwd() + '/material/output.xlsx'

@views.route('/')
def hours():
    return render_template('material_home.html')

@views.route('/get-template-names', methods=['GET'])
def send_template_names():
    template_names = manage_data.get_template_names(template_filepath)

    return jsonify(template_names)

@views.route('/get-template', methods=['GET'])
def send_template():
    template_name = request.headers['template-name']

    template = manage_data.get_template(template_filepath, template_name)

    return jsonify(template)

@views.route('/save-data', methods=['POST'])
def get_data():
    data = json.loads(request.data)
    manage_data.save_data(data_filepath, data)

    return 'OK'

@views.route('/export-data', methods=['GET'])
def export_data():
    manage_data.export_data(output_filepath, data_filepath)

    return send_file(output_filepath)

@views.route('/remove-data', methods=['PUT'])
def remove_data():
    data_name = request.headers['data-name']
    manage_data.remove_data(data_filepath, data_name)
    return 'OK'
