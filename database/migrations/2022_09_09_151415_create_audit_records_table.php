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
        Schema::create('audit_records', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->foreignId('auditor_id')->nullable()->constrained('users');
            $table->foreignId('area_id')->nullable()->constrained('areas');
            $table->foreignId('cgroup_id')->nullable()->constrained('criteria_groups');
            $table->mediumText('desc');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('audit_records');
    }
};
