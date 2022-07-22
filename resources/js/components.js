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
            if (this._icon) {
                this._icon.remove();
            }

            this._element.insertAdjacentHTML('afterbegin', IndicatorButton._spinnerHtml);
            this._element.setAttribute('disabled', '');

            if (this._callback) {
                this._callback();
            }
        };

        this._element.onclick = this._wrapperFn;
    }

    setOnClick(callback)
    {
        this._callback = callback;
    }

    setDone()
    {
        this._element.removeChild(this._element.querySelector('#__indicator'));
        this._element.removeAttribute('disabled');

        if (this._icon) {
            // re-insert the icon if available
            this._element.insertAdjacentElement('afterbegin', this._icon);
        }
    }

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
