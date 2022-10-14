<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FailedPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_id',
        'filename',
        'case_id'
    ];
}
