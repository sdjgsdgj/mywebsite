let hasBeenFocused = false;

function confirm_button_onclick() {
    const date = document.getElementById('date_input').valueAsDate;
    const time_python = date.getTime() / 1000;

    const worked_hours_input = document.getElementById('worked_hours_input').value;
    const worked_hours = parseFloat(worked_hours_input);

    if (worked_hours_input.length > 0 && (worked_hours < 0 || worked_hours > 24)) {
        const error_message_container = document.getElementById('error_message_container');

        if (!error_message_container.hasChildNodes()) {
            var error_message = document.createElement('error_message');
            error_message.setAttribute('type', 'text');
            error_message.innerHTML = 'Stunden müssen größer gleich 0 und kleiner gleich 24h sein';
            error_message_container.appendChild(error_message);
        }
    } else {
        send_to_python({
            time: time_python,
            worked_hours: worked_hours_input.length > 0 ? worked_hours : null
        });
        
        document.getElementById('worked_hours_input').value = "";
        
        const container = document.getElementById('error_message_container');
        while (container.firstChild) {
            container.removeChild(container.lastChild);
        }
    }
}

async function set_work_hours(time_python) {
    hasBeenFocused = false;

    const work_hours = await (await fetch(`/hours/get-data?time=${time_python}`)).json();

    const worked_hours_input_element = document.getElementById('worked_hours_input');

    worked_hours_input_element.value = work_hours;
    worked_hours_input_element.addEventListener('focus', () => {
        if (!hasBeenFocused) {
            worked_hours_input_element.value = null;
            hasBeenFocused = true;
        }
    });
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