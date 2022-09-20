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
            $table->renameColumn('label', 'cycle_id');
            $table->renameColumn('start_time', 'start_date');
            $table->renameColumn('finish_time', 'finish_date');
            $table->renameColumn('close_time', 'close_date');
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
            $table->renameColumn('cycle_id', 'label');
            $table->renameColumn('start_date', 'start_time');
            $table->renameColumn('finish_date', 'finish_time');
            $table->renameColumn('close_date', 'close_time');
        });
    }
};
