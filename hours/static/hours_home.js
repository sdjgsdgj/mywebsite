let hasBeenFocused = false;
let todays_work_hours = null;

function confirm_button_onclick() {
    const date = document.getElementById('date_input').valueAsDate;
    const time_python = date.getTime() / 1000;

    const worked_hours_input = document.getElementById('worked_hours_input').value;
    const worked_hours = parseFloat(worked_hours_input);

    send_to_python({
        time: time_python,
        worked_hours: worked_hours_input.length > 0 ? worked_hours : null
    });

    document.getElementById('worked_hours_input').value = "";
    document.getElementById('overtime_input').value = "";
}

async function set_work_hours(time_python) {
    hasBeenFocused = false;

    const work_hours = await (await fetch(`/hours/get-data?time=${time_python}`)).json();
    todays_work_hours = work_hours;

    const worked_hours_input_element = document.getElementById('worked_hours_input');
    worked_hours_input_element.value = work_hours;

    const overtime_input_element = document.getElementById('overtime_input');
    overtime_input_element.value = 0.0;
}

async function onLoad() {
    const date_input_element = document.getElementById('date_input');

    date_input_element.addEventListener('change', (event) => {
        const date = event.target.valueAsDate;
        const time_python = date.getTime() / 1000;
        set_work_hours(time_python);
    })

    date_input_element.valueAsDate = new Date();
    date_input_element.dispatchEvent(new Event('change'));

    //increase
    const increase_element = document.getElementById('increase');
    increase_element.addEventListener('click', () => {
        const worked_hours_input_element = document.getElementById('worked_hours_input');

        const value_str = worked_hours_input_element.value;
        const value = value_str.length == 0 ? 0.5 : parseFloat(value_str) + 0.5;

        worked_hours_input_element.value = value;

        worked_hours_input_element.dispatchEvent(new Event('input'));
    });

    //decrease
    const decrease_element = document.getElementById('decrease');
    decrease_element.addEventListener('click', () => {
        const worked_hours_input_element = document.getElementById('worked_hours_input');

        const value_str = worked_hours_input_element.value;
        const value = value_str.length == 0 ? -0.5 : parseFloat(value_str) - 0.5;

        worked_hours_input_element.value = value;

        worked_hours_input_element.dispatchEvent(new Event('input'));
    });

    //worked hours 
    const worked_hours_input_element = document.getElementById('worked_hours_input');
    worked_hours_input_element.addEventListener('focus', (event) => {
        if (!hasBeenFocused) {
            event.currentTarget.value = null;
            hasBeenFocused = true;
        }
    });
    worked_hours_input_element.addEventListener('input', (event) => {
        const overtime_input_element = document.getElementById('overtime_input');

        if (event.currentTarget.value.length == 0)
            overtime_input_element.value = "";
        else
            overtime_input_element.value = parseFloat(event.currentTarget.value) - todays_work_hours;
    });

    //overtime
    const overtime_input_element = document.getElementById('overtime_input');
    overtime_input_element.addEventListener('focus', (event) => {
        if (!hasBeenFocused) {
            event.currentTarget.value = null;
            hasBeenFocused = true;
        }
    });
    overtime_input_element.addEventListener('input', (event) => {
        const worked_hours_input_element = document.getElementById('worked_hours_input');

        if (event.currentTarget.value.length == 0)
            worked_hours_input_element.value = "";
        else
            worked_hours_input_element.value = parseFloat(event.currentTarget.value) + todays_work_hours;
    });
}

async function send_to_python(data) {
    const response = await fetch('/hours/send-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Request-Type': 'worked-hours'
        },
        body: JSON.stringify(data)
    });
}