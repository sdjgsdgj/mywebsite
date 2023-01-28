from flask import Blueprint, request, render_template, jsonify, send_file
import material.manage_data as manage_data
import json
import os

views = Blueprint('material_views', __name__, template_folder='templates')

output_filepath = os.getcwd() + '/material/output.xlsx'
data_filepath = os.getcwd() + '/material/data.json'

@views.route('/')
def material_home():
    return render_template('material_home.html')

@views.route('/edit')
def material_edit():
    return render_template('material_edit.html')

@views.route('/get-names', methods=['GET'])
def send_names():
    names = manage_data.get_names(data_filepath)

    return jsonify(names)

@views.route('/get-data', methods=['GET'])
def send_data():
    name = request.headers['name']

    data = manage_data.get_data(data_filepath, name)

    return jsonify(data)

@views.route('/save-data', methods=['POST'])
def get_data():
    data = json.loads(request.data)
    manage_data.save_data(data_filepath, data)

    return 'OK'

@views.route('/export-data', methods=['GET'])
def export_data():
    manage_data.export_data(output_filepath, data_filepath)

    return send_file(output_filepath)

@views.route('/clear-data', methods=['PUT'])
def remove_data():
    name = request.headers['data-name']
    manage_data.clear_data(data_filepath, name)
    
    return 'OK'
