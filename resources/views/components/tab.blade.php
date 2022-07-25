<li class="nav-item" role="presentation">
    <a class="nav-link {{ isset($active) ? 'active' : '' }}" id="{{ $id }}" data-bs-toggle="tab" data-bs-target="#{{ $target }}" type="button" role="tab" aria-controls="{{ $target }}" aria-selected="true">{{ $slot }}</a>
</li>
