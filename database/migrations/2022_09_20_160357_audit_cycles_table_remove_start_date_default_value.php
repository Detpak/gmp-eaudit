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
        Schema::table('audit_cycles', function(Blueprint $table) {
            $table->dropColumn('start_date');
        });

        Schema::table('audit_cycles', function(Blueprint $table) {
            $table->dateTime('start_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('audit_cycles', function(Blueprint $table) {
            $table->dropColumn('start_date');
        });

        Schema::table('audit_cycles', function(Blueprint $table) {
            $table->dateTime('start_date')->useCurrent();
        });
    }
};
