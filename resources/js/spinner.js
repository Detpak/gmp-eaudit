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
        this._spinnerElement.remove();
        this._childElement.classList.remove('d-none');
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
