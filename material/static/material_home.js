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

    //remove data
    const remove_data_element = document.getElementById('remove-data');
    remove_data_element.addEventListener('click', async () => {
        const data_name = document.getElementById('select').value;
        await remove_data(data_name);
    });

    //load available template names
    const template_names = await load_template_names();

    //load material1
    material_data1 = await load_template('Kasten 1');

    //select
    const select_element = document.getElementById('select');
    select_element.innerHTML = '';
    template_names.forEach(tm => {
        select_element.innerHTML += `<option>${tm}</option>`;
    });
    select_element.addEventListener('change', async (e) => {
        const template_name = e.currentTarget.value;
        const template = await load_template(template_name);

        material_data = template;
        current_element_index = 0;
        set_element();
    });
    select_element.value = null;

    //name
    const name_element = document.getElementById('name');
    name_element.addEventListener('change', (e) => {
        if (current_element_index)
            material_data[current_element_index].name = e.currentTarget.value;
    });

    //cnt
    const cnt_element = document.getElementById('cnt');
    name_element.addEventListener('change', (e) => {
        if (current_element_index)
            material_data[current_element_index].cnt = e.currentTarget.value;
    });

    //missing
    const missing_element = document.getElementById('missing');
    name_element.addEventListener('change', (e) => {
        if (current_element_index)
            material_data[current_element_index].missing = e.currentTarget.value;
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
    previous_element.addEventListener('click', () => {
        if (current_element_index != null && current_element_index > 0) {
            current_element_index--;
            set_element();
        }
    });

    //next
    const next_element = document.getElementById('next');
    next_element.addEventListener('click', () => {
        if (current_element_index != null) {
            if (current_element_index < material_data.length - 1) {
                current_element_index++;
                set_element();
            }
        }
    });

    //add
    const add_element = document.getElementById('add');
    add_element.addEventListener('click', () => {
        if (current_element_index != null) {
            material_data.splice(
                current_element_index,
                0,
                { name: '', cnt: null, missing: 0 });

            set_element();
        }
    });
}

async function load_template_names() {
    const r = await fetch('/material/get-template-names');
    const template_names = await r.json();

    return template_names;
}

async function load_template(template_name) {
    const r = await fetch('/material/get-template', {
        method: 'GET',
        headers: {
            'template-name': template_name
        }
    });

    const template = await r.json();

    template.forEach(el => el.missing = 0);

    return template;
}

function set_element(element = material_data[current_element_index]) {
    document.getElementById('name').value = element.name;
    document.getElementById('cnt').value = element.cnt;
    document.getElementById('missing').value = element.missing;

    set_led(element.name);
}

async function save() {
    if (material_data != null && material_data.length) {
        const data_name = document.getElementById('select').value;
        const new_array = material_data.filter(el => {
            return el.name.length > 0 && el.missing > 0;
        });
        var data = { [data_name]: new_array };

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

async function remove_data(data_name) {
    const r = await fetch('/material/remove-data', {
        method: 'PUT',
        headers: {
            'data-name': data_name
        }
    });
}

function set_led(name) {
    const led_element = document.getElementById('led');
    const template_name = document.getElementById('select').value;

    if (material_data1.find(el => el.name == name) && template_name != 'Kasten 1')
        led_element.style.color = 'green';
    else 
        led_element.style.color = 'black'; 
}