var material_data = [];

async function onload() {
    //set data options
    const data_names = await load_names('data');
    const data_select_element = document.getElementById('select-data');
    data_names.forEach(name => {
        data_select_element.innerHTML += `<option>${name}</option>`;
    });

    //data select
    data_select_element.addEventListener('change', async (e) => {
        const name = e.currentTarget.value;

        if (name == '')
            return;

        material_data = await load_data(name);
        create_table(material_data);
    });
    data_select_element.value = null;

    //save data
    const save_data_element = document.getElementById('save-data');
    save_data_element.addEventListener('click', async () => {
        const name = document.getElementById('select-data').value;

        save_data(material_data, name);
    });

    //clear all
    const clear_all_element = document.getElementById('clear-all');
    clear_all_element.addEventListener('click', async () => {
        await clear_data('');
    });

    //clear data
    const clear_data_element = document.getElementById('clear-data');
    clear_data_element.addEventListener('click', async () => {
        const name = document.getElementById('select-data').value;

        await clear_data(name);
    });

    //add
    const add_element = document.getElementById('add');
    add_element.addEventListener('click', () => {
        const table_element = document.getElementById('table');

        const new_element = { cnt: null, missing: null, name: '' };

        material_data.push(new_element);

        push_row(table_element, new_element);
    });
}

function get_index(parent, child) {
    for (let i = 0; i < parent.childNodes.length; i++)
        if (parent.childNodes[i] == child)
            return i;

    return -1;
}

function push_row(table_element, el) {
    const row_element = document.createElement('tr');
    for (const [key, value] of Object.entries(el)) {
        const data_element = document.createElement('td');
        data_element.style.padding = 1;

        const input_element = document.createElement('input');
        input_element.id = key;
        input_element.className = 'text';
        input_element.style.padding = 15;
        input_element.style.border = 0;
        if (key == 'name') {
            input_element.type = 'text';
        } else {
            input_element.type = 'number';
            input_element.style.width = '100%';
        }
        input_element.value = value;
        input_element.addEventListener('input', (event) => {
            const this_ = event.currentTarget;
            const this_parent2 = this_.parentElement.parentElement;
            const table = document.getElementById('table');

            const index = get_index(table, this_parent2) - 1;

            if (this_.type == 'number')
                material_data[index][this_.id] = parseInt(this_.value);
            else
                material_data[index][this_.id] = this_.value;
        });

        data_element.appendChild(input_element);
        row_element.appendChild(data_element);
    }
    //delete 
    const delete_element = document.createElement('td');
    delete_element.style.padding = 1;

    const input_element = document.createElement('input');
    input_element.className = 'text';
    input_element.type = 'button';
    input_element.value = 'X';
    input_element.style.width = '70px';
    input_element.style.height = '70px';
    input_element.style.color = 'red';
    input_element.addEventListener('click', (event) => {
        const this_ = event.currentTarget;
        const this_parent2 = this_.parentElement.parentElement;
        const table = document.getElementById('table');

        const index = get_index(table, this_parent2) - 1;
        material_data.splice(index, 1);
        table.removeChild(this_parent2);
    });
    delete_element.appendChild(input_element);
    row_element.appendChild(delete_element);

    table_element.appendChild(row_element);
}

function create_table(data) {
    const table_element = document.getElementById('table');

    //table head
    const head_element = document.createElement('tr');
    const head_elements = Object.keys(data[0]);
    head_elements.forEach(el => {
        head_element.innerHTML += `<th>${el}</th>`;
    });
    head_element.innerHTML += '<th>del</th>'
    table_element.innerHTML = '';
    table_element.appendChild(head_element);

    //table data
    data.forEach(el => {
        push_row(table_element, el);
    });
}

async function load_names() {
    const r = await fetch('/material/get-names', {
        method: 'GET'
    });

    const data = await r.json();

    return data;
}

async function load_data(name) {
    const r = await fetch('/material/get-data', {
        method: 'GET',
        headers: {
            'name': name
        }
    });

    const data = await r.json();

    return data;
}

async function save_data(data, name) {
    const r = await fetch('/material/save-data', {
        method: 'POST',
        body: JSON.stringify({ [name]: data })
    });
}

async function clear_data(name) {
    const r = await fetch('/material/clear-data', {
        method: 'PUT',
        headers: {
            'data-name': name,
        }
    });

    document.getElementById('select-data').dispatchEvent(new Event("change"));

}