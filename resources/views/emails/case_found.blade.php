@php
    $category = [
        'Observation',
        'Minor NC',
        'Major NC'
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

<p>
@foreach (explode("\n", $finding['desc']) as $line)
{{ $line }}<br>
@endforeach
</p>

<strong>Images</strong>
<br>
@if ($images->count() > 0)
@foreach ($images as $key => $image)
@php
    $idx = $key + 1;
@endphp
[{{ "Image {$idx}" }}]({{ asset("case_images/{$image->filename}") }})<br>
@endforeach
@else
No Image.
@endif

@component('mail::button', ['url' => url("corrective-action/{$findingId}")])
Submit Corrective Action
@endcomponent

@endcomponent
