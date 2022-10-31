<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorrectiveActionImages extends Model
{
    use HasFactory;

    protected $fillable = [
        'ca_id',
        'filename',
    ];
}
