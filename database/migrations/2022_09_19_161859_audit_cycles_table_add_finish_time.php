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
            $table->renameColumn('open_time', 'start_time');
            $table->dateTime('finish_time')->nullable();
            $table->foreignId('cgroup_id')->nullable()->constrained('criteria_groups');
            $table->text('desc')->nullable();
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
            $table->dropConstrainedForeignId('cgroup_id');
            $table->dropColumn(['finish_time', 'desc']);
            $table->renameColumn('start_time', 'open_time');
        });
    }
};
