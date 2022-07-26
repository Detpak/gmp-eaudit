<button type="{{ isset($type) ? $type : 'button' }}" class="btn btn-{{ isset($style) ? $style : 'primary' }} me-2" id="{{ $id }}" {{ isset($form) ? 'form='.$form.'' : '' }}>
    {{ $slot }}
</button>
