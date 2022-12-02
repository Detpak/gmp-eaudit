<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'auditor_id',
        'area_id',
        'cycle_id',
        'status',
        'total_findings',
    ];

    public function cycle()
    {
        return $this->belongsTo(AuditCycle::class, 'cycle_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function auditor()
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }
}
