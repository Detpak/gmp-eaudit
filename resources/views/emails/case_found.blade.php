@component('mail::message')
# {{ $finding['code'] }} - {{ $finding['ca_name'] }} ({{ $finding['created_at'] }})<br>
Date: **{{ $finding['created_at'] }}**<br>
Auditor: **{{ $auditor['name'] }}** ([{{ $auditor['email'] }}]({{ $auditor['email'] }}))<br>
Category: **{{ ['Observation', 'Minor Non-Conformance', 'Major Non-Conformance'][$finding['category']] }}**
<hr>
{{ $finding['desc'] }}

{{-- @component('mail::button', ['url' => ''])
Button Text
@endcomponent

Thanks,<br>
{{ config('app.name') }} --}}
@endcomponent
