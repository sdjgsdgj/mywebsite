var material_data = [];

function image_from_file_uploader() {
    const file_uploader = document.getElementById('file_uploader');

    const file = file_uploader.files[0];
    var blob = file.slice();
    blob.fileName = file.name;

    return blob;
}

async function text_recognition(image_data) {
    const loader_html = document.getElementById('loader');
    loader_html.style.visibility = 'visible';

    const response = await fetch('/material/send-image', {
        method: 'POST',
        headers: {
            'Filename': image_data.fileName
        },
        body: image_data
    });

    const data = await response.json();

    loader_html.style.visibility = 'hidden';

    const table_container_html = document.getElementById('table-container');

    if ('IsErroredOnProcessing' in data && data.IsErroredOnProcessing) {
        console.error(data);
        data = [];
    }

    material_data = data.material;
    create_table(data.material);
}

function get_child_index(child, parent) {
    for (let i = 0; i < parent.childElementCount; i++)
        if (parent.childNodes[i] == child)
            return i;
    return -1;
}

function append_row(data, parent_html) {
    const row_html = document.createElement('tr');

    //name
    const name_html = document.createElement('td');
    const name_input_html = document.createElement('input');
    name_input_html.type = 'text';
    name_input_html.value = data.name;
    name_input_html.style.width = '100px';
    name_input_html.addEventListener('input', (event) => {
        const this_ = event.currentTarget;
        const this_row = this_.parentElement.parentElement;
        const table = document.getElementById('table');

        const index = get_child_index(this_row, table);

        material_data[index - 1].name = this_.value;
    });
    name_html.appendChild(name_input_html);
    row_html.appendChild(name_html);

    //missing
    const missing_html = document.createElement('td');
    const missing_input_html = document.createElement('input');
    missing_input_html.id = 'missing';
    missing_input_html.type = 'number';
    missing_input_html.value = data.missing;
    missing_input_html.style.width = '60px';
    missing_input_html.addEventListener('input', (event) => {
        const this_ = event.currentTarget;
        const this_row = this_.parentElement.parentElement;
        const table = document.getElementById('table');

        const index = get_child_index(this_row, table);

        material_data[index - 1].missing = parseInt(this_.value);
    });
    missing_html.appendChild(missing_input_html);
    row_html.appendChild(missing_html);

    //cnt
    const cnt_html = document.createElement('td');
    const cnt_input_html = document.createElement('input');
    cnt_input_html.id = 'cnt';
    cnt_input_html.type = 'number';
    cnt_input_html.value = data.cnt;
    cnt_input_html.style.width = '60px';
    cnt_input_html.addEventListener('input', (event) => {
        const this_ = event.currentTarget;
        const this_row = this_.parentElement.parentElement;
        const table = document.getElementById('table');

        const index = get_child_index(this_row, table);

        material_data[index - 1].cnt = parseInt(this_.value);
    });
    cnt_html.appendChild(cnt_input_html);
    row_html.appendChild(cnt_html);

    //increase
    const increase_html = document.createElement('td');
    const increase_input_html = document.createElement('input');
    increase_input_html.type = 'button';
    increase_input_html.value = '+';
    increase_input_html.addEventListener('click', (event) => {
        const this_ = event.currentTarget;
        const this_row = this_.parentElement.parentElement;
        const missing_element = this_row.querySelector('#missing');
        const table = document.getElementById('table');

        const index = get_child_index(this_row, table);
        missing_element.value = ++material_data[index - 1].missing;
    });
    increase_html.appendChild(increase_input_html);
    row_html.appendChild(increase_html);

    //decrease
    const decrease_html = document.createElement('td');
    const decrease_input_html = document.createElement('input');
    decrease_input_html.type = 'button';
    decrease_input_html.value = '-';
    decrease_input_html.addEventListener('click', (event) => {
        const this_ = event.currentTarget;
        const this_row = this_.parentElement.parentElement;
        const missing_element = this_row.querySelector('#missing');
        const table = document.getElementById('table');

        const index = get_child_index(this_row, table);
        missing_element.value = --material_data[index - 1].missing;
    });
    decrease_html.appendChild(decrease_input_html);
    row_html.appendChild(decrease_html);

    //delete
    const delete_html = document.createElement('td');
    const delete_input_html = document.createElement('input');
    delete_input_html.type = 'button';
    delete_input_html.value = 'X';
    delete_input_html.style.color = 'red';
    delete_input_html.addEventListener('click', (event) => {
        const this_ = event.currentTarget;
        const this_row = this_.parentElement.parentElement;
        const table = document.getElementById('table');

        const index = get_child_index(this_row, table);
        material_data.splice(index - 1, 1);

        table.removeChild(this_row);
    });
    delete_html.appendChild(delete_input_html);
    row_html.appendChild(delete_html);

    parent_html.appendChild(row_html);
}

function create_table(data) {
    const table_html = document.getElementById('table');

    const header_row_html = document.createElement('tr');
    header_row_html.innerHTML = `
        <th>name</th>
        <th>missing</th>
        <th>cnt</th>
        <th>increase</th>
        <th>decrease</th>
        <th>delete</th>
    `;
    table_html.innerHTML = header_row_html.outerHTML;

    data.forEach(el => {
        append_row(el, table_html);
    });
}

async function save_table(name, mode) {
    // console.log('save ' + mode + 'with name ' + name);

    const table_data = { [name]: material_data };

    var _delete = '';
    if (name.length >= 3 && name.substring(0, 3) == '***') {
        if (name.length == 3)
            _delete = '***';
        else
            _delete = name.substring(3);
    }

    const response = await fetch('/material/send-table', {
        method: 'POST',
        headers: {
            'mode': mode,
            'delete': _delete
        },
        body: JSON.stringify(table_data)
    });
}

async function load_table(name, mode) {
    // console.log('load ' + mode + 'with name ' + name);

    const response = await fetch('/material/get-table', {
        method: 'GET',
        headers: {
            'name': name,
            'mode': mode
        }
    });

    const data = await response.json();

    material_data = data;

    create_table(material_data)
}

async function export_table() {
    const response = await fetch('/material/export-table');

    const fileToSave = await response.blob();

    const linkElement = document.createElement('a');
    linkElement.href = window.URL.createObjectURL(fileToSave);
    linkElement.download = 'material.xlsx';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}