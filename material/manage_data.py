import json
import xlsxwriter
import datetime


def get_names(filepath):
    with open(filepath, 'r') as f:
        try:
            obj = json.load(f)
        except:
            obj = {}

    if obj == None:
        obj = {}

    return list(obj.keys())


def get_data(filepath, name):
    with open(filepath, 'r') as f:
        obj = json.load(f)

        return obj[name]


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


def clear_table(table):
    for el in table:
        el['missing'] = None


def clear_data(filepath, name):
    with open(filepath, 'r') as f:
        try:
            data = json.load(f)
        except:
            data = {}

    if data == None:
        data = {}

    if name == '':
        for table_name in data:
            clear_table(data[table_name])
    else:
        clear_table(data[name])

    with open(filepath, 'w') as f:
        json.dump(data, f)


def write_to_excel(data, worksheet, offset=0):
    # filter data
    for key in data:
        data[key] = [el for el in data[key] if el['missing']]

    print(data)

    row = offset
    for table_name, table in data.items():
        if len(table) == 0:
            continue

        worksheet.write(row, 0, table_name)
        row += 1
        for el in table:
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
