const head_lookup = [
    'Datum',
    'Wochentag',
    'Feiertag',
    'Urlaub',
    'Zeitausgleich',
    'Stunden soll',
    'Stunden ist',
    'Zeitausgleich prio'
];

const red = "#b48c8c";
const green = "#6e926e";
const orange = "#c2933e";

async function get_data() {
    const response = await fetch('/hours/get-data');
    const data = await response.json();

    return data;
}

function last(arr) {
    return arr[arr.length - 1];
}

async function download_button_onlclick() {
    await save_data(false);

    const response = await fetch('/hours/download-output');
    const fileToSave = await response.blob();

    const linkElement = document.createElement('a');
    linkElement.href = window.URL.createObjectURL(fileToSave);
    linkElement.download = 'Florian_Unterweger_stunden.xlsx';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}

async function generate_table() {
    var data = await get_data();

    const info = data.shift();
    document.body.innerHTML += `
        <p class="text">Zeitausgleich benötigt: ${info.overtime_comp_needed}</p>
        <p class="text">Urlaub verbleibend: ${info.vacation_days_left}</p>
    `;

    let table = document.createElement('table');
    table.id = 'input_table';
    document.body.appendChild(table);

    let head_row = document.createElement('tr');
    table.appendChild(head_row);

    head_lookup.forEach(el => {
        let html_el = document.createElement('th');
        html_el.textContent = el;
        head_row.appendChild(html_el);
    });

    data.forEach(day => {
        if (parseInt(day.date.slice(0, 2)) == 1 && table.childElementCount > 1)
            table.appendChild(document.createElement('br'));

        let row = document.createElement('tr');
        if (day.weekday == 'Sonntag')
            row.style.borderBottom = '4px solid rgb(0, 0, 0)';
        table.appendChild(row);

        let row_children = [];

        //datum
        row_children.push(document.createElement('td'));
        last(row_children).textContent = day.date;
        last(row_children).id = 'data-str';

        //wochentag
        row_children.push(document.createElement('td'));
        if (day.weekday == 'Samstag' || day.weekday == 'Sonntag')
            last(row_children).style.backgroundColor = '#B8B8B8';
        last(row_children).textContent = day.weekday;

        //feiertag
        row_children.push(document.createElement('td'));
        const label_holiday = document.createElement('label');
        label_holiday.style.display = 'block';
        label_holiday.style.padding = 16;
        const holiday = document.createElement('input');
        label_holiday.appendChild(holiday);
        last(row_children).appendChild(label_holiday);
        holiday.type = 'checkbox';
        holiday.style.visibility = 'hidden';
        holiday.style.padding = 0;
        holiday.addEventListener('change', (event) => {
            const parent = event.target.parentNode;
            parent.style.backgroundColor = holiday.checked ? green : red;
        });
        holiday.checked = day.holiday;
        last(row_children).style.padding = 0;
        last(row_children).style.backgroundColor = day.holiday ? green : red;
        last(row_children).id = 'holiday';

        //urlaub
        row_children.push(document.createElement('td'));
        const label_vacation = document.createElement('label');
        label_vacation.style.display = 'block';
        label_vacation.style.padding = 16;
        const vacation = document.createElement('input');
        label_vacation.appendChild(vacation);
        last(row_children).appendChild(label_vacation);
        vacation.type = 'checkbox';
        vacation.style.visibility = 'hidden';
        vacation.style.padding = 0;
        vacation.addEventListener('change', (event) => {
            const parent = event.target.parentNode;
            parent.style.backgroundColor = vacation.checked ? green : red;
        });
        vacation.checked = day.vacation;
        last(row_children).style.padding = 0;
        last(row_children).style.backgroundColor = day.vacation ? green : red;
        last(row_children).id = 'vacation';

        //zeitausgleich
        row_children.push(document.createElement('td'));
        let overtime_comp = document.createElement('input');
        overtime_comp.type = 'number';
        overtime_comp.style.width = '120px';
        overtime_comp.style.padding = 15;
        overtime_comp.style.border = 0;
        overtime_comp.style.fontSize = 16;
        overtime_comp.step = 0.5;
        overtime_comp.value = day.overtime_comp;
        if (day.overtime_comp != 0) {
            overtime_comp.style.fontWeight = 900;
            overtime_comp.style.color = orange;
        }
        last(row_children).style.padding = 1;
        last(row_children).appendChild(overtime_comp);
        last(row_children).id = 'overtime_comp';

        //stunden soll
        row_children.push(document.createElement('td'));
        let work_hours = document.createElement('input');
        work_hours.type = 'number';
        work_hours.style.width = '120px';
        work_hours.style.padding = 15;
        work_hours.style.border = 0;
        work_hours.style.fontSize = 16;
        work_hours.style.backgroundColor = 'transparent';
        work_hours.readOnly = true;
        work_hours.value = day.work_hours;
        last(row_children).style.padding = 1;
        if (day.work_hours == 0)
            last(row_children).style.backgroundColor = green;
        else if (day.overtime_comp != 0.0)
            last(row_children).style.backgroundColor = orange;

        last(row_children).appendChild(work_hours);

        //stunden ist
        row_children.push(document.createElement('td'));
        let worked_hours = document.createElement('input');
        worked_hours.type = 'number';
        worked_hours.style.width = '120px';
        worked_hours.style.padding = 15;
        worked_hours.style.border = 0;
        worked_hours.style.fontSize = 16;
        worked_hours.step = 0.5;
        worked_hours.value = day.worked_hours
        if (day.worked_hours > day.work_hours)
            worked_hours.style.color = green;
        else if (day.worked_hours < day.work_hours)
            worked_hours.style.color = red;
        last(row_children).style.padding = 1;
        last(row_children).appendChild(worked_hours);
        last(row_children).id = 'worked_hours';

        //zeitausgleich prio
        row_children.push(document.createElement('td'));
        let overtime_comp_prio = document.createElement('input');
        overtime_comp_prio.type = 'number';
        overtime_comp_prio.style.width = '155px';
        overtime_comp_prio.style.padding = 15;
        overtime_comp_prio.style.border = 0;
        overtime_comp_prio.style.fontSize = 16;
        overtime_comp_prio.step = 1.0;
        overtime_comp_prio.value = day.overtime_comp_prio;
        if (day.overtime_comp_prio != 0) {
            overtime_comp_prio.style.fontWeight = 900;
            overtime_comp_prio.style.color = orange;
        }
        last(row_children).style.padding = 1;
        last(row_children).appendChild(overtime_comp_prio);
        last(row_children).id = 'overtime_comp_prio';

        //id
        row_children.push(document.createElement('td'));
        last(row_children).id = 'id';
        last(row_children).textContent = day.id;
        last(row_children).style.display = 'none';


        row_children.forEach(children => row.appendChild(children));

    });
}

