<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditFinding extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_id',
        'ca_name',
        'ca_code',
        'ca_weight',
        'cg_name',
        'cg_code',
        'category',
        'weight_deduct',
        'desc',
        'status',
        'cancel_reason',
    ];

    public function images()
    {
        return $this->hasMany(FailedPhoto::class, 'finding_id');
    }

    public function record()
    {
        return $this->belongsTo(AuditRecord::class, 'record_id');
    }
}
