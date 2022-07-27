import axios from 'axios';
import { Modal } from 'bootstrap';
import $ from 'jquery';

export class Spinner
{
    constructor(id)
    {
        this._element = document.getElementById(id);
        this._spinnerElement = this._element.querySelector("[role='status']");
        this._childElement = this._element.querySelector("[role='done']");
    }

    setDone()
    {
        this._spinnerElement.classList.add('d-none');
        this._childElement.classList.remove('d-none');
    }

    showSpinner()
    {
        this._spinnerElement.classList.remove('d-none');
        this._childElement.classList.add('d-none');
    }

    getChildElement()
    {
        return this._childElement;
    }

    static instances = new Map;

    static getOrCreateInstance(id)
    {
        if (!Spinner.instances.has(id)) {
            Spinner.instances[id] = new Spinner(id);
            return Spinner.instances[id];
        }

        return Spinner.instances[id];
    }
}

export class IndicatorButton
{
    static _spinnerHtml = '<div class="spinner-border spinner-border-sm" role="status" id="__indicator"><span class="visually-hidden">Loading...</span></div>';

    constructor(id)
    {
        this._element = document.getElementById(id);
        this._icon = this._element.querySelector("i[class^='fa-']");
        this._wrapperFn = () => {
            this.setLoad();

            if (this._callback) {
                this._callback();
            }
        };

        this._element.addEventListener('click', this._wrapperFn);
    }

    setOnClick(callback)
    {
        this._callback = callback;
    }

    // Sets the button to 'done' state
    setDone()
    {
        this._element.removeChild(this._element.querySelector('#__indicator'));
        this._element.removeAttribute('disabled');

        if (this._icon) {
            // re-insert the icon if available
            this._element.insertAdjacentElement('afterbegin', this._icon);
        }
    }

    // Sets the button to 'load' state
    setLoad()
    {
        if (this._icon) {
            this._icon.remove();
        }

        this._element.insertAdjacentHTML('afterbegin', IndicatorButton._spinnerHtml);
        this._element.setAttribute('disabled', '');
    }

    getElement() { return this._element; }

    static instances = new Map;

    static getOrCreateInstance(id)
    {
        if (!IndicatorButton.instances.has(id)) {
            IndicatorButton.instances[id] = new IndicatorButton(id);
            return IndicatorButton.instances[id];
        }

        return IndicatorButton.instances[id];
    }
}

export class ModalForm
{
    constructor(id)
    {
        this._element = document.getElementById(id);
        this._modal = Modal.getOrCreateInstance(this._element);
        this._form = this._element.querySelector("form");
        this._closeBtn = this._element.querySelectorAll("button[data-bs-dismiss='modal']");
        this._submitBtn = IndicatorButton.getOrCreateInstance(`__${id}_SubmitBtn`);

        this._submitBtn.setOnClick(() => { this._form.requestSubmit(this._submitBtn.getElement()); });

        this._element.addEventListener('hidden.bs.modal', () => {
            this.resetForm();
        });

        this._inputElements = $(this._form).find(':input:not(:button)');

        for (const elem of this._inputElements) {
            elem.addEventListener('click', () => {
                if (!elem.classList.contains('is-invalid')) return;
                this._clearInputError(elem);
            });
        }

        this._form.addEventListener('submit', (ev) => {
            ev.preventDefault();

            const data = new FormData(ev.target);
            let jsonData = Object.fromEntries(data.entries());

            // Disable all close button
            this._disableCloseButtons();

            if (this._callback) {
                jsonData = this._callback(jsonData);
            }

            // Submit form
            axios.post(ev.target.action, jsonData, { headers: { 'Content-Type': 'application/json' } })
                .then((response) => {
                    this._submitBtn.setDone();

                    this._enableCloseButtons();

                    if (response.data.formError) {
                        // Show error messages for every input
                        for (const error in response.data.formError) {
                            let input = this._form.querySelector(`[name="${error}"]`);
                            input.classList.add('is-invalid');

                            let msg = this._form.querySelector(`#${input.getAttribute('aria-describedby')}`);

                            if (msg) {
                                msg.classList.remove('d-none');
                                msg.innerHTML = response.data.formError[error][0];
                            }
                        }

                        return;
                    }

                    if (this._sentCallback) {
                        // Called when the form data has been successfully submitted
                        this._sentCallback(response.data);
                    }

                    this._modal.hide();
                })
                .catch((reason) => {
                    console.log(reason);
                });
        });

        this._element.addEventListener('show.bs.modal', (ev) => {
            let selects = this._form.querySelectorAll('select');
            let fetchOptionsTasks = [];
            let fetchFormDataTask = null;
            this._inputElements.attr('disabled', '');
            this._submitBtn.setLoad();

            for (const selectControl of selects) {
                if (selectControl.hasAttribute('data-fetch-options')) {
                    selectControl.setAttribute('disabled', '');

                    fetchOptionsTasks.push(axios.get(selectControl.getAttribute('data-fetch-options'), null, { headers: { 'Content-Type': 'application/json' } })
                        .then((response) => {
                            selectControl.innerHTML = ''; // remove all options before adding the new ones
                            for (const optionsData of response.data) {
                                $(selectControl).append(`<option value="${optionsData.id}">${optionsData.name}</option>`);
                            }
                        })
                    );
                }
            }

            if (this._form.hasAttribute('data-fetch-action')) {
                let id = ev.relatedTarget.getAttribute('data-app-id');

                this._form.reset();
                this._form.setAttribute('data-app-id', id);

                let fetchFormData = axios.get(this._form.getAttribute('data-fetch-action') + `/${id}`, null, { headers: { 'Content-Type': 'application/json' } });

                // Wait for the fetch option task
                fetchFormDataTask = Promise.all([fetchFormData, ...fetchOptionsTasks])
                    .then((values) => {
                        const response = values[0];

                        for (const elem of this._inputElements) {
                            const name = elem.getAttribute("name");
                            if (!(name in response.data) || response.data[name] == null) continue;
                            elem.value = response.data[name];
                        }
                    });
            }

            Promise.all([...fetchOptionsTasks, fetchFormDataTask])
                .then(() => {
                    this._inputElements.removeAttr('disabled');
                    this._submitBtn.setDone();
                })
                .catch((reason) => {
                    console.log(reason);
                });
        });
    }

    setOnFormSubmit(callback)
    {
        this._callback = callback;
    }

    setOnFormSent(callback)
    {
        this._sentCallback = callback;
    }

    setOnFormFetchData(callback)
    {
        this._fetchDataCallback = callback;
    }

    getFormElement()
    {
        return this._form;
    }

    resetForm()
    {
        this.clearErrors();
        this._form.reset();
    }

    clearErrors()
    {
        for (const elem of this._inputElements) {
            this._clearInputError(elem);
        }
    }

    _clearInputError(elem)
    {
        let idMsg = elem.getAttribute('aria-describedby');

        if (idMsg) {
            let msg = this._form.querySelector(`#${idMsg}`);

            if (msg) {
                msg.classList.add('d-none');
            }
        }

        elem.classList.remove('is-invalid');
    }

    _enableCloseButtons()
    {
        for (const btn of this._closeBtn) {
            btn.removeAttribute('disabled', '');
        }
    }

    _disableCloseButtons()
    {
        for (const btn of this._closeBtn) {
            btn.setAttribute('disabled', '');
        }
    }

    static instances = new Map;

    static getOrCreateInstance(id)
    {
        if (!ModalForm.instances.has(id)) {
            ModalForm.instances[id] = new ModalForm(id);
            return ModalForm.instances[id];
        }

        return ModalForm.instances[id];
    }
}
