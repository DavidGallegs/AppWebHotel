<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Administrador extends Model
{
    use HasApiTokens;

    protected $table = 'administrador';

    protected $fillable = [
        'userName',
        'passwordHash',
        'email'
    ];

    protected $hidden = [
        'passwordHash'
    ];
}
