@php
    $category = [
        'Observation',
        'Minor NC',
        'Major NC'
    ][$finding->category];
@endphp

@component('mail::message')
# {{ $finding['code'] }} - Corrective Action for {{ $finding->ca_name }}<br>

<table>
    <tbody>
        <tr>
            <td><strong>Date:</strong></td>
            <td>{{ $caDate }}</td>
        </tr>
        <tr>
            <td><strong>Audit Date:</strong></td>
            <td>{{ $finding->created_at }}</td>
        </tr>
        <tr>
            <td><strong>Auditee:</strong></td>
            <td>{{ $auditee->name }}</td>
        </tr>
        <tr>
            <td><strong>Department:</strong></td>
            <td>{{ $finding->record->area->department->name }}</td>
        </tr>
        <tr>
            <td><strong>Area:</strong></td>
            <td>{{ $finding->record->area->name }}</td>
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

{{ $finding->desc }}

@endcomponent
