import json
import xlsxwriter
import datetime

vacation_total = 10
overtime_comp_left_total = 17

weekdays_lookup = ('Montag', 'Dienstag', 'Mittwoch',
                   'Donnerstag', 'Freitag', 'Samstag', 'Sonntag')


def calc_work_hours(day):
    date = datetime.date.fromordinal(day['id'])

    if date.weekday() in (5, 6) or day['holiday'] or day['vacation']:
        return 0.0

    if date.weekday() == 4:
        return 6.0

    return 8.5

def calc_overtime_comp(_data):
    overtime_comp_left = overtime_comp_left_total

    for day in _data:
        overtime_comp_left -= day['overtime_comp']
        if day['worked_hours'] is not None:
            change = day['worked_hours'] - (calc_work_hours(day) - day['overtime_comp'])
            overtime_comp_left += change

    sorted_data = sorted(
        _data, 
        key=lambda x: (x['overtime_comp_prio'] != 0, x['overtime_comp_prio']),
        reverse=True)

    for day in sorted_data:
        if day['overtime_comp_prio'] == 0:
            break

        _calc_work_hours = calc_work_hours(day)

        if overtime_comp_left <= 0:
            overtime_comp_left -= _calc_work_hours
            continue
        
        day['overtime_comp'] = min(overtime_comp_left, _calc_work_hours)
        overtime_comp_left -= _calc_work_hours
    
    return -overtime_comp_left

def read_data(filename):
    f = open(filename, 'r')

    lines = f.readlines()

    data_str = "".join(lines)

    data = json.loads(data_str)

    f.close()

    return data

def output_data(input_filename, output_filename):
    data = read_data(input_filename)
    calc_overtime_comp(data)

    vacation_left = vacation_total
    overtime_comp_left = overtime_comp_left_total

    workbook = xlsxwriter.Workbook(output_filename)
    worksheet = workbook.add_worksheet()

    worksheet.write(3, 0, 'Wochentag')
    worksheet.write(3, 1, 'Datum')
    worksheet.write(3, 2, 'Feiertag')
    worksheet.write(3, 3, 'Urlaub')
    worksheet.write(3, 4, 'Zeitausgleich')
    worksheet.write(3, 5, 'Stunden soll')
    worksheet.write(3, 6, 'Stunden ist')

    offset = 4

    for i in range(len(data)):
        day = data[i]
        row = i + offset

        date = datetime.date.fromordinal(int(day['id']))

        # wochentag
        worksheet.write(row, 0, weekdays_lookup[date.weekday()])
        # datum
        worksheet.write(row, 1, date.strftime("%d.%m.%Y"))
        # feiertag
        worksheet.write(row, 2, 'Ja' if day['holiday'] else 'Nein')
        # urlaub
        worksheet.write(row, 3, 'Ja' if day['vacation'] else 'Nein')
        # stunden soll
        overtime_comp = day['overtime_comp']
        work_hours = calc_work_hours(day)
        worksheet.write(row, 5, str(work_hours - overtime_comp))
        # zeitausgleich
        wanted_overtime_comp_str = ''
        if day['overtime_comp_prio'] != 0 and overtime_comp != work_hours:
            wanted_overtime_comp_str = f" ({work_hours})"
        worksheet.write(row, 4, f"{overtime_comp}{wanted_overtime_comp_str}")
        # stunden ist
        worked_hours = day['worked_hours']
        if worked_hours is not None:
            worksheet.write(row, 6, str(worked_hours))

        # urlaub verbleibend
        if day['vacation']:
            vacation_left -= 1
        # zeitausgleich verbleibend
        if worked_hours is not None:
            overtime_comp_left += worked_hours - (work_hours - overtime_comp)
        overtime_comp_left -= overtime_comp

    # urlaub verbleibend
    worksheet.write(0, 0, 'Urlaub verbleibend:')
    worksheet.write(0, 1, str(vacation_left))
    # Zeitausgleich verbleibend
    worksheet.write(1, 0, 'Zeitausgleich verbleibend:')
    worksheet.write(1, 1, str(overtime_comp_left))

    workbook.close()

def set_value_of_day(data, id, key, value):
    day = next(day for day in data if day['id'] == id)

    day[key] = value

def get_value_of_day(data, id, key):
    day = next(day for day in data if day['id'] == id)

    return day[key]

def save_data(data, filename):
    file = open(filename, 'w')
    file.write(json.dumps(data, indent=4))
    file.close()

def set_worked_hours(date, worked_hours, filepath):
    id = date.toordinal()

    data = read_data(filepath)

    set_value_of_day(data, id, 'worked_hours', worked_hours)

    if worked_hours != None:
        id -= 1
        while get_value_of_day(data, id, 'worked_hours') == None:
            set_value_of_day(data, id, 'worked_hours', 0.0)
            id -= 1 

    save_data(data, filepath)

def get_data(filepath):
    data = read_data(filepath)
    overtime_comp_needed = calc_overtime_comp(data)

    ret_data = [{
        'overtime_comp_needed': overtime_comp_needed,
        'vacation_days_left': vacation_total
    }]

    for day in data:
        new_day = {}

        date = datetime.datetime.fromordinal(day['id'])

        new_day['date'] = date.strftime("%d.%m.%Y")
        new_day['weekday'] = weekdays_lookup[date.weekday()]
        new_day['holiday'] = day['holiday']
        new_day['vacation'] = day['vacation']
        ret_data[0]['vacation_days_left'] -= new_day['vacation']
        new_day['overtime_comp'] = day['overtime_comp']
        new_day['work_hours'] = calc_work_hours(day) - new_day['overtime_comp']
        new_day['worked_hours'] = day['worked_hours']
        new_day['overtime_comp_prio'] = day['overtime_comp_prio']
        new_day['id'] = day['id']

        ret_data.append(new_day)

    return ret_data

