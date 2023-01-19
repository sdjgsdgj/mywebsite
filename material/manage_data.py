import json
import xlsxwriter
import datetime

def get_template_names(filepath):
    with open(filepath, 'r') as f:
        obj = json.load(f)

        return list(obj.keys())


def get_template(filepath, template_name):
    with open(filepath, 'r') as f:
        obj = json.load(f)

        return obj[template_name]


def save_data(filepath, data):
    with open(filepath, 'r') as f:
        try:
            existing_data = json.load(f)
        except:
            existing_data = {}
        
    if existing_data == None:
        existing_data = {}

    with open(filepath, 'w') as f:
        json.dump({**existing_data, **data}, f)

def remove_data(filepath, data_name):
    with open(filepath, 'r') as f:
        try:
            data = json.load(f)
        except:
            data = {}
        
    if data == None or data_name == '':
        data = {}
    else:
        data.pop(data_name)

    with open(filepath, 'w') as f:
        json.dump(data, f)
    

def write_to_excel(data, worksheet, offset=0):
    row = offset
    for table_name in data:
        worksheet.write(row, 0, table_name)
        row += 1
        for el in data[table_name]:
            worksheet.write(row, 1, el['name'])
            worksheet.write(row, 2, el['missing'])
            row += 1


def export_data(output_filepath, data_filepath):
    with open(data_filepath, 'r') as f:
        try: 
            data = json.load(f)
        except:
            data = {}

    if data == None:
        data = {}

    date = datetime.datetime.today()
    date_str = date.strftime('%d.%m.%Y')

    workbook = xlsxwriter.Workbook(output_filepath)
    worksheet = workbook.add_worksheet()

    worksheet.write(0, 0, 'Datum:')
    worksheet.write(0, 1, date_str)
    write_to_excel(data, worksheet, 1)

    workbook.close()
