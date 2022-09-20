<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('audit_cycles', function (Blueprint $table) {
            $table->date('start_date')->change();
            $table->date('finish_date')->change();
            $table->date('close_date')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('audit_cycles', function (Blueprint $table) {
            $table->dateTime('start_date')->change();
            $table->dateTime('finish_date')->change();
            $table->dateTime('close_date')->change();
        });
    }
};
