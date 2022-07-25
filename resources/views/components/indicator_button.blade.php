<button type="{{ isset($type) ? $type : 'button' }}" class="btn btn-{{ isset($style) ? $style : 'primary' }}" id="{{ $id }}" {{ isset($form) ? 'form='.$form.'' : '' }}>
    {{ $slot }}
</button>
