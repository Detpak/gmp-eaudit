@php
    $category = [
        'Observation',
        'Minor NC',
        'Major NC'
    ][$ca->finding->category];
@endphp

@component('mail::message')
# {{ $ca->finding->code }} - Corrective Action Approval for {{ $ca->finding->ca_name }}<br>

<table>
    <tbody>
        <tr>
            <td><strong>Date:</strong></td>
            <td>{{ $ca->created_at }}</td>
        </tr>
        <tr>
            <td><strong>Audit Date:</strong></td>
            <td>{{ $ca->finding->created_at }}</td>
        </tr>
        <tr>
            <td><strong>Auditee:</strong></td>
            <td>{{ $ca->auditee->name }}</td>
        </tr>
        <tr>
            <td><strong>Department:</strong></td>
            <td>{{ $ca->finding->record->area->department->name }}</td>
        </tr>
        <tr>
            <td><strong>Area:</strong></td>
            <td>{{ $ca->finding->record->area->name }}</td>
        </tr>
        <tr>
            <td><strong>Category:</strong></td>
            <td>{{ $category }}</td>
        </tr>
    </tbody>
</table>

<br>
<strong>Remarks</strong>

<p>
@foreach (explode("\n", $ca->closing_remarks) as $line)
{{ $line }}<br>
@endforeach
</p>

@endcomponent
