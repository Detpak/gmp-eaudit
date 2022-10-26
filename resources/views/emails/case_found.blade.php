@php
    $category = [
        'Observation',
        'Minor Non-Conformance',
        'Major Non-Conformance'
    ][$finding['category']];
@endphp

@component('mail::message')
# {{ $finding['code'] }} - {{ $finding['ca_name'] }}<br>

<table>
    <tbody>
        <tr>
            <td><strong>Date:</strong></td>
            <td>{{ $finding['created_at'] }}</td>
        </tr>
        <tr>
            <td><strong>Auditor:</strong></td>
            <td>{{ $auditor['name'] }} (<a href="mailto:{{ $auditor['email'] }}">{{ $auditor['email'] }}</a>)</td>
        </tr>
        <tr>
            <td><strong>Department:</strong></td>
            <td>{{ $area->department->name }}</td>
        </tr>
        <tr>
            <td><strong>Area:</strong></td>
            <td>{{ $area->name }}</td>
        </tr>
        <tr>
            <td><strong>Category:</strong></td>
            <td>{{ $category }}</td>
        </tr>
    </tbody>
</table>

<br>
<strong>Description</strong>
<br>
{{ $finding['desc'] }}

@component('mail::button', ['url' => ''])
Resolve
@endcomponent

{{-- @component('mail::button', ['url' => ''])
Button Text
@endcomponent

Thanks,<br>
{{ config('app.name') }} --}}
@endcomponent