from flask import Blueprint, request, send_file, render_template, redirect, url_for, jsonify
import hours.manage_data as manage_data
import datetime
import os

views = Blueprint('hours_views', __name__, template_folder='templates')

data_filename = os.getcwd() + '/hours/data.json'
output_filename = os.getcwd() + '/hours/output.xlsx'

def goToHours():
    return redirect(url_for("hours"))

@views.route("/")
def hours():
    return render_template('hours_home.html')

@views.route('/edit-data')
def edit_data():
    return render_template('hours_edit_data.html')

@views.route('/send-data', methods=['POST'])
def receive_data():
    data = request.get_json()

    if request.headers['Request-Type'] == 'worked-hours':
        manage_data.set_worked_hours(
            datetime.datetime.fromtimestamp(data['time']),
            data['worked_hours'], data_filename)
    elif request.headers['Request-Type'] == 'edited-data':
        manage_data.save_data(data, data_filename)
    else:
        return 'Error'

    return 'Success'

@views.route('/get-data')
def send_data():
    time_request = request.args.get('time')
    data = manage_data.get_data(data_filename)


    if time_request != None:
        date = datetime.datetime.fromtimestamp(float(time_request))
        id = date.toordinal()
        day = next(day for day in data[1:] if day['id'] == id)
        return jsonify(day['work_hours'])
    else:
        return jsonify(data)


@views.route('/download-output')
def download_output():
    manage_data.output_data(data_filename, output_filename)

    return send_file(output_filename)