function get_updated_data() {
    const table_element = document.getElementById('input_table');
    var data = [];

    table_element.childNodes.forEach((row, index) => {
        if (index == 0 || row.nodeName != 'TR')
            return;

        data_row = {}

        //id
        const id_element = row.querySelector('#id');
        data_row.id = parseInt(id_element.textContent);

        //holiday
        const holiday_element = row.querySelector('#holiday');
        data_row.holiday = holiday_element.childNodes[0].childNodes[0].checked;

        //vacation
        const vacation_element = row.querySelector('#vacation');
        data_row.vacation = vacation_element.childNodes[0].childNodes[0].checked;

        //overtime_comp_prio
        const overtime_comp_prio_element = row.querySelector('#overtime_comp_prio');
        data_row.overtime_comp_prio = parseInt(overtime_comp_prio_element.childNodes[0].value);

        //overtime_comp
        const overtime_comp_element = row.querySelector('#overtime_comp');
        data_row.overtime_comp = data_row.overtime_comp_prio == 0 ? parseFloat(overtime_comp_element.childNodes[0].value) : 0.0;

        //worked_hours
        const worked_hours_element = row.querySelector('#worked_hours');
        data_row.worked_hours = parseFloat(worked_hours_element.childNodes[0].value);

        //date-str
        const date_str_element = row.querySelector('#data-str');
        const date_str = date_str_element.textContent;
        let [day, month, year] = date_str.split('.');
        data_row.str = year + '-' + day + '-' + month;

        data.push(data_row);
    });

    return data;
}

async function send_to_python(data) {
    const response = await fetch('/hours/send-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Request-Type': 'edited-data'
        },
        body: JSON.stringify(data)
    });
}

async function save_data(reload = true) {
    data = get_updated_data();

    const response = await send_to_python(data);

    if (reload)
        window.location.reload(true);
}
