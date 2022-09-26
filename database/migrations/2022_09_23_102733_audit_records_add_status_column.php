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
        Schema::table('audit_records', function (Blueprint $table) {
            $table->dropForeign(['cgroup_id']);
            $table->dropColumn('cgroup_id');
            $table->tinyInteger('status');
            $table->foreignId('cycle_id')->nullable()->constrained('audit_cycles');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('audit_records', function (Blueprint $table) {
            $table->dropForeign(['cycle_id']);
            $table->dropColumn('cycle_id');
            $table->dropColumn('status');
            $table->foreignId('cgroup_id')->nullable()->constrained('criteria_groups');
        });
    }
};
