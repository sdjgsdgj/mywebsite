import json
import xlsxwriter
import os

def current_dir():
    return os.getcwd() + '/'

def save(data, mode):
    filepath = current_dir() + 'material/' + mode + '.json'

    for key in data:
        for el in data[key]:
            el['missing'] = 0

    with open(filepath, 'r') as f:
        try:
            old_data = json.load(f)
        except:
            old_data = {}

    if old_data == None:
        old_data = {}

    with open(filepath, 'w') as f:
        json.dump({**old_data, **data}, f)

def load(name, mode):
    filepath = current_dir() + 'material/' + mode + '.json'

    with open(filepath, 'r') as f:
        try:
            data = json.load(f)
        except:
            return []

    if name in data:
        return data[name]
    else:
        return []

def delete(_delete, mode):
    filepath = current_dir() + 'material/' + mode + '.json'

    if _delete == '***':
        with open(filepath, 'w') as f:
            f.write('{}')
    else:
        with open(filepath, 'r') as f:
            try:
                data = json.load(f)
            except:
                data = {}

        data.pop(_delete, None)    

        with open(filepath, 'w') as f:
            json.dump(data, f)
    
def write_to_excel(data, worksheet):
    row = 0
    for table_name in data:
        worksheet.write(row, 0, table_name)
        row += 1
        for el in data[table_name]:
            if el['missing'] == 0:
                continue
            worksheet.write(row, 1, el['name'])
            worksheet.write(row, 2, el['missing'])
            row += 1

def export(filename):
    data_filepath = current_dir() + 'material/data.json'
    output_filepath = current_dir() + filename

    with open(data_filepath, 'r') as f:
        data = json.load(f)

    workbook = xlsxwriter.Workbook(output_filepath)
    worksheet = workbook.add_worksheet()
    
    write_to_excel(data, worksheet)

    workbook.close()


