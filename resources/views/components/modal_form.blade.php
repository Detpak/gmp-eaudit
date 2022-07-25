<div class="modal fade" id="{{ $id }}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="__{{ $id }}_Label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="__{{ $id }}_Label">{{ $title }}</div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="__{{ $id }}_Form" action="{{ $action }}" method="POST" {{ isset($fetchMethod) ? "data-fetch-method={$fetchMethod}" : '' }} {{ isset($fetchAction) ? "data-fetch-action={$fetchAction}" : '' }}>
                <div class="modal-body">
                    {{ $body }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <x-indicator_button type="submit" id="__{{ $id }}_SubmitBtn" style="success">
                        <i class="{{ isset($submitButton->attributes['icon']) ? $submitButton->attributes['icon'] : '' }}"></i> {{ $submitButton }}
                    </x-indicator_button>
                </div>
            </form>
        </div>
    </div>
</div>
