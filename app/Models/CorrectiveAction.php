<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorrectiveAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'finding_id',
        'auditee_id',
        'desc',
        'closing_remarks',
    ];

    public function finding()
    {
        return $this->belongsTo(AuditFinding::class, 'finding_id');
    }

    public function auditee()
    {
        return $this->belongsTo(User::class, 'auditee_id');
    }

    public function images()
    {
        return $this->hasMany(CorrectiveActionImages::class, 'ca_id');
    }
}
