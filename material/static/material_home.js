var material_data = null;
var material_data1 = null;
var current_element_index = null;

async function onload() {
    //save
    const save_element = document.getElementById('save');
    save_element.addEventListener('click', async () => {
        await save();
    });

    //export
    const export_element = document.getElementById('export');
    export_element.addEventListener('click', async () => {
        await save();
        await export_data();
    });

    //clear data
    const clear_data_element = document.getElementById('clear-data');
    clear_data_element.addEventListener('click', async () => {
        const data_name = document.getElementById('select').value;
        if (data_name == '')
            return;
            
        await clear_data(data_name);
    });

    //load available data names
    const data_names = await load_names();

    //load material1
    material_data1 = await load_data('Kasten 1');

    //select
    const select_element = document.getElementById('select');
    select_element.innerHTML = '';
    data_names.forEach(tm => {
        select_element.innerHTML += `<option>${tm}</option>`;
    });
    select_element.addEventListener('change', async (e) => {
        const name = e.currentTarget.value;
        const data = await load_data(name);

        material_data = data;
        current_element_index = 0;
        set_element();

        set_prev_next_color();
    });
    select_element.value = null;

    //name
    const name_element = document.getElementById('name');
    name_element.addEventListener('input', (e) => {
        if (current_element_index != null)
            material_data[current_element_index].name = e.currentTarget.value;
    });

    //cnt
    const cnt_element = document.getElementById('cnt');
    cnt_element.addEventListener('input', (e) => {
        if (current_element_index != null)
            material_data[current_element_index].cnt = parseInt(e.currentTarget.value);
    });

    //missing
    const missing_element = document.getElementById('missing');
    missing_element.addEventListener('input', (e) => {
        if (current_element_index != null)
            material_data[current_element_index].missing = parseInt(e.currentTarget.value);
    });

    //increase
    const increase_element = document.getElementById('increase');
    increase_element.addEventListener('click', () => {
        if (current_element_index != null) {
            material_data[current_element_index].missing++;

            set_element();
        }
    });

    //decrease
    const decrease_element = document.getElementById('decrease');
    decrease_element.addEventListener('click', () => {
        if (current_element_index != null) {
            if (material_data[current_element_index].missing > 0)
                material_data[current_element_index].missing--;

            set_element();
        }
    });

    //previous
    const previous_element = document.getElementById('previous');
    previous_element.style.color = 'grey';
    previous_element.addEventListener('click', (e) => {
        if (current_element_index != null && current_element_index > 0) {
            current_element_index--;
            set_element();

            set_prev_next_color();
        }
    });

    //next
    const next_element = document.getElementById('next');
    next_element.style.color = 'grey';
    next_element.addEventListener('click', () => {
        if (current_element_index != null) {
            if (current_element_index < material_data.length - 1) {
                current_element_index++;
                set_element();

                set_prev_next_color();
            }
        }
    });
}

async function load_names() {
    const r = await fetch('/material/get-names', {
        method: 'GET'
    });
    const names = await r.json();

    return names;
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

function set_element(element = material_data[current_element_index]) {
    document.getElementById('name').value = element.name;
    document.getElementById('cnt').value = element.cnt;
    document.getElementById('missing').value = element.missing;

    set_led(element.name);
}

async function save() {
    if (material_data != null) {

        console.log(material_data);
        const data_name = document.getElementById('select').value;

        var data = { [data_name]: material_data };

        const r = await fetch('/material/save-data', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

async function export_data() {
    const r = await fetch('/material/export-data');

    const fileToSave = await r.blob();

    const linkElement = document.createElement('a');
    linkElement.href = window.URL.createObjectURL(fileToSave);
    linkElement.download = 'material.xlsx';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}

async function clear_data(name) {
    const r = await fetch('/material/clear-data', {
        method: 'PUT',
        headers: {
            'data-name': name
        }
    });
    
    document.getElementById('select').dispatchEvent(new Event("change"));;
}

function set_led(name) {
    const led_element = document.getElementById('led');
    const data_name = document.getElementById('select').value;

    if (material_data1.find(el => el.name == name) && data_name != 'Kasten 1')
        led_element.style.color = 'green';
    else
        led_element.style.color = 'black';
}

function set_prev_next_color() {
    const previous_element = document.getElementById('previous');
    const next_element = document.getElementById('next');

    if (current_element_index != null) {
        previous_element.style.color = current_element_index == 0 ? 'grey' : 'black';
        next_element.style.color = current_element_index == material_data.length - 1 ? 'grey' : 'black';

    } else {
        previous_element.style.color = 'grey';
        next_element.style.color = 'grey';
    }
}